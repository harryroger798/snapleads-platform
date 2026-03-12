"""Usage tracking and quota enforcement routes for Desktop-First SaaS."""
import uuid
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException
import aiosqlite

from app.database import get_db
from app.models.schemas import LogUsageRequest
from app.routes.auth_deps import require_licensed_user

router = APIRouter(prefix="/api/usage", tags=["usage"])

# Quotas per plan (daily limits)
PLAN_QUOTAS = {
    "starter": {
        "searches_per_day": 10,
        "leads_per_search": 100,
        "exports_per_day": 5,
        "enrichments_per_day": 10,
        "shared_leads_per_day": 50,
    },
    "pro": {
        "searches_per_day": -1,  # unlimited
        "leads_per_search": -1,
        "exports_per_day": -1,
        "enrichments_per_day": -1,
        "shared_leads_per_day": -1,
    },
}


async def _get_user_plan(user_id: str, db: aiosqlite.Connection) -> str:
    """Get the user's current plan from their license key (filtered by user)."""
    # Find license keys activated on devices associated with this user's email
    cursor = await db.execute(
        """SELECT lk.plan FROM license_keys lk
           WHERE lk.status = 'active'
           AND lk.assigned_to_email = (SELECT email FROM users WHERE id = ?)
           AND (lk.expires_at IS NULL OR lk.expires_at > ?)
           ORDER BY lk.created_at DESC LIMIT 1""",
        (user_id, datetime.now(timezone.utc).isoformat()),
    )
    row = await cursor.fetchone()
    if row:
        return dict(row)["plan"]
    return "starter"


async def _get_daily_usage(user_id: str, action: str, db: aiosqlite.Connection) -> int:
    """Get usage count for today."""
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    cursor = await db.execute(
        "SELECT COUNT(*) as cnt FROM usage_logs WHERE user_id = ? AND action = ? AND created_at >= ?",
        (user_id, action, today_start),
    )
    return dict(await cursor.fetchone())["cnt"]


@router.post("/log")
async def log_usage(
    req: LogUsageRequest,
    user: dict = Depends(require_licensed_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Log a usage event. Called by the desktop app after each action."""
    valid_actions = ("search", "export", "enrichment", "share_lead", "extraction")
    if req.action not in valid_actions:
        raise HTTPException(status_code=400, detail=f"Action must be one of: {', '.join(valid_actions)}")

    log_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    await db.execute(
        "INSERT INTO usage_logs (id, user_id, action, detail, platform, lead_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (log_id, user["id"], req.action, req.detail, req.platform, req.lead_count, now),
    )
    await db.commit()
    return {"logged": True, "id": log_id}


@router.get("/check")
async def check_quota(
    action: str = "search",
    user: dict = Depends(require_licensed_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Check if the user has remaining quota for an action.
    Called by the desktop app BEFORE performing expensive operations."""
    plan = await _get_user_plan(user["id"], db)
    quotas = PLAN_QUOTAS.get(plan, PLAN_QUOTAS["starter"])

    # Normalize: search -> searches_per_day, export -> exports_per_day
    key_map = {
        "search": "searches_per_day",
        "export": "exports_per_day",
        "enrichment": "enrichments_per_day",
        "share_lead": "shared_leads_per_day",
        "extraction": "searches_per_day",
    }
    quota_key = key_map.get(action, "searches_per_day")
    daily_limit = quotas.get(quota_key, 10)

    if daily_limit == -1:
        return {"allowed": True, "remaining": -1, "plan": plan, "limit": -1}

    current_usage = await _get_daily_usage(user["id"], action, db)
    remaining = max(0, daily_limit - current_usage)

    return {
        "allowed": remaining > 0,
        "remaining": remaining,
        "used_today": current_usage,
        "limit": daily_limit,
        "plan": plan,
    }


@router.get("/stats")
async def get_usage_stats(
    days: int = 30,
    user: dict = Depends(require_licensed_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Get usage statistics for the current user."""
    if days > 90:
        days = 90

    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    plan = await _get_user_plan(user["id"], db)
    quotas = PLAN_QUOTAS.get(plan, PLAN_QUOTAS["starter"])

    # Total counts by action
    cursor = await db.execute(
        "SELECT action, COUNT(*) as cnt, COALESCE(SUM(lead_count), 0) as total_leads FROM usage_logs WHERE user_id = ? AND created_at >= ? GROUP BY action",
        (user["id"], since),
    )
    by_action = {}
    total_leads = 0
    for row in await cursor.fetchall():
        r = dict(row)
        by_action[r["action"]] = {"count": r["cnt"], "total_leads": r["total_leads"]}
        total_leads += r["total_leads"]

    # Daily breakdown (last 7 days)
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    cursor = await db.execute(
        """SELECT DATE(created_at) as day, action, COUNT(*) as cnt
           FROM usage_logs WHERE user_id = ? AND created_at >= ?
           GROUP BY DATE(created_at), action
           ORDER BY day DESC""",
        (user["id"], week_ago),
    )
    daily = [dict(r) for r in await cursor.fetchall()]

    # Today's usage for quota display
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    cursor = await db.execute(
        "SELECT action, COUNT(*) as cnt FROM usage_logs WHERE user_id = ? AND created_at >= ? GROUP BY action",
        (user["id"], today_start),
    )
    today = {}
    for row in await cursor.fetchall():
        r = dict(row)
        today[r["action"]] = r["cnt"]

    # Platform breakdown
    cursor = await db.execute(
        "SELECT platform, COUNT(*) as cnt, COALESCE(SUM(lead_count), 0) as total_leads FROM usage_logs WHERE user_id = ? AND created_at >= ? AND platform != '' GROUP BY platform ORDER BY cnt DESC",
        (user["id"], since),
    )
    by_platform = [dict(r) for r in await cursor.fetchall()]

    return {
        "plan": plan,
        "quotas": quotas,
        "period_days": days,
        "by_action": by_action,
        "total_leads_extracted": total_leads,
        "daily": daily,
        "today": today,
        "by_platform": by_platform,
    }


@router.get("/quotas")
async def get_quotas(
    user: dict = Depends(require_licensed_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Get the user's plan quotas and current daily usage."""
    plan = await _get_user_plan(user["id"], db)
    quotas = PLAN_QUOTAS.get(plan, PLAN_QUOTAS["starter"])

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    cursor = await db.execute(
        "SELECT action, COUNT(*) as cnt FROM usage_logs WHERE user_id = ? AND created_at >= ? GROUP BY action",
        (user["id"], today_start),
    )
    today = {}
    for row in await cursor.fetchall():
        r = dict(row)
        today[r["action"]] = r["cnt"]

    return {
        "plan": plan,
        "quotas": quotas,
        "today_usage": today,
    }
