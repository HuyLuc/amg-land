"""add customer role and user phone

Revision ID: 20260514_0007
Revises: 20260513_0006
Create Date: 2026-05-14 00:07:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260514_0007"
down_revision: str | None = "20260513_0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'customer'")
    op.add_column("users", sa.Column("phone", sa.String(length=20), nullable=True))
    op.create_index(op.f("ix_users_phone"), "users", ["phone"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_users_phone"), table_name="users")
    op.drop_column("users", "phone")
    # PostgreSQL enum values cannot be removed safely without recreating the type.
