from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.v1.router import api_router
from app.db.init_db import seed_admin_user


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    seed_admin_user()
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="AMG News API", version="0.1.0", lifespan=lifespan)

    @app.get("/health", tags=["health"])
    async def health_check() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(api_router, prefix="/api/v1")

    return app


app = create_app()
