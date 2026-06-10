"""
Local benchmark for the annual employee report endpoint.

This file is intentionally not named ``test_*.py`` so it does not run as part of
the default pytest suite. Run it explicitly:

    PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 ../.venv/bin/pytest \
        tests/integration/employee_report_latency_benchmark.py -s
"""

from __future__ import annotations

import math
import statistics
import time
from dataclasses import dataclass
from datetime import date, time as time_of_day, timedelta

import pytest
from fastapi.testclient import TestClient

import core_api.services.employee as employee_service
from core_api.core.constants import DEMO_EMAIL, DEMO_USER_ID
from core_api.core.db import SessionLocal
from core_api.models import Employee, Shift, ShiftAssignment, User, Week


BENCHMARK_YEAR = 2025
BENCHMARK_WEEKS = 52
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
    weeks: int
    shifts_per_day: int
    open_days: tuple[int, ...]


def _first_monday(year: int) -> date:
    current = date(year, 1, 1)
    while current.weekday() != 0:
        current += timedelta(days=1)
    return current


def _p95(values: list[float]) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = max(0, math.ceil(len(ordered) * 0.95) - 1)
    return ordered[index]


def _sample_stddev(values: list[float]) -> float:
    if len(values) < 2:
        return 0.0
    return statistics.stdev(values)


def _stats_row(label: str, samples_ms: list[float]) -> dict[str, float | int | str]:
    return {
        "label": label,
        "runs": len(samples_ms),
        "min_ms": min(samples_ms),
        "avg_ms": statistics.mean(samples_ms),
        "median_ms": statistics.median(samples_ms),
        "stddev_ms": _sample_stddev(samples_ms),
        "p95_ms": _p95(samples_ms),
    }


def _print_summary(label: str, samples_ms: list[float], *, dataset: BenchmarkDataset) -> None:
    stats = _stats_row(label, samples_ms)
    print(
        (
            f"\n[{label}] runs={stats['runs']} "
            f"min={stats['min_ms']:.2f}ms "
            f"avg={stats['avg_ms']:.2f}ms "
            f"median={stats['median_ms']:.2f}ms "
            f"stddev={stats['stddev_ms']:.2f}ms "
            f"p95={stats['p95_ms']:.2f}ms "
            f"dataset=weeks:{dataset.weeks} "
            f"open_days:{len(dataset.open_days)} "
            f"shifts_per_day:{dataset.shifts_per_day}"
        )
    )


def _print_final_summary(
    rows: list[dict[str, float | int | str]],
    *,
    dataset: BenchmarkDataset,
) -> None:
    print("\n=== FINAL LATENCY SUMMARY ===")
    print(
        (
            f"dataset: year={dataset.year} weeks={dataset.weeks} "
            f"open_days={len(dataset.open_days)} shifts_per_day={dataset.shifts_per_day}"
        )
    )
    for row in rows:
        print(
            (
                f"{row['label']}: runs={row['runs']} "
                f"avg={row['avg_ms']:.2f}ms "
                f"median={row['median_ms']:.2f}ms "
                f"stddev={row['stddev_ms']:.2f}ms "
                f"min={row['min_ms']:.2f}ms "
                f"p95={row['p95_ms']:.2f}ms"
            )
        )


def _measure_ms(runs: int, callback) -> list[float]:
    samples_ms: list[float] = []
    for _ in range(runs):
        start = time.perf_counter()
        callback()
        samples_ms.append((time.perf_counter() - start) * 1000)
    return samples_ms


@pytest.fixture
def annual_report_benchmark_dataset() -> BenchmarkDataset:
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

        first_monday = _first_monday(BENCHMARK_YEAR)
        shifts: list[Shift] = []
        for week_index in range(BENCHMARK_WEEKS):
            week_start = first_monday + timedelta(days=7 * week_index)
            week = Week(
                user_id=DEMO_USER_ID,
                start_date=week_start,
                open_days=list(BENCHMARK_OPEN_DAYS),
                approved=False,
            )
            db.add(week)
            db.flush()

            for weekday in BENCHMARK_OPEN_DAYS:
                local_date = week_start + timedelta(days=weekday)
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

        for shift in shifts:
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
            weeks=BENCHMARK_WEEKS,
            shifts_per_day=len(BENCHMARK_SHIFT_WINDOWS),
            open_days=BENCHMARK_OPEN_DAYS,
        )
    finally:
        db.query(User).filter(User.id == DEMO_USER_ID).delete(synchronize_session=False)
        db.commit()
        db.close()


@pytest.mark.benchmark
@pytest.mark.integration
def test_employee_year_report_latency_benchmark(
    client: TestClient,
    annual_report_benchmark_dataset: BenchmarkDataset,
):
    employee_id = annual_report_benchmark_dataset.employee_id
    year = annual_report_benchmark_dataset.year

    def fetch_endpoint():
        response = client.get(f"/api/v1/employees/{employee_id}/report/{year}")
        assert response.status_code == 200
        payload = response.json()
        assert payload["name"] == annual_report_benchmark_dataset.employee_name
        assert len(payload["months_data"]) == 12
        return payload

    for _ in range(WARMUP_RUNS):
        fetch_endpoint()

    endpoint_samples_ms = _measure_ms(MEASURED_RUNS, fetch_endpoint)
    _print_summary(
        "annual-report-endpoint",
        endpoint_samples_ms,
        dataset=annual_report_benchmark_dataset,
    )

    db = SessionLocal()
    try:
        def build_service_report():
            report = employee_service.build_employee_year_report(
                employee_id=employee_id,
                employee_name=annual_report_benchmark_dataset.employee_name,
                year=year,
                db=db,
            )
            assert report.name == annual_report_benchmark_dataset.employee_name
            assert len(report.months_data) == 12
            return report

        for _ in range(WARMUP_RUNS):
            build_service_report()

        service_samples_ms = _measure_ms(MEASURED_RUNS, build_service_report)
        _print_summary(
            "annual-report-service",
            service_samples_ms,
            dataset=annual_report_benchmark_dataset,
        )
        _print_final_summary(
            [
                _stats_row("annual-report-endpoint", endpoint_samples_ms),
                _stats_row("annual-report-service", service_samples_ms),
            ],
            dataset=annual_report_benchmark_dataset,
        )
    finally:
        db.close()
