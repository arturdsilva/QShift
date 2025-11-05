from uuid import UUID
from fastapi import APIRouter, status, Response, Depends, HTTPException
from sqlalchemy.orm import Session

import app.schemas.schedule as schemas
from app.models import ShiftAssignment, Employee
from app.models.shift import Shift
from app.models.week import Week
from app.api.dependencies import current_user_id
from app.core.db import get_session

router = APIRouter(prefix="/weeks/{week_id}/schedule", tags=["schedule"])


def _build_schedule_schema_from_db(week_id: UUID, user_id: UUID, db: Session):
    shifts = (
        db.query(Shift).filter(Shift.week_id == week_id, Shift.user_id == user_id).all()
    )
    schedule_shifts_out = []
    shift: Shift
    for shift in shifts:
        assignments = (
            db.query(ShiftAssignment)
            .filter(
                ShiftAssignment.shift_id == shift.id,
                ShiftAssignment.user_id == user_id,
            )
            .all()
        )
        schedule_shift_employees_out = []
        for assignment in assignments:
            employee = (
                db.query(Employee).filter(Employee.id == assignment.employee_id).first()
            )
            schedule_shift_employees_out.append(
                schemas.ScheduleShiftEmployeeOut(
                    employee_id=employee.id, name=str(employee.name)
                )
            )
        schedule_shifts_out.append(
            schemas.ScheduleShiftOut(
                shift_id=shift.id,
                weekday=shift.weekday,
                start_time=shift.start_time,
                end_time=shift.end_time,
                min_staff=shift.min_staff,
                employees=schedule_shift_employees_out,
            )
        )
    return schemas.ScheduleOut(shifts=schedule_shifts_out)


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
    week = db.query(Week).filter(Week.user_id == user_id, Week.id == week_id).first()
    if week is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Week not found"
        )

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

    return _build_schedule_schema_from_db(week_id, user_id, db)


# READ
@router.get("", response_model=schemas.ScheduleOut, status_code=status.HTTP_200_OK)
def read_schedule(
    week_id: UUID,
    user_id: UUID = Depends(current_user_id),
    db: Session = Depends(get_session),
):
    return _build_schedule_schema_from_db(week_id, user_id, db)
