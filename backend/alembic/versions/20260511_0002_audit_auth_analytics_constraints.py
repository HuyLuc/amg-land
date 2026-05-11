"""audit auth analytics constraints

Revision ID: 20260511_0002
Revises: 20260511_0001
Create Date: 2026-05-11
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260511_0002"
down_revision: Union[str, None] = "20260511_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def uuid_pk() -> sa.Column:
    return sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True)


def add_validated_check(table: str, name: str, condition: str) -> None:
    op.execute(sa.text(f"ALTER TABLE {table} ADD CONSTRAINT {name} CHECK ({condition}) NOT VALID"))
    op.execute(sa.text(f"ALTER TABLE {table} VALIDATE CONSTRAINT {name}"))


def upgrade() -> None:
    op.create_table(
        "refresh_tokens",
        uuid_pk(),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(255), nullable=False),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"])
    op.create_index("ix_refresh_tokens_expires_at", "refresh_tokens", ["expires_at"])
    op.create_index("ix_refresh_tokens_token_hash", "refresh_tokens", ["token_hash"], unique=True)
    op.create_index(
        "ix_refresh_tokens_active_user",
        "refresh_tokens",
        ["user_id", "expires_at"],
        postgresql_where=sa.text("revoked_at IS NULL"),
    )

    op.create_table(
        "password_reset_tokens",
        uuid_pk(),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_password_reset_tokens_user_id", "password_reset_tokens", ["user_id"])
    op.create_index("ix_password_reset_tokens_expires_at", "password_reset_tokens", ["expires_at"])
    op.create_index("ix_password_reset_tokens_token_hash", "password_reset_tokens", ["token_hash"], unique=True)
    op.create_index(
        "ix_password_reset_tokens_active_user",
        "password_reset_tokens",
        ["user_id", "expires_at"],
        postgresql_where=sa.text("used_at IS NULL"),
    )

    op.create_table(
        "activity_logs",
        uuid_pk(),
        sa.Column("actor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("resource_type", sa.String(100), nullable=False),
        sa.Column("resource_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("metadata", postgresql.JSONB(), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_activity_logs_actor_id", "activity_logs", ["actor_id"])
    op.create_index("ix_activity_logs_action", "activity_logs", ["action"])
    op.create_index("ix_activity_logs_resource", "activity_logs", ["resource_type", "resource_id"])
    op.create_index("ix_activity_logs_created_at", "activity_logs", ["created_at"])
    op.create_index("ix_activity_logs_metadata_gin", "activity_logs", ["metadata"], postgresql_using="gin")

    op.create_table(
        "analytics_events",
        uuid_pk(),
        sa.Column("visitor_id", sa.String(100), nullable=True),
        sa.Column("session_id", sa.String(100), nullable=True),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="SET NULL"), nullable=True),
        sa.Column("apartment_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("apartments.id", ondelete="SET NULL"), nullable=True),
        sa.Column("path", sa.String(500), nullable=True),
        sa.Column("referrer", sa.Text(), nullable=True),
        sa.Column("metadata", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_analytics_events_visitor_id", "analytics_events", ["visitor_id"])
    op.create_index("ix_analytics_events_session_id", "analytics_events", ["session_id"])
    op.create_index("ix_analytics_events_event_type", "analytics_events", ["event_type"])
    op.create_index("ix_analytics_events_project_id", "analytics_events", ["project_id"])
    op.create_index("ix_analytics_events_apartment_id", "analytics_events", ["apartment_id"])
    op.create_index("ix_analytics_events_created_at", "analytics_events", ["created_at"])
    op.create_index("ix_analytics_events_project_time", "analytics_events", ["project_id", "created_at"])
    op.create_index("ix_analytics_events_apartment_time", "analytics_events", ["apartment_id", "created_at"])
    op.create_index("ix_analytics_events_metadata_gin", "analytics_events", ["metadata"], postgresql_using="gin")

    add_validated_check("projects", "ck_projects_price_from_positive", "price_from > 0")
    add_validated_check("apartments", "ck_apartments_floor_positive", "floor > 0")
    add_validated_check("apartments", "ck_apartments_area_positive", "area > 0")
    add_validated_check("apartments", "ck_apartments_bedrooms_non_negative", "bedrooms >= 0")
    add_validated_check("apartments", "ck_apartments_bathrooms_positive", "bathrooms >= 1")
    add_validated_check("apartments", "ck_apartments_price_positive", "price > 0")
    add_validated_check("floor_plans", "ck_floor_plans_floor_number_positive", "floor_number > 0")
    add_validated_check("contact_requests", "ck_contact_requests_phone_length", "length(phone) >= 8")
    add_validated_check("refresh_tokens", "ck_refresh_tokens_expiry_after_created", "expires_at > created_at")
    add_validated_check("password_reset_tokens", "ck_password_reset_tokens_expiry_after_created", "expires_at > created_at")

    op.create_index("ix_apartments_search_core", "apartments", ["status", "bedrooms", "direction", "price"])
    op.create_index("ix_projects_public_filter", "projects", ["status", "district", "deleted_at"])
    op.create_index("ix_contact_requests_created_at", "contact_requests", ["created_at"])

    op.execute(
        sa.text(
            """
            INSERT INTO categories (name, slug, description)
            VALUES
                ('Tin thi truong', 'tin-thi-truong', 'Tin tuc va cap nhat thi truong bat dong san'),
                ('Phan tich', 'phan-tich', 'Phan tich xu huong va du an'),
                ('Phong thuy', 'phong-thuy', 'Noi dung ve phong thuy nha o')
            ON CONFLICT (name) DO NOTHING;
            """
        )
    )
    op.execute(
        sa.text(
            """
            INSERT INTO amenities (name, icon, category, description)
            VALUES
                ('Ho boi', 'waves', 'internal', 'Tien ich ho boi noi khu'),
                ('Gym', 'dumbbell', 'internal', 'Phong tap gym noi khu'),
                ('Cong vien', 'trees', 'external', 'Khong gian xanh gan du an'),
                ('Truong hoc', 'school', 'external', 'Truong hoc trong khu vuc'),
                ('Benh vien', 'hospital', 'external', 'Co so y te gan du an')
            ON CONFLICT (name) DO NOTHING;
            """
        )
    )


def downgrade() -> None:
    op.execute("DELETE FROM amenities WHERE name IN ('Ho boi', 'Gym', 'Cong vien', 'Truong hoc', 'Benh vien')")
    op.execute("DELETE FROM categories WHERE name IN ('Tin thi truong', 'Phan tich', 'Phong thuy')")

    op.drop_index("ix_contact_requests_created_at", table_name="contact_requests")
    op.drop_index("ix_projects_public_filter", table_name="projects")
    op.drop_index("ix_apartments_search_core", table_name="apartments")

    op.drop_constraint("ck_password_reset_tokens_expiry_after_created", "password_reset_tokens", type_="check")
    op.drop_constraint("ck_refresh_tokens_expiry_after_created", "refresh_tokens", type_="check")
    op.drop_constraint("ck_contact_requests_phone_length", "contact_requests", type_="check")
    op.drop_constraint("ck_floor_plans_floor_number_positive", "floor_plans", type_="check")
    op.drop_constraint("ck_apartments_price_positive", "apartments", type_="check")
    op.drop_constraint("ck_apartments_bathrooms_positive", "apartments", type_="check")
    op.drop_constraint("ck_apartments_bedrooms_non_negative", "apartments", type_="check")
    op.drop_constraint("ck_apartments_area_positive", "apartments", type_="check")
    op.drop_constraint("ck_apartments_floor_positive", "apartments", type_="check")
    op.drop_constraint("ck_projects_price_from_positive", "projects", type_="check")

    op.drop_index("ix_analytics_events_metadata_gin", table_name="analytics_events")
    op.drop_index("ix_analytics_events_apartment_time", table_name="analytics_events")
    op.drop_index("ix_analytics_events_project_time", table_name="analytics_events")
    op.drop_index("ix_analytics_events_created_at", table_name="analytics_events")
    op.drop_index("ix_analytics_events_apartment_id", table_name="analytics_events")
    op.drop_index("ix_analytics_events_project_id", table_name="analytics_events")
    op.drop_index("ix_analytics_events_event_type", table_name="analytics_events")
    op.drop_index("ix_analytics_events_session_id", table_name="analytics_events")
    op.drop_index("ix_analytics_events_visitor_id", table_name="analytics_events")
    op.drop_table("analytics_events")

    op.drop_index("ix_activity_logs_metadata_gin", table_name="activity_logs")
    op.drop_index("ix_activity_logs_created_at", table_name="activity_logs")
    op.drop_index("ix_activity_logs_resource", table_name="activity_logs")
    op.drop_index("ix_activity_logs_action", table_name="activity_logs")
    op.drop_index("ix_activity_logs_actor_id", table_name="activity_logs")
    op.drop_table("activity_logs")

    op.drop_index("ix_password_reset_tokens_active_user", table_name="password_reset_tokens")
    op.drop_index("ix_password_reset_tokens_token_hash", table_name="password_reset_tokens")
    op.drop_index("ix_password_reset_tokens_expires_at", table_name="password_reset_tokens")
    op.drop_index("ix_password_reset_tokens_user_id", table_name="password_reset_tokens")
    op.drop_table("password_reset_tokens")

    op.drop_index("ix_refresh_tokens_active_user", table_name="refresh_tokens")
    op.drop_index("ix_refresh_tokens_token_hash", table_name="refresh_tokens")
    op.drop_index("ix_refresh_tokens_expires_at", table_name="refresh_tokens")
    op.drop_index("ix_refresh_tokens_user_id", table_name="refresh_tokens")
    op.drop_table("refresh_tokens")
