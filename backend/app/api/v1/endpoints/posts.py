from app.api.v1.common import *

router = APIRouter()


def normalize_post_images(images: list[str] | None) -> list[str]:
    if not images:
        return []
    normalized: list[str] = []
    seen: set[str] = set()
    for image in images:
        value = image.strip()
        if value and value not in seen:
            normalized.append(value)
            seen.add(value)
    return normalized


def validate_post_images(
    db: Session,
    images: list[str],
    project_id: uuid.UUID | None,
    apartment_id: uuid.UUID | None,
    apartment: Apartment | None = None,
) -> list[str]:
    normalized = normalize_post_images(images)
    if not normalized:
        return []
    if apartment_id and apartment is None:
        apartment = db.get(Apartment, apartment_id)
    effective_project_id = project_id or (apartment.project_id if apartment is not None else None)
    if effective_project_id is None and apartment_id is None:
        raise HTTPException(status_code=400, detail="Post images must belong to selected project or apartment")

    allowed_urls: set[str] = set()
    if effective_project_id:
        allowed_urls.update(db.scalars(select(ProjectImage.image_url).where(ProjectImage.project_id == effective_project_id)))
    if apartment_id:
        allowed_urls.update(
            db.scalars(
                select(ApartmentMedia.url).where(
                    ApartmentMedia.apartment_id == apartment_id,
                    ApartmentMedia.media_type == ApartmentMediaType.image,
                )
            )
        )
    invalid_urls = [image for image in normalized if image not in allowed_urls]
    if invalid_urls:
        raise HTTPException(status_code=400, detail="Post images must be selected from project or apartment media")
    return normalized


@router.get("/posts", response_model=PostPage, tags=["posts"])
def list_posts(
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
    keyword: str | None = None,
    status: PostStatus | None = None,
    project_id: uuid.UUID | None = None,
    apartment_id: uuid.UUID | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
) -> dict:
    is_staff = current_user is not None and current_user.role in {UserRole.admin, UserRole.editor}
    query = select(Post)
    if keyword:
        query = query.where(Post.title.ilike(f"%{keyword}%"))
    if status:
        query = query.where(Post.status == status)
    elif not is_staff:
        query = query.where(Post.status == PostStatus.published)
    if project_id:
        query = query.where(Post.project_id == project_id)
    if apartment_id:
        query = query.where(Post.apartment_id == apartment_id)
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    items = list(db.scalars(query.order_by(Post.created_at.desc()).offset((page - 1) * limit).limit(limit)))
    return page_response(items, total, page, limit)


@router.get("/posts/{slug}", response_model=PostOut, tags=["posts"])
def get_post(slug: str, db: Session = Depends(get_db), current_user: User | None = Depends(get_optional_current_user)) -> Post:
    post = db.scalar(select(Post).where(Post.slug == slug))
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    is_staff = current_user is not None and current_user.role in {UserRole.admin, UserRole.editor}
    if post.status != PostStatus.published and not is_staff:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("/posts", response_model=PostOut, status_code=201, tags=["posts"])
def create_post(payload: PostCreate, current_user: StaffUser, db: Session = Depends(get_db)) -> Post:
    if payload.project_id and db.get(Project, payload.project_id) is None:
        raise HTTPException(status_code=404, detail="Project not found")
    apartment = None
    if payload.apartment_id:
        apartment = db.get(Apartment, payload.apartment_id)
        if apartment is None:
            raise HTTPException(status_code=404, detail="Apartment not found")
        if payload.project_id and apartment.project_id != payload.project_id:
            raise HTTPException(status_code=400, detail="Apartment does not belong to selected project")
    images = validate_post_images(db, payload.images, payload.project_id, payload.apartment_id, apartment)
    published_at = payload.published_at or payload.scheduled_at
    if payload.status == PostStatus.published and published_at is None:
        published_at = datetime.now(timezone.utc)

    post = Post(
        title=payload.title,
        slug=unique_slug(db, Post, payload.title),
        excerpt=payload.excerpt,
        content=payload.content,
        images=images,
        project_id=payload.project_id,
        apartment_id=payload.apartment_id,
        status=payload.status,
        published_at=published_at,
        author_id=current_user.id,
    )
    db.add(post)
    commit_or_400(db)
    db.refresh(post)
    return post


@router.put("/posts/{post_id}", response_model=PostOut, tags=["posts"])
def update_post(post_id: uuid.UUID, payload: PostUpdate, _: StaffUser, db: Session = Depends(get_db)) -> Post:
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    values = payload.model_dump(exclude_unset=True)
    project_id = values.get("project_id", post.project_id)
    apartment_id = values.get("apartment_id", post.apartment_id)
    if project_id and db.get(Project, project_id) is None:
        raise HTTPException(status_code=404, detail="Project not found")
    apartment = None
    if apartment_id:
        apartment = db.get(Apartment, apartment_id)
        if apartment is None:
            raise HTTPException(status_code=404, detail="Apartment not found")
        if project_id and apartment.project_id != project_id:
            raise HTTPException(status_code=400, detail="Apartment does not belong to selected project")
    if "images" in values:
        values["images"] = validate_post_images(db, values["images"], project_id, apartment_id, apartment)
    elif "project_id" in values or "apartment_id" in values:
        values["images"] = validate_post_images(db, post.images, project_id, apartment_id, apartment)
    if "title" in values:
        post.slug = unique_slug(db, Post, values["title"], exclude_id=post.id)
    for key, value in values.items():
        setattr(post, key, value)
    if post.status == PostStatus.published and post.published_at is None:
        post.published_at = datetime.now(timezone.utc)
    commit_or_400(db)
    db.refresh(post)
    return post

@router.delete("/posts/{post_id}", response_model=dict, tags=["posts"])
def delete_post(post_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)) -> dict:
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return {"message": "Deleted"}
