import os
import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_roles
from app.api.v1.schemas import (
    AnalyticsEventCreate,
    AmenityCreate,
    AmenityOut,
    AmenityUpdate,
    ApartmentCreate,
    ApartmentPage,
    ApartmentOut,
    ApartmentUpdate,
    ChatMessageRequest,
    CategoryCreate,
    CategoryOut,
    ContactCreate,
    ContactOut,
    ContactPage,
    ContactUpdate,
    FengShuiRequest,
    FloorPlanCreate,
    FloorPlanOut,
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    PostCreate,
    PostOut,
    PostPage,
    PostUpdate,
    ProjectAmenityAssign,
    ProjectCreate,
    ProjectImageUpdate,
    ProjectPage,
    ProjectOut,
    ProjectUpdate,
    RefreshRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserCreate,
    UserOut,
    UserPage,
    UserUpdate,
)
from app.core.config import settings
from app.core.security import create_access_token, generate_opaque_token, hash_password, hash_token, verify_password
from app.integrations.storage import delete_public_object, upload_floor_plan_image, upload_project_image
from app.models.activity_log import ActivityLog
from app.models.amenity import Amenity, ProjectAmenity
from app.models.analytics_event import AnalyticsEvent
from app.models.apartment import Apartment, ApartmentStatus, Direction
from app.models.auth_token import PasswordResetToken, RefreshToken
from app.models.chat_session import ChatSession
from app.models.contact_request import ContactRequest, ContactStatus
from app.models.floor_plan import FloorPlan
from app.models.post import Category, Post, PostStatus
from app.models.project import Project, ProjectImage, ProjectStatus
from app.models.user import User, UserRole




AdminUser = Annotated[User, Depends(require_roles(UserRole.admin))]
StaffUser = Annotated[User, Depends(require_roles(UserRole.admin, UserRole.editor))]


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9\s-]", "", value)
    value = re.sub(r"[\s-]+", "-", value)
    return value.strip("-") or str(uuid.uuid4())


def unique_slug(db: Session, model, value: str, exclude_id: uuid.UUID | None = None) -> str:
    base = slugify(value)
    slug = base
    suffix = 1
    query = select(model).where(model.slug == slug)
    if exclude_id is not None:
        query = query.where(model.id != exclude_id)
    while db.scalar(query) is not None:
        suffix += 1
        slug = f"{base}-{suffix}"
        query = select(model).where(model.slug == slug)
        if exclude_id is not None:
            query = query.where(model.id != exclude_id)
    return slug


def commit_or_400(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database constraint violation") from exc


def page_response(items: list, total: int | None, page: int, limit: int) -> dict:
    return {"items": items, "total": total or 0, "page": page, "limit": limit}


def get_project_or_404(db: Session, project_id: uuid.UUID) -> Project:
    project = db.get(Project, project_id)
    if project is None or project.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


def log_activity(db: Session, actor: User | None, action: str, resource_type: str, resource_id: uuid.UUID | None = None, metadata: dict | None = None) -> None:
    db.add(
        ActivityLog(
            actor_id=actor.id if actor else None,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata_=metadata,
        )
    )
