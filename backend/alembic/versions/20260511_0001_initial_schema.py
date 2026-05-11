"""initial schema

Revision ID: 20260511_0001
Revises:
Create Date: 2026-05-11
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260511_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def uuid_pk() -> sa.Column:
    return sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True)


def create_enum_if_not_exists(name: str, values: list[str]) -> None:
    quoted_values = ", ".join(f"'{value}'" for value in values)
    op.execute(
        sa.text(
            f"""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '{name}') THEN
                    CREATE TYPE {name} AS ENUM ({quoted_values});
                END IF;
            END
            $$;
            """
        )
    )


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    create_enum_if_not_exists("user_role", ["admin", "editor", "viewer"])
    create_enum_if_not_exists("project_status", ["draft", "active", "closed"])
    create_enum_if_not_exists("apartment_status", ["available", "reserved", "sold"])
    create_enum_if_not_exists("post_status", ["draft", "published", "archived"])
    create_enum_if_not_exists("contact_status", ["new", "processing", "done"])
    create_enum_if_not_exists("amenity_category", ["internal", "external"])
    create_enum_if_not_exists("direction", ["N", "S", "E", "W", "NE", "NW", "SE", "SW"])

    user_role = postgresql.ENUM("admin", "editor", "viewer", name="user_role", create_type=False)
    project_status = postgresql.ENUM("draft", "active", "closed", name="project_status", create_type=False)
    apartment_status = postgresql.ENUM("available", "reserved", "sold", name="apartment_status", create_type=False)
    post_status = postgresql.ENUM("draft", "published", "archived", name="post_status", create_type=False)
    contact_status = postgresql.ENUM("new", "processing", "done", name="contact_status", create_type=False)
    amenity_category = postgresql.ENUM("internal", "external", name="amenity_category", create_type=False)
    direction = postgresql.ENUM("N", "S", "E", "W", "NE", "NW", "SE", "SW", name="direction", create_type=False)

    op.create_table(
        "users",
        uuid_pk(),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(100), nullable=False),
        sa.Column("role", user_role, nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("failed_attempts", sa.Integer(), nullable=False),
        sa.Column("locked_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_login", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "amenities",
        uuid_pk(),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("icon", sa.String(100), nullable=True),
        sa.Column("category", amenity_category, nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
    )
    op.create_unique_constraint("uq_amenities_name", "amenities", ["name"])

    op.create_table(
        "categories",
        uuid_pk(),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("slug", sa.String(120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
    )
    op.create_unique_constraint("uq_categories_name", "categories", ["name"])
    op.create_index("ix_categories_slug", "categories", ["slug"], unique=True)

    op.create_table(
        "projects",
        uuid_pk(),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("slug", sa.String(220), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("location", sa.String(300), nullable=False),
        sa.Column("district", sa.String(100), nullable=False),
        sa.Column("city", sa.String(100), nullable=False),
        sa.Column("price_from", sa.BigInteger(), nullable=False),
        sa.Column("status", project_status, nullable=False),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_projects_slug", "projects", ["slug"], unique=True)
    op.create_index("ix_projects_district", "projects", ["district"])
    op.create_index("ix_projects_status", "projects", ["status"])

    op.create_table(
        "apartments",
        uuid_pk(),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("code", sa.String(20), nullable=False),
        sa.Column("floor", sa.Integer(), nullable=False),
        sa.Column("area", sa.Numeric(8, 2), nullable=False),
        sa.Column("bedrooms", sa.Integer(), nullable=False),
        sa.Column("bathrooms", sa.Integer(), nullable=False),
        sa.Column("direction", direction, nullable=False),
        sa.Column("price", sa.BigInteger(), nullable=False),
        sa.Column("status", apartment_status, nullable=False),
        sa.Column("feng_shui_element", sa.String(20), nullable=True),
    )
    op.create_index("ix_apartments_project_id", "apartments", ["project_id"])
    op.create_index("ix_apartments_direction", "apartments", ["direction"])
    op.create_index("ix_apartments_price", "apartments", ["price"])
    op.create_index("ix_apartments_status", "apartments", ["status"])
    op.create_unique_constraint("uq_apartments_project_code", "apartments", ["project_id", "code"])

    op.create_table(
        "project_amenities",
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("amenity_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("amenities.id"), primary_key=True),
        sa.Column("note", sa.Text(), nullable=True),
    )

    op.create_table(
        "floor_plans",
        uuid_pk(),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("floor_number", sa.Integer(), nullable=False),
        sa.Column("image_url", sa.String(500), nullable=False),
        sa.Column("description", sa.String(200), nullable=True),
    )

    op.create_table(
        "project_images",
        uuid_pk(),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("image_url", sa.String(500), nullable=False),
        sa.Column("caption", sa.String(200), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("is_thumbnail", sa.Boolean(), nullable=False),
    )
    op.create_index("ix_project_images_project_id", "project_images", ["project_id"])

    op.create_table(
        "posts",
        uuid_pk(),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("slug", sa.String(320), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("thumbnail", sa.String(500), nullable=True),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("categories.id"), nullable=False),
        sa.Column("author_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("status", post_status, nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_posts_slug", "posts", ["slug"], unique=True)
    op.create_index("ix_posts_status", "posts", ["status"])

    op.create_table(
        "contact_requests",
        uuid_pk(),
        sa.Column("full_name", sa.String(100), nullable=False),
        sa.Column("phone", sa.String(15), nullable=False),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("projects.id"), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("status", contact_status, nullable=False),
        sa.Column("assigned_to", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_contact_requests_status", "contact_requests", ["status"])

    op.create_table(
        "chat_sessions",
        uuid_pk(),
        sa.Column("session_id", sa.String(100), nullable=False),
        sa.Column("user_info", postgresql.JSONB(), nullable=True),
        sa.Column("messages", postgresql.JSONB(), server_default=sa.text("'[]'::jsonb"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), server_default=sa.text("now() + interval '24 hours'"), nullable=False),
    )
    op.create_index("ix_chat_sessions_session_id", "chat_sessions", ["session_id"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_chat_sessions_session_id", table_name="chat_sessions")
    op.drop_table("chat_sessions")
    op.drop_index("ix_contact_requests_status", table_name="contact_requests")
    op.drop_table("contact_requests")
    op.drop_index("ix_posts_status", table_name="posts")
    op.drop_index("ix_posts_slug", table_name="posts")
    op.drop_table("posts")
    op.drop_index("ix_project_images_project_id", table_name="project_images")
    op.drop_table("project_images")
    op.drop_table("floor_plans")
    op.drop_table("project_amenities")
    op.drop_constraint("uq_apartments_project_code", "apartments", type_="unique")
    op.drop_index("ix_apartments_status", table_name="apartments")
    op.drop_index("ix_apartments_price", table_name="apartments")
    op.drop_index("ix_apartments_direction", table_name="apartments")
    op.drop_index("ix_apartments_project_id", table_name="apartments")
    op.drop_table("apartments")
    op.drop_index("ix_projects_status", table_name="projects")
    op.drop_index("ix_projects_district", table_name="projects")
    op.drop_index("ix_projects_slug", table_name="projects")
    op.drop_table("projects")
    op.drop_index("ix_categories_slug", table_name="categories")
    op.drop_constraint("uq_categories_name", "categories", type_="unique")
    op.drop_table("categories")
    op.drop_constraint("uq_amenities_name", "amenities", type_="unique")
    op.drop_table("amenities")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

    bind = op.get_bind()
    for enum_name in ["direction", "amenity_category", "contact_status", "post_status", "apartment_status", "project_status", "user_role"]:
        sa.Enum(name=enum_name).drop(bind, checkfirst=True)
