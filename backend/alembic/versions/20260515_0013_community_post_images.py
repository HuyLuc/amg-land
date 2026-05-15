"""add community post images array

Revision ID: 20260515_0013
Revises: 20260515_0012
Create Date: 2026-05-15 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260515_0013"
down_revision = "20260515_0012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "community_posts",
        sa.Column("images", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'[]'::jsonb")),
    )
    op.execute(
        """
        UPDATE community_posts
        SET images = jsonb_build_array(image_url)
        WHERE image_url IS NOT NULL
          AND image_url <> ''
          AND images = '[]'::jsonb
        """
    )
    op.alter_column("community_posts", "images", server_default=None)


def downgrade() -> None:
    op.drop_column("community_posts", "images")
