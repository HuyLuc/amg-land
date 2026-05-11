from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"
    user_info: dict[str, Any]


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
    role: str = "editor"


class UserUpdate(BaseModel):
    full_name: str | None = None
    role: str | None = None
    is_active: bool | None = None


class UserOut(ORMModel):
    id: UUID
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    last_login: datetime | None = None


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    location: str
    district: str
    city: str
    price_from: int = Field(gt=0)
    status: str = "draft"


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    location: str | None = None
    district: str | None = None
    city: str | None = None
    price_from: int | None = Field(default=None, gt=0)
    status: str | None = None


class ProjectOut(ORMModel):
    id: UUID
    name: str
    slug: str
    description: str | None = None
    location: str
    district: str
    city: str
    price_from: int
    status: str


class ApartmentCreate(BaseModel):
    project_id: UUID
    code: str
    floor: int = Field(gt=0)
    area: Decimal = Field(gt=0)
    bedrooms: int = Field(ge=0)
    bathrooms: int = Field(ge=1)
    direction: str
    price: int = Field(gt=0)
    status: str = "available"
    feng_shui_element: str | None = None


class ApartmentUpdate(BaseModel):
    code: str | None = None
    floor: int | None = Field(default=None, gt=0)
    area: Decimal | None = Field(default=None, gt=0)
    bedrooms: int | None = Field(default=None, ge=0)
    bathrooms: int | None = Field(default=None, ge=1)
    direction: str | None = None
    price: int | None = Field(default=None, gt=0)
    status: str | None = None
    feng_shui_element: str | None = None


class ApartmentOut(ORMModel):
    id: UUID
    project_id: UUID
    code: str
    floor: int
    area: Decimal
    bedrooms: int
    bathrooms: int
    direction: str
    price: int
    status: str
    feng_shui_element: str | None = None


class AmenityCreate(BaseModel):
    name: str
    icon: str | None = None
    category: str
    description: str | None = None


class AmenityOut(ORMModel):
    id: UUID
    name: str
    icon: str | None = None
    category: str
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


class PostCreate(BaseModel):
    title: str
    content: str
    category_id: UUID
    thumbnail: str | None = None
    status: str = "draft"
    scheduled_at: datetime | None = None


class PostUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    category_id: UUID | None = None
    thumbnail: str | None = None
    status: str | None = None
    published_at: datetime | None = None


class PostOut(ORMModel):
    id: UUID
    title: str
    slug: str
    content: str | None = None
    thumbnail: str | None = None
    category_id: UUID
    author_id: UUID
    status: str
    published_at: datetime | None = None
    created_at: datetime


class ContactCreate(BaseModel):
    full_name: str
    phone: str = Field(min_length=8, max_length=15)
    email: EmailStr | None = None
    project_id: UUID | None = None
    message: str | None = None


class ContactUpdate(BaseModel):
    status: str | None = None
    note: str | None = None
    assigned_to: UUID | None = None


class ContactOut(ORMModel):
    id: UUID
    full_name: str
    phone: str
    email: EmailStr | None = None
    project_id: UUID | None = None
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
