"""add other amenity category

Revision ID: 20260513_0005
Revises: 20260513_0004
Create Date: 2026-05-13 00:00:00.000000
"""

from collections.abc import Sequence

from alembic import op


revision: str = "20260513_0005"
down_revision: str | None = "20260513_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("ALTER TYPE amenity_category ADD VALUE IF NOT EXISTS 'other'")


def downgrade() -> None:
    # PostgreSQL cannot drop enum values without recreating the type.
    pass
