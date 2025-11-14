from uuid import UUID
from fastapi import APIRouter, status, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Tuple

import app.schemas.schedule as schemas
import app.services.schedule as schedule_service
from app.models import ShiftAssignment, Employee, Week
from app.models.shift import Shift
from app.api.dependencies import current_user_id
from app.core.db import get_session
from app.services.schedule import ScheduleGenerator

router = APIRouter(prefix="/weeks/{week_id}/schedule", tags=["schedule"])


# CREATE
@router.post(
    "", response_model=schemas.ScheduleOut, status_code=status.HTTP_201_CREATED
)
def create_schedule(
    week_id: UUID,
    payload: schemas.ScheduleCreate,
    user_id: UUID = Depends(current_user_id),
    db: Session = Depends(get_session),
):
    for schedule_shift in payload.shifts:
        if db.get(Shift, schedule_shift.shift_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Shift not found"
            )
        for employee_id in schedule_shift.employee_ids:
            if db.get(Employee, employee_id) is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found"
                )
            new_assignment = ShiftAssignment(
                user_id=user_id,
                shift_id=schedule_shift.shift_id,
                employee_id=employee_id,
            )
            db.add(new_assignment)

    db.commit()

    return schedule_service.build_schedule_schema_from_db(week_id, user_id, db)


# READ
@router.get("", response_model=schemas.ScheduleOut, status_code=status.HTTP_200_OK)
def read_schedule(
    week_id: UUID,
    user_id: UUID = Depends(current_user_id),
    db: Session = Depends(get_session),
):
    return schedule_service.build_schedule_schema_from_db(week_id, user_id, db)


# DELETE
@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule(
    week_id: UUID,
    user_id: UUID = Depends(current_user_id),
    db: Session = Depends(get_session),
):
    week = db.query(Week).filter(Week.user_id == user_id, Week.id == week_id).first()

    if week is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Week not found"
        )

    shift_ids_tuple = db.query(Shift.id).filter(Shift.week_id == week_id).all()
    shift_ids = []
    for shift_id_tuple in shift_ids_tuple:
        shift_ids.append(shift_id_tuple[0])

    db.query(ShiftAssignment).filter(ShiftAssignment.shift_id.in_(shift_ids)).delete(
        synchronize_session=False
    )

    db.commit()


# GENERATE PREVIEW SCHEDULE
@router.get(
    "/preview",
    response_model=schemas.SchedulePreviewOut,
    status_code=status.HTTP_200_OK,
)
def generate_preview_schedule(
    week_id: UUID,
    user_id: UUID = Depends(current_user_id),
    db: Session = Depends(get_session),
):
    schedule_generator = ScheduleGenerator.from_db(
        db=db, user_id=user_id, week_id=week_id
    )
    possible = schedule_generator.check_possibility()

    if possible:
        schedule_out = schedule_generator.generate_schedule()
    else:
        schedule_out = None

    return schemas.SchedulePreviewOut(possible=possible, schedule=schedule_out)
