"""Public license validation and activation routes."""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
import aiosqlite

from app.database import get_db
from app.models.schemas import ValidateLicenseRequest, ActivateLicenseRequest
from app.services.license import compute_signature, PLAN_FEATURES

router = APIRouter(prefix="/api/license", tags=["license"])


@router.post("/validate")
async def validate_license(req: ValidateLicenseRequest, request: Request, db: aiosqlite.Connection = Depends(get_db)):
    """Validate a license key. Called by the desktop app on startup."""
    cursor = await db.execute("SELECT * FROM license_keys WHERE key = ?", (req.key,))
    row = await cursor.fetchone()

    log_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    client_ip = request.client.host if request.client else ""

    if not row:
        # Log failed validation
        await db.execute(
            "INSERT INTO validation_logs (id, license_id, device_id, ip_address, result, validated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (log_id, "", req.device_id, client_ip, "invalid_key", now),
        )
        await db.commit()
        return {
            "valid": False,
            "error": "invalid_key",
            "message": "License key not found",
        }

    key_data = dict(row)

    # Check if revoked
    if key_data["status"] == "revoked":
        await db.execute(
            "INSERT INTO validation_logs (id, license_id, device_id, ip_address, result, validated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (log_id, key_data["id"], req.device_id, client_ip, "revoked", now),
        )
        await db.commit()
        return {
            "valid": False,
            "error": "revoked",
            "message": "License key has been revoked",
        }

    # Check expiry
    if key_data["expires_at"]:
        expiry = datetime.fromisoformat(key_data["expires_at"])
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
        if expiry < datetime.now(timezone.utc):
            await db.execute("UPDATE license_keys SET status = 'expired' WHERE id = ?", (key_data["id"],))
            await db.execute(
                "INSERT INTO validation_logs (id, license_id, device_id, ip_address, result, validated_at) VALUES (?, ?, ?, ?, ?, ?)",
                (log_id, key_data["id"], req.device_id, client_ip, "expired", now),
            )
            await db.commit()
            return {
                "valid": False,
                "error": "expired",
                "message": "License key has expired",
                "expired_at": key_data["expires_at"],
            }

    # Update last validated
    await db.execute("UPDATE license_keys SET last_validated = ? WHERE id = ?", (now, key_data["id"]))

    # Log successful validation
    await db.execute(
        "INSERT INTO validation_logs (id, license_id, device_id, ip_address, result, validated_at) VALUES (?, ?, ?, ?, ?, ?)",
        (log_id, key_data["id"], req.device_id, client_ip, "valid", now),
    )
    await db.commit()

    plan = key_data["plan"]
    features = PLAN_FEATURES.get(plan, PLAN_FEATURES["starter"])

    # Compute offline signature for the desktop app to cache
    signature = compute_signature(req.key)

    return {
        "valid": True,
        "plan": plan,
        "billing_cycle": key_data["billing_cycle"],
        "expires_at": key_data["expires_at"],
        "features": features,
        "signature": signature,
        "max_activations": key_data["max_activations"],
        "current_activations": key_data["current_activations"],
    }


@router.post("/activate")
async def activate_license(req: ActivateLicenseRequest, request: Request, db: aiosqlite.Connection = Depends(get_db)):
    """Activate a license key on a new device."""
    if not req.device_id:
        raise HTTPException(status_code=400, detail="Device ID is required")

    cursor = await db.execute("SELECT * FROM license_keys WHERE key = ?", (req.key,))
    row = await cursor.fetchone()
    if not row:
        return {"activated": False, "error": "invalid_key", "message": "License key not found"}

    key_data = dict(row)

    # Check status
    if key_data["status"] == "revoked":
        return {"activated": False, "error": "revoked", "message": "License key has been revoked"}
    if key_data["status"] == "expired":
        return {"activated": False, "error": "expired", "message": "License key has expired"}

    # Check expiry
    if key_data["expires_at"]:
        expiry = datetime.fromisoformat(key_data["expires_at"])
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
        if expiry < datetime.now(timezone.utc):
            return {"activated": False, "error": "expired", "message": "License key has expired"}

    # Check if already activated on this device
    cursor = await db.execute(
        "SELECT * FROM activations WHERE license_id = ? AND device_id = ?",
        (key_data["id"], req.device_id),
    )
    existing = await cursor.fetchone()
    if existing:
        # Already activated — just update last_seen
        now = datetime.now(timezone.utc).isoformat()
        await db.execute(
            "UPDATE activations SET last_seen = ? WHERE license_id = ? AND device_id = ?",
            (now, key_data["id"], req.device_id),
        )
        await db.commit()
        plan = key_data["plan"]
        features = PLAN_FEATURES.get(plan, PLAN_FEATURES["starter"])
        signature = compute_signature(req.key)
        return {
            "activated": True,
            "already_active": True,
            "plan": plan,
            "billing_cycle": key_data["billing_cycle"],
            "expires_at": key_data["expires_at"],
            "features": features,
            "signature": signature,
        }

    # Check max activations
    if key_data["current_activations"] >= key_data["max_activations"]:
        return {
            "activated": False,
            "error": "max_activations",
            "message": f"Maximum {key_data['max_activations']} device activations reached",
            "current_activations": key_data["current_activations"],
            "max_activations": key_data["max_activations"],
        }

    # Activate
    now = datetime.now(timezone.utc).isoformat()
    client_ip = request.client.host if request.client else ""
    activation_id = str(uuid.uuid4())

    await db.execute(
        "INSERT INTO activations (id, license_id, device_id, device_name, ip_address, activated_at, last_seen) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (activation_id, key_data["id"], req.device_id, req.device_name, client_ip, now, now),
    )
    new_count = key_data["current_activations"] + 1
    await db.execute(
        "UPDATE license_keys SET current_activations = ?, activated_at = COALESCE(activated_at, ?) WHERE id = ?",
        (new_count, now, key_data["id"]),
    )
    await db.commit()

    plan = key_data["plan"]
    features = PLAN_FEATURES.get(plan, PLAN_FEATURES["starter"])
    signature = compute_signature(req.key)

    return {
        "activated": True,
        "already_active": False,
        "plan": plan,
        "billing_cycle": key_data["billing_cycle"],
        "expires_at": key_data["expires_at"],
        "features": features,
        "signature": signature,
        "current_activations": new_count,
        "max_activations": key_data["max_activations"],
    }


@router.post("/deactivate")
async def deactivate_device(req: ActivateLicenseRequest, db: aiosqlite.Connection = Depends(get_db)):
    """Deactivate a license on a specific device."""
    cursor = await db.execute("SELECT * FROM license_keys WHERE key = ?", (req.key,))
    row = await cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="License key not found")

    key_data = dict(row)

    result = await db.execute(
        "DELETE FROM activations WHERE license_id = ? AND device_id = ?",
        (key_data["id"], req.device_id),
    )
    if result.rowcount and result.rowcount > 0:
        new_count = max(0, key_data["current_activations"] - 1)
        await db.execute(
            "UPDATE license_keys SET current_activations = ? WHERE id = ?",
            (new_count, key_data["id"]),
        )
    await db.commit()
    return {"deactivated": True, "message": "Device deactivated"}


@router.get("/pricing")
async def get_pricing():
    """Get pricing information — public endpoint."""
    from app.services.license import PRICING
    return {"pricing": PRICING}


@router.get("/features/{plan}")
async def get_plan_features(plan: str):
    """Get feature list for a plan — public endpoint."""
    if plan not in PLAN_FEATURES:
        raise HTTPException(status_code=404, detail="Plan not found")
    return {"plan": plan, "features": PLAN_FEATURES[plan]}
