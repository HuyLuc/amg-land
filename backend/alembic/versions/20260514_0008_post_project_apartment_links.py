"""add post project apartment links

Revision ID: 20260514_0008
Revises: 20260514_0007
Create Date: 2026-05-14 00:08:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260514_0008"
down_revision: str | None = "20260514_0007"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("posts", sa.Column("excerpt", sa.String(length=500), nullable=True))
    op.add_column("posts", sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("posts", sa.Column("apartment_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_index(op.f("ix_posts_project_id"), "posts", ["project_id"], unique=False)
    op.create_index(op.f("ix_posts_apartment_id"), "posts", ["apartment_id"], unique=False)
    op.create_foreign_key("fk_posts_project_id_projects", "posts", "projects", ["project_id"], ["id"], ondelete="SET NULL")
    op.create_foreign_key("fk_posts_apartment_id_apartments", "posts", "apartments", ["apartment_id"], ["id"], ondelete="SET NULL")


def downgrade() -> None:
    op.drop_constraint("fk_posts_apartment_id_apartments", "posts", type_="foreignkey")
    op.drop_constraint("fk_posts_project_id_projects", "posts", type_="foreignkey")
    op.drop_index(op.f("ix_posts_apartment_id"), table_name="posts")
    op.drop_index(op.f("ix_posts_project_id"), table_name="posts")
    op.drop_column("posts", "apartment_id")
    op.drop_column("posts", "project_id")
    op.drop_column("posts", "excerpt")
