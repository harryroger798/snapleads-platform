"""Authentication routes."""
import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Header
import aiosqlite

from app.database import get_db
from app.models.schemas import LoginRequest, RegisterRequest, TokenResponse, CreateUserRequest
from app.services.auth import hash_password, verify_password, create_access_token, decode_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


async def get_current_user(
    authorization: str = Header(""),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Dependency to get current user from Authorization header (fix #4)."""
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
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


@router.post("/register", response_model=TokenResponse)
async def register_user(req: RegisterRequest, db: aiosqlite.Connection = Depends(get_db)):
    """Register a new user account (customer role). Used by desktop app."""
    # Pydantic validates email format, password length (6-128) via schema
    email = req.email.strip().lower()
    name = req.name.strip() if req.name else email.split('@')[0]
    # Check duplicate email
    cursor = await db.execute("SELECT id FROM users WHERE email = ?", (email,))
    if await cursor.fetchone():
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    try:
        await db.execute(
            "INSERT INTO users (id, email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, 'customer', ?)",
            (user_id, email, hash_password(req.password), name, now),
        )
        await db.commit()
    except Exception:
        # UNIQUE constraint on email handles race condition
        raise HTTPException(status_code=400, detail="Email already registered")
    # Auto-login after registration
    token = create_access_token({"sub": user_id, "role": "customer"})
    return TokenResponse(
        access_token=token,
        user={
            "id": user_id,
            "email": email,
            "name": name,
            "role": "customer",
        },
    )


@router.post("/setup")
async def initial_setup(db: aiosqlite.Connection = Depends(get_db)):
    """Create default super admin if none exists.
    Reads credentials from environment variables (fix #1 - no hardcoded creds)."""
    cursor = await db.execute("SELECT COUNT(*) as cnt FROM users WHERE role = 'super_admin'")
    row = await cursor.fetchone()
    if dict(row)["cnt"] > 0:
        raise HTTPException(status_code=400, detail="Super admin already exists")
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@snapleads.store")
    admin_password = os.environ.get("ADMIN_PASSWORD")
    if not admin_password:
        raise HTTPException(status_code=500, detail="ADMIN_PASSWORD environment variable not set")
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    try:
        await db.execute(
            "INSERT INTO users (id, email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (user_id, admin_email, hash_password(admin_password), "Super Admin", "super_admin", now),
        )
        await db.commit()
    except Exception:
        # UNIQUE constraint race condition guard (fix #2)
        raise HTTPException(status_code=400, detail="Super admin already exists")
    return {
        "message": "Super admin created",
        "email": admin_email,
    }


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    """Get current user info from Authorization header (fix #4)."""
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "status": user["status"],
    }
