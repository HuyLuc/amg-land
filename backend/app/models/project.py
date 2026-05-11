from datetime import datetime
from enum import Enum
import uuid

from sqlalchemy import BigInteger, DateTime, Enum as SqlEnum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.common import TimestampMixin, UUIDPrimaryKeyMixin


class ProjectStatus(str, Enum):
    draft = "draft"
    active = "active"
    closed = "closed"


class Project(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "projects"

    name: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str] = mapped_column(String(300))
    district: Mapped[str] = mapped_column(String(100), index=True)
    city: Mapped[str] = mapped_column(String(100))
    price_from: Mapped[int] = mapped_column(BigInteger)
    status: Mapped[ProjectStatus] = mapped_column(SqlEnum(ProjectStatus, name="project_status"), default=ProjectStatus.draft, index=True)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    creator = relationship("User", back_populates="projects")
    apartments = relationship("Apartment", back_populates="project", cascade="all, delete-orphan")
    images = relationship("ProjectImage", back_populates="project", cascade="all, delete-orphan")
    floor_plans = relationship("FloorPlan", back_populates="project", cascade="all, delete-orphan")
    amenities = relationship("ProjectAmenity", back_populates="project", cascade="all, delete-orphan")
    contact_requests = relationship("ContactRequest", back_populates="project")
    analytics_events = relationship("AnalyticsEvent", back_populates="project")


class ProjectImage(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "project_images"

    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), index=True)
    image_url: Mapped[str] = mapped_column(String(500))
    caption: Mapped[str | None] = mapped_column(String(200), nullable=True)
    sort_order: Mapped[int] = mapped_column(default=0)
    is_thumbnail: Mapped[bool] = mapped_column(default=False)

    project = relationship("Project", back_populates="images")
