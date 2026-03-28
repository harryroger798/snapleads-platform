"""Dodo Payments webhook endpoint.

Handles subscription lifecycle events:
- subscription.active  → Generate license key + email to customer
- subscription.renewed → Extend license key expiry
- subscription.cancelled → Revoke license key
"""
import logging
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Request, HTTPException
import aiosqlite

from app.database import get_db
from app.services.license import generate_key, get_expiry_date
from app.services.dodo_webhook import verify_webhook_signature, resolve_plan_from_product
from app.services.email import send_license_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])

# System user ID used as created_by for auto-generated keys
SYSTEM_USER_ID = "system-dodo-payments"


@router.post("/dodo")
async def dodo_webhook(request: Request):
    """Handle incoming Dodo Payments webhook events.

    Verifies signature, then dispatches to the appropriate handler
    based on the event type.
    """
    body = await request.body()

    # Extract Standard Webhooks headers
    webhook_id = request.headers.get("webhook-id", "")
    webhook_signature = request.headers.get("webhook-signature", "")
    webhook_timestamp = request.headers.get("webhook-timestamp", "")

    # Verify signature
    if not verify_webhook_signature(body, webhook_id, webhook_signature, webhook_timestamp):
        logger.warning("Webhook signature verification failed (id=%s)", webhook_id)
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    # Parse payload
    import json
    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = payload.get("type", "")
    event_data = payload.get("data", {})

    logger.info("Dodo webhook received: type=%s, id=%s", event_type, webhook_id)

    # Get a database connection
    db = await aiosqlite.connect(
        __import__("app.database", fromlist=["DB_PATH"]).DB_PATH
    )
    db.row_factory = aiosqlite.Row

    try:
        if event_type == "subscription.active":
            await _handle_subscription_active(db, event_data)
        elif event_type == "subscription.renewed":
            await _handle_subscription_renewed(db, event_data)
        elif event_type in ("subscription.cancelled", "subscription.canceled"):
            await _handle_subscription_cancelled(db, event_data)
        else:
            logger.info("Unhandled webhook event type: %s", event_type)
    finally:
        await db.close()

    return {"status": "ok", "event": event_type}


async def _handle_subscription_active(db: aiosqlite.Connection, data: dict):
    """Handle new subscription activation — generate license key and email it.

    Payload data contains: subscription_id, product_id, customer (with email, name),
    next_billing_date, status, etc.
    """
    subscription_id = data.get("subscription_id", "")
    product_id = data.get("product_id", "")
    customer = data.get("customer", {})
    customer_email = customer.get("email", "")
    customer_name = customer.get("name", "")

    if not subscription_id or not product_id:
        logger.error("subscription.active missing subscription_id or product_id: %s", data)
        return

    # Check if we already processed this subscription (idempotency)
    cursor = await db.execute(
        "SELECT id FROM license_keys WHERE notes LIKE ?",
        (f"%dodo_sub:{subscription_id}%",),
    )
    existing = await cursor.fetchone()
    if existing:
        logger.info("Subscription %s already has a license key — skipping", subscription_id)
        return

    # Map product to plan
    plan_info = resolve_plan_from_product(product_id)
    if not plan_info:
        logger.error("Unknown Dodo product_id: %s", product_id)
        return

    plan = plan_info["plan"]
    billing_cycle = plan_info["billing_cycle"]

    # Generate license key using existing service
    license_key = generate_key(plan, billing_cycle)
    expiry = get_expiry_date(billing_cycle)
    now = datetime.now(timezone.utc).isoformat()
    key_id = str(uuid.uuid4())

    # Store in database with subscription_id in notes for lookup
    await db.execute(
        """INSERT INTO license_keys
           (id, key, plan, billing_cycle, status, max_activations,
            created_by, assigned_to_email, assigned_to_name, expires_at, created_at, notes)
           VALUES (?, ?, ?, ?, 'active', 2, ?, ?, ?, ?, ?, ?)""",
        (
            key_id,
            license_key,
            plan,
            billing_cycle,
            SYSTEM_USER_ID,
            customer_email,
            customer_name,
            expiry,
            now,
            f"dodo_sub:{subscription_id} | dodo_product:{product_id} | auto-generated",
        ),
    )
    await db.commit()

    logger.info(
        "License key generated: key=%s, plan=%s, cycle=%s, email=%s, sub=%s",
        license_key, plan, billing_cycle, customer_email, subscription_id,
    )

    # Send license key email to customer
    if customer_email:
        email_sent = send_license_email(
            to_email=customer_email,
            customer_name=customer_name,
            license_key=license_key,
            plan=plan,
            billing_cycle=billing_cycle,
            expires_at=expiry or "",
        )
        if email_sent:
            logger.info("License email sent to %s", customer_email)
        else:
            logger.warning("Failed to send license email to %s", customer_email)


async def _handle_subscription_renewed(db: aiosqlite.Connection, data: dict):
    """Handle subscription renewal — extend expiry of existing license key.

    Finds the license key by dodo subscription_id stored in notes,
    then extends the expiry by the appropriate period.
    """
    subscription_id = data.get("subscription_id", "")
    if not subscription_id:
        logger.error("subscription.renewed missing subscription_id: %s", data)
        return

    # Find the license key for this subscription
    cursor = await db.execute(
        "SELECT * FROM license_keys WHERE notes LIKE ?",
        (f"%dodo_sub:{subscription_id}%",),
    )
    row = await cursor.fetchone()
    if not row:
        logger.error("No license key found for subscription %s", subscription_id)
        return

    key_data = dict(row)
    billing_cycle = key_data["billing_cycle"]

    # Calculate new expiry from current expiry (or from now if already expired)
    current_expiry = key_data.get("expires_at", "")
    try:
        expiry_dt = datetime.fromisoformat(current_expiry)
    except (ValueError, TypeError):
        expiry_dt = datetime.now(timezone.utc)

    # If already expired, extend from now instead
    now = datetime.now(timezone.utc)
    base = max(expiry_dt, now)

    if billing_cycle == "monthly":
        new_expiry = base + timedelta(days=30)
    else:
        new_expiry = base + timedelta(days=365)

    await db.execute(
        "UPDATE license_keys SET expires_at = ?, status = 'active' WHERE id = ?",
        (new_expiry.isoformat(), key_data["id"]),
    )
    await db.commit()

    logger.info(
        "License key renewed: id=%s, old_expiry=%s, new_expiry=%s, sub=%s",
        key_data["id"], current_expiry, new_expiry.isoformat(), subscription_id,
    )


async def _handle_subscription_cancelled(db: aiosqlite.Connection, data: dict):
    """Handle subscription cancellation — revoke the license key.

    The key is set to 'revoked' status. The customer can no longer
    activate or validate the key.
    """
    subscription_id = data.get("subscription_id", "")
    if not subscription_id:
        logger.error("subscription.cancelled missing subscription_id: %s", data)
        return

    # Find the license key for this subscription
    cursor = await db.execute(
        "SELECT * FROM license_keys WHERE notes LIKE ?",
        (f"%dodo_sub:{subscription_id}%",),
    )
    row = await cursor.fetchone()
    if not row:
        logger.error("No license key found for subscription %s", subscription_id)
        return

    key_data = dict(row)

    await db.execute(
        "UPDATE license_keys SET status = 'revoked' WHERE id = ?",
        (key_data["id"],),
    )
    await db.commit()

    logger.info(
        "License key revoked: id=%s, key=%s, sub=%s",
        key_data["id"], key_data["key"], subscription_id,
    )
