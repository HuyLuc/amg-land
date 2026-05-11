import uuid
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.main import app
from app.models.post import Category
from app.models.user import User, UserRole


client = TestClient(app)


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
        json={"floor_number": 1, "image_url": "http://example.com/floor.png", "description": "Typical floor"},
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
    assert client.get(f"/api/v1/apartments/{apartment['id']}").status_code == 200
    assert client.get(f"/api/v1/projects/{project['id']}/apartments").status_code == 200
    assert client.put(f"/api/v1/apartments/{apartment['id']}", json={"price": 2400000000}, headers=headers).status_code == 200

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
    assert client.delete(f"/api/v1/projects/{project['id']}/amenities/{amenity['id']}", headers=headers).status_code == 200
    assert client.delete(f"/api/v1/apartments/{apartment['id']}", headers=headers).status_code == 200
    assert client.delete(f"/api/v1/projects/{project['id']}", headers=headers).status_code == 200
    assert client.delete(f"/api/v1/categories/{category['id']}", headers=headers).status_code == 200
    assert client.post("/api/v1/auth/logout", json={"refresh_token": refresh_token}, headers=headers).status_code == 200
