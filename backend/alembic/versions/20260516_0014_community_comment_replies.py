"""add parent comment support for community replies

Revision ID: 20260516_0014
Revises: 20260515_0013
Create Date: 2026-05-16 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260516_0014"
down_revision = "20260515_0013"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("community_comments", sa.Column("parent_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_index(op.f("ix_community_comments_parent_id"), "community_comments", ["parent_id"], unique=False)
    op.create_foreign_key(
        "fk_community_comments_parent_id_community_comments",
        "community_comments",
        "community_comments",
        ["parent_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint("fk_community_comments_parent_id_community_comments", "community_comments", type_="foreignkey")
    op.drop_index(op.f("ix_community_comments_parent_id"), table_name="community_comments")
    op.drop_column("community_comments", "parent_id")
