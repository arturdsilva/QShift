"""add employee weekly workload hours

Revision ID: 3a1f0d5c8b72
Revises: 7d3b4f2b9a11
Create Date: 2026-04-03 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3a1f0d5c8b72"
down_revision: Union[str, Sequence[str], None] = "7d3b4f2b9a11"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "employee",
        sa.Column("weekly_workload_hours", sa.Integer(), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("employee", "weekly_workload_hours")
