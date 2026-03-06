"""Reseller routes for Master Reseller and Reseller panels."""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Header
import aiosqlite

from app.database import get_db
from app.models.schemas import GenerateKeysRequest, CreateUserRequest
from app.services.auth import hash_password, decode_token
from app.services.license import generate_keys, get_expiry_date, PRICING

router = APIRouter(prefix="/api/reseller", tags=["reseller"])


async def require_reseller(authorization: str = Header(""), db: aiosqlite.Connection = Depends(get_db)) -> dict:
    """Require master_reseller or reseller role."""
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
    if user_dict["role"] not in ("master_reseller", "reseller"):
        raise HTTPException(status_code=403, detail="Reseller access required")
    if user_dict["status"] != "active":
        raise HTTPException(status_code=403, detail="Account suspended")
    return user_dict


async def get_hierarchy_ids(user_id: str, db: aiosqlite.Connection) -> list[str]:
    """Get all user IDs in the hierarchy under a user (including self)."""
    ids = [user_id]
    cursor = await db.execute("SELECT id FROM users WHERE parent_id = ?", (user_id,))
    children = await cursor.fetchall()
    for child in children:
        child_ids = await get_hierarchy_ids(dict(child)["id"], db)
        ids.extend(child_ids)
    return ids


@router.get("/stats")
async def get_reseller_stats(user: dict = Depends(require_reseller), db: aiosqlite.Connection = Depends(get_db)):
    """Get reseller dashboard statistics — only their own data."""
    hierarchy_ids = await get_hierarchy_ids(user["id"], db)
    placeholders = ",".join(["?" for _ in hierarchy_ids])

    stats: dict = {}

    # Total keys created by this hierarchy
    cursor = await db.execute(
        f"SELECT COUNT(*) as cnt FROM license_keys WHERE created_by IN ({placeholders})", hierarchy_ids
    )
    stats["total_keys"] = dict(await cursor.fetchone())["cnt"]

    # Active keys
    cursor = await db.execute(
        f"SELECT COUNT(*) as cnt FROM license_keys WHERE created_by IN ({placeholders}) AND status = 'active'",
        hierarchy_ids,
    )
    stats["active_keys"] = dict(await cursor.fetchone())["cnt"]

    # By plan
    cursor = await db.execute(
        f"SELECT COUNT(*) as cnt FROM license_keys WHERE created_by IN ({placeholders}) AND plan = 'starter'",
        hierarchy_ids,
    )
    stats["starter_keys"] = dict(await cursor.fetchone())["cnt"]

    cursor = await db.execute(
        f"SELECT COUNT(*) as cnt FROM license_keys WHERE created_by IN ({placeholders}) AND plan = 'pro'",
        hierarchy_ids,
    )
    stats["pro_keys"] = dict(await cursor.fetchone())["cnt"]

    # Revenue
    cursor = await db.execute(
        f"SELECT plan, billing_cycle, COUNT(*) as cnt FROM license_keys WHERE created_by IN ({placeholders}) GROUP BY plan, billing_cycle",
        hierarchy_ids,
    )
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

    # Sub-resellers count (only for master_reseller)
    if user["role"] == "master_reseller":
        cursor = await db.execute("SELECT COUNT(*) as cnt FROM users WHERE parent_id = ? AND role = 'reseller'", (user["id"],))
        stats["sub_resellers"] = dict(await cursor.fetchone())["cnt"]

    return stats


@router.post("/keys/generate")
async def reseller_generate_keys(
    req: GenerateKeysRequest,
    user: dict = Depends(require_reseller),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Generate keys as a reseller."""
    if req.quantity < 1 or req.quantity > 50:
        raise HTTPException(status_code=400, detail="Quantity must be between 1 and 50")
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
            (key_id, key, req.plan, req.billing_cycle, user["id"],
             req.assigned_to_email, req.assigned_to_name, expiry, now, req.notes),
        )
        created.append({
            "id": key_id,
            "key": key,
            "plan": req.plan,
            "billing_cycle": req.billing_cycle,
            "expires_at": expiry,
        })

    await db.commit()
    return {"keys": created, "count": len(created)}


@router.get("/keys")
async def reseller_list_keys(
    page: int = 1,
    per_page: int = 50,
    search: str = "",
    user: dict = Depends(require_reseller),
    db: aiosqlite.Connection = Depends(get_db),
):
    """List keys created by this reseller hierarchy only."""
    hierarchy_ids = await get_hierarchy_ids(user["id"], db)
    placeholders = ",".join(["?" for _ in hierarchy_ids])

    query = f"SELECT * FROM license_keys WHERE created_by IN ({placeholders})"
    params: list = list(hierarchy_ids)

    if search:
        query += " AND (key LIKE ? OR assigned_to_email LIKE ? OR assigned_to_name LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])

    count_query = query.replace("SELECT *", "SELECT COUNT(*) as cnt")
    cursor = await db.execute(count_query, params)
    total = dict(await cursor.fetchone())["cnt"]

    offset = (page - 1) * per_page
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.extend([per_page, offset])

    cursor = await db.execute(query, params)
    rows = await cursor.fetchall()
    keys = [dict(row) for row in rows]

    return {"keys": keys, "total": total, "page": page, "per_page": per_page}


@router.post("/sub-resellers")
async def create_sub_reseller(
    req: CreateUserRequest,
    user: dict = Depends(require_reseller),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Create a sub-reseller (only master_reseller can do this)."""
    if user["role"] != "master_reseller":
        raise HTTPException(status_code=403, detail="Only master resellers can create sub-resellers")
    cursor = await db.execute("SELECT id FROM users WHERE email = ?", (req.email,))
    if await cursor.fetchone():
        raise HTTPException(status_code=400, detail="Email already exists")
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    await db.execute(
        "INSERT INTO users (id, email, password_hash, name, role, parent_id, created_at) VALUES (?, ?, ?, ?, 'reseller', ?, ?)",
        (user_id, req.email, hash_password(req.password), req.name, user["id"], now),
    )
    await db.commit()
    return {
        "id": user_id,
        "email": req.email,
        "name": req.name,
        "role": "reseller",
        "created_at": now,
    }


@router.get("/sub-resellers")
async def list_sub_resellers(user: dict = Depends(require_reseller), db: aiosqlite.Connection = Depends(get_db)):
    """List sub-resellers under this master reseller."""
    if user["role"] != "master_reseller":
        return {"resellers": []}
    cursor = await db.execute(
        "SELECT id, email, name, role, status, created_at, last_login FROM users WHERE parent_id = ? AND role = 'reseller' ORDER BY created_at DESC",
        (user["id"],),
    )
    rows = await cursor.fetchall()
    resellers = []
    for row in rows:
        r = dict(row)
        cursor2 = await db.execute("SELECT COUNT(*) as cnt FROM license_keys WHERE created_by = ?", (r["id"],))
        r["total_keys"] = dict(await cursor2.fetchone())["cnt"]
        resellers.append(r)
    return {"resellers": resellers}
