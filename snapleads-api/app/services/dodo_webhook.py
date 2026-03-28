"""Dodo Payments webhook handling service.

Maps Dodo product IDs to SnapLeads plans, verifies webhook signatures,
and orchestrates license key generation + email delivery on payment events.
"""
import base64
import hashlib
import hmac
import logging
import os
import time

logger = logging.getLogger(__name__)

# Webhook secret from Dodo Payments dashboard (Settings > Webhooks)
DODO_WEBHOOK_SECRET = os.environ.get("DODO_WEBHOOK_SECRET", "")

# Dodo Product ID → SnapLeads plan mapping
DODO_PRODUCT_MAP: dict[str, dict[str, str]] = {
    "pdt_0NbTzBdTBYTeFm09HPt5g": {"plan": "starter", "billing_cycle": "monthly"},
    "pdt_0NbTzOk5XHeFxkUELENXl": {"plan": "starter", "billing_cycle": "yearly"},
    "pdt_0NbTzZroyG9d8UJ99Npsx": {"plan": "pro", "billing_cycle": "monthly"},
    "pdt_0NbTzoHEqWKfiDqn2r4SH": {"plan": "pro", "billing_cycle": "yearly"},
}

# Tolerance for webhook timestamp verification (5 minutes)
TIMESTAMP_TOLERANCE_SECONDS = 300


def verify_webhook_signature(
    payload: bytes,
    webhook_id: str,
    webhook_signature: str,
    webhook_timestamp: str,
) -> bool:
    """Verify Dodo Payments webhook signature using Standard Webhooks spec.

    The signature follows: base64(HMAC-SHA256(secret, "{msg_id}.{timestamp}.{body}"))
    The webhook-signature header may contain multiple signatures prefixed with version,
    e.g. "v1,base64sig1 v1,base64sig2".
    """
    if not DODO_WEBHOOK_SECRET:
        logger.warning("DODO_WEBHOOK_SECRET not set — skipping signature verification")
        return True  # Allow in dev; in production this env var MUST be set

    # Verify timestamp is within tolerance
    try:
        ts = int(webhook_timestamp)
        now = int(time.time())
        if abs(now - ts) > TIMESTAMP_TOLERANCE_SECONDS:
            logger.error("Webhook timestamp too old: %s (now=%s)", ts, now)
            return False
    except (ValueError, TypeError):
        logger.error("Invalid webhook timestamp: %s", webhook_timestamp)
        return False

    # The secret from Dodo dashboard is base64-encoded with "whsec_" prefix
    secret = DODO_WEBHOOK_SECRET
    if secret.startswith("whsec_"):
        secret = secret[6:]
    try:
        secret_bytes = base64.b64decode(secret)
    except Exception:
        logger.error("Failed to decode webhook secret")
        return False

    # Construct the signed content: "{msg_id}.{timestamp}.{body}"
    signed_content = f"{webhook_id}.{webhook_timestamp}.".encode() + payload
    expected_sig = base64.b64encode(
        hmac.new(secret_bytes, signed_content, hashlib.sha256).digest()
    ).decode()

    # The header can contain multiple signatures separated by spaces
    # Each signature is prefixed with version, e.g. "v1,<base64sig>"
    for sig_part in webhook_signature.split(" "):
        parts = sig_part.split(",", 1)
        if len(parts) == 2 and parts[0] == "v1":
            if hmac.compare_digest(expected_sig, parts[1]):
                return True

    logger.error("Webhook signature mismatch")
    return False


def resolve_plan_from_product(product_id: str) -> dict[str, str] | None:
    """Map a Dodo product ID to a SnapLeads plan and billing cycle."""
    return DODO_PRODUCT_MAP.get(product_id)
