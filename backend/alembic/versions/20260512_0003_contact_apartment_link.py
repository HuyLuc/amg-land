"""contact apartment link

Revision ID: 20260512_0003
Revises: 20260511_0002
Create Date: 2026-05-12
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260512_0003"
down_revision: Union[str, None] = "20260511_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("contact_requests", sa.Column("apartment_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(
        "fk_contact_requests_apartment_id_apartments",
        "contact_requests",
        "apartments",
        ["apartment_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index("ix_contact_requests_apartment_id", "contact_requests", ["apartment_id"])


def downgrade() -> None:
    op.drop_index("ix_contact_requests_apartment_id", table_name="contact_requests")
    op.drop_constraint("fk_contact_requests_apartment_id_apartments", "contact_requests", type_="foreignkey")
    op.drop_column("contact_requests", "apartment_id")
