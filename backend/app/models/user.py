from __future__ import annotations

from datetime import datetime
from typing import List
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .base import Base


class User(Base):
    __tablename__ = "app_user"

    username: Mapped[str] = mapped_column(
        String(200), unique=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # relationships
    employees: Mapped[List["Employee"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    weeks: Mapped[List["Week"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
