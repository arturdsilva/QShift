from __future__ import annotations
import uuid

from pydantic import BaseModel, Field, field_validator, SecretStr
from datetime import datetime


class UserBase(BaseModel):
    username: str = Field(..., max_length=200, description="User's login name")

    @field_validator("username")
    @classmethod
    def _strip_and_non_empty(cls, v: str):
        v2 = v.strip()
        if not v2:
            raise ValueError("username cannot be empty or whitespace")
        # v2 = v2.lower() ?
        return v2


class UserCreate(UserBase):
    password: SecretStr = Field(..., max_length=255, description="User's password")


class UserUpdate(BaseModel):
    username: str | None = Field(None, max_length=200)
    password: SecretStr | None = Field(None, max_length=255)

    @field_validator("username")
    @classmethod
    def _strip_and_non_empty(cls, v: str):
        if v is None:
            return None

        v2 = v.strip()
        if not v2:
            raise ValueError("username cannot be empty or whitespace")
        # v2 = v2.lower() ?
        return v2


class UserOut(UserBase):
    id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
