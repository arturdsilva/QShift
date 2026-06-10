"""
Local benchmark for schedule create latency.

This file is intentionally not named ``test_*.py`` so it does not run as part of
the default pytest suite. Run it explicitly:

    PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 ../.venv/bin/pytest \
        tests/integration/schedule_create_latency_benchmark.py -s
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, time as time_of_day, timedelta
from uuid import UUID

import pytest
from fastapi.testclient import TestClient

import core_api.schemas.schedule as schemas
import core_api.services.schedule as schedule_service
from core_api.core.constants import DEMO_EMAIL, DEMO_USER_ID
from core_api.core.db import SessionLocal
from core_api.models import Employee, Shift, User, Week
from tests.benchmarking import measure_ms, print_final_summary, print_summary, stats_row


BENCHMARK_OPEN_DAYS = (0, 1, 2, 3, 4)
BENCHMARK_SHIFT_WINDOWS = (
    (time_of_day(9, 0), time_of_day(13, 0)),
    (time_of_day(13, 0), time_of_day(17, 0)),
    (time_of_day(18, 0), time_of_day(22, 0)),
)
BENCHMARK_EMPLOYEE_COUNT = 40
BENCHMARK_EMPLOYEES_PER_SHIFT = 12
WARMUP_RUNS = 3
MEASURED_RUNS = 25


@dataclass(frozen=True)
class ScheduleCreateBenchmarkWeek:
    week_id: UUID
    payload: dict


@dataclass(frozen=True)
class ScheduleCreateBenchmarkDataset:
    user_id: UUID
    employee_count: int
    employees_per_shift: int
    shifts_per_week: int
    weeks: list[ScheduleCreateBenchmarkWeek]
    service_payload: schemas.ScheduleCreate


def _dataset_summary(dataset: ScheduleCreateBenchmarkDataset) -> dict[str, int]:
    return {
        "weeks": len(dataset.weeks),
        "shifts_per_week": dataset.shifts_per_week,
        "employees": dataset.employee_count,
        "employees_per_shift": dataset.employees_per_shift,
    }


@pytest.fixture
def schedule_create_benchmark_dataset() -> ScheduleCreateBenchmarkDataset:
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
                name=f"Benchmark Employee {index:02d}",
                active=True,
            )
            db.add(employee)
            employees.append(employee)
        db.flush()

        total_weeks = WARMUP_RUNS + MEASURED_RUNS
        weeks: list[ScheduleCreateBenchmarkWeek] = []
        service_payload: schemas.ScheduleCreate | None = None
        monday = date(2025, 1, 6)
        for week_index in range(total_weeks):
            week_start = monday + timedelta(days=7 * week_index)
            week = Week(
                user_id=DEMO_USER_ID,
                start_date=week_start,
                open_days=list(BENCHMARK_OPEN_DAYS),
                approved=False,
            )
            db.add(week)
            db.flush()

            shifts_payload = []
            shift_creates = []
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
                        min_staff=1,
                    )
                    db.add(shift)
                    db.flush()

                    selected_employee_ids = [str(employee.id) for employee in employees[:BENCHMARK_EMPLOYEES_PER_SHIFT]]
                    shifts_payload.append(
                        {
                            "shift_id": str(shift.id),
                            "employee_ids": selected_employee_ids,
                        }
                    )
                    shift_creates.append(
                        schemas.ScheduleShiftCreate(
                            shift_id=shift.id,
                            employee_ids=[employee.id for employee in employees[:BENCHMARK_EMPLOYEES_PER_SHIFT]],
                        )
                    )

            weeks.append(
                ScheduleCreateBenchmarkWeek(
                    week_id=week.id,
                    payload={"shifts": shifts_payload},
                )
            )
            if service_payload is None:
                service_payload = schemas.ScheduleCreate(shifts=shift_creates)

        db.commit()

        assert service_payload is not None
        yield ScheduleCreateBenchmarkDataset(
            user_id=user.id,
            employee_count=len(employees),
            employees_per_shift=BENCHMARK_EMPLOYEES_PER_SHIFT,
            shifts_per_week=len(BENCHMARK_OPEN_DAYS) * len(BENCHMARK_SHIFT_WINDOWS),
            weeks=weeks,
            service_payload=service_payload,
        )
    finally:
        db.query(User).filter(User.id == DEMO_USER_ID).delete(synchronize_session=False)
        db.commit()
        db.close()


@pytest.mark.benchmark
@pytest.mark.integration
def test_schedule_create_latency_benchmark(
    client: TestClient,
    schedule_create_benchmark_dataset: ScheduleCreateBenchmarkDataset,
):
    week_runs = iter(schedule_create_benchmark_dataset.weeks)

    def create_schedule_endpoint():
        week_run = next(week_runs)
        response = client.post(
            f"/api/v1/weeks/{week_run.week_id}/schedule",
            json=week_run.payload,
        )
        assert response.status_code == 201
        payload = response.json()
        assert len(payload["shifts"]) == schedule_create_benchmark_dataset.shifts_per_week
        return payload

    for _ in range(WARMUP_RUNS):
        create_schedule_endpoint()

    endpoint_samples_ms = measure_ms(MEASURED_RUNS, create_schedule_endpoint)
    print_summary(
        "schedule-create-endpoint",
        endpoint_samples_ms,
        dataset=_dataset_summary(schedule_create_benchmark_dataset),
    )

    db = SessionLocal()
    try:
        first_week_id = schedule_create_benchmark_dataset.weeks[0].week_id

        def prepare_assignments():
            assignments = schedule_service.build_schedule_assignments_to_create(
                week_id=first_week_id,
                user_id=schedule_create_benchmark_dataset.user_id,
                payload=schedule_create_benchmark_dataset.service_payload,
                db=db,
            )
            assert len(assignments) == (
                schedule_create_benchmark_dataset.shifts_per_week
                * schedule_create_benchmark_dataset.employees_per_shift
            )
            return assignments

        for _ in range(WARMUP_RUNS):
            prepare_assignments()

        service_samples_ms = measure_ms(MEASURED_RUNS, prepare_assignments)
        print_summary(
            "schedule-create-prepare-service",
            service_samples_ms,
            dataset=_dataset_summary(schedule_create_benchmark_dataset),
        )
        print_final_summary(
            [
                stats_row("schedule-create-endpoint", endpoint_samples_ms),
                stats_row("schedule-create-prepare-service", service_samples_ms),
            ],
            dataset=_dataset_summary(schedule_create_benchmark_dataset),
        )
    finally:
        db.close()
