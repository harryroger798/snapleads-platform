"""Database initialization and connection management."""
import aiosqlite
import os

DB_PATH = os.environ.get("DATABASE_PATH", "/data/app.db")
if not os.path.exists(os.path.dirname(DB_PATH)):
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
                parent_id TEXT,
                status TEXT NOT NULL DEFAULT 'active',
                created_at TEXT NOT NULL,
                last_login TEXT,
                FOREIGN KEY (parent_id) REFERENCES users(id)
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
            CREATE INDEX IF NOT EXISTS idx_users_parent ON users(parent_id);
        """)
        await db.commit()
