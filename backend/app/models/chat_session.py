from datetime import datetime

from sqlalchemy import DateTime, String, func, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.common import UUIDPrimaryKeyMixin


class ChatSession(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "chat_sessions"

    session_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    user_info: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    messages: Mapped[list] = mapped_column(JSONB, server_default=text("'[]'::jsonb"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now() + interval '24 hours'"))
