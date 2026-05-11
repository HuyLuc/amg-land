import os
import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_roles
from app.api.v1.schemas import (
    AnalyticsEventCreate,
    AmenityCreate,
    AmenityOut,
    ApartmentCreate,
    ApartmentOut,
    ApartmentUpdate,
    ChatMessageRequest,
    CategoryCreate,
    CategoryOut,
    ContactCreate,
    ContactOut,
    ContactUpdate,
    FengShuiRequest,
    FloorPlanCreate,
    FloorPlanOut,
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    PostCreate,
    PostOut,
    PostUpdate,
    ProjectAmenityAssign,
    ProjectCreate,
    ProjectOut,
    ProjectUpdate,
    RefreshRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserCreate,
    UserOut,
    UserUpdate,
)
from app.core.security import create_access_token, generate_opaque_token, hash_password, hash_token, verify_password
from app.integrations.storage import upload_project_image
from app.models.activity_log import ActivityLog
from app.models.amenity import Amenity, ProjectAmenity
from app.models.analytics_event import AnalyticsEvent
from app.models.apartment import Apartment
from app.models.auth_token import PasswordResetToken, RefreshToken
from app.models.chat_session import ChatSession
from app.models.contact_request import ContactRequest
from app.models.floor_plan import FloorPlan
from app.models.post import Category, Post
from app.models.project import Project, ProjectImage
from app.models.user import User, UserRole


api_router = APIRouter()


AdminUser = Annotated[User, Depends(require_roles(UserRole.admin))]
StaffUser = Annotated[User, Depends(require_roles(UserRole.admin, UserRole.editor))]


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9\s-]", "", value)
    value = re.sub(r"[\s-]+", "-", value)
    return value.strip("-") or str(uuid.uuid4())


def unique_slug(db: Session, model, value: str) -> str:
    base = slugify(value)
    slug = base
    suffix = 1
    while db.scalar(select(model).where(model.slug == slug)) is not None:
        suffix += 1
        slug = f"{base}-{suffix}"
    return slug


def commit_or_400(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database constraint violation") from exc


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


@api_router.post("/auth/login", response_model=TokenResponse, tags=["auth"])
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user.last_login = datetime.now(timezone.utc)
    refresh_plain = generate_opaque_token()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(refresh_plain),
            expires_at=datetime.now(timezone.utc) + timedelta(days=30),
            created_at=datetime.now(timezone.utc),
        )
    )
    log_activity(db, user, "auth.login", "user", user.id)
    db.commit()
    access_token = create_access_token(str(user.id), {"role": user.role.value})
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_plain,
        user_info={"id": str(user.id), "email": user.email, "full_name": user.full_name, "role": user.role.value},
    )


@api_router.post("/auth/refresh", response_model=dict, tags=["auth"])
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)) -> dict:
    token = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_token(payload.refresh_token)))
    if token is None or token.revoked_at is not None or token.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = db.get(User, token.user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="Inactive or missing user")
    return {"access_token": create_access_token(str(user.id), {"role": user.role.value}), "token_type": "bearer"}


@api_router.post("/auth/logout", response_model=dict, tags=["auth"])
def logout(payload: LogoutRequest | None = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    if payload and payload.refresh_token:
        token = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_token(payload.refresh_token), RefreshToken.user_id == current_user.id))
        if token is not None:
            token.revoked_at = datetime.now(timezone.utc)
    log_activity(db, current_user, "auth.logout", "user", current_user.id)
    db.commit()
    return {"message": "Logged out"}


@api_router.post("/auth/forgot-password", response_model=dict, tags=["auth"])
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)) -> dict:
    user = db.scalar(select(User).where(User.email == payload.email))
    response = {"message": "If the email exists, a reset link will be sent"}
    if user is None:
        return response
    reset_plain = generate_opaque_token()
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=hash_token(reset_plain),
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
            created_at=datetime.now(timezone.utc),
        )
    )
    db.commit()
    if os.getenv("APP_ENV", "development") == "development":
        response["reset_token"] = reset_plain
    return response


