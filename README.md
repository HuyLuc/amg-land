# AMG Land / AMG News

AMG News la ung dung web bat dong san cho AMG Land. Repo nay duoc to chuc theo monorepo gom backend FastAPI, frontend React, shared packages, ha tang Docker va tai lieu dac ta trong `docs/`.

## Kien Truc Hien Tai

```text
amg-land/
  backend/        FastAPI API, SQLAlchemy models, Alembic migrations
  frontend/       React frontend scaffold
  packages/       Shared contracts/types scaffold
  infra/          Docker/nginx/scripts phu tro
  docs/           Spec, database, API, use case, ADR
  compose.yaml    Docker Compose entrypoint chinh o root
```

Stack local hien co:

- Backend: FastAPI + Uvicorn, port `8000`
- Database: PostgreSQL 16, port `5432`
- Migration: Alembic, service `migrate`
- Object storage: MinIO, API port `9000`, console port `9001`

## API Da Co

Backend expose API tai prefix `http://localhost:8000/api/v1`.

- Auth: login, refresh, logout, forgot/reset password token flow.
- Users: list/create/update/deactivate.
- Projects: list/detail/create/update/delete, upload image len MinIO, floor plans, assign/unassign amenities.
- Apartments: list by project/detail/create/update/delete.
- Amenities: list/create.
- Categories: list/create/update/delete.
- Search: search da tieu chi, search phong thuy.
- Chat: message fallback, history, feng-shui suggestion.
- Posts: list/detail/create/update/delete.
- Contacts: create/list/update.
- Analytics: create event.
- Stats: dashboard tu contact va analytics events.

## Yeu Cau Moi Truong

Can cai san:

- Docker Desktop
- Docker Compose plugin
- PowerShell hoac terminal tuong duong

Kiem tra Docker:

```powershell
docker --version
docker compose version
```

## Chay Lan Dau

Tat ca lenh duoi day chay tu thu muc root:

```powershell
cd D:\amg-land
```

Tao file moi truong local:

```powershell
Copy-Item .env.example .env
```

Build va chay toan bo stack:

```powershell
docker compose up -d --build
```

Docker Compose se tu dong:

1. Start PostgreSQL.
2. Cho PostgreSQL healthy.
3. Chay service `migrate` voi lenh `alembic upgrade head`.
4. Start backend FastAPI.
5. Start MinIO va tao bucket mac dinh.

## Kiem Tra Sau Khi Chay

Xem trang thai container:

```powershell
docker compose ps
```

Health check backend:

```powershell
curl http://localhost:8000/health
```

Ket qua dung:

```json
{"status":"ok"}
```

Cac URL dev:

- Backend health: `http://localhost:8000/health`
- Backend OpenAPI: `http://localhost:8000/docs`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

Thong tin MinIO mac dinh nam trong `.env`:

```text
MINIO_ROOT_USER=amgminio
MINIO_ROOT_PASSWORD=amgminio123
MINIO_BUCKET=amg-land-media
```

Tai khoan admin local mac dinh duoc seed khi backend startup neu chua ton tai:

```text
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

Doi cac gia tri `ADMIN_*` va `JWT_SECRET_KEY` trong `.env` truoc khi dung moi truong that.

## Lenh Docker Thuong Dung

Start hoac rebuild stack:

```powershell
docker compose up -d --build
```

Dung stack nhung giu data volume:

```powershell
docker compose down
```

Dung stack va xoa data volume PostgreSQL/MinIO:

```powershell
docker compose down -v
```

Xem log backend:

```powershell
docker compose logs -f backend
```

Chay API smoke test:

```powershell
docker compose run --rm backend pytest -q -p no:cacheprovider
```

Xem log migration:

```powershell
docker compose logs migrate
```

Chay shell trong backend container:

```powershell
docker compose exec backend sh
```

## Quan Ly Database Migration

Du an dung Alembic trong `backend/alembic`.

Migration hien co:

```text
backend/alembic/versions/20260511_0001_initial_schema.py
backend/alembic/versions/20260511_0002_audit_auth_analytics_constraints.py
```

Schema hien co gom cac bang chinh:

- `users`
- `projects`
- `apartments`
- `amenities`
- `project_amenities`
- `floor_plans`
- `project_images`
- `categories`
- `posts`
- `contact_requests`
- `chat_sessions`
- `refresh_tokens`
- `password_reset_tokens`
- `activity_logs`
- `analytics_events`

Migration `0002` bo sung check constraints, index cho search/dashboard, seed categories/amenities mau, audit log va bang token phuc vu auth.

### Chay migration thu cong

Neu stack dang chay:

```powershell
docker compose run --rm migrate
```

Hoac chay truc tiep trong backend image:

```powershell
docker compose run --rm backend alembic upgrade head
```

### Tao migration moi

Sau khi sua SQLAlchemy models trong `backend/app/models`, tao revision moi:

```powershell
docker compose run --rm backend alembic revision --autogenerate -m "describe change"
```

Kiem tra file moi trong:

```text
backend/alembic/versions/
```

Sau do apply migration:

```powershell
docker compose run --rm backend alembic upgrade head
```

### Xem revision hien tai

```powershell
docker compose run --rm backend alembic current
```

### Rollback migration gan nhat

```powershell
docker compose run --rm backend alembic downgrade -1
```

Chi rollback khi ban hieu ro tac dong den du lieu.

## Reset Database Local

Khi muon xoa sach database local va tao lai schema tu dau:

```powershell
docker compose down -v
docker compose up -d --build
```

Lenh `down -v` se xoa named volumes, bao gom data PostgreSQL va MinIO.

## Cau Hinh Moi Truong

File `.env` o root duoc Docker Compose tu dong doc khi chay `docker compose ...`.

Khong commit `.env` that len Git. File mau duoc commit la:

```text
.env.example
```

Neu doi port hoac credential, sua `.env`, sau do restart:

```powershell
docker compose up -d --build
```

Bien auth quan trong:

```text
JWT_SECRET_KEY=change-this-local-secret
ACCESS_TOKEN_EXPIRE_MINUTES=60
MAX_FAILED_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_MINUTES=15
```

Trong `APP_ENV=production`, backend yeu cau `JWT_SECRET_KEY` phai duoc cau hinh ro rang.

## API Contract Notes

Cac endpoint list chinh tra ve pagination metadata:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "limit": 20
}
```

Ap dung cho `GET /api/v1/users`, `/projects`, `/projects/{project_id}/apartments`, `/posts`, `/contacts`.

## Backend Development

Backend Dockerfile nam o:

```text
backend/Dockerfile
```

Backend source duoc mount vao container qua volume:

```text
./backend/app:/app/app
```

Vì vậy khi sua code trong `backend/app`, Uvicorn reload tu dong trong moi truong development.

Dependency Python nam o:

```text
backend/requirements.txt
```

Sau khi them package moi, rebuild backend:

```powershell
docker compose up -d --build backend
```

## Troubleshooting

Neu backend khong start vi migration fail:

```powershell
docker compose logs migrate
```

Neu PostgreSQL chua healthy:

```powershell
docker compose logs postgres
```

Neu port bi trung, sua cac bien trong `.env`:

```text
BACKEND_PORT=8000
POSTGRES_PORT=5432
MINIO_API_PORT=9000
MINIO_CONSOLE_PORT=9001
```

Neu muon build lai sach image backend:

```powershell
docker compose build --no-cache backend migrate
docker compose up -d
```
