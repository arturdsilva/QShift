from __future__ import annotations
import uuid
from datetime import datetime

from pydantic import BaseModel


class ShiftAssignmentOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    shift_id: uuid.UUID
    employee_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
