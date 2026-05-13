import uuid
import sys
from pathlib import Path

import pytest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from sqlalchemy import String, delete, or_, select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.main import app
from app.models.activity_log import ActivityLog
from app.models.amenity import Amenity, ProjectAmenity
from app.models.analytics_event import AnalyticsEvent
from app.models.apartment import Apartment
from app.models.auth_token import PasswordResetToken, RefreshToken
from app.models.chat_session import ChatSession
from app.models.contact_request import ContactRequest
from app.models.floor_plan import FloorPlan
from app.models.post import Category
from app.models.post import Post
from app.models.project import Project, ProjectImage
from app.models.user import User, UserRole


client = TestClient(app)


def cleanup_smoke_artifacts() -> None:
    with SessionLocal() as db:
        smoke_user_ids = list(
            db.scalars(
                select(User.id).where(
                    or_(
                        User.email.like("admin-%@example.com"),
                        User.email.like("editor-%@example.com"),
                        User.full_name.in_(["Smoke Admin", "Editor User", "Updated Editor"]),
                    )
                )
            )
        )
        smoke_project_ids = list(db.scalars(select(Project.id).where(Project.name.like("Project %"))))
        smoke_category_ids = list(db.scalars(select(Category.id).where(Category.name.like("Category %"))))
        smoke_amenity_ids = list(db.scalars(select(Amenity.id).where(Amenity.name.like("Amenity %"))))

        db.execute(delete(ContactRequest).where(or_(ContactRequest.full_name == "Lead User", ContactRequest.email == "lead@example.com")))
        db.execute(delete(ChatSession).where(ChatSession.messages.cast(String).like("%Tu van giup toi%")))

        if smoke_project_ids:
            db.execute(delete(AnalyticsEvent).where(AnalyticsEvent.project_id.in_(smoke_project_ids)))
            db.execute(delete(ContactRequest).where(ContactRequest.project_id.in_(smoke_project_ids)))
            db.execute(delete(ProjectAmenity).where(ProjectAmenity.project_id.in_(smoke_project_ids)))
            db.execute(delete(FloorPlan).where(FloorPlan.project_id.in_(smoke_project_ids)))
            db.execute(delete(ProjectImage).where(ProjectImage.project_id.in_(smoke_project_ids)))
            db.execute(delete(Apartment).where(Apartment.project_id.in_(smoke_project_ids)))
            db.execute(delete(Project).where(Project.id.in_(smoke_project_ids)))

        db.execute(delete(Post).where(Post.title.like("Post %")))
        if smoke_category_ids:
            db.execute(delete(Category).where(Category.id.in_(smoke_category_ids)))
        if smoke_amenity_ids:
            db.execute(delete(ProjectAmenity).where(ProjectAmenity.amenity_id.in_(smoke_amenity_ids)))
            db.execute(delete(Amenity).where(Amenity.id.in_(smoke_amenity_ids)))

        if smoke_user_ids:
            db.execute(delete(ActivityLog).where(ActivityLog.actor_id.in_(smoke_user_ids)))
            db.execute(delete(RefreshToken).where(RefreshToken.user_id.in_(smoke_user_ids)))
            db.execute(delete(PasswordResetToken).where(PasswordResetToken.user_id.in_(smoke_user_ids)))
            db.execute(delete(User).where(User.id.in_(smoke_user_ids)))

        db.commit()


@pytest.fixture(autouse=True)
def clean_smoke_data():
    cleanup_smoke_artifacts()
    yield
    cleanup_smoke_artifacts()


def ensure_admin() -> tuple[str, str]:
    email = f"admin-{uuid.uuid4().hex}@example.com"
    password = "secret123"
    with SessionLocal() as db:
        user = User(email=email, password_hash=hash_password(password), full_name="Smoke Admin", role=UserRole.admin)
        db.add(user)
        db.commit()
    return email, password


def login_payload() -> tuple[dict[str, str], str]:
    email, password = ensure_admin()
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    body = response.json()
    return {"Authorization": f"Bearer {body['access_token']}"}, body["refresh_token"]


def auth_headers() -> dict[str, str]:
    return login_payload()[0]


def test_public_health_and_empty_lists() -> None:
    assert client.get("/health").json() == {"status": "ok"}
    projects_response = client.get("/api/v1/projects")
    assert projects_response.status_code == 200
    assert {"items", "total", "page", "limit"} <= projects_response.json().keys()
    assert client.get("/api/v1/amenities").status_code == 200
    posts_response = client.get("/api/v1/posts")
    assert posts_response.status_code == 200
    assert {"items", "total", "page", "limit"} <= posts_response.json().keys()


