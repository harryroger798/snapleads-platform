"""Shared authentication dependencies for route modules."""
from fastapi import Depends, HTTPException, Header
import aiosqlite

from app.database import get_db
from app.services.auth import decode_token


async def require_licensed_user(
    authorization: str = Header(""),
    db: aiosqlite.Connection = Depends(get_db),
) -> dict:
    """Require a valid licensed user (any role). Shared dependency for all protected routes."""
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
    user_dict = dict(user)
    if user_dict["status"] != "active":
        raise HTTPException(status_code=403, detail="Account suspended")
    return user_dict
