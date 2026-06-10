"""
Local benchmark for preview-schedule latency.

This file is intentionally not named ``test_*.py`` so it does not run as part of
the default pytest suite. Run it explicitly:

    PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 ../.venv/bin/pytest \
        tests/integration/preview_schedule_latency_benchmark.py -s
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, time as time_of_day, timedelta
from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient

import core_api.services.schedule as schedule_service
from core_api.core.constants import DEMO_EMAIL, DEMO_USER_ID
from core_api.core.db import SessionLocal
from core_api.models import Availability, Employee, Shift, User, Week
from tests.benchmarking import measure_ms, print_final_summary, print_summary, stats_row


BENCHMARK_OPEN_DAYS = (0, 1, 2, 3, 4)
BENCHMARK_SHIFT_WINDOWS = (
    (time_of_day(9, 0), time_of_day(13, 0)),
    (time_of_day(13, 0), time_of_day(17, 0)),
    (time_of_day(18, 0), time_of_day(22, 0)),
)
BENCHMARK_EMPLOYEE_COUNT = 60
BENCHMARK_AVAILABILITY_WINDOWS = (
    (time_of_day(8, 0), time_of_day(12, 0)),
    (time_of_day(12, 0), time_of_day(18, 0)),
)
WARMUP_RUNS = 3
MEASURED_RUNS = 25


@dataclass(frozen=True)
class PreviewScheduleBenchmarkDataset:
    user_id: UUID
    shift_vector: list[dict]
    shift_count: int
    employee_count: int
    availability_count: int


def _dataset_summary(dataset: PreviewScheduleBenchmarkDataset) -> dict[str, int]:
    return {
        "shifts": dataset.shift_count,
        "employees": dataset.employee_count,
        "availabilities": dataset.availability_count,
    }


@pytest.fixture
def preview_schedule_benchmark_dataset() -> PreviewScheduleBenchmarkDataset:
    db = SessionLocal()
    try:
        db.query(User).filter(User.id == DEMO_USER_ID).delete(synchronize_session=False)

        user = User(
            id=DEMO_USER_ID,
            email=DEMO_EMAIL,
            password_hash="benchmark-password-hash",
        )
        db.add(user)
        db.flush()

        employees = []
        for index in range(BENCHMARK_EMPLOYEE_COUNT):
            employee = Employee(
                user_id=DEMO_USER_ID,
                name=f"Preview Employee {index:02d}",
                active=True,
                weekly_workload_hours=24 + (index % 3) * 6,
                preferred_weekdays=[index % 5],
            )
            db.add(employee)
            employees.append(employee)
        db.flush()

        week = Week(
            user_id=DEMO_USER_ID,
            start_date=date(2025, 1, 6),
            open_days=list(BENCHMARK_OPEN_DAYS),
            approved=False,
        )
        db.add(week)
        db.flush()

        shift_vector = []
        for weekday in BENCHMARK_OPEN_DAYS:
            local_date = week.start_date + timedelta(days=weekday)
            for start_time, end_time in BENCHMARK_SHIFT_WINDOWS:
                shift = Shift(
                    user_id=DEMO_USER_ID,
                    week_id=week.id,
                    weekday=weekday,
                    local_date=local_date,
                    start_time=start_time,
                    end_time=end_time,
                    min_staff=2,
                )
                db.add(shift)
                db.flush()
                shift_vector.append(
                    {
                        "id": str(shift.id),
                        "weekday": shift.weekday,
                        "start_time": str(shift.start_time),
                        "end_time": str(shift.end_time),
                        "min_staff": shift.min_staff,
                    }
                )

        availability_count = 0
        for employee in employees:
            for weekday in BENCHMARK_OPEN_DAYS:
                for start_time, end_time in BENCHMARK_AVAILABILITY_WINDOWS:
                    db.add(
                        Availability(
                            user_id=DEMO_USER_ID,
                            employee_id=employee.id,
                            weekday=weekday,
                            start_time=start_time,
                            end_time=end_time,
                        )
                    )
                    availability_count += 1

        db.commit()

        yield PreviewScheduleBenchmarkDataset(
            user_id=user.id,
            shift_vector=shift_vector,
            shift_count=len(shift_vector),
            employee_count=len(employees),
            availability_count=availability_count,
        )
    finally:
        db.query(User).filter(User.id == DEMO_USER_ID).delete(synchronize_session=False)
        db.commit()
        db.close()


@pytest.mark.benchmark
@pytest.mark.integration
def test_preview_schedule_latency_benchmark(
    client: TestClient,
    preview_schedule_benchmark_dataset: PreviewScheduleBenchmarkDataset,
    monkeypatch,
):
    dispatched_jobs = []

    def fake_dispatch(dispatch_request):
        dispatched_jobs.append(dispatch_request)

    monkeypatch.setattr(
        schedule_service,
        "dispatch_schedule_generation_job",
        fake_dispatch,
    )

    request_body = {"shift_vector": preview_schedule_benchmark_dataset.shift_vector}

    def call_endpoint():
        response = client.post("/api/v1/preview-schedule", json=request_body)
        assert response.status_code == 202
        payload = response.json()
        assert payload["status"] == "processing"
        return payload

    for _ in range(WARMUP_RUNS):
        call_endpoint()

    endpoint_samples_ms = measure_ms(MEASURED_RUNS, call_endpoint)
    assert len(dispatched_jobs) == WARMUP_RUNS + MEASURED_RUNS
    print_summary(
        "preview-schedule-endpoint",
        endpoint_samples_ms,
        dataset=_dataset_summary(preview_schedule_benchmark_dataset),
    )

    db = SessionLocal()
    try:
        def build_payload():
            payload = schedule_service.build_schedule_generation_payload(
                db=db,
                user_id=preview_schedule_benchmark_dataset.user_id,
                shift_vector=[],
            )
            assert len(payload.employees) == preview_schedule_benchmark_dataset.employee_count
            assert len(payload.availabilities) == preview_schedule_benchmark_dataset.availability_count
            return payload

        for _ in range(WARMUP_RUNS):
            build_payload()

        payload_samples_ms = measure_ms(MEASURED_RUNS, build_payload)
        print_summary(
            "preview-schedule-payload-service",
            payload_samples_ms,
            dataset=_dataset_summary(preview_schedule_benchmark_dataset),
        )

        payload = build_payload()

        def build_dispatch_artifacts():
            dispatch_request, request_payload = (
                schedule_service.build_schedule_generation_dispatch_artifacts(
                    job_id=uuid4(),
                    payload=payload,
                )
            )
            assert dispatch_request.payload == payload
            assert request_payload["payload"]["employees"]
            return request_payload

        for _ in range(WARMUP_RUNS):
            build_dispatch_artifacts()

        dispatch_samples_ms = measure_ms(MEASURED_RUNS, build_dispatch_artifacts)
        print_summary(
            "preview-schedule-dispatch-service",
            dispatch_samples_ms,
            dataset=_dataset_summary(preview_schedule_benchmark_dataset),
        )
        print_final_summary(
            [
                stats_row("preview-schedule-endpoint", endpoint_samples_ms),
                stats_row("preview-schedule-payload-service", payload_samples_ms),
                stats_row("preview-schedule-dispatch-service", dispatch_samples_ms),
            ],
            dataset=_dataset_summary(preview_schedule_benchmark_dataset),
        )
    finally:
        db.close()
