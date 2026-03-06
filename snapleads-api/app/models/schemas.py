"""Pydantic schemas for request/response models."""
from pydantic import BaseModel


# Auth schemas
class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# User schemas
class CreateUserRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str = "customer"  # super_admin, master_reseller, reseller, customer


class UpdateUserRequest(BaseModel):
    name: str | None = None
    status: str | None = None  # active, suspended


# License key schemas
class GenerateKeysRequest(BaseModel):
    plan: str = "starter"  # starter, pro
    billing_cycle: str = "monthly"  # monthly, yearly, lifetime
    quantity: int = 1
    assigned_to_email: str = ""
    assigned_to_name: str = ""
    notes: str = ""


class ValidateLicenseRequest(BaseModel):
    key: str
    device_id: str = ""
    device_name: str = ""


class ActivateLicenseRequest(BaseModel):
    key: str
    device_id: str
    device_name: str = ""


class RevokeLicenseRequest(BaseModel):
    reason: str = ""


# Stats
class StatsResponse(BaseModel):
    total_keys: int = 0
    active_keys: int = 0
    expired_keys: int = 0
    revoked_keys: int = 0
    total_activations: int = 0
    starter_keys: int = 0
    pro_keys: int = 0
    keys_expiring_7d: int = 0
    keys_expiring_30d: int = 0
    revenue_usd: int = 0
    revenue_inr: int = 0
