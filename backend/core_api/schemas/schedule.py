from __future__ import annotations
import uuid

from datetime import time
from typing import List
from pydantic import BaseModel, Field, field_validator
import core_api.core.constants as constants
from typing import Optional
from core_api.schemas.shift import PreviewShiftBase
from enum import Enum


def _validate_preferred_weekdays(v: list[int]) -> list[int]:
    invalid_weekdays = [weekday for weekday in v if weekday < 0 or weekday > 6]
    if invalid_weekdays:
        raise ValueError("preferred_weekdays must contain only values from 0 to 6")

    if len(set(v)) != len(v):
        raise ValueError("preferred_weekdays cannot contain duplicates")

    return v


class ScheduleOut(BaseModel):
    shifts: List[ScheduleShiftOut]

class ScheduleShiftOutBase(BaseModel):
    weekday: int = Field(..., ge=0, le=6, description="0 = monday ... 6 = sunday")
    start_time: time = Field(..., description="Local shift start time")
    end_time: time = Field(..., description="Local shift end time")
    min_staff: int = Field(
        1, ge=1, description="Minimum amount of employees required for the shift"
    )
    employees: List[ScheduleShiftEmployeeOut]

class ScheduleShiftOut(ScheduleShiftOutBase):
    shift_id: uuid.UUID

    model_config = {"from_attributes": True}

class ScheduleShiftEmployeeOut(BaseModel):
    employee_id: uuid.UUID
    name: str = Field(
        ...,
        max_length=constants.MAX_EMPLOYEE_NAME_LENGTH,
        description="Employee's name",
    )

class ScheduleCreate(BaseModel):
    shifts: List[ScheduleShiftCreate]

class ScheduleShiftCreate(BaseModel):
    shift_id: uuid.UUID
    employee_ids: List[uuid.UUID]

class SchedulePreviewOut(BaseModel):
    possible: bool
    schedule: Optional[PreviewScheduleOut] = None

class PreviewScheduleOut(BaseModel):
    shifts: List[PreviewScheduleShiftOut]

class PreviewScheduleShiftOut(ScheduleShiftOutBase):
    pass

class ShiftVectorIn(BaseModel):
    shift_vector: List[PreviewShiftBase]


class ScheduleGenerationJobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    DONE = "done"
    FAILED = "failed"


class ScheduleGenerationEmployeeOut(BaseModel):
    id: uuid.UUID
    name: str = Field(
        ...,
        max_length=constants.MAX_EMPLOYEE_NAME_LENGTH,
        description="Employee's name",
    )
    weekly_workload_hours: int | None = Field(
        None,
        ge=0,
        le=constants.MAX_WEEKLY_WORKLOAD_HOURS,
        description=(
            "Optional weekly workload target in hours used by the generator to "
            "balance assignments for this employee"
        ),
    )
    preferred_weekdays: list[int] = Field(
        default_factory=list,
        description=(
            "Weekdays the employee prefers to work, where 0 = monday and "
            "6 = sunday. Empty means no preference."
        ),
    )

    @field_validator("preferred_weekdays")
    @classmethod
    def _preferred_weekdays_valid(cls, v: list[int]):
        return _validate_preferred_weekdays(v)


class ScheduleGenerationAvailabilityOut(BaseModel):
    employee_id: uuid.UUID
    weekday: int = Field(..., ge=0, le=6)
    start_time: time
    end_time: time


class ScheduleGenerationDispatchPayload(BaseModel):
    shift_vector: List[PreviewShiftBase]
    employees: List[ScheduleGenerationEmployeeOut]
    availabilities: List[ScheduleGenerationAvailabilityOut]


class ScheduleGenerationDispatchRequest(BaseModel):
    job_id: uuid.UUID
    callback_url: str
    payload: ScheduleGenerationDispatchPayload


class ScheduleGenerationJobAcceptedOut(BaseModel):
    job_id: uuid.UUID
    status: ScheduleGenerationJobStatus


class ScheduleGenerationJobOut(BaseModel):
    job_id: uuid.UUID
    status: ScheduleGenerationJobStatus
    result: Optional[SchedulePreviewOut] = None
    error: Optional[str] = None


class ScheduleGenerationCallbackIn(BaseModel):
    job_id: uuid.UUID
    status: ScheduleGenerationJobStatus
    result: Optional[SchedulePreviewOut] = None
    error: Optional[str] = None
