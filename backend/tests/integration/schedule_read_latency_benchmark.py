"""
Local benchmark for schedule read latency.

This file is intentionally not named ``test_*.py`` so it does not run as part of
the default pytest suite. Run it explicitly:

    PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 ../.venv/bin/pytest \
        tests/integration/schedule_read_latency_benchmark.py -s
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, time as time_of_day, timedelta
from uuid import UUID

import pytest
from fastapi.testclient import TestClient

import core_api.services.schedule as schedule_service
from core_api.core.constants import DEMO_EMAIL, DEMO_USER_ID
from core_api.core.db import SessionLocal
from core_api.models import Employee, Shift, ShiftAssignment, User, Week
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
class ScheduleReadBenchmarkDataset:
    user_id: UUID
    week_id: UUID
    shifts: int
    employees: int
    employees_per_shift: int
    shifts_without_assignments: int


def _dataset_summary(dataset: ScheduleReadBenchmarkDataset) -> dict[str, int | str]:
    return {
        "week_id": str(dataset.week_id),
        "shifts": dataset.shifts,
        "employees": dataset.employees,
        "employees_per_shift": dataset.employees_per_shift,
        "empty_shifts": dataset.shifts_without_assignments,
    }


@pytest.fixture
def schedule_read_benchmark_dataset() -> ScheduleReadBenchmarkDataset:
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

        week = Week(
            user_id=DEMO_USER_ID,
            start_date=date(2025, 1, 6),
            open_days=list(BENCHMARK_OPEN_DAYS),
            approved=False,
        )
        db.add(week)
        db.flush()

        shifts: list[Shift] = []
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
                shifts.append(shift)
        db.flush()

        shifts_without_assignments = 0
        for shift_index, shift in enumerate(shifts):
            if shift_index % 5 == 0:
                shifts_without_assignments += 1
                continue
            for employee in employees[:BENCHMARK_EMPLOYEES_PER_SHIFT]:
                db.add(
                    ShiftAssignment(
                        user_id=DEMO_USER_ID,
                        shift_id=shift.id,
                        employee_id=employee.id,
                    )
                )

        db.commit()

        yield ScheduleReadBenchmarkDataset(
            user_id=user.id,
            week_id=week.id,
            shifts=len(shifts),
            employees=len(employees),
            employees_per_shift=BENCHMARK_EMPLOYEES_PER_SHIFT,
            shifts_without_assignments=shifts_without_assignments,
        )
    finally:
        db.query(User).filter(User.id == DEMO_USER_ID).delete(synchronize_session=False)
        db.commit()
        db.close()


@pytest.mark.benchmark
@pytest.mark.integration
def test_schedule_read_latency_benchmark(
    client: TestClient,
    schedule_read_benchmark_dataset: ScheduleReadBenchmarkDataset,
):
    week_id = schedule_read_benchmark_dataset.week_id
    user_id = schedule_read_benchmark_dataset.user_id

    def fetch_endpoint():
        response = client.get(f"/api/v1/weeks/{week_id}/schedule")
        assert response.status_code == 200
        payload = response.json()
        assert len(payload["shifts"]) == schedule_read_benchmark_dataset.shifts
        assert any(shift["employees"] == [] for shift in payload["shifts"])
        return payload

    for _ in range(WARMUP_RUNS):
        fetch_endpoint()

    endpoint_samples_ms = measure_ms(MEASURED_RUNS, fetch_endpoint)
    print_summary(
        "schedule-read-endpoint",
        endpoint_samples_ms,
        dataset=_dataset_summary(schedule_read_benchmark_dataset),
    )

    db = SessionLocal()
    try:
        def build_schedule():
            schedule = schedule_service.build_schedule_schema_from_db(
                week_id=week_id,
                user_id=user_id,
                db=db,
            )
            assert len(schedule.shifts) == schedule_read_benchmark_dataset.shifts
            assert any(shift.employees == [] for shift in schedule.shifts)
            return schedule

        for _ in range(WARMUP_RUNS):
            build_schedule()

        service_samples_ms = measure_ms(MEASURED_RUNS, build_schedule)
        print_summary(
            "schedule-read-service",
            service_samples_ms,
            dataset=_dataset_summary(schedule_read_benchmark_dataset),
        )
        print_final_summary(
            [
                stats_row("schedule-read-endpoint", endpoint_samples_ms),
                stats_row("schedule-read-service", service_samples_ms),
            ],
            dataset=_dataset_summary(schedule_read_benchmark_dataset),
        )
    finally:
        db.close()
