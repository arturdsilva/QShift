from uuid import UUID
from datetime import datetime, date, time, timedelta
import calendar

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from core_api.models import ShiftAssignment, Shift
from core_api.schemas.employee import (
    EmployeeMonthReport,
    EmployeeYearReport,
    EmployeeMonthData,
)

# HELPERS


def _time_diff(start_time: time, end_time: time) -> timedelta:
    datetime1 = datetime.combine(datetime.today(), start_time)
    datetime2 = datetime.combine(datetime.today(), end_time)
    return datetime2 - datetime1


def _empty_employee_month_data(*, year: int, month: int) -> EmployeeMonthData:
    start_date = date(year, month, 1)
    last_month_day = calendar.monthrange(year, month)[1]
    end_date = date(year, month, last_month_day)

    return EmployeeMonthData(
        hours_worked=0.0,
        num_days_off=(end_date - start_date).days + 1,
        num_days_worked=0,
        num_morning_shifts=0,
        num_afternoon_shifts=0,
        num_night_shifts=0,
    )


def _build_employee_month_data(
    employee_id: UUID, year: int, month: int, db: Session
) -> EmployeeMonthData:
    start_date = date(year, month, 1)
    last_month_day = calendar.monthrange(year, month)[1]
    end_date = date(year, month, last_month_day)

    shifts = (
        db.execute(
            select(Shift.local_date, Shift.start_time, Shift.end_time)
            .join(
                ShiftAssignment,
                and_(
                    ShiftAssignment.shift_id == Shift.id,
                    ShiftAssignment.user_id == Shift.user_id,
                ),
            )
            .where(
                ShiftAssignment.employee_id == employee_id,
                Shift.local_date >= start_date,
                Shift.local_date <= end_date,
            )
            .order_by(Shift.local_date, Shift.start_time, Shift.id)
        )
        .all()
    )

    if not shifts:
        return _empty_employee_month_data(year=year, month=month)

    hours_worked = 0.0
    num_days_worked = 0
    num_morning_shifts = 0
    num_afternoon_shifts = 0
    num_night_shifts = 0

    last_date = None
    for shift in shifts:
        hours_worked += (
            _time_diff(shift.start_time, shift.end_time).total_seconds() / 3600.0
        )
        if last_date is None or last_date != shift.local_date:
            num_days_worked += 1

        if shift.start_time < time(12):
            num_morning_shifts += 1
        elif shift.start_time < time(18):
            num_afternoon_shifts += 1
        else:
            num_night_shifts += 1

        last_date = shift.local_date

    num_days_off = (end_date - start_date).days + 1 - num_days_worked

    return EmployeeMonthData(
        hours_worked=hours_worked,
        num_days_off=num_days_off,
        num_days_worked=num_days_worked,
        num_morning_shifts=num_morning_shifts,
        num_afternoon_shifts=num_afternoon_shifts,
        num_night_shifts=num_night_shifts,
    )


def _build_employee_year_data(
    employee_id: UUID, year: int, db: Session
) -> list[EmployeeMonthData]:
    start_date = date(year, 1, 1)
    end_date = date(year, 12, 31)

    shifts = (
        db.execute(
            select(Shift.local_date, Shift.start_time, Shift.end_time)
            .join(
                ShiftAssignment,
                and_(
                    ShiftAssignment.shift_id == Shift.id,
                    ShiftAssignment.user_id == Shift.user_id,
                ),
            )
            .where(
                ShiftAssignment.employee_id == employee_id,
                Shift.local_date >= start_date,
                Shift.local_date <= end_date,
            )
            .order_by(Shift.local_date, Shift.start_time, Shift.id)
        )
        .all()
    )

    months_data = [
        {
            "hours_worked": 0.0,
            "worked_dates": set(),
            "num_morning_shifts": 0,
            "num_afternoon_shifts": 0,
            "num_night_shifts": 0,
        }
        for _ in range(12)
    ]

    for shift in shifts:
        month_data = months_data[shift.local_date.month - 1]

        month_data["hours_worked"] += (
            _time_diff(shift.start_time, shift.end_time).total_seconds() / 3600.0
        )
        month_data["worked_dates"].add(shift.local_date)

        if shift.start_time < time(12):
            month_data["num_morning_shifts"] += 1
        elif shift.start_time < time(18):
            month_data["num_afternoon_shifts"] += 1
        else:
            month_data["num_night_shifts"] += 1

    report_months_data = []
    for month, month_data in enumerate(months_data, start=1):
        num_days_worked = len(month_data["worked_dates"])
        report_months_data.append(
            EmployeeMonthData(
                hours_worked=month_data["hours_worked"],
                num_days_off=calendar.monthrange(year, month)[1] - num_days_worked,
                num_days_worked=num_days_worked,
                num_morning_shifts=month_data["num_morning_shifts"],
                num_afternoon_shifts=month_data["num_afternoon_shifts"],
                num_night_shifts=month_data["num_night_shifts"],
            )
        )

    return report_months_data


# SERVICES


def build_employee_month_report(
    employee_id: UUID, employee_name: str, year: int, month: int, db: Session
) -> EmployeeMonthReport:
    return EmployeeMonthReport(
        name=employee_name,
        month_data=_build_employee_month_data(employee_id, year, month, db),
    )


def build_employee_year_report(
    employee_id: UUID, employee_name: str, year: int, db: Session
) -> EmployeeYearReport:
    return EmployeeYearReport(
        name=employee_name,
        months_data=_build_employee_year_data(employee_id, year, db),
    )
