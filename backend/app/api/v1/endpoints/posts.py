from app.api.v1.common import *

router = APIRouter()


@router.get("/posts", response_model=PostPage, tags=["posts"])
def list_posts(
    db: Session = Depends(get_db),
    category: str | None = None,
    keyword: str | None = None,
    status: PostStatus | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
) -> dict:
    query = select(Post)
    if category:
        query = query.join(Category).where(or_(Category.slug == category, Category.name.ilike(f"%{category}%")))
    if keyword:
        query = query.where(Post.title.ilike(f"%{keyword}%"))
    if status:
        query = query.where(Post.status == status)
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    items = list(db.scalars(query.order_by(Post.created_at.desc()).offset((page - 1) * limit).limit(limit)))
    return page_response(items, total, page, limit)


@router.get("/posts/{slug}", response_model=PostOut, tags=["posts"])
def get_post(slug: str, db: Session = Depends(get_db)) -> Post:
    post = db.scalar(select(Post).where(Post.slug == slug))
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("/posts", response_model=PostOut, status_code=201, tags=["posts"])
def create_post(payload: PostCreate, current_user: StaffUser, db: Session = Depends(get_db)) -> Post:
    if db.get(Category, payload.category_id) is None:
        raise HTTPException(status_code=404, detail="Category not found")
    post = Post(
        title=payload.title,
        slug=unique_slug(db, Post, payload.title),
        content=payload.content,
        category_id=payload.category_id,
        thumbnail=payload.thumbnail,
        status=payload.status,
        published_at=payload.scheduled_at,
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
    if "title" in values:
        post.slug = unique_slug(db, Post, values["title"])
    for key, value in values.items():
        setattr(post, key, value)
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
