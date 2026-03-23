"""SnapLeads License Server API."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routes.auth import router as auth_router
from app.routes.admin import router as admin_router
from app.routes.license import router as license_router
from app.routes.teams import router as teams_router
from app.routes.usage import router as usage_router


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Initialize database on startup."""
    await init_db()
    yield


app = FastAPI(title="SnapLeads License Server", version="1.0.0", lifespan=lifespan)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(license_router)
app.include_router(teams_router)
app.include_router(usage_router)


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
