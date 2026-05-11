import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.common import UUIDPrimaryKeyMixin


class FloorPlan(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "floor_plans"

    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"))
    floor_number: Mapped[int]
    image_url: Mapped[str] = mapped_column(String(500))
    description: Mapped[str | None] = mapped_column(String(200), nullable=True)

    project = relationship("Project", back_populates="floor_plans")
