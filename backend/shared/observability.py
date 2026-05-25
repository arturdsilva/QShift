from __future__ import annotations

import json
import logging
import sys
import threading
import time
import uuid
from collections import Counter
from contextvars import ContextVar
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from fastapi import FastAPI, Request

REQUEST_DURATION_BUCKETS = (0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0)

request_id_context: ContextVar[str] = ContextVar("request_id", default="-")

_RESERVED_LOG_RECORD_ATTRS = set(
    logging.LogRecord(
        name="",
        level=0,
        pathname="",
        lineno=0,
        msg="",
        args=(),
        exc_info=None,
    ).__dict__.keys()
)


class RequestIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_context.get()
        return True


class JsonLogFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": self.formatTime(record, datefmt="%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": getattr(record, "request_id", "-"),
        }

        extras = {
            key: value
            for key, value in record.__dict__.items()
            if key not in _RESERVED_LOG_RECORD_ATTRS
            and key != "request_id"
            and not key.startswith("_")
        }
        payload.update(extras)

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, default=str, ensure_ascii=True)


def configure_logger(name: str = "qshift") -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    logger.propagate = False

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        logger.addHandler(handler)

    for handler in logger.handlers:
        handler.setFormatter(JsonLogFormatter())
        if not any(isinstance(filter_, RequestIdFilter) for filter_ in handler.filters):
            handler.addFilter(RequestIdFilter())

    return logger


def _escape_label_value(value: str) -> str:
    return value.replace("\\", "\\\\").replace("\n", "\\n").replace('"', '\\"')


def _format_labels(labels: dict[str, str]) -> str:
    label_parts = [
        f'{key}="{_escape_label_value(value)}"' for key, value in sorted(labels.items())
    ]
    return "{" + ",".join(label_parts) + "}"


