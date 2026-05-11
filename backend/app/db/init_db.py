from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User, UserRole


def seed_admin_user() -> None:
    if not settings.admin_email or not settings.admin_password:
        return

    with SessionLocal() as db:
        existing = db.scalar(select(User).where(User.email == settings.admin_email))
        if existing is not None:
            return

        admin = User(
            email=settings.admin_email,
            password_hash=hash_password(settings.admin_password),
            full_name=settings.admin_full_name,
            role=UserRole.admin,
            is_active=True,
        )
        db.add(admin)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
