from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware

from core_api.core.config import settings
from core_api.api import api_router
from core_api.core.logging import logger
from core_api.core.metrics import metrics
from core_api.services import operations as operations_service
from shared.observability import install_request_observability

app = FastAPI(title="QShift API")

install_request_observability(app, logger=logger, metrics=metrics)

app.include_router(api_router, prefix="/api/v1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    logger.info("Endpoint / accessed")
    return {"message": "QShift backend is running!", "env": settings.ENV}


@app.api_route("/healthz", methods=["GET", "HEAD"])
def healthz():
    return {
        "status": "ok",
        "service": "core_api",
        "env": settings.ENV,
        "uptime_seconds": round(metrics.uptime_seconds(), 2),
    }


@app.api_route("/healthz/ready", methods=["GET", "HEAD"])
def healthz_ready(response: Response):
    checks = [
        operations_service.check_database_health(),
        operations_service.check_schedule_generator_health(),
    ]
    service_status = (
        "ok" if all(check.status == "ok" for check in checks) else "degraded"
    )
    if service_status != "ok":
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return {
        "status": service_status,
        "service": "core_api",
        "checks": [check.model_dump() for check in checks],
    }


@app.get("/healthz/db")
def healthz_db(response: Response):
    check = operations_service.check_database_health()
    if check.status != "ok":
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return {
        "database": check.status,
        "latency_ms": check.latency_ms,
        **check.details,
    }


@app.get("/metrics", include_in_schema=False)
def prometheus_metrics():
    return Response(
        metrics.render_prometheus(
            env=settings.ENV,
            extra_lines=operations_service.render_schedule_generation_prometheus_metrics(),
        ),
        media_type="text/plain; version=0.0.4; charset=utf-8",
    )
