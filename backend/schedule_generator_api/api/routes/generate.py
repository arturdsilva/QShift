from fastapi import APIRouter, BackgroundTasks, status

import core_api.schemas.schedule as schemas
from schedule_generator_api.core.logging import logger
from schedule_generator_api.services.generator import process_schedule_generation_job

router = APIRouter()


@router.post(
    "/internal/generate-schedule",
    response_model=schemas.ScheduleGenerationJobAcceptedOut,
    status_code=status.HTTP_202_ACCEPTED,
)
def generate_schedule(
    dispatch_request: schemas.ScheduleGenerationDispatchRequest,
    background_tasks: BackgroundTasks,
):
    logger.info(
        "Schedule generation job accepted by generator",
        extra={
            "job_id": str(dispatch_request.job_id),
            "shift_count": len(dispatch_request.payload.shift_vector),
            "employee_count": len(dispatch_request.payload.employees),
        },
    )
    background_tasks.add_task(
        process_schedule_generation_job,
        dispatch_request,
    )
    return schemas.ScheduleGenerationJobAcceptedOut(
        job_id=dispatch_request.job_id,
        status=schemas.ScheduleGenerationJobStatus.PROCESSING,
    )
