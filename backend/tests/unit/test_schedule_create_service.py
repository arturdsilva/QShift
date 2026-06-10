from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi import HTTPException

import core_api.schemas.schedule as schemas
import core_api.services.schedule as schedule_service


class _FakeQuery:
    def __init__(self, rows):
        self._rows = rows

    def filter(self, *args, **kwargs):
        return self

    def all(self):
        return self._rows


class _FakeSession:
    def __init__(self, query_rows):
        self.query_rows = list(query_rows)
        self.query_calls = 0

    def query(self, *entities):
        if self.query_calls >= len(self.query_rows):
            raise AssertionError("unexpected extra query")
        rows = self.query_rows[self.query_calls]
        self.query_calls += 1
        return _FakeQuery(rows)


@pytest.mark.unit
def test_build_schedule_assignments_to_create_returns_empty_list_for_empty_payload():
    payload = schemas.ScheduleCreate(shifts=[])
    db = _FakeSession(query_rows=[])

    assignments = schedule_service.build_schedule_assignments_to_create(
        week_id=uuid4(),
        user_id=uuid4(),
        payload=payload,
        db=db,
    )

    assert assignments == []
    assert db.query_calls == 0


@pytest.mark.unit
def test_build_schedule_assignments_to_create_validates_in_batch_and_preserves_pairs():
    shift_a = uuid4()
    shift_b = uuid4()
    employee_a = uuid4()
    employee_b = uuid4()
    employee_c = uuid4()
    payload = schemas.ScheduleCreate(
        shifts=[
            schemas.ScheduleShiftCreate(
                shift_id=shift_a,
                employee_ids=[employee_a, employee_b],
            ),
            schemas.ScheduleShiftCreate(
                shift_id=shift_b,
                employee_ids=[employee_c],
            ),
        ]
    )
    db = _FakeSession(
        query_rows=[
            [(shift_a,), (shift_b,)],
            [(employee_a,), (employee_b,), (employee_c,)],
        ]
    )
    user_id = uuid4()

    assignments = schedule_service.build_schedule_assignments_to_create(
        week_id=uuid4(),
        user_id=user_id,
        payload=payload,
        db=db,
    )

    assert db.query_calls == 2
    assert [(assignment.shift_id, assignment.employee_id) for assignment in assignments] == [
        (shift_a, employee_a),
        (shift_a, employee_b),
        (shift_b, employee_c),
    ]
    assert all(assignment.user_id == user_id for assignment in assignments)


@pytest.mark.unit
def test_build_schedule_assignments_to_create_raises_when_shift_missing_from_week_scope():
    existing_shift = uuid4()
    missing_shift = uuid4()
    employee_id = uuid4()
    payload = schemas.ScheduleCreate(
        shifts=[
            schemas.ScheduleShiftCreate(
                shift_id=existing_shift,
                employee_ids=[],
            ),
            schemas.ScheduleShiftCreate(
                shift_id=missing_shift,
                employee_ids=[employee_id],
            ),
        ]
    )
    db = _FakeSession(query_rows=[[(existing_shift,)]] )

    with pytest.raises(HTTPException) as exc_info:
        schedule_service.build_schedule_assignments_to_create(
            week_id=uuid4(),
            user_id=uuid4(),
            payload=payload,
            db=db,
        )

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Shift not found"
    assert db.query_calls == 1


@pytest.mark.unit
def test_build_schedule_assignments_to_create_raises_when_employee_missing():
    shift_id = uuid4()
    existing_employee = uuid4()
    missing_employee = uuid4()
    payload = schemas.ScheduleCreate(
        shifts=[
            schemas.ScheduleShiftCreate(
                shift_id=shift_id,
                employee_ids=[existing_employee, missing_employee],
            ),
        ]
    )
    db = _FakeSession(
        query_rows=[
            [(shift_id,)],
            [(existing_employee,)],
        ]
    )

    with pytest.raises(HTTPException) as exc_info:
        schedule_service.build_schedule_assignments_to_create(
            week_id=uuid4(),
            user_id=uuid4(),
            payload=payload,
            db=db,
        )

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Employee not found"
    assert db.query_calls == 2
