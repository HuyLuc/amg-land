from enum import Enum
import uuid

from sqlalchemy import BigInteger, Enum as SqlEnum, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.common import UUIDPrimaryKeyMixin


class ApartmentStatus(str, Enum):
    available = "available"
    reserved = "reserved"
    sold = "sold"


class ApartmentMediaType(str, Enum):
    image = "image"
    video = "video"


class Direction(str, Enum):
    N = "N"
    S = "S"
    E = "E"
    W = "W"
    NE = "NE"
    NW = "NW"
    SE = "SE"
    SW = "SW"


class Apartment(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "apartments"

    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(20))
    floor: Mapped[int]
    area: Mapped[float] = mapped_column(Numeric(8, 2))
    bedrooms: Mapped[int]
    bathrooms: Mapped[int]
    direction: Mapped[Direction] = mapped_column(SqlEnum(Direction, name="direction"), index=True)
    price: Mapped[int] = mapped_column(BigInteger, index=True)
    status: Mapped[ApartmentStatus] = mapped_column(SqlEnum(ApartmentStatus, name="apartment_status"), default=ApartmentStatus.available, index=True)
    feng_shui_element: Mapped[str | None] = mapped_column(String(20), nullable=True)

    project = relationship("Project", back_populates="apartments")
    analytics_events = relationship("AnalyticsEvent", back_populates="apartment")
    media = relationship("ApartmentMedia", back_populates="apartment", cascade="all, delete-orphan")


class ApartmentMedia(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "apartment_media"

    apartment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("apartments.id", ondelete="CASCADE"), index=True)
    media_type: Mapped[ApartmentMediaType] = mapped_column(SqlEnum(ApartmentMediaType, name="apartment_media_type"), index=True)
    url: Mapped[str] = mapped_column(String(500))
    caption: Mapped[str | None] = mapped_column(String(200), nullable=True)
    sort_order: Mapped[int] = mapped_column(default=0)
    is_thumbnail: Mapped[bool] = mapped_column(default=False)

    apartment = relationship("Apartment", back_populates="media")
