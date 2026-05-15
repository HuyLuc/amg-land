import os
from dataclasses import dataclass
from urllib.parse import urlparse


@dataclass(frozen=True)
class Settings:
    app_env: str
    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str
    access_token_expire_minutes: int
    admin_email: str | None
    admin_password: str | None
    admin_full_name: str
    max_failed_login_attempts: int
    account_lock_minutes: int
    cors_origins: list[str]
    cors_origin_regex: str | None


def build_dev_cors_origin_regex(origins: list[str]) -> str | None:
    ports: set[str] = set()
    for origin in origins:
        parsed = urlparse(origin)
        if parsed.port is not None:
            ports.add(str(parsed.port))

    if not ports:
        return None

    port_pattern = "|".join(sorted(ports))
    return (
        rf"^https?://(?:localhost|127\.0\.0\.1|10(?:\.\d{{1,3}}){{3}}|"
        rf"192\.168(?:\.\d{{1,3}}){{2}}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{{1,3}}){{2}})"
        rf":(?:{port_pattern})$"
    )


def get_settings() -> Settings:
    app_env = os.getenv("APP_ENV", "development")
    jwt_secret_key = os.getenv("JWT_SECRET_KEY")
    if not jwt_secret_key:
        if app_env == "production":
            raise RuntimeError("JWT_SECRET_KEY is required in production")
        jwt_secret_key = "change-me-in-local-env"

    cors_origins = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174").split(",")
        if origin.strip()
    ]

    return Settings(
        app_env=app_env,
        database_url=os.getenv("DATABASE_URL", "postgresql+psycopg://amg_land:amg_land_password@localhost:5432/amg_land"),
        jwt_secret_key=jwt_secret_key,
        jwt_algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
        access_token_expire_minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")),
        admin_email=os.getenv("ADMIN_EMAIL"),
        admin_password=os.getenv("ADMIN_PASSWORD"),
        admin_full_name=os.getenv("ADMIN_FULL_NAME", "AMG Admin"),
        max_failed_login_attempts=int(os.getenv("MAX_FAILED_LOGIN_ATTEMPTS", "5")),
        account_lock_minutes=int(os.getenv("ACCOUNT_LOCK_MINUTES", "15")),
        cors_origins=cors_origins,
        cors_origin_regex=build_dev_cors_origin_regex(cors_origins) if app_env == "development" else None,
    )


settings = get_settings()
