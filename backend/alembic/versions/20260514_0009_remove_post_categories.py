"""remove post categories

Revision ID: 20260514_0009
Revises: 20260514_0008
Create Date: 2026-05-14 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260514_0009"
down_revision = "20260514_0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("posts_category_id_fkey", "posts", type_="foreignkey")
    op.drop_column("posts", "category_id")
    op.drop_index("ix_categories_slug", table_name="categories")
    op.drop_constraint("uq_categories_name", "categories", type_="unique")
    op.drop_table("categories")


def downgrade() -> None:
    op.create_table(
        "categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_unique_constraint("uq_categories_name", "categories", ["name"])
    op.create_index("ix_categories_slug", "categories", ["slug"], unique=True)
    op.add_column("posts", sa.Column("category_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key("posts_category_id_fkey", "posts", "categories", ["category_id"], ["id"])
