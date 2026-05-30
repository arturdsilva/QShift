from __future__ import annotations
import uuid
from typing import List

from pydantic import BaseModel, Field, field_validator
import core_api.core.constants as constants


def _validate_preferred_weekdays(v: list[int] | None) -> list[int]:
    if v is None:
        raise ValueError("preferred_weekdays cannot be null; use [] to clear it")

    invalid_weekdays = [weekday for weekday in v if weekday < 0 or weekday > 6]
    if invalid_weekdays:
        raise ValueError("preferred_weekdays must contain only values from 0 to 6")

    if len(set(v)) != len(v):
        raise ValueError("preferred_weekdays cannot contain duplicates")

    return v


class EmployeeBase(BaseModel):
    name: str = Field(
        ...,
        max_length=constants.MAX_EMPLOYEE_NAME_LENGTH,
        description="Employee's name",
    )
    active: bool = Field(
        True, description="If True, the employee will be included on the schedule"
    )
    weekly_workload_hours: int | None = Field(
        None,
        ge=0,
        le=constants.MAX_WEEKLY_WORKLOAD_HOURS,
        description=(
            "Optional weekly workload target in hours used by the schedule generator "
            "to balance assignments for this employee"
        ),
    )
    preferred_weekdays: list[int] = Field(
        default_factory=list,
        description=(
            "Weekdays the employee prefers to work, where 0 = monday and "
            "6 = sunday. Empty means no preference."
        ),
    )

    @field_validator("name")
    @classmethod
    def _strip_and_non_empty(cls, v: str):
        v2 = v.strip()
        if not v2:
            raise ValueError("name cannot be empty or whitespace")
        return v2

    @field_validator("preferred_weekdays")
    @classmethod
    def _preferred_weekdays_valid(cls, v: list[int]):
        return _validate_preferred_weekdays(v)


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    name: str | None = Field(None, max_length=constants.MAX_EMPLOYEE_NAME_LENGTH)
    active: bool | None = Field(None)
    weekly_workload_hours: int | None = Field(
        None,
        ge=0,
        le=constants.MAX_WEEKLY_WORKLOAD_HOURS,
    )
    preferred_weekdays: list[int] | None = Field(
        None,
        description=(
            "Weekdays the employee prefers to work, where 0 = monday and "
            "6 = sunday. Empty means no preference."
        ),
    )

    @field_validator("name")
    @classmethod
    def _strip_and_non_empty(cls, v: str):
        if v is None:
            return v

        v2 = v.strip()
        if not v2:
            raise ValueError("name cannot be empty or whitespace")
        return v2

    @field_validator("preferred_weekdays")
    @classmethod
    def _preferred_weekdays_valid(cls, v: list[int] | None):
        return _validate_preferred_weekdays(v)


class EmployeeOut(EmployeeBase):
    id: uuid.UUID
    user_id: uuid.UUID

    model_config = {"from_attributes": True}


class EmployeeYearReport(BaseModel):
    name: str | None = Field(None, max_length=constants.MAX_EMPLOYEE_NAME_LENGTH)
    months_data: List[EmployeeMonthData]


class EmployeeMonthReport(BaseModel):
    name: str | None = Field(None, max_length=constants.MAX_EMPLOYEE_NAME_LENGTH)
    month_data: EmployeeMonthData


class EmployeeMonthData(BaseModel):
    hours_worked: float
    num_days_off: int
    num_days_worked: int
    num_morning_shifts: int
    num_afternoon_shifts: int
    num_night_shifts: int
