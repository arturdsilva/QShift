from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class HealthCheckOut(BaseModel):
    name: str
    status: Literal["ok", "error"]
    latency_ms: float | None = None
    details: dict[str, Any] = Field(default_factory=dict)


class HttpRouteMetricsOut(BaseModel):
    method: str
    route: str
    request_count: int
    error_count: int
    average_latency_ms: float


class HttpMetricsOut(BaseModel):
    request_count: int
    error_count: int
    average_latency_ms: float
    routes: list[HttpRouteMetricsOut] = Field(default_factory=list)


class ScheduleGenerationMetricsOut(BaseModel):
    total: int
    by_status: dict[str, int]
    active: int
    done: int
    failed: int
    oldest_processing_job_age_seconds: float | None = None
    last_failure_at: datetime | None = None


class OperationsSummaryOut(BaseModel):
    service: str
    env: str
    status: Literal["ok", "degraded"]
    generated_at: datetime
    uptime_seconds: float
    checks: list[HealthCheckOut]
    http: HttpMetricsOut
    schedule_generation: ScheduleGenerationMetricsOut
