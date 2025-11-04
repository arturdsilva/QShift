from __future__ import annotations
import uuid

from datetime import time
from typing import List
from pydantic import BaseModel, Field
import app.core.constants as constants

class ScheduleOut(BaseModel):
    week_id: uuid.UUID
    shifts: List[ScheduleShiftOut]

class ScheduleShiftOut(BaseModel):
    shift_id: uuid.UUID
    weekday: int = Field(..., ge=0, le=6, description="0 = monday ... 6 = sunday")
    start_time: time = Field(..., description="Local shift start time")
    end_time: time = Field(..., description="Local shift end time")
    min_staff: int = Field(
        1, ge=1, description="Minimum amount of employees required for the shift"
    )
    employees: List[ScheduleEmployeeOut]

class ScheduleEmployeeOut(BaseModel):
    employee_id: uuid.UUID
    name: str = Field(..., max_length=constants.MAX_EMPLOYEE_NAME_LENGTH, description="Employee's name")

class ScheduleCreate(BaseModel):
    week_id: uuid.UUID
    shifts: List[ScheduleShiftCreate]

class ScheduleShiftCreate(BaseModel):
    shift_id: uuid.UUID
    employee_ids: List[uuid.UUID]


