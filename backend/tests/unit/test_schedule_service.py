from datetime import time
from types import SimpleNamespace
from uuid import uuid4

import pytest

import core_api.services.schedule as schedule_service


class _FakeQuery:
    def __init__(self, rows):
        self._rows = rows

    def filter(self, *args, **kwargs):
        return self

    def join(self, *args, **kwargs):
        return self

    def order_by(self, *args, **kwargs):
        return self

    def all(self):
        return self._rows


class _FakeSession:
    def __init__(self, shifts, assignment_rows):
        self.shifts = shifts
        self.assignment_rows = assignment_rows
        self.query_calls = 0

    def query(self, *entities):
        self.query_calls += 1
        if self.query_calls == 1:
            return _FakeQuery(self.shifts)
        if self.query_calls == 2:
            return _FakeQuery(self.assignment_rows)
        raise AssertionError("unexpected extra query")


def _build_shift(*, weekday: int, start_hour: int, end_hour: int, min_staff: int = 1):
    return SimpleNamespace(
        id=uuid4(),
        weekday=weekday,
        start_time=time(start_hour, 0),
        end_time=time(end_hour, 0),
        min_staff=min_staff,
    )


@pytest.mark.unit
def test_build_schedule_schema_from_db_returns_empty_employee_lists():
    shifts = [
        _build_shift(weekday=0, start_hour=9, end_hour=13),
        _build_shift(weekday=0, start_hour=13, end_hour=17),
        _build_shift(weekday=1, start_hour=9, end_hour=13, min_staff=2),
    ]
    db = _FakeSession(shifts=shifts, assignment_rows=[])

    schedule = schedule_service.build_schedule_schema_from_db(uuid4(), uuid4(), db)

    assert len(schedule.shifts) == 3
    assert all(shift.employees == [] for shift in schedule.shifts)


@pytest.mark.unit
def test_build_schedule_schema_from_db_groups_multiple_employees_per_shift_in_name_order():
    shifts = [_build_shift(weekday=0, start_hour=9, end_hour=13)]
    db = _FakeSession(
        shifts=shifts,
        assignment_rows=[
            (shifts[0].id, uuid4(), "Alice"),
            (shifts[0].id, uuid4(), "Bob"),
        ],
    )

    schedule = schedule_service.build_schedule_schema_from_db(uuid4(), uuid4(), db)

    assert [employee.name for employee in schedule.shifts[0].employees] == ["Alice", "Bob"]


@pytest.mark.unit
def test_build_schedule_schema_from_db_preserves_shift_order_and_mixed_empty_shifts():
    shifts = [
        _build_shift(weekday=0, start_hour=9, end_hour=13),
        _build_shift(weekday=0, start_hour=13, end_hour=17),
        _build_shift(weekday=1, start_hour=9, end_hour=13, min_staff=2),
    ]
    db = _FakeSession(
        shifts=shifts,
        assignment_rows=[
            (shifts[0].id, uuid4(), "Alice"),
            (shifts[2].id, uuid4(), "Carol"),
        ],
    )

    schedule = schedule_service.build_schedule_schema_from_db(uuid4(), uuid4(), db)

    assert [(shift.weekday, shift.start_time, shift.end_time) for shift in schedule.shifts] == [
        (0, time(9, 0), time(13, 0)),
        (0, time(13, 0), time(17, 0)),
        (1, time(9, 0), time(13, 0)),
    ]
    assert [employee.name for employee in schedule.shifts[0].employees] == ["Alice"]
    assert schedule.shifts[1].employees == []
    assert [employee.name for employee in schedule.shifts[2].employees] == ["Carol"]
