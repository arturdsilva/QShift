from fastapi import APIRouter, Depends, status, Response, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.db import get_session
from app.api.dependencies import current_user_id
from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeOut

router = APIRouter(prefix="/employees", tags=["employees"])


# HELPERS
def _get_employee(employee_id: UUID, user_id: UUID, db: Session):
    employee = (
        db.query(Employee)
        .filter(Employee.user_id == user_id, Employee.id == employee_id)
        .first()
    )

    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found"
        )

    return employee


# CREATE
@router.post("", response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
def create_employee(
    payload: EmployeeCreate,
    response: Response,
    user_id: UUID = Depends(current_user_id),
    db: Session = Depends(get_session),
):
    employee = Employee(user_id=user_id, **payload.model_dump())

    db.add(employee)
    db.flush()
    db.refresh(employee)

    response.headers["Location"] = f"/employees/{employee.id}"

    return employee


# READ
@router.get("", response_model=list[EmployeeOut], status_code=status.HTTP_200_OK)
def list_employees(
    db: Session = Depends(get_session), user_id: UUID = Depends(current_user_id)
):
    employees = (
        db.query(Employee)
        .filter(Employee.user_id == user_id)
        .order_by(Employee.name)
        .all()
    )

    return employees


@router.get(
    "/{employee_id}", response_model=EmployeeOut, status_code=status.HTTP_200_OK
)
def get_employee(
    employee_id: UUID,
    user_id: UUID = Depends(current_user_id),
    db: Session = Depends(get_session),
):
    return _get_employee(employee_id, user_id, db)


# UPDATE
@router.patch(
    "/{employee_id}", response_model=EmployeeOut, status_code=status.HTTP_200_OK
)
def update_employee(
    payload: EmployeeUpdate,
    employee_id: UUID,
    user_id: UUID = Depends(current_user_id),
    db: Session = Depends(get_session),
):
    employee = _get_employee(employee_id, user_id, db)

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(employee, field, value)

    db.flush()
    db.refresh(employee)

    return employee


# DELETE
@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    employee_id: UUID,
    user_id: UUID = Depends(current_user_id),
    db: Session = Depends(get_session),
):
    employee = _get_employee(employee_id, user_id, db)

    db.delete(employee)

    return Response(status_code=status.HTTP_204_NO_CONTENT)
