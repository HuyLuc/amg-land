import os
import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, get_optional_current_user, require_roles
from app.api.v1.schemas import (
    AnalyticsEventCreate,
    AmenityCreate,
    AmenityOut,
    AmenityUpdate,
    ApartmentCreate,
    ApartmentMediaOut,
    ApartmentMediaUpdate,
    ApartmentPage,
    ApartmentOut,
    ApartmentUpdate,
    ChatMessageRequest,
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
    UserPasswordUpdate,
    UserUpdate,
)
from app.core.config import settings
from app.core.security import create_access_token, generate_opaque_token, hash_password, hash_token, verify_password
from app.integrations.storage import delete_public_object, upload_apartment_media, upload_floor_plan_image, upload_project_image
from app.models.activity_log import ActivityLog
from app.models.amenity import Amenity, ProjectAmenity
from app.models.analytics_event import AnalyticsEvent
from app.models.apartment import Apartment, ApartmentMedia, ApartmentMediaType, ApartmentStatus, Direction
from app.models.auth_token import PasswordResetToken, RefreshToken
from app.models.chat_session import ChatSession
from app.models.contact_request import ContactRequest, ContactStatus
from app.models.floor_plan import FloorPlan
from app.models.post import Post, PostStatus
from app.models.project import Project, ProjectImage, ProjectStatus
from app.models.user import User, UserRole




AdminUser = Annotated[User, Depends(require_roles(UserRole.admin))]
StaffUser = Annotated[User, Depends(require_roles(UserRole.admin, UserRole.editor, UserRole.consultant, UserRole.content))]
SalesUser = Annotated[User, Depends(require_roles(UserRole.admin, UserRole.editor, UserRole.consultant))]
ContentUser = Annotated[User, Depends(require_roles(UserRole.admin, UserRole.content))]


def is_consultant_user(user: User | None) -> bool:
    return user is not None and user.role in {UserRole.consultant, UserRole.editor}


def is_internal_user(user: User | None) -> bool:
    return user is not None and user.role in {UserRole.admin, UserRole.editor, UserRole.consultant, UserRole.content}


def can_manage_content(user: User | None) -> bool:
    return user is not None and user.role in {UserRole.admin, UserRole.content}


def validate_consultant_id(db: Session, consultant_id: uuid.UUID | None) -> None:
    if consultant_id is None:
        return
    user = db.get(User, consultant_id)
    if user is None or user.role != UserRole.consultant or not user.is_active:
        raise HTTPException(status_code=400, detail="Consultant not found")


def consultant_project_condition(user: User):
    assigned_project_ids = select(ContactRequest.project_id).where(
        ContactRequest.assigned_to == user.id,
        ContactRequest.project_id.is_not(None),
    )
    assigned_apartment_project_ids = (
        select(Apartment.project_id)
        .join(ContactRequest, ContactRequest.apartment_id == Apartment.id)
        .where(ContactRequest.assigned_to == user.id)
    )
    return or_(
        Project.consultant_id == user.id,
        Project.id.in_(assigned_project_ids),
        Project.id.in_(assigned_apartment_project_ids),
    )


def consultant_apartment_condition(user: User):
    assigned_apartment_ids = select(ContactRequest.apartment_id).where(
        ContactRequest.assigned_to == user.id,
        ContactRequest.apartment_id.is_not(None),
    )
    return or_(
        Apartment.consultant_id == user.id,
        and_(Apartment.consultant_id.is_(None), Project.consultant_id == user.id),
        Apartment.id.in_(assigned_apartment_ids),
    )


def ensure_project_visible(db: Session, project: Project, user: User | None) -> None:
    if not is_consultant_user(user):
        return
    visible_project_id = db.scalar(select(Project.id).where(Project.id == project.id, consultant_project_condition(user)))
    if visible_project_id is None:
        raise HTTPException(status_code=404, detail="Project not found")


def ensure_apartment_visible(db: Session, apartment: Apartment, user: User | None) -> None:
    if not is_consultant_user(user):
        return
    visible_apartment_id = db.scalar(
        select(Apartment.id)
        .join(Project)
        .where(Apartment.id == apartment.id, Project.deleted_at.is_(None), consultant_apartment_condition(user))
    )
    if visible_apartment_id is None:
        raise HTTPException(status_code=404, detail="Apartment not found")


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
