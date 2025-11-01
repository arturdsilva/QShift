from __future__ import annotations
import uuid

from pydantic import BaseModel, Field, field_validator


class EmployeeBase(BaseModel):
    name: str = Field(..., max_length=120, description="Employee's name")
    active: bool = Field(
        True, description="If True, the employee will be included on the schedule"
    )

    @field_validator("name")
    @classmethod
    def _strip_and_non_empty(cls, v: str):
        v2 = v.strip()
        if not v2:
            raise ValueError("name cannot be empty or whitespace")
        return v2


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    name: str | None = Field(None, max_length=120)
    active: bool | None = Field(None)

    @field_validator("name")
    @classmethod
    def _strip_and_non_empty(cls, v: str):
        if v is None:
            return v

        v2 = v.strip()
        if not v2:
            raise ValueError("name cannot be empty or whitespace")
        return v2


class EmployeeOut(EmployeeBase):
    id: uuid.UUID
    user_id: uuid.UUID

    model_config = {"from_attributes": True}
