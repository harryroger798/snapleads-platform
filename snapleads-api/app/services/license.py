"""License key generation and validation service."""
import hashlib
import hmac
import random
import string
import uuid
from datetime import datetime, timedelta, timezone

SECRET_KEY = "snapleads-crypto-sign-2026"

PLAN_PREFIXES = {
    "starter": "STR",
    "pro": "PRO",
}

CYCLE_PREFIXES = {
    "monthly": "M",
    "yearly": "Y",
    "lifetime": "L",
}


def generate_key(plan: str = "starter", billing_cycle: str = "monthly") -> str:
    """Generate a unique license key."""
    plan_code = PLAN_PREFIXES.get(plan, "STR")
    cycle_code = CYCLE_PREFIXES.get(billing_cycle, "M")
    chars = string.ascii_uppercase + string.digits
    segments = ["".join(random.choices(chars, k=4)) for _ in range(3)]
    return f"SNPL-{plan_code}-{cycle_code}-{'-'.join(segments)}"


def generate_keys(quantity: int, plan: str = "starter", billing_cycle: str = "monthly") -> list[str]:
    """Generate multiple unique license keys."""
    keys: set[str] = set()
    while len(keys) < quantity:
        keys.add(generate_key(plan, billing_cycle))
    return list(keys)


def compute_signature(key: str) -> str:
    """Compute HMAC signature for a license key."""
    return hmac.new(
        SECRET_KEY.encode(),
        key.encode(),
        hashlib.sha256,
    ).hexdigest()[:16]


def get_expiry_date(billing_cycle: str) -> str | None:
    """Calculate expiry date based on billing cycle."""
    now = datetime.now(timezone.utc)
    if billing_cycle == "monthly":
        return (now + timedelta(days=30)).isoformat()
    elif billing_cycle == "yearly":
        return (now + timedelta(days=365)).isoformat()
    elif billing_cycle == "lifetime":
        return (now + timedelta(days=36500)).isoformat()  # 100 years
    return None


def generate_device_id() -> str:
    """Generate a unique device ID."""
    return str(uuid.uuid4())


# Pricing configuration (in cents for USD, paise for INR)
PRICING = {
    "starter": {
        "monthly": {"usd": 700, "inr": 49900, "usd_display": "$7/mo", "inr_display": "\u20b9499/mo"},
        "yearly": {"usd": 5900, "inr": 449900, "usd_display": "$59/yr", "inr_display": "\u20b94,499/yr"},
        "lifetime": {"usd": 9900, "inr": 799900, "usd_display": "$99", "inr_display": "\u20b97,999"},
    },
    "pro": {
        "monthly": {"usd": 1900, "inr": 149900, "usd_display": "$19/mo", "inr_display": "\u20b91,499/mo"},
        "yearly": {"usd": 16900, "inr": 1299900, "usd_display": "$169/yr", "inr_display": "\u20b912,999/yr"},
        "lifetime": {"usd": 24900, "inr": 1999900, "usd_display": "$249", "inr_display": "\u20b919,999"},
    },
}

# Feature gating configuration
PLAN_FEATURES = {
    "starter": {
        "platforms": ["reddit", "twitter", "youtube", "pinterest", "tumblr"],
        "max_extractions_per_month": 10,
        "max_leads_per_extraction": 100,
        "export_formats": ["csv"],
        "email_verification_daily": 10,
        "google_maps": False,
        "scheduled_extractions": False,
        "email_outreach": False,
        "crm_export": False,
        "telegram_scraper": False,
        "whatsapp_scraper": False,
        "website_email_finder": False,
        "duplicate_detection": "basic",
        "lead_scoring": False,
        "proxy_support": False,
    },
    "pro": {
        "platforms": [
            "reddit", "twitter", "youtube", "pinterest", "tumblr",
            "linkedin", "facebook", "instagram", "tiktok",
            "google_maps", "telegram", "whatsapp",
        ],
        "max_extractions_per_month": -1,  # unlimited
        "max_leads_per_extraction": -1,  # unlimited
        "export_formats": ["csv", "xlsx", "json", "html"],
        "email_verification_daily": -1,  # unlimited
        "google_maps": True,
        "scheduled_extractions": True,
        "email_outreach": True,
        "crm_export": True,
        "telegram_scraper": True,
        "whatsapp_scraper": True,
        "website_email_finder": True,
        "duplicate_detection": "advanced",
        "lead_scoring": True,
        "proxy_support": True,
    },
}