@api_router.post("/auth/reset-password", response_model=dict, tags=["auth"])
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> dict:
    token = db.scalar(select(PasswordResetToken).where(PasswordResetToken.token_hash == hash_token(payload.token)))
    if token is None or token.used_at is not None or token.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid reset token")
    user = db.get(User, token.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.password_hash = hash_password(payload.new_password)
    token.used_at = datetime.now(timezone.utc)
    log_activity(db, user, "auth.reset_password", "user", user.id)
    db.commit()
    return {"message": "Password updated"}


@api_router.get("/users", response_model=list[UserOut], tags=["users"])
def list_users(
    _: AdminUser,
    db: Session = Depends(get_db),
    role: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
) -> list[User]:
    query = select(User).order_by(User.created_at.desc())
    if role:
        query = query.where(User.role == role)
    return list(db.scalars(query.offset((page - 1) * limit).limit(limit)))


@api_router.post("/users", response_model=UserOut, status_code=201, tags=["users"])
def create_user(payload: UserCreate, _: AdminUser, db: Session = Depends(get_db)) -> User:
    user = User(email=payload.email, password_hash=hash_password(payload.password), full_name=payload.full_name, role=payload.role)
    db.add(user)
    log_activity(db, _, "users.create", "user", None, {"email": payload.email})
    commit_or_400(db)
    db.refresh(user)
    return user


@api_router.put("/users/{user_id}", response_model=UserOut, tags=["users"])
def update_user(user_id: uuid.UUID, payload: UserUpdate, _: AdminUser, db: Session = Depends(get_db)) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    log_activity(db, _, "users.update", "user", user.id)
    commit_or_400(db)
    db.refresh(user)
    return user


@api_router.delete("/users/{user_id}", response_model=dict, tags=["users"])
def delete_user(user_id: uuid.UUID, current_user: AdminUser, db: Session = Depends(get_db)) -> dict:
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate current user")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    log_activity(db, current_user, "users.deactivate", "user", user.id)
    db.commit()
    return {"message": "Deleted"}


@api_router.get("/projects", response_model=list[ProjectOut], tags=["projects"])
def list_projects(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    district: str | None = None,
    status: str | None = None,
    keyword: str | None = None,
) -> list[Project]:
    query = select(Project).where(Project.deleted_at.is_(None))
    if status:
        query = query.where(Project.status == status)
    if district:
        query = query.where(Project.district.ilike(f"%{district}%"))
    if keyword:
        query = query.where(Project.name.ilike(f"%{keyword}%"))
    return list(db.scalars(query.order_by(Project.created_at.desc()).offset((page - 1) * limit).limit(limit)))


@api_router.get("/projects/{slug}", response_model=dict, tags=["projects"])
def get_project(slug: str, db: Session = Depends(get_db)) -> dict:
    project = db.scalar(select(Project).where(Project.slug == slug, Project.deleted_at.is_(None)))
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return {
        "project_detail": ProjectOut.model_validate(project).model_dump(mode="json"),
        "amenities": [item.amenity.name for item in project.amenities],
        "floor_plans": [{"id": str(item.id), "floor_number": item.floor_number, "image_url": item.image_url} for item in project.floor_plans],
        "images": [{"id": str(item.id), "image_url": item.image_url, "is_thumbnail": item.is_thumbnail} for item in project.images],
    }


@api_router.post("/projects", response_model=ProjectOut, status_code=201, tags=["projects"])
def create_project(payload: ProjectCreate, current_user: StaffUser, db: Session = Depends(get_db)) -> Project:
    project = Project(**payload.model_dump(), slug=unique_slug(db, Project, payload.name), created_by=current_user.id)
    db.add(project)
    log_activity(db, current_user, "projects.create", "project", None, {"name": payload.name})
    commit_or_400(db)
    db.refresh(project)
    return project


@api_router.put("/projects/{project_id}", response_model=ProjectOut, tags=["projects"])
def update_project(project_id: uuid.UUID, payload: ProjectUpdate, _: StaffUser, db: Session = Depends(get_db)) -> Project:
    project = get_project_or_404(db, project_id)
    values = payload.model_dump(exclude_unset=True)
    if "name" in values:
        project.slug = unique_slug(db, Project, values["name"])
    for key, value in values.items():
        setattr(project, key, value)
    log_activity(db, _, "projects.update", "project", project.id)
    commit_or_400(db)
    db.refresh(project)
    return project


@api_router.delete("/projects/{project_id}", response_model=dict, tags=["projects"])
def delete_project(project_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)) -> dict:
    project = get_project_or_404(db, project_id)
    project.deleted_at = datetime.now(timezone.utc)
    log_activity(db, _, "projects.delete", "project", project.id)
    db.commit()
    return {"message": "Deleted successfully"}


