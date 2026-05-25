from fastapi import APIRouter, Depends, status

from core_api.api.dependencies import current_user_id
from core_api.schemas.operations import OperationsSummaryOut
from core_api.services.operations import build_operations_summary

router = APIRouter(prefix="/operations", tags=["operations"])


@router.get(
    "/summary",
    response_model=OperationsSummaryOut,
    status_code=status.HTTP_200_OK,
)
def read_operations_summary(_user_id=Depends(current_user_id)):
    return build_operations_summary()
