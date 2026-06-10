from datetime import time
from types import SimpleNamespace
from uuid import uuid4

import pytest

import core_api.schemas.schedule as schemas
import core_api.services.schedule as schedule_service


class _FakeQuery:
    def __init__(self, rows):
        self._rows = rows

    def filter(self, *args, **kwargs):
        return self

    def order_by(self, *args, **kwargs):
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
def test_build_schedule_generation_dispatch_artifacts_returns_request_and_json_payload(monkeypatch):
    payload = schemas.ScheduleGenerationDispatchPayload(
        shift_vector=[],
        employees=[],
        availabilities=[],
    )
    job_id = uuid4()
    captured = {}

    def fake_build_schedule_generation_dispatch_request(*, job_id, payload):
        captured["job_id"] = job_id
        captured["payload"] = payload
        return schemas.ScheduleGenerationDispatchRequest(
            job_id=job_id,
            callback_url="http://core/api/v1/internal/schedule-generation-results",
            payload=payload,
        )

    monkeypatch.setattr(
        schedule_service,
        "build_schedule_generation_dispatch_request",
        fake_build_schedule_generation_dispatch_request,
    )

    dispatch_request, request_payload = (
        schedule_service.build_schedule_generation_dispatch_artifacts(
            job_id=job_id,
            payload=payload,
        )
    )

    assert captured["job_id"] == job_id
    assert captured["payload"] == payload
    assert dispatch_request.job_id == job_id
    assert request_payload["job_id"] == str(job_id)
    assert request_payload["payload"] == {
        "shift_vector": [],
        "employees": [],
        "availabilities": [],
    }


@pytest.mark.unit
def test_build_schedule_generation_payload_builds_expected_models_from_scalar_rows():
    employee_id = uuid4()
    payload = schedule_service.build_schedule_generation_payload(
        db=_FakeSession(
            query_rows=[
                [
                    SimpleNamespace(
                        id=employee_id,
                        name="Alice",
                        weekly_workload_hours=24,
                        preferred_weekdays=[0, 2],
                    )
                ],
                [
                    SimpleNamespace(
                        employee_id=employee_id,
                        weekday=0,
                        start_time=time(9, 0),
                        end_time=time(17, 0),
                    )
                ],
            ]
        ),
        user_id=uuid4(),
        shift_vector=[],
    )

    assert len(payload.employees) == 1
    assert payload.employees[0].name == "Alice"
    assert payload.employees[0].weekly_workload_hours == 24
    assert payload.employees[0].preferred_weekdays == [0, 2]
    assert len(payload.availabilities) == 1
    assert payload.availabilities[0].employee_id == employee_id
    assert payload.availabilities[0].weekday == 0
