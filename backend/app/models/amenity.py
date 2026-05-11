from enum import Enum
import uuid

from sqlalchemy import Enum as SqlEnum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.common import UUIDPrimaryKeyMixin


class AmenityCategory(str, Enum):
    internal = "internal"
    external = "external"


class Amenity(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "amenities"

    name: Mapped[str] = mapped_column(String(100), unique=True)
    icon: Mapped[str | None] = mapped_column(String(100), nullable=True)
    category: Mapped[AmenityCategory] = mapped_column(SqlEnum(AmenityCategory, name="amenity_category"))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    projects = relationship("ProjectAmenity", back_populates="amenity")


class ProjectAmenity(Base):
    __tablename__ = "project_amenities"

    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True)
    amenity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("amenities.id"), primary_key=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    project = relationship("Project", back_populates="amenities")
    amenity = relationship("Amenity", back_populates="projects")
