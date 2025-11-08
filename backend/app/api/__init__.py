from fastapi import APIRouter

from app.core.config import settings
from app.api.routes.availabilities import router as availabilities_router
from app.api.routes.employees import router as employees_router
from app.api.routes.shifts import router as shifts_router
from app.api.routes.weeks import router as weeks_router
from app.api.routes.dev import router as dev_router
from app.api.routes.schedule import router as schedule_router

api_router = APIRouter()

api_router.include_router(availabilities_router)
api_router.include_router(employees_router)
api_router.include_router(shifts_router)
api_router.include_router(weeks_router)
api_router.include_router(schedule_router)

if settings.ENV in {"dev", "test"}:
    api_router.include_router(dev_router)
