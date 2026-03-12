"""Authentication routes."""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
import aiosqlite

from app.database import get_db
from app.models.schemas import LoginRequest, RegisterRequest, TokenResponse, CreateUserRequest
from app.services.auth import hash_password, verify_password, create_access_token, decode_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


async def get_current_user(db: aiosqlite.Connection = Depends(get_db), token: str = ""):
    """Dependency to get current user from token."""
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    cursor = await db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = await cursor.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if dict(user)["status"] != "active":
        raise HTTPException(status_code=403, detail="Account suspended")
    return dict(user)


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: aiosqlite.Connection = Depends(get_db)):
    """Login and get access token."""
    cursor = await db.execute("SELECT * FROM users WHERE email = ?", (req.email,))
    user = await cursor.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user_dict = dict(user)
    if not verify_password(req.password, user_dict["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user_dict["status"] != "active":
        raise HTTPException(status_code=403, detail="Account suspended")
    # Update last login
    now = datetime.now(timezone.utc).isoformat()
    await db.execute("UPDATE users SET last_login = ? WHERE id = ?", (now, user_dict["id"]))
    await db.commit()
    token = create_access_token({"sub": user_dict["id"], "role": user_dict["role"]})
    return TokenResponse(
        access_token=token,
        user={
            "id": user_dict["id"],
            "email": user_dict["email"],
            "name": user_dict["name"],
            "role": user_dict["role"],
        },
    )


@router.post("/register")
async def register_user(req: RegisterRequest, db: aiosqlite.Connection = Depends(get_db)):
    """Register a new user account (customer role). Used by desktop app."""
    if not req.email or not req.password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    # Check duplicate email
    cursor = await db.execute("SELECT id FROM users WHERE email = ?", (req.email,))
    if await cursor.fetchone():
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    await db.execute(
        "INSERT INTO users (id, email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, 'customer', ?)",
        (user_id, req.email, hash_password(req.password), req.name or req.email.split('@')[0], now),
    )
    await db.commit()
    # Auto-login after registration
    token = create_access_token({"sub": user_id, "role": "customer"})
    return TokenResponse(
        access_token=token,
        user={
            "id": user_id,
            "email": req.email,
            "name": req.name or req.email.split('@')[0],
            "role": "customer",
        },
    )


@router.post("/setup")
async def initial_setup(db: aiosqlite.Connection = Depends(get_db)):
    """Create default super admin if none exists."""
    cursor = await db.execute("SELECT COUNT(*) as cnt FROM users WHERE role = 'super_admin'")
    row = await cursor.fetchone()
    if dict(row)["cnt"] > 0:
        raise HTTPException(status_code=400, detail="Super admin already exists")
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    await db.execute(
        "INSERT INTO users (id, email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (user_id, "admin@snapleads.store", hash_password("SnapLeads@2026"), "Super Admin", "super_admin", now),
    )
    await db.commit()
    return {
        "message": "Super admin created",
        "email": "admin@snapleads.store",
        "password": "SnapLeads@2026",
    }


@router.get("/me")
async def get_me(db: aiosqlite.Connection = Depends(get_db), token: str = ""):
    """Get current user info from token."""
    user = await get_current_user(db, token)
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "status": user["status"],
    }
