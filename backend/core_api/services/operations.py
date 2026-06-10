from __future__ import annotations

from datetime import datetime, timezone
from urllib import error as urllib_error
from urllib import request as urllib_request

from sqlalchemy import func, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from core_api.core.config import settings
from core_api.core.db import SessionLocal, engine
from core_api.core.metrics import metrics
from core_api.models import ScheduleGenerationJob
from core_api.schemas.operations import (
    HealthCheckOut,
    OperationsSummaryOut,
    ScheduleGenerationMetricsOut,
)
from core_api.schemas.schedule import ScheduleGenerationJobStatus


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _elapsed_ms(start: datetime, end: datetime) -> float:
    return round((end - start).total_seconds() * 1000, 2)


def _datetime_age_seconds(value: datetime | None) -> float | None:
    if value is None:
        return None
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return round(max((utcnow() - value).total_seconds(), 0.0), 2)


def check_database_health() -> HealthCheckOut:
    start = utcnow()
    try:
        with engine.begin() as conn:
            result = conn.execute(text("SELECT 1"))
            select_1 = result.scalar_one()
        return HealthCheckOut(
            name="database",
            status="ok",
            latency_ms=_elapsed_ms(start, utcnow()),
            details={"select_1": select_1},
        )
    except Exception as exc:
        return HealthCheckOut(
            name="database",
            status="error",
            latency_ms=_elapsed_ms(start, utcnow()),
            details={"error": str(exc)},
        )


def check_schedule_generator_health() -> HealthCheckOut:
    start = utcnow()
    base_url = settings.SCHEDULE_GENERATOR_BASE_URL.rstrip("/")
    url = f"{base_url}/healthz"
    request = urllib_request.Request(url, method="GET")

    try:
        with urllib_request.urlopen(
            request,
            timeout=settings.SCHEDULE_GENERATOR_HEALTH_TIMEOUT_SECONDS,
        ) as response:
            status_code = getattr(response, "status", response.getcode())
            if status_code >= 400:
                raise RuntimeError(f"unexpected status {status_code}")

        return HealthCheckOut(
            name="schedule_generator_api",
            status="ok",
            latency_ms=_elapsed_ms(start, utcnow()),
            details={"url": url, "status_code": status_code},
        )
    except (
        urllib_error.URLError,
        urllib_error.HTTPError,
        TimeoutError,
        OSError,
        RuntimeError,
    ) as exc:
        return HealthCheckOut(
            name="schedule_generator_api",
            status="error",
            latency_ms=_elapsed_ms(start, utcnow()),
            details={"url": url, "error": str(exc)},
        )


def build_schedule_generation_metrics(db: Session) -> ScheduleGenerationMetricsOut:
    statuses = [status.value for status in ScheduleGenerationJobStatus]
    by_status = dict.fromkeys(statuses, 0)

    rows = (
        db.query(ScheduleGenerationJob.status, func.count(ScheduleGenerationJob.id))
        .group_by(ScheduleGenerationJob.status)
        .all()
    )
    for status, count in rows:
        by_status[status] = count

    oldest_processing_job = (
        db.query(ScheduleGenerationJob)
        .filter(
            ScheduleGenerationJob.status.in_(
                [
                    ScheduleGenerationJobStatus.PENDING.value,
                    ScheduleGenerationJobStatus.PROCESSING.value,
                ]
            )
        )
        .order_by(ScheduleGenerationJob.created_at.asc())
        .first()
    )
    last_failed_job = (
        db.query(ScheduleGenerationJob)
        .filter(ScheduleGenerationJob.status == ScheduleGenerationJobStatus.FAILED.value)
        .order_by(ScheduleGenerationJob.finished_at.desc())
        .first()
    )

    active = (
        by_status[ScheduleGenerationJobStatus.PENDING.value]
        + by_status[ScheduleGenerationJobStatus.PROCESSING.value]
    )

    return ScheduleGenerationMetricsOut(
        total=sum(by_status.values()),
        by_status=by_status,
        active=active,
        done=by_status[ScheduleGenerationJobStatus.DONE.value],
        failed=by_status[ScheduleGenerationJobStatus.FAILED.value],
        oldest_processing_job_age_seconds=_datetime_age_seconds(
            oldest_processing_job.created_at if oldest_processing_job else None
        ),
        last_failure_at=last_failed_job.finished_at if last_failed_job else None,
    )


def build_operations_summary() -> OperationsSummaryOut:
    checks = [check_database_health(), check_schedule_generator_health()]
    status = "ok" if all(check.status == "ok" for check in checks) else "degraded"

    try:
        with SessionLocal() as db:
            schedule_generation = build_schedule_generation_metrics(db)
    except SQLAlchemyError:
        schedule_generation = ScheduleGenerationMetricsOut(
            total=0,
            by_status={status.value: 0 for status in ScheduleGenerationJobStatus},
            active=0,
            done=0,
            failed=0,
        )
        status = "degraded"

    return OperationsSummaryOut(
        service="core_api",
        env=settings.ENV,
        status=status,
        generated_at=utcnow(),
        uptime_seconds=round(metrics.uptime_seconds(), 2),
        checks=checks,
        http=metrics.http_snapshot(),
        schedule_generation=schedule_generation,
    )


def render_schedule_generation_prometheus_metrics() -> list[str]:
    lines = [
        "# HELP qshift_schedule_generation_metrics_up Whether schedule generation metrics were collected successfully.",
        "# TYPE qshift_schedule_generation_metrics_up gauge",
    ]

    try:
        with SessionLocal() as db:
            schedule_metrics = build_schedule_generation_metrics(db)
    except SQLAlchemyError:
        lines.append('qshift_schedule_generation_metrics_up{service="core_api"} 0')
        return lines

    lines.append('qshift_schedule_generation_metrics_up{service="core_api"} 1')
    lines.extend(
        [
            "# HELP qshift_schedule_generation_jobs_total Schedule generation jobs by status.",
            "# TYPE qshift_schedule_generation_jobs_total gauge",
        ]
    )
    for status, count in sorted(schedule_metrics.by_status.items()):
        lines.append(
            'qshift_schedule_generation_jobs_total'
            + f'{{service="core_api",status="{status}"}} {count}'
        )

    lines.extend(
        [
            "# HELP qshift_schedule_generation_active_jobs Current pending or processing generation jobs.",
            "# TYPE qshift_schedule_generation_active_jobs gauge",
            "qshift_schedule_generation_active_jobs"
            + f'{{service="core_api"}} {schedule_metrics.active}',
        ]
    )
    if schedule_metrics.oldest_processing_job_age_seconds is not None:
        lines.extend(
            [
                "# HELP qshift_schedule_generation_oldest_processing_job_age_seconds Age of the oldest pending or processing generation job.",
                "# TYPE qshift_schedule_generation_oldest_processing_job_age_seconds gauge",
                "qshift_schedule_generation_oldest_processing_job_age_seconds"
                + f'{{service="core_api"}} {schedule_metrics.oldest_processing_job_age_seconds}',
            ]
        )

    return lines
