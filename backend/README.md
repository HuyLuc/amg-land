# API

Backend FastAPI cho AMG News.

## Layers

- `api`: HTTP routing va versioning.
- `api/v1/router.py`: router tong, include cac router con theo domain.
- `api/v1/endpoints`: endpoint modules theo domain nhu auth, projects, apartments, posts, contacts.
- `api/v1/common.py`: helper/dependency dung chung cho API v1.
- `modules`: nghiep vu theo domain.
- `services`: business logic dung chung.
- `repositories`: data access.
- `models`: SQLAlchemy models.
- `schemas`: Pydantic schemas.
- `integrations`: Gemini, MinIO, email va dich vu ngoai.

## Docker

Backend chay trong Docker Compose cung PostgreSQL va MinIO:

```powershell
docker compose up -d --build
```

Service `migrate` se chay `alembic upgrade head` truoc khi backend start.

API health check: `http://localhost:8000/health`
