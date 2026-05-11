import os
import re
from dataclasses import dataclass
from uuid import UUID

from fastapi import HTTPException, UploadFile
from minio import Minio
from minio.error import S3Error


ALLOWED_IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_UPLOAD_SIZE = 5 * 1024 * 1024


@dataclass(frozen=True)
class StoredObject:
    object_name: str
    public_url: str


def sanitize_filename(filename: str) -> str:
    basename = filename.split("/")[-1].split("\\")[-1]
    basename = re.sub(r"[^A-Za-z0-9._-]", "-", basename).strip(".-")
    return basename or "upload.bin"


def get_minio_client() -> Minio:
    endpoint = os.getenv("MINIO_ENDPOINT", "http://minio:9000").replace("http://", "").replace("https://", "")
    secure = os.getenv("MINIO_ENDPOINT", "").startswith("https://")
    return Minio(
        endpoint,
        access_key=os.getenv("MINIO_ACCESS_KEY", os.getenv("MINIO_ROOT_USER", "amgminio")),
        secret_key=os.getenv("MINIO_SECRET_KEY", os.getenv("MINIO_ROOT_PASSWORD", "amgminio123")),
        secure=secure,
    )


def ensure_bucket(client: Minio, bucket: str) -> None:
    if not client.bucket_exists(bucket):
        client.make_bucket(bucket)


def upload_project_image(project_id: UUID, file: UploadFile) -> StoredObject:
    if file.content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG, PNG and WebP images are allowed")

    bucket = os.getenv("MINIO_BUCKET", "amg-land-media")
    filename = sanitize_filename(file.filename or "image")
    object_name = f"projects/{project_id}/{filename}"

    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)
    if size <= 0 or size > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="File size must be between 1 byte and 5MB")

    client = get_minio_client()
    try:
        ensure_bucket(client, bucket)
        client.put_object(bucket, object_name, file.file, length=size, content_type=file.content_type)
    except S3Error as exc:
        raise HTTPException(status_code=502, detail=f"Object storage error: {exc.code}") from exc

    public_base = os.getenv("MINIO_PUBLIC_URL", f"http://localhost:9000/{bucket}").rstrip("/")
    return StoredObject(object_name=object_name, public_url=f"{public_base}/{object_name}")
