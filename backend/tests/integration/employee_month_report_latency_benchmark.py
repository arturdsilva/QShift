"""
Local benchmark for the monthly employee report endpoint.

This file is intentionally not named ``test_*.py`` so it does not run as part of
the default pytest suite. Run it explicitly:

    PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 ../.venv/bin/pytest \
        tests/integration/employee_month_report_latency_benchmark.py -s
"""

from __future__ import annotations

import calendar
from dataclasses import dataclass
from datetime import date, time as time_of_day, timedelta

import pytest
from fastapi.testclient import TestClient

import core_api.services.employee as employee_service
from core_api.core.constants import DEMO_EMAIL, DEMO_USER_ID
from core_api.core.db import SessionLocal
from core_api.models import Employee, Shift, ShiftAssignment, User, Week
from tests.benchmarking import measure_ms, print_final_summary, print_summary, stats_row


BENCHMARK_YEAR = 2025
BENCHMARK_MONTH = 3
BENCHMARK_OPEN_DAYS = (0, 1, 2, 3, 4)
BENCHMARK_SHIFT_WINDOWS = (
    (time_of_day(9, 0), time_of_day(13, 0)),
    (time_of_day(13, 0), time_of_day(17, 0)),
    (time_of_day(18, 0), time_of_day(22, 0)),
)
WARMUP_RUNS = 3
MEASURED_RUNS = 25


@dataclass(frozen=True)
class BenchmarkDataset:
    employee_id: str
    employee_name: str
    year: int
    month: int
    weeks: int
    shifts_per_day: int
    open_days: tuple[int, ...]


def _dataset_summary(dataset: BenchmarkDataset) -> dict[str, int]:
    return {
        "year": dataset.year,
        "month": dataset.month,
        "weeks": dataset.weeks,
        "open_days": len(dataset.open_days),
        "shifts_per_day": dataset.shifts_per_day,
    }


@pytest.fixture
def monthly_report_benchmark_dataset() -> BenchmarkDataset:
    db = SessionLocal()
    try:
        db.query(User).filter(User.id == DEMO_USER_ID).delete(synchronize_session=False)

        user = User(
            id=DEMO_USER_ID,
            email=DEMO_EMAIL,
            password_hash="benchmark-password-hash",
        )
        db.add(user)

        employee = Employee(
            user_id=DEMO_USER_ID,
            name="Benchmark Employee",
            active=True,
        )
        db.add(employee)
        db.flush()

        month_start = date(BENCHMARK_YEAR, BENCHMARK_MONTH, 1)
        month_end = date(
            BENCHMARK_YEAR,
            BENCHMARK_MONTH,
            calendar.monthrange(BENCHMARK_YEAR, BENCHMARK_MONTH)[1],
        )
        while month_start.weekday() != 0:
            month_start -= timedelta(days=1)

        weeks_created = 0
        shifts_created: list[Shift] = []
        current_week_start = month_start
        while current_week_start <= month_end:
            week = Week(
                user_id=DEMO_USER_ID,
                start_date=current_week_start,
                open_days=list(BENCHMARK_OPEN_DAYS),
                approved=False,
            )
            db.add(week)
            db.flush()
            weeks_created += 1

            for weekday in BENCHMARK_OPEN_DAYS:
                local_date = current_week_start + timedelta(days=weekday)
                if local_date.month != BENCHMARK_MONTH:
                    continue
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
                    shifts_created.append(shift)

            current_week_start += timedelta(days=7)

        db.flush()

        for shift in shifts_created:
            db.add(
                ShiftAssignment(
                    user_id=DEMO_USER_ID,
                    shift_id=shift.id,
                    employee_id=employee.id,
                )
            )

        db.commit()

        yield BenchmarkDataset(
            employee_id=str(employee.id),
            employee_name=employee.name,
            year=BENCHMARK_YEAR,
            month=BENCHMARK_MONTH,
            weeks=weeks_created,
            shifts_per_day=len(BENCHMARK_SHIFT_WINDOWS),
            open_days=BENCHMARK_OPEN_DAYS,
        )
    finally:
        try:
            db.query(User).filter(User.id == DEMO_USER_ID).delete(
                synchronize_session=False
            )
            db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()


@pytest.mark.benchmark
@pytest.mark.integration
def test_employee_month_report_latency_benchmark(
    client: TestClient,
    monthly_report_benchmark_dataset: BenchmarkDataset,
):
    employee_id = monthly_report_benchmark_dataset.employee_id
    year = monthly_report_benchmark_dataset.year
    month = monthly_report_benchmark_dataset.month

    def fetch_endpoint():
        response = client.get(f"/api/v1/employees/{employee_id}/report/{year}/{month}")
        assert response.status_code == 200
        payload = response.json()
        assert payload["name"] == monthly_report_benchmark_dataset.employee_name
        assert "month_data" in payload
        assert payload["month_data"]["num_days_worked"] > 0
        return payload

    for _ in range(WARMUP_RUNS):
        fetch_endpoint()

    endpoint_samples_ms = measure_ms(MEASURED_RUNS, fetch_endpoint)
    print_summary(
        "monthly-report-endpoint",
        endpoint_samples_ms,
        dataset=_dataset_summary(monthly_report_benchmark_dataset),
    )

    db = SessionLocal()
    try:

        def build_service_report():
            report = employee_service.build_employee_month_report(
                employee_id=employee_id,
                employee_name=monthly_report_benchmark_dataset.employee_name,
                year=year,
                month=month,
                db=db,
            )
            assert report.name == monthly_report_benchmark_dataset.employee_name
            assert report.month_data.num_days_worked > 0
            return report

        for _ in range(WARMUP_RUNS):
            build_service_report()

        service_samples_ms = measure_ms(MEASURED_RUNS, build_service_report)
        print_summary(
            "monthly-report-service",
            service_samples_ms,
            dataset=_dataset_summary(monthly_report_benchmark_dataset),
        )
        print_final_summary(
            [
                stats_row("monthly-report-endpoint", endpoint_samples_ms),
                stats_row("monthly-report-service", service_samples_ms),
            ],
            dataset=_dataset_summary(monthly_report_benchmark_dataset),
        )
    finally:
        db.close()
