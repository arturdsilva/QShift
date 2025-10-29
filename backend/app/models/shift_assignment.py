from __future__ import annotations
import uuid

from datetime import datetime
from sqlalchemy import (
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    UniqueConstraint,
    func,
    Index,
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from .base import Base


class ShiftAssignment(Base):
    __tablename__ = "shift_assignment"
    __table_args__ = (
        UniqueConstraint(
            "user_id", "shift_id", "employee_id", name="uq_assignment_unique"
        ),
        ForeignKeyConstraint(
            ["user_id", "shift_id"],
            ["shift.user_id", "shift.id"],
            ondelete="CASCADE",
            name="fk_assignment_shift_user_scoped",
        ),
        ForeignKeyConstraint(
            ["user_id", "employee_id"],
            ["employee.user_id", "employee.id"],
            ondelete="CASCADE",
            name="fk_assignment_employee_user_scoped",
        ),
        Index("ix_assignment_user_shift", "user_id", "shift_id"),
        Index("ix_assignment_user_employee", "user_id", "employee_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    shift_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    employee_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # relationships
    shift: Mapped["Shift"] = relationship(back_populates="assignments")
    employee: Mapped["Employee"] = relationship(back_populates="assignments")
