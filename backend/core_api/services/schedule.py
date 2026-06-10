import json
import time as time_module
from datetime import datetime, timezone
from collections import defaultdict
from fastapi import HTTPException, status
from sqlalchemy import false
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from urllib import error as urllib_error
from urllib import request as urllib_request

import core_api.schemas.schedule as schemas
from core_api.core.logging import logger
from shared.schedule_callback import (
    build_schedule_callback_signature,
    is_schedule_callback_signature_valid,
)


def wake_schedule_generator() -> None:
    from core_api.core.config import settings

    base_url = settings.SCHEDULE_GENERATOR_BASE_URL.rstrip("/")
    url = f"{base_url}/healthz"
    logger.debug("Calling schedule generator wake route: GET %s", url)
    request = urllib_request.Request(url, method="GET")
    try:
        with urllib_request.urlopen(
            request,
            timeout=settings.SCHEDULE_GENERATOR_WAKE_TIMEOUT_SECONDS,
        ) as response:
            status_code = getattr(response, "status", response.getcode())
            response_body = response.read().decode("utf-8", errors="replace")
            logger.debug(
                "Schedule generator wake route result: status=%s body=%s",
                status_code,
                response_body,
            )
    except (urllib_error.URLError, urllib_error.HTTPError, TimeoutError, OSError) as exc:
        logger.info("Schedule generator healthz was called but returned error: %s", exc)


def build_schedule_generation_payload(
    *,
    db: Session,
    user_id: UUID,
    shift_vector: List[schemas.PreviewShiftBase],
) -> schemas.ScheduleGenerationDispatchPayload:
    from core_api.models import Availability, Employee

    employees = (
        db.query(Employee)
        .filter(Employee.user_id == user_id, Employee.active == True)
        .order_by(Employee.name.asc(), Employee.id.asc())
        .all()
    )
    employee_ids = [employee.id for employee in employees]
    availabilities = (
        db.query(Availability)
        .filter(
            Availability.user_id == user_id,
            Availability.employee_id.in_(employee_ids) if employee_ids else false(),
        )
        .order_by(
            Availability.employee_id.asc(),
            Availability.weekday.asc(),
            Availability.start_time.asc(),
            Availability.end_time.asc(),
        )
        .all()
    )

    return schemas.ScheduleGenerationDispatchPayload(
        shift_vector=shift_vector,
        employees=[
            schemas.ScheduleGenerationEmployeeOut(
                id=employee.id,
                name=employee.name,
                weekly_workload_hours=employee.weekly_workload_hours,
                preferred_weekdays=employee.preferred_weekdays,
            )
            for employee in employees
        ],
        availabilities=[
            schemas.ScheduleGenerationAvailabilityOut(
                employee_id=availability.employee_id,
                weekday=availability.weekday,
                start_time=availability.start_time,
                end_time=availability.end_time,
            )
            for availability in availabilities
        ],
    )


def build_schedule_assignments_to_create(
    *,
    week_id: UUID,
    user_id: UUID,
    payload: schemas.ScheduleCreate,
    db: Session,
):
    from core_api.models import Employee, ShiftAssignment
    from core_api.models.shift import Shift

    assignment_pairs: list[tuple[UUID, UUID]] = []
    shift_ids: list[UUID] = []
    employee_ids: list[UUID] = []
    seen_shift_ids: set[UUID] = set()
    seen_employee_ids: set[UUID] = set()

    for schedule_shift in payload.shifts:
        if schedule_shift.shift_id not in seen_shift_ids:
            seen_shift_ids.add(schedule_shift.shift_id)
            shift_ids.append(schedule_shift.shift_id)

        for employee_id in schedule_shift.employee_ids:
            assignment_pairs.append((schedule_shift.shift_id, employee_id))
            if employee_id not in seen_employee_ids:
                seen_employee_ids.add(employee_id)
                employee_ids.append(employee_id)

    if shift_ids:
        existing_shift_ids = {
            shift_id
            for (shift_id,) in (
                db.query(Shift.id)
                .filter(
                    Shift.user_id == user_id,
                    Shift.week_id == week_id,
                    Shift.id.in_(shift_ids),
                )
                .all()
            )
        }
        if len(existing_shift_ids) != len(shift_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shift not found",
            )

    if employee_ids:
        existing_employee_ids = {
            employee_id
            for (employee_id,) in (
                db.query(Employee.id)
                .filter(
                    Employee.user_id == user_id,
                    Employee.id.in_(employee_ids),
                )
                .all()
            )
        }
        if len(existing_employee_ids) != len(employee_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found",
            )

    return [
        ShiftAssignment(
            user_id=user_id,
            shift_id=shift_id,
            employee_id=employee_id,
        )
        for shift_id, employee_id in assignment_pairs
    ]


