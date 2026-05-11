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
