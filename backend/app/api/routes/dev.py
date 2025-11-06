from __future__ import annotations
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from datetime import date, time, timedelta

from app.core.db import get_session
from app.api.dependencies import current_user_id
from app.models import User, Employee, Week, Shift, Availability, ShiftAssignment

router = APIRouter(prefix="/dev", tags=["dev"])


def next_monday(d: date) -> date:
    return d + timedelta(days=(7 - d.weekday()))


@router.post("/seed", status_code=status.HTTP_200_OK)
def seed(db: Session = Depends(get_session), user_id=Depends(current_user_id)):
    """
    Populate (or ensure) consistent demo data for the current user.
    - User(username='demo')
    - 5 active employees
    - Week starting next Monday, open_days = Mon..Sat
    - Shifts 09:00-13:00 and 13:00-18:00 (min_staff=2 Mon-Fri, 3 Sat)
    - Availabilities Mon-Fri 09:00-18:00 for all employees
    """

    try:

        # 0) Clear demo user db
        db.query(ShiftAssignment).filter_by(user_id=user_id).delete(
            synchronize_session=False
        )
        db.query(Availability).filter_by(user_id=user_id).delete(
            synchronize_session=False
        )
        db.query(Shift).filter_by(user_id=user_id).delete(synchronize_session=False)
        db.query(Week).filter_by(user_id=user_id).delete(synchronize_session=False)
        db.query(Employee).filter_by(user_id=user_id).delete(synchronize_session=False)

        # 1) USER
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            user = User(id=user_id, username="demo", password_hash="x")
            db.add(user)
            db.flush()

        # 2) EMPLOYEES
        names: list[str] = ["Artur", "Arthur", "Angelo", "Gabriel", "Guilherme"]
        for n in names:
            db.add(Employee(user_id=user_id, name=n, active=True))
        db.flush()

        # 3) WEEK (next Monday; your schemas use open_days: List[int])
        start = next_monday(date.today())
        # Mon..Sat => [0,1,2,3,4,5]  (0=Mon ... 6=Sun),
        week = Week(
            user_id=user_id,
            start_date=start,
            open_days=[0, 1, 2, 3, 4, 5],
            approved=False,
        )
        db.add(week)
        db.flush()

        # 4) WEEK SHIFTS
        for wd in week.open_days:  # according to your Week.open_days (int[] 0..6)
            # ensure local_date is consistent with the week
            local_date = start + timedelta(days=wd)
            min_staff = 2 if wd < 5 else 3  # Mon–Fri=2, Sat=3
            db.add_all(
                [
                    Shift(
                        user_id=user_id,
                        week_id=week.id,
                        weekday=wd,
                        local_date=local_date,
                        start_time=time(9, 0),
                        end_time=time(13, 0),
                        min_staff=min_staff,
                    ),
                    Shift(
                        user_id=user_id,
                        week_id=week.id,
                        weekday=wd,
                        local_date=local_date,
                        start_time=time(13, 0),
                        end_time=time(18, 0),
                        min_staff=min_staff,
                    ),
                ]
            )

        # 5) AVAILABILITIES (Mon–Fri 09–18 for all active employees)
        employees = db.query(Employee).filter_by(user_id=user_id, active=True).all()
        for emp in employees:
            for wd in [0, 1, 2, 3, 4]:  # Mon..Fri
                db.add(
                    Availability(
                        user_id=user_id,
                        employee_id=emp.id,
                        weekday=wd,
                        start_time=time(9, 0),
                        end_time=time(18, 0),
                    )
                )

        db.commit()
        return {
            "user_id": str(user_id),
            "week_id": str(week.id),
            "week_start": str(week.start_date),
            "open_days": week.open_days,
            "employees": len(employees),
        }

    except Exception:
        db.rollback()
        raise
