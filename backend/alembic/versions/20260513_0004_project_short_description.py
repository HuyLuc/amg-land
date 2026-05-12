"""project short description

Revision ID: 20260513_0004
Revises: 20260512_0003
Create Date: 2026-05-13
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260513_0004"
down_revision: Union[str, None] = "20260512_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("projects", sa.Column("short_description", sa.Text(), nullable=True))
    op.execute("UPDATE projects SET short_description = description WHERE short_description IS NULL")


def downgrade() -> None:
    op.drop_column("projects", "short_description")
