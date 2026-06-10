from datetime import date, time
from types import SimpleNamespace
from uuid import uuid4

import pytest

import core_api.services.employee as employee_service


class _FakeResult:
    def __init__(self, rows):
        self._rows = rows

    def all(self):
        return self._rows


class _FakeSession:
    def __init__(self, rows):
        self.rows = rows
        self.execute_calls = []

    def execute(self, statement):
        self.execute_calls.append(statement)
        return _FakeResult(self.rows)


@pytest.mark.unit
def test_build_employee_year_report_returns_zeroed_months_when_employee_has_no_shifts():
    db = _FakeSession(rows=[])

    report = employee_service.build_employee_year_report(
        employee_id=uuid4(),
        employee_name="Alice",
        year=2025,
        db=db,
    )

    assert report.name == "Alice"
    assert len(report.months_data) == 12
    assert len(db.execute_calls) == 1

    january = report.months_data[0]
    february = report.months_data[1]

    assert january.hours_worked == 0.0
    assert january.num_days_worked == 0
    assert january.num_days_off == 31
    assert february.num_days_off == 28


@pytest.mark.unit
def test_build_employee_month_report_returns_zeroed_month_when_employee_has_no_shifts():
    db = _FakeSession(rows=[])

    report = employee_service.build_employee_month_report(
        employee_id=uuid4(),
        employee_name="Alice",
        year=2025,
        month=4,
        db=db,
    )

    assert report.name == "Alice"
    assert report.month_data.hours_worked == 0.0
    assert report.month_data.num_days_worked == 0
    assert report.month_data.num_days_off == 30
    assert len(db.execute_calls) == 1


@pytest.mark.unit
def test_build_employee_month_report_aggregates_multiple_shifts_same_day():
    db = _FakeSession(
        rows=[
            SimpleNamespace(
                local_date=date(2025, 3, 10),
                start_time=time(9, 0),
                end_time=time(13, 0),
            ),
            SimpleNamespace(
                local_date=date(2025, 3, 10),
                start_time=time(13, 0),
                end_time=time(17, 0),
            ),
            SimpleNamespace(
                local_date=date(2025, 3, 12),
                start_time=time(18, 0),
                end_time=time(22, 0),
            ),
        ]
    )

    report = employee_service.build_employee_month_report(
        employee_id=uuid4(),
        employee_name="Alice",
        year=2025,
        month=3,
        db=db,
    )

    month_data = report.month_data

    assert len(db.execute_calls) == 1
    assert month_data.hours_worked == 12.0
    assert month_data.num_days_worked == 2
    assert month_data.num_days_off == 29
    assert month_data.num_morning_shifts == 1
    assert month_data.num_afternoon_shifts == 1
    assert month_data.num_night_shifts == 1


@pytest.mark.unit
def test_build_employee_month_report_classifies_shift_boundaries_like_current_rules():
    db = _FakeSession(
        rows=[
            SimpleNamespace(
                local_date=date(2024, 2, 1),
                start_time=time(11, 59),
                end_time=time(12, 59),
            ),
            SimpleNamespace(
                local_date=date(2024, 2, 2),
                start_time=time(12, 0),
                end_time=time(13, 0),
            ),
            SimpleNamespace(
                local_date=date(2024, 2, 3),
                start_time=time(17, 59),
                end_time=time(18, 59),
            ),
            SimpleNamespace(
                local_date=date(2024, 2, 4),
                start_time=time(18, 0),
                end_time=time(19, 0),
            ),
        ]
    )

    report = employee_service.build_employee_month_report(
        employee_id=uuid4(),
        employee_name="Alice",
        year=2024,
        month=2,
        db=db,
    )

    month_data = report.month_data

    assert month_data.hours_worked == 4.0
    assert month_data.num_days_worked == 4
    assert month_data.num_days_off == 25
    assert month_data.num_morning_shifts == 1
    assert month_data.num_afternoon_shifts == 2
    assert month_data.num_night_shifts == 1


@pytest.mark.unit
def test_build_employee_year_report_aggregates_multiple_shifts_same_day_and_across_months():
    db = _FakeSession(
        rows=[
            SimpleNamespace(
                local_date=date(2025, 1, 10),
                start_time=time(9, 0),
                end_time=time(13, 0),
            ),
            SimpleNamespace(
                local_date=date(2025, 1, 10),
                start_time=time(13, 0),
                end_time=time(17, 0),
            ),
            SimpleNamespace(
                local_date=date(2025, 1, 12),
                start_time=time(18, 0),
                end_time=time(22, 0),
            ),
            SimpleNamespace(
                local_date=date(2025, 2, 1),
                start_time=time(9, 0),
                end_time=time(12, 0),
            ),
        ]
    )

    report = employee_service.build_employee_year_report(
        employee_id=uuid4(),
        employee_name="Alice",
        year=2025,
        db=db,
    )

    january = report.months_data[0]
    february = report.months_data[1]
    march = report.months_data[2]

    assert len(db.execute_calls) == 1

    assert january.hours_worked == 12.0
    assert january.num_days_worked == 2
    assert january.num_days_off == 29
    assert january.num_morning_shifts == 1
    assert january.num_afternoon_shifts == 1
    assert january.num_night_shifts == 1

    assert february.hours_worked == 3.0
    assert february.num_days_worked == 1
    assert february.num_days_off == 27
    assert february.num_morning_shifts == 1
    assert february.num_afternoon_shifts == 0
    assert february.num_night_shifts == 0

    assert march.hours_worked == 0.0
    assert march.num_days_worked == 0
    assert march.num_days_off == 31


@pytest.mark.unit
def test_build_employee_year_report_classifies_shift_boundaries_like_current_rules():
    db = _FakeSession(
        rows=[
            SimpleNamespace(
                local_date=date(2024, 2, 1),
                start_time=time(11, 59),
                end_time=time(12, 59),
            ),
            SimpleNamespace(
                local_date=date(2024, 2, 2),
                start_time=time(12, 0),
                end_time=time(13, 0),
            ),
            SimpleNamespace(
                local_date=date(2024, 2, 3),
                start_time=time(17, 59),
                end_time=time(18, 59),
            ),
            SimpleNamespace(
                local_date=date(2024, 2, 4),
                start_time=time(18, 0),
                end_time=time(19, 0),
            ),
        ]
    )

    report = employee_service.build_employee_year_report(
        employee_id=uuid4(),
        employee_name="Alice",
        year=2024,
        db=db,
    )

    february = report.months_data[1]

    assert february.hours_worked == 4.0
    assert february.num_days_worked == 4
    assert february.num_days_off == 25
    assert february.num_morning_shifts == 1
    assert february.num_afternoon_shifts == 2
    assert february.num_night_shifts == 1
