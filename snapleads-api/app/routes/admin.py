"""Admin routes for Super Admin dashboard."""
import uuid
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, Header
import aiosqlite

from app.database import get_db
from app.models.schemas import GenerateKeysRequest
from app.services.auth import decode_token
from app.services.license import generate_keys, get_expiry_date, PRICING

router = APIRouter(prefix="/api/admin", tags=["admin"])


async def require_admin(authorization: str = Header(""), db: aiosqlite.Connection = Depends(get_db)) -> dict:
    """Require super_admin role."""
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = payload.get("sub")
    cursor = await db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = await cursor.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    user_dict = dict(user)
    if user_dict["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    if user_dict["status"] != "active":
        raise HTTPException(status_code=403, detail="Account suspended")
    return user_dict


@router.get("/stats")
async def get_stats(admin: dict = Depends(require_admin), db: aiosqlite.Connection = Depends(get_db)):
    """Get dashboard statistics."""
    now = datetime.now(timezone.utc)
    d7 = (now + timedelta(days=7)).isoformat()
    d30 = (now + timedelta(days=30)).isoformat()
    now_iso = now.isoformat()

    stats = {}

    # Total keys
    cursor = await db.execute("SELECT COUNT(*) as cnt FROM license_keys")
    stats["total_keys"] = dict(await cursor.fetchone())["cnt"]

    # Active keys
    cursor = await db.execute("SELECT COUNT(*) as cnt FROM license_keys WHERE status = 'active'")
    stats["active_keys"] = dict(await cursor.fetchone())["cnt"]

    # Expired keys
    cursor = await db.execute(
        "SELECT COUNT(*) as cnt FROM license_keys WHERE status = 'expired' OR (expires_at IS NOT NULL AND expires_at < ?)",
        (now_iso,),
    )
    stats["expired_keys"] = dict(await cursor.fetchone())["cnt"]

    # Revoked keys
    cursor = await db.execute("SELECT COUNT(*) as cnt FROM license_keys WHERE status = 'revoked'")
    stats["revoked_keys"] = dict(await cursor.fetchone())["cnt"]

    # By plan
    cursor = await db.execute("SELECT COUNT(*) as cnt FROM license_keys WHERE plan = 'starter'")
    stats["starter_keys"] = dict(await cursor.fetchone())["cnt"]

    cursor = await db.execute("SELECT COUNT(*) as cnt FROM license_keys WHERE plan = 'pro'")
    stats["pro_keys"] = dict(await cursor.fetchone())["cnt"]

    # Total activations
    cursor = await db.execute("SELECT COUNT(*) as cnt FROM activations")
    stats["total_activations"] = dict(await cursor.fetchone())["cnt"]

    # Expiring soon
    cursor = await db.execute(
        "SELECT COUNT(*) as cnt FROM license_keys WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at BETWEEN ? AND ?",
        (now_iso, d7),
    )
    stats["keys_expiring_7d"] = dict(await cursor.fetchone())["cnt"]

    cursor = await db.execute(
        "SELECT COUNT(*) as cnt FROM license_keys WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at BETWEEN ? AND ?",
        (now_iso, d30),
    )
    stats["keys_expiring_30d"] = dict(await cursor.fetchone())["cnt"]

    # Revenue calculation
    cursor = await db.execute("SELECT plan, billing_cycle, COUNT(*) as cnt FROM license_keys GROUP BY plan, billing_cycle")
    rows = await cursor.fetchall()
    total_usd = 0
    total_inr = 0
    for row in rows:
        r = dict(row)
        plan = r["plan"]
        cycle = r["billing_cycle"]
        count = r["cnt"]
        if plan in PRICING and cycle in PRICING[plan]:
            total_usd += PRICING[plan][cycle]["usd"] * count
            total_inr += PRICING[plan][cycle]["inr"] * count
    stats["revenue_usd"] = total_usd
    stats["revenue_inr"] = total_inr

    return stats


@router.post("/keys/generate")
async def generate_license_keys(
    req: GenerateKeysRequest,
    admin: dict = Depends(require_admin),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Generate new license keys."""
    if req.quantity < 1 or req.quantity > 100:
        raise HTTPException(status_code=400, detail="Quantity must be between 1 and 100")
    if req.plan not in ("starter", "pro"):
        raise HTTPException(status_code=400, detail="Plan must be 'starter' or 'pro'")
    if req.billing_cycle not in ("monthly", "yearly", "lifetime"):
        raise HTTPException(status_code=400, detail="Billing cycle must be 'monthly', 'yearly', or 'lifetime'")

    keys = generate_keys(req.quantity, req.plan, req.billing_cycle)
    now = datetime.now(timezone.utc).isoformat()
    expiry = get_expiry_date(req.billing_cycle)
    created = []

    for key in keys:
        key_id = str(uuid.uuid4())
        await db.execute(
            """INSERT INTO license_keys (id, key, plan, billing_cycle, status, max_activations,
               created_by, assigned_to_email, assigned_to_name, expires_at, created_at, notes)
               VALUES (?, ?, ?, ?, 'active', 2, ?, ?, ?, ?, ?, ?)""",
            (key_id, key, req.plan, req.billing_cycle, admin["id"],
             req.assigned_to_email, req.assigned_to_name, expiry, now, req.notes),
        )
        created.append({
            "id": key_id,
            "key": key,
            "plan": req.plan,
            "billing_cycle": req.billing_cycle,
            "expires_at": expiry,
            "assigned_to_email": req.assigned_to_email,
            "assigned_to_name": req.assigned_to_name,
        })

    await db.commit()
    return {"keys": created, "count": len(created)}


@router.get("/keys")
async def list_keys(
    page: int = 1,
    per_page: int = 50,
    plan: str = "",
    status: str = "",
    search: str = "",
    admin: dict = Depends(require_admin),
    db: aiosqlite.Connection = Depends(get_db),
):
    """List all license keys with filtering."""
    query = "SELECT * FROM license_keys WHERE 1=1"
    params: list = []

    if plan:
        query += " AND plan = ?"
        params.append(plan)
    if status:
        query += " AND status = ?"
        params.append(status)
    if search:
        query += " AND (key LIKE ? OR assigned_to_email LIKE ? OR assigned_to_name LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])

    # Count total
    count_query = query.replace("SELECT *", "SELECT COUNT(*) as cnt")
    cursor = await db.execute(count_query, params)
    total = dict(await cursor.fetchone())["cnt"]

    # Paginate
    offset = (page - 1) * per_page
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.extend([per_page, offset])

    cursor = await db.execute(query, params)
    rows = await cursor.fetchall()
    keys = [dict(row) for row in rows]

    return {"keys": keys, "total": total, "page": page, "per_page": per_page}


@router.get("/keys/{key_id}")
async def get_key_detail(key_id: str, admin: dict = Depends(require_admin), db: aiosqlite.Connection = Depends(get_db)):
    """Get detailed info about a specific key."""
    cursor = await db.execute("SELECT * FROM license_keys WHERE id = ?", (key_id,))
    key = await cursor.fetchone()
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")
    key_dict = dict(key)

    # Get activations
    cursor = await db.execute("SELECT * FROM activations WHERE license_id = ?", (key_id,))
    activations = [dict(row) for row in await cursor.fetchall()]
    key_dict["activations"] = activations

    # Get validation logs
    cursor = await db.execute(
        "SELECT * FROM validation_logs WHERE license_id = ? ORDER BY validated_at DESC LIMIT 20",
        (key_id,),
    )
    logs = [dict(row) for row in await cursor.fetchall()]
    key_dict["validation_logs"] = logs

    return key_dict


@router.put("/keys/{key_id}/revoke")
async def revoke_key(key_id: str, admin: dict = Depends(require_admin), db: aiosqlite.Connection = Depends(get_db)):
    """Revoke a license key."""
    cursor = await db.execute("SELECT * FROM license_keys WHERE id = ?", (key_id,))
    key = await cursor.fetchone()
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")
    await db.execute("UPDATE license_keys SET status = 'revoked' WHERE id = ?", (key_id,))
    await db.commit()
    return {"message": "Key revoked", "id": key_id}


@router.put("/keys/{key_id}/activate")
async def reactivate_key(key_id: str, admin: dict = Depends(require_admin), db: aiosqlite.Connection = Depends(get_db)):
    """Reactivate a revoked or expired key."""
    cursor = await db.execute("SELECT * FROM license_keys WHERE id = ?", (key_id,))
    key = await cursor.fetchone()
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")
    await db.execute("UPDATE license_keys SET status = 'active' WHERE id = ?", (key_id,))
    await db.commit()
    return {"message": "Key reactivated", "id": key_id}
