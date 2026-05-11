# API

Backend FastAPI cho AMG News.

## Layers

- `api`: HTTP routing va versioning.
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
