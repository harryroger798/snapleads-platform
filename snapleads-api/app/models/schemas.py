"""Pydantic schemas for request/response models."""
import re
from pydantic import BaseModel, Field, field_validator


# Auth schemas
class LoginRequest(BaseModel):
    email: str = Field(..., max_length=500)
    password: str = Field(..., max_length=128)


class RegisterRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=6, max_length=128)
    name: str = ""

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", v):
            raise ValueError("Invalid email format")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# User schemas
class CreateUserRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str = "customer"  # super_admin, customer


class UpdateUserRequest(BaseModel):
    name: str | None = None
    status: str | None = None  # active, suspended


# License key schemas
class GenerateKeysRequest(BaseModel):
    plan: str = "starter"  # starter, pro
    billing_cycle: str = "monthly"  # monthly, yearly
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


# Team schemas
class CreateTeamRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class InviteTeamMemberRequest(BaseModel):
    email: str = Field(..., max_length=500)
    role: str = Field(default="member", pattern="^(member|admin)$")

    @field_validator("email")
    @classmethod
    def validate_invite_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", v):
            raise ValueError("Invalid email format")
        return v


class ShareLeadRequest(BaseModel):
    email: str = Field(default="", max_length=500)
    phone: str = Field(default="", max_length=50)
    name: str = Field(default="", max_length=500)
    platform: str = Field(default="", max_length=50)
    source_keyword: str = Field(default="", max_length=500)
    source_url: str = Field(default="", max_length=2000)
    quality_score: int = Field(default=0, ge=0, le=100)
    metadata: str = Field(default="", max_length=10000)


class ShareLeadsBatchRequest(BaseModel):
    leads: list[ShareLeadRequest]


# Usage schemas
class LogUsageRequest(BaseModel):
    action: str = Field(..., pattern="^(search|export|enrichment|share_lead|extraction)$")
    detail: str = Field(default="", max_length=500)
    platform: str = Field(default="", max_length=50)
    lead_count: int = Field(default=0, ge=0)
