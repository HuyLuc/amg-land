from enum import Enum
import uuid

from sqlalchemy import Enum as SqlEnum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.common import TimestampMixin, UUIDPrimaryKeyMixin


class ContactStatus(str, Enum):
    new = "new"
    processing = "processing"
    done = "done"


class ContactRequest(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "contact_requests"

    full_name: Mapped[str] = mapped_column(String(100))
    phone: Mapped[str] = mapped_column(String(15))
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    project_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True)
    apartment_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("apartments.id", ondelete="SET NULL"), nullable=True, index=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[ContactStatus] = mapped_column(SqlEnum(ContactStatus, name="contact_status"), default=ContactStatus.new, index=True)
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    project = relationship("Project", back_populates="contact_requests")
    apartment = relationship("Apartment")

    @property
    def apartment_code(self) -> str | None:
        return self.apartment.code if self.apartment else None
