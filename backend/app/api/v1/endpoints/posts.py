from app.api.v1.common import *

router = APIRouter()


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
    if payload.apartment_id:
        apartment = db.get(Apartment, payload.apartment_id)
        if apartment is None:
            raise HTTPException(status_code=404, detail="Apartment not found")
        if payload.project_id and apartment.project_id != payload.project_id:
            raise HTTPException(status_code=400, detail="Apartment does not belong to selected project")
    published_at = payload.published_at or payload.scheduled_at
    if payload.status == PostStatus.published and published_at is None:
        published_at = datetime.now(timezone.utc)

    post = Post(
        title=payload.title,
        slug=unique_slug(db, Post, payload.title),
        excerpt=payload.excerpt,
        content=payload.content,
        thumbnail=payload.thumbnail,
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
    if apartment_id:
        apartment = db.get(Apartment, apartment_id)
        if apartment is None:
            raise HTTPException(status_code=404, detail="Apartment not found")
        if project_id and apartment.project_id != project_id:
            raise HTTPException(status_code=400, detail="Apartment does not belong to selected project")
    if "title" in values:
        post.slug = unique_slug(db, Post, values["title"], exclude_id=post.id)
    for key, value in values.items():
        setattr(post, key, value)
    if post.status == PostStatus.published and post.published_at is None:
        post.published_at = datetime.now(timezone.utc)
    commit_or_400(db)
    db.refresh(post)
    return post


@router.post("/posts/{post_id}/thumbnail", response_model=PostOut, tags=["posts"])
def upload_post_thumbnail_item(post_id: uuid.UUID, current_user: StaffUser, db: Session = Depends(get_db), image: UploadFile = File(...)) -> Post:
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.thumbnail:
        delete_public_object(post.thumbnail)
    stored = upload_post_thumbnail(post_id, image)
    post.thumbnail = stored.public_url
    log_activity(db, current_user, "posts.thumbnail.upload", "post", post.id)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/posts/{post_id}", response_model=dict, tags=["posts"])
def delete_post(post_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)) -> dict:
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.thumbnail:
        delete_public_object(post.thumbnail)
    db.delete(post)
    db.commit()
    return {"message": "Deleted"}