class MetricsRegistry:
    def __init__(self, service_name: str):
        self.service_name = service_name
        self.started_at = time.time()
        self._lock = threading.Lock()
        self._http_requests: Counter[tuple[str, str, int]] = Counter()
        self._http_duration_sum: Counter[tuple[str, str]] = Counter()
        self._http_duration_count: Counter[tuple[str, str]] = Counter()
        self._http_duration_buckets: Counter[tuple[str, str, float]] = Counter()

    def uptime_seconds(self) -> float:
        return max(time.time() - self.started_at, 0.0)

    def record_http_request(
        self,
        *,
        method: str,
        route: str,
        status_code: int,
        duration_seconds: float,
    ) -> None:
        method = method.upper()
        duration_seconds = max(duration_seconds, 0.0)
        route_key = route or "unmatched"
        duration_key = (method, route_key)

        with self._lock:
            self._http_requests[(method, route_key, status_code)] += 1
            self._http_duration_sum[duration_key] += duration_seconds
            self._http_duration_count[duration_key] += 1
            for bucket in REQUEST_DURATION_BUCKETS:
                if duration_seconds <= bucket:
                    self._http_duration_buckets[(method, route_key, bucket)] += 1

    def http_snapshot(self) -> dict[str, Any]:
        with self._lock:
            requests = self._http_requests.copy()
            duration_sum = self._http_duration_sum.copy()
            duration_count = self._http_duration_count.copy()

        request_count = sum(requests.values())
        error_count = sum(
            count for (_, _, status_code), count in requests.items() if status_code >= 500
        )
        total_duration = sum(duration_sum.values())
        average_latency_ms = (
            (total_duration / request_count) * 1000 if request_count else 0.0
        )

        route_rows = []
        for method, route in sorted(duration_count.keys()):
            route_request_count = sum(
                count
                for (request_method, request_route, _), count in requests.items()
                if request_method == method and request_route == route
            )
            route_error_count = sum(
                count
                for (request_method, request_route, status_code), count in requests.items()
                if request_method == method and request_route == route and status_code >= 500
            )
            route_duration_count = duration_count[(method, route)]
            route_average_ms = (
                (duration_sum[(method, route)] / route_duration_count) * 1000
                if route_duration_count
                else 0.0
            )
            route_rows.append(
                {
                    "method": method,
                    "route": route,
                    "request_count": route_request_count,
                    "error_count": route_error_count,
                    "average_latency_ms": round(route_average_ms, 2),
                }
            )

        route_rows.sort(key=lambda row: row["request_count"], reverse=True)
        return {
            "request_count": request_count,
            "error_count": error_count,
            "average_latency_ms": round(average_latency_ms, 2),
            "routes": route_rows,
        }

    def render_prometheus(
        self,
        *,
        env: str,
        extra_lines: list[str] | None = None,
    ) -> str:
        with self._lock:
            requests = self._http_requests.copy()
            duration_sum = self._http_duration_sum.copy()
            duration_count = self._http_duration_count.copy()
            duration_buckets = self._http_duration_buckets.copy()

        lines = [
            "# HELP qshift_app_info Static application information.",
            "# TYPE qshift_app_info gauge",
            "qshift_app_info"
            + _format_labels({"service": self.service_name, "env": env})
            + " 1",
            "# HELP qshift_process_uptime_seconds Seconds since the service started.",
            "# TYPE qshift_process_uptime_seconds gauge",
            "qshift_process_uptime_seconds"
            + _format_labels({"service": self.service_name})
            + f" {self.uptime_seconds():.6f}",
            "# HELP qshift_http_requests_total HTTP requests by route and status.",
            "# TYPE qshift_http_requests_total counter",
        ]

        for (method, route, status_code), count in sorted(requests.items()):
            status_class = f"{status_code // 100}xx"
            labels = {
                "service": self.service_name,
                "method": method,
                "route": route,
                "status_code": str(status_code),
                "status_class": status_class,
            }
            lines.append(f"qshift_http_requests_total{_format_labels(labels)} {count}")

        lines.extend(
            [
                "# HELP qshift_http_request_duration_seconds HTTP request latency histogram.",
                "# TYPE qshift_http_request_duration_seconds histogram",
            ]
        )
        for method, route in sorted(duration_count.keys()):
            for bucket in REQUEST_DURATION_BUCKETS:
                labels = {
                    "service": self.service_name,
                    "method": method,
                    "route": route,
                    "le": str(bucket),
                }
                lines.append(
                    "qshift_http_request_duration_seconds_bucket"
                    + _format_labels(labels)
                    + f" {duration_buckets[(method, route, bucket)]}"
                )
            infinity_labels = {
                "service": self.service_name,
                "method": method,
                "route": route,
                "le": "+Inf",
            }
            lines.append(
                "qshift_http_request_duration_seconds_bucket"
                + _format_labels(infinity_labels)
                + f" {duration_count[(method, route)]}"
            )
            base_labels = {
                "service": self.service_name,
                "method": method,
                "route": route,
            }
            lines.append(
                "qshift_http_request_duration_seconds_sum"
                + _format_labels(base_labels)
                + f" {duration_sum[(method, route)]:.6f}"
            )
            lines.append(
                "qshift_http_request_duration_seconds_count"
                + _format_labels(base_labels)
                + f" {duration_count[(method, route)]}"
            )

        if extra_lines:
            lines.extend(extra_lines)

        return "\n".join(lines) + "\n"


def _route_path(request: "Request") -> str:
    route = request.scope.get("route")
    route_path = getattr(route, "path", None)
    if route_path:
        return route_path
    return request.url.path


def install_request_observability(
    app: "FastAPI",
    *,
    logger: logging.Logger,
    metrics: MetricsRegistry,
) -> None:
    @app.middleware("http")
    async def request_observability(request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        token = request_id_context.set(request_id)
        start = time.perf_counter()
        status_code = 500

        try:
            response = await call_next(request)
            status_code = response.status_code
            response.headers["X-Request-ID"] = request_id
            return response
        except Exception:
            logger.exception(
                "Unhandled request error",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "route": _route_path(request),
                },
            )
            raise
        finally:
            duration_seconds = time.perf_counter() - start
            route = _route_path(request)
            metrics.record_http_request(
                method=request.method,
                route=route,
                status_code=status_code,
                duration_seconds=duration_seconds,
            )
            logger.info(
                "HTTP request completed",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "route": route,
                    "status_code": status_code,
                    "duration_ms": round(duration_seconds * 1000, 2),
                },
            )
            request_id_context.reset(token)