def test_auth_locks_after_repeated_failed_attempts() -> None:
    email, password = ensure_admin()
    for _ in range(5):
        response = client.post("/api/v1/auth/login", json={"email": email, "password": "wrong-password"})
        assert response.status_code == 401

    locked_response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert locked_response.status_code == 423


def test_query_validation_and_dashboard_period() -> None:
    headers = auth_headers()

    invalid_direction = client.get("/api/v1/search", params={"direction": "BAD"})
    assert invalid_direction.status_code == 422

    invalid_period = client.get("/api/v1/stats/dashboard", params={"period": "year"}, headers=headers)
    assert invalid_period.status_code == 400


def test_full_api_smoke_flow() -> None:
    headers, refresh_token = login_payload()
    assert client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token}).status_code == 200

    user_payload = {
        "email": f"editor-{uuid.uuid4().hex}@example.com",
        "password": "secret123",
        "full_name": "Editor User",
        "role": "editor",
    }
    user_response = client.post("/api/v1/users", json=user_payload, headers=headers)
    assert user_response.status_code == 201, user_response.text
    user_id = user_response.json()["id"]
    assert client.get("/api/v1/users", headers=headers).status_code == 200
    assert client.put(f"/api/v1/users/{user_id}", json={"full_name": "Updated Editor"}, headers=headers).status_code == 200

    project_payload = {
        "name": f"Project {uuid.uuid4().hex[:8]}",
        "short_description": "Smoke project short",
        "description": "Smoke project",
        "location": "Ha Noi",
        "district": "Cau Giay",
        "city": "Ha Noi",
        "price_from": 1000000000,
        "status": "active",
    }
    project_response = client.post("/api/v1/projects", json=project_payload, headers=headers)
    assert project_response.status_code == 201, project_response.text
    project = project_response.json()
    assert project["short_description"] == "Smoke project short"
    update_project_response = client.put(
        f"/api/v1/projects/{project['id']}",
        json={"name": project_payload["name"], "description": "Updated smoke project"},
        headers=headers,
    )
    assert update_project_response.status_code == 200, update_project_response.text
    assert update_project_response.json()["slug"] == project["slug"]
    assert client.get(f"/api/v1/projects/{project['slug']}").status_code == 200

    category_response = client.post(
        "/api/v1/categories",
        json={"name": f"Category {uuid.uuid4().hex[:8]}", "description": "Smoke category"},
        headers=headers,
    )
    assert category_response.status_code == 201, category_response.text
    category = category_response.json()
    assert client.get("/api/v1/categories").status_code == 200

    amenity_response = client.post(
        "/api/v1/amenities",
        json={"name": f"Amenity {uuid.uuid4().hex[:8]}", "icon": "star", "category": "internal"},
        headers=headers,
    )
    assert amenity_response.status_code == 201, amenity_response.text
    amenity = amenity_response.json()
    assert client.post(
        f"/api/v1/projects/{project['id']}/amenities",
        json={"amenity_id": amenity["id"], "note": "Assigned by smoke test"},
        headers=headers,
    ).status_code == 200

    image_response = client.post(
        f"/api/v1/projects/{project['id']}/images",
        files=[("files", ("thumb.jpg", b"fake-image", "image/jpeg"))],
        headers=headers,
    )
    assert image_response.status_code == 200, image_response.text

    floor_plan_response = client.post(
        f"/api/v1/projects/{project['id']}/floor-plans",
        data={"floor_number": "1", "description": "Typical floor"},
        files={"image": ("floor.png", b"fake-floor-image", "image/png")},
        headers=headers,
    )
    assert floor_plan_response.status_code == 201, floor_plan_response.text
    floor_plan = floor_plan_response.json()
    assert client.get(f"/api/v1/projects/{project['id']}/floor-plans").status_code == 200

    apartment_payload = {
        "project_id": project["id"],
        "code": f"A{uuid.uuid4().hex[:5]}",
        "floor": 10,
        "area": "72.5",
        "bedrooms": 2,
        "bathrooms": 2,
        "direction": "E",
        "price": 2500000000,
        "status": "available",
        "feng_shui_element": "Moc",
    }
    apartment_response = client.post("/api/v1/apartments", json=apartment_payload, headers=headers)
    assert apartment_response.status_code == 201, apartment_response.text
    apartment = apartment_response.json()
    filtered_apartments_response = client.get(
        f"/api/v1/apartments?project_id={project['id']}&price_min=2000000000&price_max=3000000000&area_min=70&area_max=80",
        headers=headers,
    )
    assert filtered_apartments_response.status_code == 200, filtered_apartments_response.text
    assert filtered_apartments_response.json()["total"] >= 1
    assert client.get(f"/api/v1/apartments/{apartment['id']}").status_code == 200
    assert client.get(f"/api/v1/projects/{project['id']}/apartments").status_code == 200
    assert client.put(f"/api/v1/apartments/{apartment['id']}", json={"price": 2400000000}, headers=headers).status_code == 200
    apartment_media_response = client.post(
        f"/api/v1/apartments/{apartment['id']}/media",
        data={"media_type": "image", "caption": "Living room"},
        files={"file": ("apartment.jpg", b"fake-apartment-image", "image/jpeg")},
        headers=headers,
    )
    assert apartment_media_response.status_code == 201, apartment_media_response.text
    apartment_media = apartment_media_response.json()
    assert apartment_media["is_thumbnail"] is True
    assert client.get(f"/api/v1/apartments/{apartment['id']}/media", headers=headers).status_code == 200
    assert client.put(f"/api/v1/apartment-media/{apartment_media['id']}", json={"caption": "Updated media"}, headers=headers).status_code == 200

    assert client.post(
        "/api/v1/analytics/events",
        json={"event_type": "page_view", "project_id": project["id"], "apartment_id": apartment["id"], "path": f"/projects/{project['slug']}"},
    ).status_code == 201

    search_response = client.get("/api/v1/search", params={"district": "Cau Giay", "price_max": 3000000000})
    assert search_response.status_code == 200, search_response.text
    assert search_response.json()["total"] >= 1
    assert client.get("/api/v1/search/feng-shui", params={"birth_date": "1990-01-01"}).status_code == 200

    contact_response = client.post(
        "/api/v1/contacts",
        json={"full_name": "Lead User", "phone": "0912345678", "email": "lead@example.com", "project_id": project["id"]},
    )
    assert contact_response.status_code == 201, contact_response.text
    contact_id = contact_response.json()["id"]
    assert client.get("/api/v1/contacts", headers=headers).status_code == 200
    assert client.patch(f"/api/v1/contacts/{contact_id}", json={"status": "processing"}, headers=headers).status_code == 200

    post_response = client.post(
        "/api/v1/posts",
        json={"title": f"Post {uuid.uuid4().hex[:8]}", "content": "<p>Body</p>", "category_id": category["id"], "status": "published"},
        headers=headers,
    )
    assert post_response.status_code == 201, post_response.text
    post = post_response.json()
    assert client.get(f"/api/v1/posts/{post['slug']}").status_code == 200
    assert client.put(f"/api/v1/posts/{post['id']}", json={"status": "archived"}, headers=headers).status_code == 200

    chat_response = client.post("/api/v1/chat/message", json={"message": "Tu van giup toi"})
    assert chat_response.status_code == 200, chat_response.text
    session_id = chat_response.json()["session_id"]
    assert client.get(f"/api/v1/chat/{session_id}").status_code == 200
    assert client.post("/api/v1/chat/feng-shui", json={"birth_date": "1990-01-01", "budget": 3000000000}).status_code == 200

    assert client.get("/api/v1/stats/dashboard", headers=headers).status_code == 200

    assert client.delete(f"/api/v1/posts/{post['id']}", headers=headers).status_code == 200
    assert client.delete(f"/api/v1/floor-plans/{floor_plan['id']}", headers=headers).status_code == 200
    assert client.delete(f"/api/v1/apartment-media/{apartment_media['id']}", headers=headers).status_code == 200
    assert client.delete(f"/api/v1/projects/{project['id']}/amenities/{amenity['id']}", headers=headers).status_code == 200
    assert client.delete(f"/api/v1/apartments/{apartment['id']}", headers=headers).status_code == 200
    assert client.delete(f"/api/v1/projects/{project['id']}", headers=headers).status_code == 200
    assert client.delete(f"/api/v1/categories/{category['id']}", headers=headers).status_code == 200
    assert client.post("/api/v1/auth/logout", json={"refresh_token": refresh_token}, headers=headers).status_code == 200
