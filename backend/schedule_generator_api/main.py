from fastapi import FastAPI, Response

from schedule_generator_api.api.routes.generate import router as generate_router
from schedule_generator_api.core.config import settings
from schedule_generator_api.core.logging import logger
from schedule_generator_api.core.metrics import metrics
from shared.observability import install_request_observability

app = FastAPI(title="QShift Schedule Generator")

install_request_observability(app, logger=logger, metrics=metrics)

app.include_router(generate_router)


@app.get("/")
def root():
    logger.info("Generator endpoint / accessed")
    return {"message": "QShift schedule generator is running!"}


@app.api_route("/healthz", methods=["GET", "HEAD"])
def healthz():
    return {
        "status": "ok",
        "service": "schedule_generator_api",
        "env": settings.ENV,
        "uptime_seconds": round(metrics.uptime_seconds(), 2),
    }


@app.api_route("/healthz/ready", methods=["GET", "HEAD"])
def healthz_ready():
    return {
        "status": "ok",
        "service": "schedule_generator_api",
        "checks": [{"name": "process", "status": "ok"}],
    }


@app.get("/metrics", include_in_schema=False)
def prometheus_metrics():
    return Response(
        metrics.render_prometheus(env=settings.ENV),
        media_type="text/plain; version=0.0.4; charset=utf-8",
    )
