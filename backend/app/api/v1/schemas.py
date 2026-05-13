from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.amenity import AmenityCategory
from app.models.apartment import ApartmentMediaType, ApartmentStatus, Direction
from app.models.contact_request import ContactStatus
from app.models.post import PostStatus
from app.models.project import ProjectStatus
from app.models.user import UserRole


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"
    user_info: dict[str, Any]


class PageMeta(BaseModel):
    total: int
    page: int
    limit: int


class UserPage(BaseModel):
    items: list["UserOut"]
    total: int
    page: int
    limit: int


class ProjectPage(BaseModel):
    items: list["ProjectOut"]
    total: int
    page: int
    limit: int


class ApartmentPage(BaseModel):
    items: list["ApartmentOut"]
    total: int
    page: int
    limit: int


class PostPage(BaseModel):
    items: list["PostOut"]
    total: int
    page: int
    limit: int


class ContactPage(BaseModel):
    items: list["ContactOut"]
    total: int
    page: int
    limit: int


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str | None = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6)


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    role: UserRole = UserRole.editor


class UserUpdate(BaseModel):
    full_name: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None


class UserOut(ORMModel):
    id: UUID
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime
    last_login: datetime | None = None


class ProjectCreate(BaseModel):
    name: str
    short_description: str | None = None
    description: str | None = None
    location: str
    district: str
    city: str
    price_from: int = Field(gt=0)
    status: ProjectStatus = ProjectStatus.draft


class ProjectUpdate(BaseModel):
    name: str | None = None
    short_description: str | None = None
    description: str | None = None
    location: str | None = None
    district: str | None = None
    city: str | None = None
    price_from: int | None = Field(default=None, gt=0)
    status: ProjectStatus | None = None


class ProjectOut(ORMModel):
    id: UUID
    name: str
    slug: str
    short_description: str | None = None
    description: str | None = None
    location: str
    district: str
    city: str
    price_from: int
    status: ProjectStatus


class ApartmentCreate(BaseModel):
    project_id: UUID
    code: str
    floor: int = Field(gt=0)
    area: Decimal = Field(gt=0)
    bedrooms: int = Field(ge=0)
    bathrooms: int = Field(ge=1)
    direction: Direction
    price: int = Field(gt=0)
    status: ApartmentStatus = ApartmentStatus.available
    feng_shui_element: str | None = None


class ApartmentUpdate(BaseModel):
    code: str | None = None
    floor: int | None = Field(default=None, gt=0)
    area: Decimal | None = Field(default=None, gt=0)
    bedrooms: int | None = Field(default=None, ge=0)
    bathrooms: int | None = Field(default=None, ge=1)
    direction: Direction | None = None
    price: int | None = Field(default=None, gt=0)
    status: ApartmentStatus | None = None
    feng_shui_element: str | None = None


class ApartmentOut(ORMModel):
    id: UUID
    project_id: UUID
    code: str
    floor: int
    area: Decimal
    bedrooms: int
    bathrooms: int
    direction: Direction
    price: int
    status: ApartmentStatus
    feng_shui_element: str | None = None


class ApartmentMediaUpdate(BaseModel):
    caption: str | None = None
    sort_order: int | None = None
    is_thumbnail: bool | None = None


class ApartmentMediaOut(ORMModel):
    id: UUID
    apartment_id: UUID
    media_type: ApartmentMediaType
    url: str
    caption: str | None = None
    sort_order: int
    is_thumbnail: bool


class AmenityCreate(BaseModel):
    name: str
    icon: str | None = None
    category: AmenityCategory
    description: str | None = None


class AmenityUpdate(BaseModel):
    name: str | None = None
    icon: str | None = None
    category: AmenityCategory | None = None
    description: str | None = None


class AmenityOut(ORMModel):
    id: UUID
    name: str
    icon: str | None = None
    category: AmenityCategory
    description: str | None = None


class CategoryCreate(BaseModel):
    name: str
    description: str | None = None


class CategoryOut(ORMModel):
    id: UUID
    name: str
    slug: str
    description: str | None = None


class FloorPlanCreate(BaseModel):
    floor_number: int = Field(gt=0)
    image_url: str
    description: str | None = None


class FloorPlanOut(ORMModel):
    id: UUID
    project_id: UUID
    floor_number: int
    image_url: str
    description: str | None = None


class ProjectAmenityAssign(BaseModel):
    amenity_id: UUID
    note: str | None = None


class ProjectImageUpdate(BaseModel):
    caption: str | None = None
    sort_order: int | None = Field(default=None, ge=0)
    is_thumbnail: bool | None = None


class PostCreate(BaseModel):
    title: str
    content: str
    category_id: UUID
    thumbnail: str | None = None
    status: PostStatus = PostStatus.draft
    scheduled_at: datetime | None = None


class PostUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    category_id: UUID | None = None
    thumbnail: str | None = None
    status: PostStatus | None = None
    published_at: datetime | None = None


class PostOut(ORMModel):
    id: UUID
    title: str
    slug: str
    content: str | None = None
    thumbnail: str | None = None
    category_id: UUID
    author_id: UUID
    status: PostStatus
    published_at: datetime | None = None
    created_at: datetime


class ContactCreate(BaseModel):
    full_name: str
    phone: str = Field(min_length=8, max_length=15, pattern=r"^[0-9+()\-\s]+$")
    email: EmailStr | None = None
    project_id: UUID | None = None
    apartment_id: UUID | None = None
    message: str | None = None


class ContactUpdate(BaseModel):
    status: ContactStatus | None = None
    note: str | None = None
    assigned_to: UUID | None = None
    apartment_id: UUID | None = None


class ContactOut(ORMModel):
    id: UUID
    full_name: str
    phone: str
    email: EmailStr | None = None
    project_id: UUID | None = None
    apartment_id: UUID | None = None
    apartment_code: str | None = None
    message: str | None = None
    status: str
    assigned_to: UUID | None = None
    note: str | None = None
    created_at: datetime


class ChatMessageRequest(BaseModel):
    session_id: str | None = None
    message: str
    user_info: dict[str, Any] | None = None


class FengShuiRequest(BaseModel):
    birth_date: str
    budget: int | None = None
    district: str | None = None


class AnalyticsEventCreate(BaseModel):
    visitor_id: str | None = None
    session_id: str | None = None
    event_type: str
    project_id: UUID | None = None
    apartment_id: UUID | None = None
    path: str | None = None
    referrer: str | None = None
    metadata: dict[str, Any] | None = None