def dispatch_schedule_generation_job(
    dispatch_request: schemas.ScheduleGenerationDispatchRequest,
) -> None:
    from core_api.core.config import settings

    base_url = settings.SCHEDULE_GENERATOR_BASE_URL.rstrip("/")
    url = f"{base_url}/internal/generate-schedule"
    payload = dispatch_request.model_dump(mode="json")
    body = json.dumps(payload).encode("utf-8")
    logger.debug(
        "Calling schedule generation route for job %s: POST %s",
        dispatch_request.job_id,
        url,
    )
    request = urllib_request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib_request.urlopen(
            request,
            timeout=settings.SCHEDULE_GENERATOR_TIMEOUT_SECONDS,
        ) as response:
            status_code = getattr(response, "status", response.getcode())
            response_body = response.read().decode("utf-8", errors="replace")
            logger.debug(
                "Schedule generation route result for job %s: status=%s body=%s",
                dispatch_request.job_id,
                status_code,
                response_body,
            )
            if status_code >= 400:
                raise RuntimeError(
                    f"schedule generator returned unexpected status {status_code}"
                )
    except (urllib_error.URLError, urllib_error.HTTPError, TimeoutError, OSError) as exc:
        logger.error("Schedule generation dispatch failed for job %s: %s", dispatch_request.job_id, exc)
        raise RuntimeError("unable to dispatch schedule generation job") from exc


def build_schedule_generation_job_schema(
    job,
) -> schemas.ScheduleGenerationJobOut:
    result = None
    if job.result_payload is not None:
        result = schemas.SchedulePreviewOut.model_validate(job.result_payload)

    return schemas.ScheduleGenerationJobOut(
        job_id=job.id,
        status=schemas.ScheduleGenerationJobStatus(job.status),
        result=result,
        error=job.error_message,
    )


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def build_schedule_generation_dispatch_request(
    *,
    job_id: UUID,
    payload: schemas.ScheduleGenerationDispatchPayload,
):
    from core_api.core.config import settings

    core_api_base_url = settings.CORE_API_BASE_URL.rstrip("/")
    callback_url = f"{core_api_base_url}/api/v1/internal/schedule-generation-results"
    return schemas.ScheduleGenerationDispatchRequest(
        job_id=job_id,
        callback_url=callback_url,
        payload=payload,
    )

def is_schedule_callback_timestamp_valid(
    *,
    timestamp: str,
    tolerance_seconds: int,
    now_timestamp: int | None = None,
) -> bool:
    try:
        timestamp_int = int(timestamp)
    except (TypeError, ValueError):
        return False

    if now_timestamp is None:
        now_timestamp = int(time_module.time())

    return abs(now_timestamp - timestamp_int) <= tolerance_seconds


def apply_schedule_generation_callback(
    *,
    job,
    callback_payload: schemas.ScheduleGenerationCallbackIn,
) -> schemas.ScheduleGenerationJobOut:
    terminal_statuses = {
        schemas.ScheduleGenerationJobStatus.DONE.value,
        schemas.ScheduleGenerationJobStatus.FAILED.value,
    }
    result_payload = None
    if callback_payload.result is not None:
        result_payload = callback_payload.result.model_dump(mode="json")

    if callback_payload.status not in (
        schemas.ScheduleGenerationJobStatus.DONE,
        schemas.ScheduleGenerationJobStatus.FAILED,
    ):
        raise ValueError("invalid schedule generation callback status")

    if job.status in terminal_statuses:
        if (
            job.status == callback_payload.status.value
            and job.result_payload == result_payload
            and job.error_message == callback_payload.error
        ):
            return build_schedule_generation_job_schema(job)
        raise ValueError("schedule generation job already finalized")

    job.status = callback_payload.status.value
    job.result_payload = result_payload
    job.error_message = callback_payload.error
    job.finished_at = utcnow()
    return build_schedule_generation_job_schema(job)


def build_schedule_schema_from_db(week_id: UUID, user_id: UUID, db: Session):
    from core_api.models.shift import Shift
    from core_api.models import ShiftAssignment, Employee

    shifts = (
        db.query(Shift)
        .filter(Shift.week_id == week_id, Shift.user_id == user_id)
        .order_by(Shift.weekday, Shift.start_time, Shift.end_time, Shift.id)
        .all()
    )

    employees_by_shift_id: dict[UUID, list[schemas.ScheduleShiftEmployeeOut]] = defaultdict(list)
    shift_ids = [shift.id for shift in shifts]
    if shift_ids:
        assignment_rows = (
            db.query(ShiftAssignment.shift_id, Employee.id, Employee.name)
            .join(
                Employee,
                (Employee.id == ShiftAssignment.employee_id)
                & (Employee.user_id == ShiftAssignment.user_id),
            )
            .filter(
                ShiftAssignment.user_id == user_id,
                ShiftAssignment.shift_id.in_(shift_ids),
            )
            .order_by(ShiftAssignment.shift_id, Employee.name, Employee.id)
            .all()
        )
        for shift_id, employee_id, employee_name in assignment_rows:
            employees_by_shift_id[shift_id].append(
                schemas.ScheduleShiftEmployeeOut(
                    employee_id=employee_id,
                    name=str(employee_name),
                )
            )

    schedule_shifts_out = []
    for shift in shifts:
        schedule_shifts_out.append(
            schemas.ScheduleShiftOut(
                shift_id=shift.id,
                weekday=shift.weekday,
                start_time=shift.start_time,
                end_time=shift.end_time,
                min_staff=shift.min_staff,
                employees=employees_by_shift_id.get(shift.id, []),
            )
        )
    return schemas.ScheduleOut(shifts=schedule_shifts_out)