@api_router.post("/projects/{project_id}/images", response_model=list[dict], tags=["projects"])
def upload_project_images(project_id: uuid.UUID, _: StaffUser, db: Session = Depends(get_db), files: list[UploadFile] = File(...)) -> list[dict]:
    get_project_or_404(db, project_id)
    created: list[ProjectImage] = []
    for index, file in enumerate(files):
        stored = upload_project_image(project_id, file)
        image = ProjectImage(
            project_id=project_id,
            image_url=stored.public_url,
            caption=file.filename,
            sort_order=index,
            is_thumbnail=index == 0,
        )
        db.add(image)
        created.append(image)
    log_activity(db, _, "projects.images.upload", "project", project_id, {"count": len(created)})
    commit_or_400(db)
    for image in created:
        db.refresh(image)
    return [{"image_id": str(image.id), "image_url": image.image_url, "is_thumbnail": image.is_thumbnail} for image in created]


@api_router.post("/projects/{project_id}/floor-plans", response_model=FloorPlanOut, status_code=201, tags=["projects"])
def create_floor_plan(project_id: uuid.UUID, payload: FloorPlanCreate, current_user: StaffUser, db: Session = Depends(get_db)) -> FloorPlan:
    get_project_or_404(db, project_id)
    floor_plan = FloorPlan(project_id=project_id, **payload.model_dump())
    db.add(floor_plan)
    log_activity(db, current_user, "projects.floor_plans.create", "project", project_id)
    commit_or_400(db)
    db.refresh(floor_plan)
    return floor_plan


@api_router.get("/projects/{project_id}/floor-plans", response_model=list[FloorPlanOut], tags=["projects"])
def list_floor_plans(project_id: uuid.UUID, db: Session = Depends(get_db)) -> list[FloorPlan]:
    get_project_or_404(db, project_id)
    return list(db.scalars(select(FloorPlan).where(FloorPlan.project_id == project_id).order_by(FloorPlan.floor_number)))


@api_router.delete("/floor-plans/{floor_plan_id}", response_model=dict, tags=["projects"])
def delete_floor_plan(floor_plan_id: uuid.UUID, current_user: StaffUser, db: Session = Depends(get_db)) -> dict:
    floor_plan = db.get(FloorPlan, floor_plan_id)
    if floor_plan is None:
        raise HTTPException(status_code=404, detail="Floor plan not found")
    project_id = floor_plan.project_id
    db.delete(floor_plan)
    log_activity(db, current_user, "projects.floor_plans.delete", "project", project_id)
    db.commit()
    return {"message": "Deleted"}


@api_router.post("/projects/{project_id}/amenities", response_model=dict, tags=["projects"])
def assign_project_amenity(project_id: uuid.UUID, payload: ProjectAmenityAssign, current_user: StaffUser, db: Session = Depends(get_db)) -> dict:
    get_project_or_404(db, project_id)
    if db.get(Amenity, payload.amenity_id) is None:
        raise HTTPException(status_code=404, detail="Amenity not found")
    existing = db.get(ProjectAmenity, {"project_id": project_id, "amenity_id": payload.amenity_id})
    if existing is None:
        db.add(ProjectAmenity(project_id=project_id, amenity_id=payload.amenity_id, note=payload.note))
    else:
        existing.note = payload.note
    log_activity(db, current_user, "projects.amenities.assign", "project", project_id, {"amenity_id": str(payload.amenity_id)})
    commit_or_400(db)
    return {"message": "Assigned"}


