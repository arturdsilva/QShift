from __future__ import annotations
import uuid

from datetime import date, datetime
from typing import List
from sqlalchemy import (
    Date,
    DateTime,
    Integer,
    Boolean,
    ForeignKey,
    UniqueConstraint,
    CheckConstraint,
    Index,
    func,
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from .base import Base


class Week(Base):
    __tablename__ = "week"
    __table_args__ = (
        UniqueConstraint(
            "user_id", "start_date"
        ),  # uma semana por segunda-feira por usuário
        UniqueConstraint("user_id", "id"),  # habilita FKs compostas vindas de Shift
        CheckConstraint(
            "open_days_mask BETWEEN 0 AND 127", name="open_days_mask_range"
        ),
        # segunda-feira = 1 no Postgres (0=domingo, 1=segunda, ..., 6=sábado)
        CheckConstraint("EXTRACT(DOW FROM start_date) = 1", name="start_is_monday"),
        Index("ix_week_user_id_approved", "user_id", "approved"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("app_user.id", ondelete="CASCADE"),
        nullable=False,
    )

    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    open_days_mask: Mapped[int] = mapped_column(Integer, nullable=False, default=127)
    approved: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )
    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # relationships
    user: Mapped["User"] = relationship(back_populates="weeks")
    shifts: Mapped[List["Shift"]] = relationship(
        back_populates="week", cascade="all, delete-orphan"
    )
