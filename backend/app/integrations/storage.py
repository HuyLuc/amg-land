import os
import re
from dataclasses import dataclass
from uuid import UUID

from fastapi import HTTPException, UploadFile
from minio import Minio
from minio.error import S3Error


ALLOWED_IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_VIDEO_CONTENT_TYPES = {"video/mp4", "video/webm", "video/quicktime"}
MAX_UPLOAD_SIZE = 5 * 1024 * 1024
MAX_VIDEO_UPLOAD_SIZE = 80 * 1024 * 1024


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
    return upload_project_object(project_id, file, "images")


def upload_floor_plan_image(project_id: UUID, file: UploadFile) -> StoredObject:
    return upload_project_object(project_id, file, "floor-plans")


def upload_apartment_media(apartment_id: UUID, file: UploadFile, media_type: str) -> StoredObject:
    return upload_media_object("apartments", apartment_id, file, media_type)


def upload_post_thumbnail(post_id: UUID, file: UploadFile) -> StoredObject:
    return upload_media_object("posts", post_id, file, "thumbnail", image_only=True)


def upload_project_object(project_id: UUID, file: UploadFile, folder: str) -> StoredObject:
    return upload_media_object("projects", project_id, file, folder, image_only=True)


def upload_media_object(owner_folder: str, owner_id: UUID, file: UploadFile, folder: str, image_only: bool = False) -> StoredObject:
    allowed_types = ALLOWED_IMAGE_CONTENT_TYPES if image_only or folder == "image" else ALLOWED_VIDEO_CONTENT_TYPES
    max_size = MAX_UPLOAD_SIZE if image_only or folder == "image" else MAX_VIDEO_UPLOAD_SIZE
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WebP, MP4, WebM and MOV files are allowed")

    bucket = os.getenv("MINIO_BUCKET", "amg-land-media")
    filename = sanitize_filename(file.filename or "image")
    object_name = f"{owner_folder}/{owner_id}/{folder}/{filename}"

    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)
    if size <= 0 or size > max_size:
        raise HTTPException(status_code=413, detail=f"File size must be between 1 byte and {max_size // (1024 * 1024)}MB")

    client = get_minio_client()
    try:
        ensure_bucket(client, bucket)
        client.put_object(bucket, object_name, file.file, length=size, content_type=file.content_type)
    except S3Error as exc:
        raise HTTPException(status_code=502, detail=f"Object storage error: {exc.code}") from exc

    public_base = os.getenv("MINIO_PUBLIC_URL", f"http://localhost:9000/{bucket}").rstrip("/")
    return StoredObject(object_name=object_name, public_url=f"{public_base}/{object_name}")


def delete_public_object(public_url: str) -> None:
    bucket = os.getenv("MINIO_BUCKET", "amg-land-media")
    public_base = os.getenv("MINIO_PUBLIC_URL", f"http://localhost:9000/{bucket}").rstrip("/")
    prefix = f"{public_base}/"
    if not public_url.startswith(prefix):
        return

    object_name = public_url[len(prefix) :]
    if not object_name:
        return

    client = get_minio_client()
    try:
        client.remove_object(bucket, object_name)
    except S3Error:
        return