@api_router.delete("/projects/{project_id}/amenities/{amenity_id}", response_model=dict, tags=["projects"])
def unassign_project_amenity(project_id: uuid.UUID, amenity_id: uuid.UUID, current_user: StaffUser, db: Session = Depends(get_db)) -> dict:
    link = db.get(ProjectAmenity, {"project_id": project_id, "amenity_id": amenity_id})
    if link is None:
        raise HTTPException(status_code=404, detail="Project amenity not found")
    db.delete(link)
    log_activity(db, current_user, "projects.amenities.unassign", "project", project_id, {"amenity_id": str(amenity_id)})
    db.commit()
    return {"message": "Unassigned"}


@api_router.get("/projects/{project_id}/apartments", response_model=list[ApartmentOut], tags=["apartments"])
def list_project_apartments(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    floor: int | None = None,
    bedrooms: int | None = None,
    direction: str | None = None,
    status: str | None = None,
) -> list[Apartment]:
    get_project_or_404(db, project_id)
    query = select(Apartment).where(Apartment.project_id == project_id)
    if floor is not None:
        query = query.where(Apartment.floor == floor)
    if bedrooms is not None:
        query = query.where(Apartment.bedrooms == bedrooms)
    if direction:
        query = query.where(Apartment.direction == direction)
    if status:
        query = query.where(Apartment.status == status)
    return list(db.scalars(query.order_by(Apartment.floor, Apartment.code)))


@api_router.get("/apartments/{apartment_id}", response_model=ApartmentOut, tags=["apartments"])
def get_apartment(apartment_id: uuid.UUID, db: Session = Depends(get_db)) -> Apartment:
    apartment = db.get(Apartment, apartment_id)
    if apartment is None:
        raise HTTPException(status_code=404, detail="Apartment not found")
    return apartment


@api_router.post("/apartments", response_model=ApartmentOut, status_code=201, tags=["apartments"])
def create_apartment(payload: ApartmentCreate, _: StaffUser, db: Session = Depends(get_db)) -> Apartment:
    get_project_or_404(db, payload.project_id)
    apartment = Apartment(**payload.model_dump())
    db.add(apartment)
    commit_or_400(db)
    db.refresh(apartment)
    return apartment


@api_router.put("/apartments/{apartment_id}", response_model=ApartmentOut, tags=["apartments"])
def update_apartment(apartment_id: uuid.UUID, payload: ApartmentUpdate, _: StaffUser, db: Session = Depends(get_db)) -> Apartment:
    apartment = db.get(Apartment, apartment_id)
    if apartment is None:
        raise HTTPException(status_code=404, detail="Apartment not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(apartment, key, value)
    commit_or_400(db)
    db.refresh(apartment)
    return apartment


@api_router.delete("/apartments/{apartment_id}", response_model=dict, tags=["apartments"])
def delete_apartment(apartment_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)) -> dict:
    apartment = db.get(Apartment, apartment_id)
    if apartment is None:
        raise HTTPException(status_code=404, detail="Apartment not found")
    db.delete(apartment)
    db.commit()
    return {"message": "Deleted"}


@api_router.get("/amenities", response_model=list[AmenityOut], tags=["amenities"])
def list_amenities(db: Session = Depends(get_db)) -> list[Amenity]:
    return list(db.scalars(select(Amenity).order_by(Amenity.name)))


@api_router.post("/amenities", response_model=AmenityOut, status_code=201, tags=["amenities"])
def create_amenity(payload: AmenityCreate, _: StaffUser, db: Session = Depends(get_db)) -> Amenity:
    amenity = Amenity(**payload.model_dump())
    db.add(amenity)
    commit_or_400(db)
    db.refresh(amenity)
    return amenity


