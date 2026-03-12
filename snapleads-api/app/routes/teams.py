"""Team management routes for Desktop-First SaaS."""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
import aiosqlite

from app.database import get_db
from app.models.schemas import (
    CreateTeamRequest,
    InviteTeamMemberRequest,
    ShareLeadRequest,
    ShareLeadsBatchRequest,
)
from app.routes.auth_deps import require_licensed_user

router = APIRouter(prefix="/api/teams", tags=["teams"])


# ─── Team CRUD ─────────────────────────────────────────────────────────────


@router.post("")
async def create_team(
    req: CreateTeamRequest,
    user: dict = Depends(require_licensed_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Create a new team. The creator becomes the owner."""
    # Check if user already owns a team
    cursor = await db.execute(
        "SELECT id FROM teams WHERE owner_id = ?", (user["id"],)
    )
    if await cursor.fetchone():
        raise HTTPException(status_code=400, detail="You already own a team. Delete it first to create a new one.")

    team_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    await db.execute(
        "INSERT INTO teams (id, name, owner_id, created_at) VALUES (?, ?, ?, ?)",
        (team_id, req.name, user["id"], now),
    )

    # Auto-add owner as member with 'owner' role
    member_id = str(uuid.uuid4())
    await db.execute(
        "INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES (?, ?, ?, 'owner', ?)",
        (member_id, team_id, user["id"], now),
    )

    # Log activity
    activity_id = str(uuid.uuid4())
    await db.execute(
        "INSERT INTO activity_feed (id, team_id, user_id, action, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (activity_id, team_id, user["id"], "team_created", f"Created team '{req.name}'", now),
    )

    await db.commit()
    return {
        "id": team_id,
        "name": req.name,
        "owner_id": user["id"],
        "created_at": now,
    }


@router.get("/my")
async def get_my_teams(
    user: dict = Depends(require_licensed_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Get all teams the current user belongs to."""
    # Use subqueries to avoid N+1 queries (fix #24)
    cursor = await db.execute(
        """SELECT t.*, tm.role as member_role,
           (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count,
           (SELECT COUNT(*) FROM shared_leads WHERE team_id = t.id) as shared_leads_count
           FROM teams t
           JOIN team_members tm ON t.id = tm.team_id
           WHERE tm.user_id = ?
           ORDER BY t.created_at DESC""",
        (user["id"],),
    )
    rows = await cursor.fetchall()
    teams = [dict(row) for row in rows]
    return {"teams": teams}


@router.get("/{team_id}")
async def get_team(
    team_id: str,
    user: dict = Depends(require_licensed_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Get team details (must be a member)."""
    # Check team exists first (fix #22)
    cursor = await db.execute("SELECT * FROM teams WHERE id = ?", (team_id,))
    team = await cursor.fetchone()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    # Verify membership
    cursor = await db.execute(
        "SELECT role FROM team_members WHERE team_id = ? AND user_id = ?",
        (team_id, user["id"]),
    )
    membership = await cursor.fetchone()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this team")

    team_dict = dict(team)

    # Get members with user info
    cursor = await db.execute(
        """SELECT tm.user_id, tm.role, tm.joined_at, u.email, u.name
           FROM team_members tm
           JOIN users u ON tm.user_id = u.id
           WHERE tm.team_id = ?
           ORDER BY tm.joined_at""",
        (team_id,),
    )
    team_dict["members"] = [dict(r) for r in await cursor.fetchall()]

    return {"team": team_dict}


@router.delete("/{team_id}")
async def delete_team(
    team_id: str,
    user: dict = Depends(require_licensed_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Delete a team (owner only)."""
    # Check team exists first (fix #22)
    cursor = await db.execute("SELECT * FROM teams WHERE id = ?", (team_id,))
    team = await cursor.fetchone()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    if dict(team)["owner_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Only the team owner can delete the team")

    await db.execute("DELETE FROM shared_leads WHERE team_id = ?", (team_id,))
    await db.execute("DELETE FROM activity_feed WHERE team_id = ?", (team_id,))
    await db.execute("DELETE FROM team_members WHERE team_id = ?", (team_id,))
    await db.execute("DELETE FROM teams WHERE id = ?", (team_id,))
    await db.commit()
    return {"message": "Team deleted"}


# ─── Team Members ──────────────────────────────────────────────────────────


@router.post("/{team_id}/invite")
async def invite_member(
    team_id: str,
    req: InviteTeamMemberRequest,
    user: dict = Depends(require_licensed_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Invite a user to the team by email (owner or admin only)."""
    # Verify inviter is owner or admin
    cursor = await db.execute(
        "SELECT role FROM team_members WHERE team_id = ? AND user_id = ?",
        (team_id, user["id"]),
    )
    membership = await cursor.fetchone()
    if not membership or dict(membership)["role"] not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Only owners and admins can invite members")

    # Find the invitee by email
    cursor = await db.execute("SELECT id FROM users WHERE email = ?", (req.email,))
    invitee = await cursor.fetchone()
    if not invitee:
        raise HTTPException(status_code=404, detail="No user found with that email. They must register first.")

    invitee_id = dict(invitee)["id"]

    # Check if already a member
    cursor = await db.execute(
        "SELECT id FROM team_members WHERE team_id = ? AND user_id = ?",
        (team_id, invitee_id),
    )
    if await cursor.fetchone():
        raise HTTPException(status_code=400, detail="User is already a member of this team")

    # Check team size limit (free tier: max 5 members)
    cursor = await db.execute(
        "SELECT COUNT(*) as cnt FROM team_members WHERE team_id = ?", (team_id,)
    )
    count = dict(await cursor.fetchone())["cnt"]
    if count >= 10:
        raise HTTPException(status_code=400, detail="Team is at maximum capacity (10 members)")

    member_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    role = req.role if req.role in ("admin", "member") else "member"

    await db.execute(
        "INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES (?, ?, ?, ?, ?)",
        (member_id, team_id, invitee_id, role, now),
    )

    # Log activity
    activity_id = str(uuid.uuid4())
    await db.execute(
        "INSERT INTO activity_feed (id, team_id, user_id, action, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (activity_id, team_id, user["id"], "member_invited", f"Invited {req.email} as {role}", now),
    )
    await db.commit()

    return {"message": f"User {req.email} added to team as {role}"}


@router.delete("/{team_id}/members/{member_user_id}")
async def remove_member(
    team_id: str,
    member_user_id: str,
    user: dict = Depends(require_licensed_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Remove a member from the team (owner/admin only, or self-remove)."""
    is_self = member_user_id == user["id"]

    if not is_self:
        # Verify the remover is owner or admin
        cursor = await db.execute(
            "SELECT role FROM team_members WHERE team_id = ? AND user_id = ?",
            (team_id, user["id"]),
        )
        membership = await cursor.fetchone()
        if not membership or dict(membership)["role"] not in ("owner", "admin"):
            raise HTTPException(status_code=403, detail="Only owners and admins can remove members")

    # Cannot remove the owner
    cursor = await db.execute("SELECT owner_id FROM teams WHERE id = ?", (team_id,))
    team = await cursor.fetchone()
    if team and dict(team)["owner_id"] == member_user_id:
        raise HTTPException(status_code=400, detail="Cannot remove the team owner. Delete the team instead.")

    await db.execute(
        "DELETE FROM team_members WHERE team_id = ? AND user_id = ?",
        (team_id, member_user_id),
    )
    await db.commit()
    return {"message": "Member removed from team"}


# ─── Shared Leads ──────────────────────────────────────────────────────────


@router.post("/{team_id}/leads")
async def share_lead(
    team_id: str,
    req: ShareLeadRequest,
    user: dict = Depends(require_licensed_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Share a single lead with the team."""
    # Verify membership
    cursor = await db.execute(
        "SELECT role FROM team_members WHERE team_id = ? AND user_id = ?",
        (team_id, user["id"]),
    )
    if not await cursor.fetchone():
        raise HTTPException(status_code=403, detail="Not a member of this team")

    # Check shared leads limit per team (free: 1000)
    cursor = await db.execute(
        "SELECT COUNT(*) as cnt FROM shared_leads WHERE team_id = ?", (team_id,)
    )
    count = dict(await cursor.fetchone())["cnt"]
    if count >= 5000:
        raise HTTPException(status_code=400, detail="Team shared leads limit reached (5000)")

    lead_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    await db.execute(
        """INSERT INTO shared_leads (id, team_id, shared_by, email, phone, name,
           platform, source_keyword, source_url, quality_score, metadata, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (lead_id, team_id, user["id"], req.email, req.phone, req.name,
         req.platform, req.source_keyword, req.source_url, req.quality_score,
         req.metadata, now),
    )

    # Log activity
    activity_id = str(uuid.uuid4())
    detail = f"Shared lead: {req.name or req.email or req.phone} from {req.platform}"
    await db.execute(
        "INSERT INTO activity_feed (id, team_id, user_id, action, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (activity_id, team_id, user["id"], "lead_shared", detail, now),
    )
    await db.commit()

    return {"id": lead_id, "message": "Lead shared with team"}


@router.post("/{team_id}/leads/batch")
async def share_leads_batch(
    team_id: str,
    req: ShareLeadsBatchRequest,
    user: dict = Depends(require_licensed_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Share multiple leads with the team at once."""
    # Verify membership
    cursor = await db.execute(
        "SELECT role FROM team_members WHERE team_id = ? AND user_id = ?",
        (team_id, user["id"]),
    )
    if not await cursor.fetchone():
        raise HTTPException(status_code=403, detail="Not a member of this team")

    if len(req.leads) > 200:
        raise HTTPException(status_code=400, detail="Maximum 200 leads per batch")

    # Check shared leads limit per team (fix #6 - batch was bypassing limit)
    cursor = await db.execute(
        "SELECT COUNT(*) as cnt FROM shared_leads WHERE team_id = ?", (team_id,)
    )
    current_count = dict(await cursor.fetchone())["cnt"]
    if current_count + len(req.leads) > 5000:
        raise HTTPException(
            status_code=400,
            detail=f"Team shared leads limit would be exceeded. Current: {current_count}/5000, trying to add: {len(req.leads)}",
        )

    now = datetime.now(timezone.utc).isoformat()
    created_count = 0

    for lead in req.leads:
        lead_id = str(uuid.uuid4())
        await db.execute(
            """INSERT INTO shared_leads (id, team_id, shared_by, email, phone, name,
               platform, source_keyword, source_url, quality_score, metadata, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (lead_id, team_id, user["id"], lead.email, lead.phone, lead.name,
             lead.platform, lead.source_keyword, lead.source_url, lead.quality_score,
             lead.metadata, now),
        )
        created_count += 1

    # Log activity
    activity_id = str(uuid.uuid4())
    await db.execute(
        "INSERT INTO activity_feed (id, team_id, user_id, action, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (activity_id, team_id, user["id"], "leads_shared_batch", f"Shared {created_count} leads", now),
    )
    await db.commit()

    return {"shared_count": created_count, "message": f"{created_count} leads shared with team"}


@router.get("/{team_id}/leads")
async def get_shared_leads(
    team_id: str,
    page: int = 1,
    per_page: int = 50,
    platform: str = "",
    search: str = "",
    user: dict = Depends(require_licensed_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Get shared leads for a team with pagination and filtering."""
    # Verify membership
    cursor = await db.execute(
        "SELECT role FROM team_members WHERE team_id = ? AND user_id = ?",
        (team_id, user["id"]),
    )
    if not await cursor.fetchone():
        raise HTTPException(status_code=403, detail="Not a member of this team")

    # Cap per_page to prevent DoS (fix #15)
    if per_page > 200:
        per_page = 200
    if per_page < 1:
        per_page = 50

    # Build WHERE conditions separately for clean count query (fix #7)
    where = "sl.team_id = ?"
    params: list = [team_id]

    if platform:
        where += " AND sl.platform = ?"
        params.append(platform)
    if search:
        where += " AND (sl.email LIKE ? OR sl.name LIKE ? OR sl.phone LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])

    # Count (clean query without JOIN, fix #7)
    cursor = await db.execute(f"SELECT COUNT(*) as cnt FROM shared_leads sl WHERE {where}", params)
    total = dict(await cursor.fetchone())["cnt"]

    # Paginate
    offset = (page - 1) * per_page
    query = f"SELECT sl.*, u.name as shared_by_name FROM shared_leads sl LEFT JOIN users u ON sl.shared_by = u.id WHERE {where} ORDER BY sl.created_at DESC LIMIT ? OFFSET ?"
    params.extend([per_page, offset])

    cursor = await db.execute(query, params)
    rows = await cursor.fetchall()
    leads = [dict(r) for r in rows]

    return {"leads": leads, "total": total, "page": page, "per_page": per_page}


# ─── Activity Feed ─────────────────────────────────────────────────────────


@router.get("/{team_id}/activity")
async def get_activity_feed(
    team_id: str,
    limit: int = 50,
    user: dict = Depends(require_licensed_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Get the team activity feed."""
    # Verify membership
    cursor = await db.execute(
        "SELECT role FROM team_members WHERE team_id = ? AND user_id = ?",
        (team_id, user["id"]),
    )
    if not await cursor.fetchone():
        raise HTTPException(status_code=403, detail="Not a member of this team")

    if limit > 100:
        limit = 100

    cursor = await db.execute(
        """SELECT af.*, u.name as user_name, u.email as user_email
           FROM activity_feed af
           LEFT JOIN users u ON af.user_id = u.id
           WHERE af.team_id = ?
           ORDER BY af.created_at DESC
           LIMIT ?""",
        (team_id, limit),
    )
    rows = await cursor.fetchall()
    activities = [dict(r) for r in rows]

    return {"activities": activities}
