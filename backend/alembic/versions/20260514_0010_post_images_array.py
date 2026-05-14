"""use multiple post images

Revision ID: 20260514_0010
Revises: 20260514_0009
Create Date: 2026-05-14 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260514_0010"
down_revision = "20260514_0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "posts",
        sa.Column(
            "images",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
    )
    op.execute("UPDATE posts SET images = CASE WHEN thumbnail IS NOT NULL AND thumbnail <> '' THEN jsonb_build_array(thumbnail) ELSE '[]'::jsonb END")
    op.alter_column("posts", "images", server_default=None)
    op.drop_column("posts", "thumbnail")


def downgrade() -> None:
    op.add_column("posts", sa.Column("thumbnail", sa.String(length=500), nullable=True))
    op.execute("UPDATE posts SET thumbnail = images->>0 WHERE jsonb_array_length(images) > 0")
    op.drop_column("posts", "images")