@api_router.get("/categories", response_model=list[CategoryOut], tags=["categories"])
def list_categories(db: Session = Depends(get_db)) -> list[Category]:
    return list(db.scalars(select(Category).order_by(Category.name)))


@api_router.post("/categories", response_model=CategoryOut, status_code=201, tags=["categories"])
def create_category(payload: CategoryCreate, current_user: StaffUser, db: Session = Depends(get_db)) -> Category:
    category = Category(name=payload.name, slug=unique_slug(db, Category, payload.name), description=payload.description)
    db.add(category)
    log_activity(db, current_user, "categories.create", "category", None, {"name": payload.name})
    commit_or_400(db)
    db.refresh(category)
    return category


@api_router.put("/categories/{category_id}", response_model=CategoryOut, tags=["categories"])
def update_category(category_id: uuid.UUID, payload: CategoryCreate, current_user: StaffUser, db: Session = Depends(get_db)) -> Category:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    category.name = payload.name
    category.slug = unique_slug(db, Category, payload.name)
    category.description = payload.description
    log_activity(db, current_user, "categories.update", "category", category.id)
    commit_or_400(db)
    db.refresh(category)
    return category


@api_router.delete("/categories/{category_id}", response_model=dict, tags=["categories"])
def delete_category(category_id: uuid.UUID, current_user: StaffUser, db: Session = Depends(get_db)) -> dict:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    log_activity(db, current_user, "categories.delete", "category", category.id)
    db.commit()
    return {"message": "Deleted"}


@api_router.get("/search", response_model=dict, tags=["search"])
def search_apartments(
    db: Session = Depends(get_db),
    district: str | None = None,
    price_min: int | None = None,
    price_max: int | None = None,
    area_min: float | None = None,
    area_max: float | None = None,
    bedrooms: int | None = None,
    direction: str | None = None,
    status: str | None = None,
    sort: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
) -> dict:
    query = select(Apartment).join(Project).where(Project.deleted_at.is_(None), Project.status == "active")
    filters = []
    if district:
        filters.append(Project.district.ilike(f"%{district}%"))
    if price_min is not None:
        filters.append(Apartment.price >= price_min)
    if price_max is not None:
        filters.append(Apartment.price <= price_max)
    if area_min is not None:
        filters.append(Apartment.area >= area_min)
    if area_max is not None:
        filters.append(Apartment.area <= area_max)
    if bedrooms is not None:
        filters.append(Apartment.bedrooms == bedrooms)
    if direction:
        filters.append(Apartment.direction == direction)
    if status:
        filters.append(Apartment.status == status)
    if filters:
        query = query.where(and_(*filters))
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    if sort == "price_desc":
        query = query.order_by(Apartment.price.desc())
    elif sort == "area_asc":
        query = query.order_by(Apartment.area.asc())
    elif sort == "area_desc":
        query = query.order_by(Apartment.area.desc())
    else:
        query = query.order_by(Apartment.price.asc())
    items = list(db.scalars(query.offset((page - 1) * limit).limit(limit)))
    return {"items": [ApartmentOut.model_validate(item).model_dump(mode="json") for item in items], "total": total or 0, "page": page}


FENG_SHUI_DIRECTIONS = {
    "Kim": ["W", "NW", "SW"],
    "Moc": ["E", "SE", "S"],
    "Thuy": ["N", "E", "SE"],
    "Hoa": ["S", "E", "SE"],
    "Tho": ["SW", "NE", "W", "NW"],
}


def element_from_birth_date(birth_date: str) -> str:
    year = int(birth_date[:4])
    return ["Kim", "Thuy", "Hoa", "Tho", "Moc"][year % 5]


