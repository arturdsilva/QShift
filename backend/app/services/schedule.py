from sqlalchemy.orm import Session
from uuid import UUID

import app.schemas.schedule as schemas
from app.models.shift import Shift
from app.models import ShiftAssignment, Employee


def build_schedule_schema_from_db(week_id: UUID, user_id: UUID, db: Session):
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


def generate_schedule(db: Session, user_id: UUID, week_id: UUID):
    pass
