from __future__ import annotations

from datetime import datetime
from typing import List
from sqlalchemy import String, Boolean, DateTime, func
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .base import Base


class User(Base):
    __tablename__ = "app_user"

    email: Mapped[str] = mapped_column(
        String(320), unique=True, index=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="true"
    )

    # relationships
    employees: Mapped[List["Employee"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    weeks: Mapped[List["Week"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
