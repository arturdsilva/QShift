from __future__ import annotations
import uuid

from datetime import date, time
from typing import List
from sqlalchemy import (
    Date,
    Time,
    Integer,
    ForeignKey,
    ForeignKeyConstraint,
    UniqueConstraint,
    CheckConstraint,
    Index,
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from .base import Base


class Shift(Base):
    __tablename__ = "shift"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "week_id",
            "day_of_week",
            "start_time",
            "end_time",
            name="uq_shift_slot",
        ),
        UniqueConstraint("user_id", "id"),
        CheckConstraint("day_of_week BETWEEN 0 AND 6", name="dow_range"),
        CheckConstraint("end_time > start_time", name="no_overnight_for_now"),
        CheckConstraint("min_staff >= 1", name="min_staff_positive"),
        ForeignKeyConstraint(
            ["user_id", "week_id"],
            ["week.user_id", "week.id"],
            ondelete="CASCADE",
            name="fk_shift_week_user_scoped",
        ),
        Index("ix_shift_user_id_week_id_dow", "user_id", "week_id", "day_of_week"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    week_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)
    local_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    min_staff: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # relationships
    week: Mapped["Week"] = relationship(back_populates="shifts")
    assignments: Mapped[List["ShiftAssignment"]] = relationship(
        back_populates="shift", cascade="all, delete-orphan"
    )