@api_router.get("/search/feng-shui", response_model=list[dict], tags=["search"])
def feng_shui_search(birth_date: str, db: Session = Depends(get_db), budget_max: int | None = None, district: str | None = None) -> list[dict]:
    element = element_from_birth_date(birth_date)
    directions = FENG_SHUI_DIRECTIONS[element]
    query = select(Apartment).join(Project).where(Apartment.direction.in_(directions), Project.status == "active", Project.deleted_at.is_(None))
    if budget_max:
        query = query.where(Apartment.price <= budget_max)
    if district:
        query = query.where(Project.district.ilike(f"%{district}%"))
    items = list(db.scalars(query.limit(10)))
    return [{"apartment": ApartmentOut.model_validate(item).model_dump(mode="json"), "score": 90, "reason": f"Hop menh {element}"} for item in items]


@api_router.post("/chat/message", response_model=dict, tags=["chat"])
def chat_message(payload: ChatMessageRequest, db: Session = Depends(get_db)) -> dict:
    session_id = payload.session_id or str(uuid.uuid4())
    session = db.scalar(select(ChatSession).where(ChatSession.session_id == session_id))
    messages = [{"role": "user", "content": payload.message, "ts": datetime.now(timezone.utc).isoformat()}]
    reply = "Cam on ban da lien he AMG Land. Hien tai bot dang o che do fallback, vui long de lai thong tin tu van."
    messages.append({"role": "assistant", "content": reply, "ts": datetime.now(timezone.utc).isoformat()})
    if session is None:
        session = ChatSession(session_id=session_id, user_info=payload.user_info, messages=messages)
        db.add(session)
    else:
        session.messages = [*session.messages, *messages]
    db.commit()
    return {"reply": reply, "suggested_apartments": [], "session_id": session_id}


@api_router.get("/chat/{session_id}", response_model=dict, tags=["chat"])
def get_chat(session_id: str, db: Session = Depends(get_db)) -> dict:
    session = db.scalar(select(ChatSession).where(ChatSession.session_id == session_id))
    if session is None:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return {"messages": session.messages, "created_at": session.created_at}


@api_router.post("/chat/feng-shui", response_model=dict, tags=["chat"])
def chat_feng_shui(payload: FengShuiRequest, db: Session = Depends(get_db)) -> dict:
    element = element_from_birth_date(payload.birth_date)
    suggestions = feng_shui_search(payload.birth_date, db, payload.budget, payload.district)[:5]
    return {"element": element, "compatible_directions": FENG_SHUI_DIRECTIONS[element], "suggested_apartments": suggestions}


@api_router.get("/posts", response_model=list[PostOut], tags=["posts"])
def list_posts(db: Session = Depends(get_db), category: str | None = None, keyword: str | None = None, page: int = 1) -> list[Post]:
    query = select(Post)
    if category:
        query = query.join(Category).where(or_(Category.slug == category, Category.name.ilike(f"%{category}%")))
    if keyword:
        query = query.where(Post.title.ilike(f"%{keyword}%"))
    return list(db.scalars(query.order_by(Post.created_at.desc()).offset((page - 1) * 10).limit(10)))


@api_router.get("/posts/{slug}", response_model=PostOut, tags=["posts"])
def get_post(slug: str, db: Session = Depends(get_db)) -> Post:
    post = db.scalar(select(Post).where(Post.slug == slug))
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@api_router.post("/posts", response_model=PostOut, status_code=201, tags=["posts"])
def create_post(payload: PostCreate, current_user: StaffUser, db: Session = Depends(get_db)) -> Post:
    if db.get(Category, payload.category_id) is None:
        raise HTTPException(status_code=404, detail="Category not found")
    post = Post(
        title=payload.title,
        slug=unique_slug(db, Post, payload.title),
        content=payload.content,
        category_id=payload.category_id,
        thumbnail=payload.thumbnail,
        status=payload.status,
        published_at=payload.scheduled_at,
        author_id=current_user.id,
    )
    db.add(post)
    commit_or_400(db)
    db.refresh(post)
    return post


@api_router.put("/posts/{post_id}", response_model=PostOut, tags=["posts"])
def update_post(post_id: uuid.UUID, payload: PostUpdate, _: StaffUser, db: Session = Depends(get_db)) -> Post:
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    values = payload.model_dump(exclude_unset=True)
    if "title" in values:
        post.slug = unique_slug(db, Post, values["title"])
    for key, value in values.items():
        setattr(post, key, value)
    commit_or_400(db)
    db.refresh(post)
    return post


