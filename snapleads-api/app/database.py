"""Database initialization and connection management."""
import aiosqlite
import os

_env_db = os.environ.get("DATABASE_PATH", "").strip()
if _env_db:
    _parent = os.path.dirname(_env_db)
    # Use env path only if the parent directory exists or can be created
    if _parent and (os.path.isdir(_parent) or _parent == "/data"):
        DB_PATH = _env_db
    else:
        DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "app.db")
else:
    # Default: try /data (Render persistent disk) then local fallback
    if os.path.isdir("/data"):
        DB_PATH = "/data/app.db"
    else:
        DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "app.db")


async def get_db():
    """Get a database connection."""
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    try:
        yield db
    finally:
        await db.close()


async def init_db():
    """Initialize the database with all required tables."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                name TEXT NOT NULL DEFAULT '',
                role TEXT NOT NULL DEFAULT 'customer',
                status TEXT NOT NULL DEFAULT 'active',
                created_at TEXT NOT NULL,
                last_login TEXT
            );

            CREATE TABLE IF NOT EXISTS license_keys (
                id TEXT PRIMARY KEY,
                key TEXT NOT NULL UNIQUE,
                plan TEXT NOT NULL DEFAULT 'starter',
                billing_cycle TEXT NOT NULL DEFAULT 'monthly',
                status TEXT NOT NULL DEFAULT 'active',
                max_activations INTEGER NOT NULL DEFAULT 2,
                current_activations INTEGER NOT NULL DEFAULT 0,
                created_by TEXT NOT NULL,
                assigned_to_email TEXT DEFAULT '',
                assigned_to_name TEXT DEFAULT '',
                expires_at TEXT,
                created_at TEXT NOT NULL,
                activated_at TEXT,
                last_validated TEXT,
                notes TEXT DEFAULT '',
                FOREIGN KEY (created_by) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS activations (
                id TEXT PRIMARY KEY,
                license_id TEXT NOT NULL,
                device_id TEXT NOT NULL,
                device_name TEXT DEFAULT '',
                ip_address TEXT DEFAULT '',
                activated_at TEXT NOT NULL,
                last_seen TEXT,
                FOREIGN KEY (license_id) REFERENCES license_keys(id),
                UNIQUE(license_id, device_id)
            );

            CREATE TABLE IF NOT EXISTS validation_logs (
                id TEXT PRIMARY KEY,
                license_id TEXT NOT NULL,
                device_id TEXT,
                ip_address TEXT,
                result TEXT NOT NULL,
                validated_at TEXT NOT NULL,
                FOREIGN KEY (license_id) REFERENCES license_keys(id)
            );

            CREATE INDEX IF NOT EXISTS idx_keys_created_by ON license_keys(created_by);
            CREATE INDEX IF NOT EXISTS idx_keys_status ON license_keys(status);
            CREATE INDEX IF NOT EXISTS idx_keys_plan ON license_keys(plan);
            CREATE INDEX IF NOT EXISTS idx_activations_license ON activations(license_id);
            CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

            -- ═══ Desktop-First SaaS Tables (v3.5.2) ═══

            CREATE TABLE IF NOT EXISTS teams (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                owner_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (owner_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS team_members (
                id TEXT PRIMARY KEY,
                team_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'member',
                joined_at TEXT NOT NULL,
                FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE(team_id, user_id)
            );

            CREATE TABLE IF NOT EXISTS shared_leads (
                id TEXT PRIMARY KEY,
                team_id TEXT NOT NULL,
                shared_by TEXT NOT NULL,
                email TEXT DEFAULT '',
                phone TEXT DEFAULT '',
                name TEXT DEFAULT '',
                platform TEXT DEFAULT '',
                source_keyword TEXT DEFAULT '',
                source_url TEXT DEFAULT '',
                quality_score INTEGER DEFAULT 0,
                metadata TEXT DEFAULT '',
                created_at TEXT NOT NULL,
                FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
                FOREIGN KEY (shared_by) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS usage_logs (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                action TEXT NOT NULL,
                detail TEXT DEFAULT '',
                platform TEXT DEFAULT '',
                lead_count INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS activity_feed (
                id TEXT PRIMARY KEY,
                team_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                action TEXT NOT NULL,
                detail TEXT DEFAULT '',
                created_at TEXT NOT NULL,
                FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams(owner_id);
            CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
            CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
            CREATE INDEX IF NOT EXISTS idx_shared_leads_team ON shared_leads(team_id);
            CREATE INDEX IF NOT EXISTS idx_shared_leads_platform ON shared_leads(platform);
            CREATE INDEX IF NOT EXISTS idx_usage_logs_user ON usage_logs(user_id);
            CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON usage_logs(action);
            CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON usage_logs(created_at);
            CREATE INDEX IF NOT EXISTS idx_activity_feed_team ON activity_feed(team_id);
        """)
        await db.commit()
