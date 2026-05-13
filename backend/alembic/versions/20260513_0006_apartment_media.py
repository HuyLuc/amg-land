"""apartment media

Revision ID: 20260513_0006
Revises: 20260513_0005
Create Date: 2026-05-13
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260513_0006"
down_revision: Union[str, None] = "20260513_0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    media_type = postgresql.ENUM("image", "video", name="apartment_media_type", create_type=False)
    media_type.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "apartment_media",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("apartment_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("apartments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("media_type", media_type, nullable=False),
        sa.Column("url", sa.String(500), nullable=False),
        sa.Column("caption", sa.String(200), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_thumbnail", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.create_index("ix_apartment_media_apartment_id", "apartment_media", ["apartment_id"])
    op.create_index("ix_apartment_media_media_type", "apartment_media", ["media_type"])


def downgrade() -> None:
    op.drop_index("ix_apartment_media_media_type", table_name="apartment_media")
    op.drop_index("ix_apartment_media_apartment_id", table_name="apartment_media")
    op.drop_table("apartment_media")
    postgresql.ENUM(name="apartment_media_type").drop(op.get_bind(), checkfirst=True)
