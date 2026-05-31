"""add employee preferred weekdays

Revision ID: a4f3b6c7d8e9
Revises: 3a1f0d5c8b72
Create Date: 2026-05-30 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "a4f3b6c7d8e9"
down_revision: Union[str, Sequence[str], None] = "3a1f0d5c8b72"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "employee",
        sa.Column(
            "preferred_weekdays",
            postgresql.ARRAY(sa.Integer()),
            server_default=sa.text("'{}'::integer[]"),
            nullable=False,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("employee", "preferred_weekdays")
