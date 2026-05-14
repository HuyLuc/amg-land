"""add consultant/content roles and consultant assignments

Revision ID: 20260514_0011
Revises: 20260514_0010
Create Date: 2026-05-14 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260514_0011"
down_revision = "20260514_0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'consultant'")
    op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'content'")

    op.add_column("projects", sa.Column("consultant_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_index("ix_projects_consultant_id", "projects", ["consultant_id"])
    op.create_foreign_key(
        "fk_projects_consultant_id_users",
        "projects",
        "users",
        ["consultant_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.add_column("apartments", sa.Column("consultant_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_index("ix_apartments_consultant_id", "apartments", ["consultant_id"])
    op.create_foreign_key(
        "fk_apartments_consultant_id_users",
        "apartments",
        "users",
        ["consultant_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_apartments_consultant_id_users", "apartments", type_="foreignkey")
    op.drop_index("ix_apartments_consultant_id", table_name="apartments")
    op.drop_column("apartments", "consultant_id")

    op.drop_constraint("fk_projects_consultant_id_users", "projects", type_="foreignkey")
    op.drop_index("ix_projects_consultant_id", table_name="projects")
    op.drop_column("projects", "consultant_id")