@api_router.delete("/posts/{post_id}", response_model=dict, tags=["posts"])
def delete_post(post_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)) -> dict:
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return {"message": "Deleted"}


@api_router.post("/contacts", response_model=ContactOut, status_code=201, tags=["contacts"])
def create_contact(payload: ContactCreate, db: Session = Depends(get_db)) -> ContactRequest:
    contact = ContactRequest(**payload.model_dump(), status="new")
    db.add(contact)
    commit_or_400(db)
    db.refresh(contact)
    return contact


@api_router.post("/analytics/events", response_model=dict, status_code=201, tags=["analytics"])
def create_analytics_event(payload: AnalyticsEventCreate, db: Session = Depends(get_db)) -> dict:
    if payload.project_id and db.get(Project, payload.project_id) is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if payload.apartment_id and db.get(Apartment, payload.apartment_id) is None:
        raise HTTPException(status_code=404, detail="Apartment not found")
    event = AnalyticsEvent(
        visitor_id=payload.visitor_id,
        session_id=payload.session_id,
        event_type=payload.event_type,
        project_id=payload.project_id,
        apartment_id=payload.apartment_id,
        path=payload.path,
        referrer=payload.referrer,
        metadata_=payload.metadata,
    )
    db.add(event)
    commit_or_400(db)
    db.refresh(event)
    return {"id": str(event.id), "created_at": event.created_at}


@api_router.get("/contacts", response_model=list[ContactOut], tags=["contacts"])
def list_contacts(_: StaffUser, db: Session = Depends(get_db), status: str | None = None, page: int = 1) -> list[ContactRequest]:
    query = select(ContactRequest)
    if status:
        query = query.where(ContactRequest.status == status)
    return list(db.scalars(query.order_by(ContactRequest.created_at.desc()).offset((page - 1) * 20).limit(20)))


@api_router.patch("/contacts/{contact_id}", response_model=ContactOut, tags=["contacts"])
def update_contact(contact_id: uuid.UUID, payload: ContactUpdate, _: StaffUser, db: Session = Depends(get_db)) -> ContactRequest:
    contact = db.get(ContactRequest, contact_id)
    if contact is None:
        raise HTTPException(status_code=404, detail="Contact request not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(contact, key, value)
    commit_or_400(db)
    db.refresh(contact)
    return contact


@api_router.get("/stats/dashboard", response_model=dict, tags=["stats"])
def dashboard(_: AdminUser, db: Session = Depends(get_db), period: str = "week") -> dict:
    visits = db.scalar(select(func.count()).select_from(AnalyticsEvent).where(AnalyticsEvent.event_type == "page_view")) or 0
    top_projects = db.execute(
        select(Project.id, Project.name, func.count(AnalyticsEvent.id).label("views"))
        .join(AnalyticsEvent, AnalyticsEvent.project_id == Project.id)
        .group_by(Project.id, Project.name)
        .order_by(func.count(AnalyticsEvent.id).desc())
        .limit(5)
    ).all()
    top_apartments = db.execute(
        select(Apartment.id, Apartment.code, func.count(AnalyticsEvent.id).label("views"))
        .join(AnalyticsEvent, AnalyticsEvent.apartment_id == Apartment.id)
        .group_by(Apartment.id, Apartment.code)
        .order_by(func.count(AnalyticsEvent.id).desc())
        .limit(5)
    ).all()
    return {
        "period": period,
        "visits": visits,
        "new_contacts": db.scalar(select(func.count()).select_from(ContactRequest).where(ContactRequest.status == "new")) or 0,
        "top_projects": [{"id": str(row.id), "name": row.name, "views": row.views} for row in top_projects],
        "top_apartments": [{"id": str(row.id), "code": row.code, "views": row.views} for row in top_apartments],
    }
    CategoryCreate,
    CategoryOut,
