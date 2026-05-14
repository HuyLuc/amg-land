from app.api.v1.common import *

router = APIRouter()


ROLE_LABELS = {
    UserRole.admin: "Quản lý AMG Land",
    UserRole.editor: "Nhân viên tư vấn",
    UserRole.consultant: "Nhân viên tư vấn",
    UserRole.content: "Biên tập viên AMG Land",
    UserRole.customer: "Thành viên AMG Land",
    UserRole.viewer: "Thành viên AMG Land",
}


def author_payload(user: User | None) -> dict:
    if user is None:
        return {"id": None, "name": "Thành viên AMG Land", "role": "Thành viên AMG Land", "avatar": "AM"}
    initials = "".join(part[0] for part in user.full_name.split()[:2]).upper() or "AM"
    return {"id": user.id, "name": user.full_name, "role": ROLE_LABELS.get(user.role, "Thành viên AMG Land"), "avatar": initials[:2]}


def serialize_comment(comment: CommunityComment) -> dict:
    return {
        "id": comment.id,
        "author": author_payload(comment.author),
        "content": comment.content,
        "created_at": comment.created_at,
    }


def serialize_community_post(db: Session, post: CommunityPost, current_user: User | None = None) -> dict:
    liked = False
    bookmarked = False
    if current_user is not None:
        liked = db.get(CommunityPostLike, {"post_id": post.id, "user_id": current_user.id}) is not None
        bookmarked = db.get(CommunityPostBookmark, {"post_id": post.id, "user_id": current_user.id}) is not None
    return {
        "id": post.id,
        "author": author_payload(post.author),
        "title": post.title,
        "content": post.content,
        "category": post.category,
        "image_url": post.image_url,
        "created_at": post.created_at,
        "likes": db.scalar(select(func.count()).select_from(CommunityPostLike).where(CommunityPostLike.post_id == post.id)) or 0,
        "shares": post.shares,
        "liked": liked,
        "bookmarked": bookmarked,
        "comments": [serialize_comment(comment) for comment in sorted(post.comments, key=lambda item: item.created_at)],
    }


@router.get("/community/posts", response_model=CommunityPostPage, tags=["community"])
def list_community_posts(
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
    category: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
) -> dict:
    query = select(CommunityPost)
    if category:
        query = query.where(CommunityPost.category == category)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    posts = list(db.scalars(query.order_by(CommunityPost.created_at.desc()).offset((page - 1) * limit).limit(limit)))
    return page_response([serialize_community_post(db, post, current_user) for post in posts], total, page, limit)


@router.post("/community/posts", response_model=CommunityPostOut, status_code=201, tags=["community"])
def create_community_post(payload: CommunityPostCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    post = CommunityPost(
        author_id=current_user.id,
        title=payload.title.strip(),
        content=payload.content.strip(),
        category=payload.category.strip(),
        image_url=payload.image_url.strip() if payload.image_url else None,
    )
    db.add(post)
    commit_or_400(db)
    db.refresh(post)
    return serialize_community_post(db, post, current_user)


@router.post("/community/images", status_code=201, tags=["community"])
def upload_community_images(_: User = Depends(get_current_user), files: list[UploadFile] = File(...)) -> list[dict]:
    uploaded = []
    for file in files:
        stored = upload_community_image(file)
        uploaded.append({"image_url": stored.public_url})
    return uploaded


@router.post("/community/posts/{post_id}/comments", response_model=CommunityPostOut, tags=["community"])
def create_community_comment(post_id: uuid.UUID, payload: CommunityCommentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    post = db.get(CommunityPost, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Community post not found")
    comment = CommunityComment(post_id=post.id, author_id=current_user.id, content=payload.content.strip())
    db.add(comment)
    commit_or_400(db)
    db.refresh(post)
    return serialize_community_post(db, post, current_user)


@router.post("/community/posts/{post_id}/like", response_model=CommunityPostOut, tags=["community"])
def toggle_community_like(post_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    post = db.get(CommunityPost, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Community post not found")
    like = db.get(CommunityPostLike, {"post_id": post.id, "user_id": current_user.id})
    if like:
        db.delete(like)
    else:
        db.add(CommunityPostLike(post_id=post.id, user_id=current_user.id))
    commit_or_400(db)
    db.refresh(post)
    return serialize_community_post(db, post, current_user)


@router.post("/community/posts/{post_id}/bookmark", response_model=CommunityPostOut, tags=["community"])
def toggle_community_bookmark(post_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    post = db.get(CommunityPost, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Community post not found")
    bookmark = db.get(CommunityPostBookmark, {"post_id": post.id, "user_id": current_user.id})
    if bookmark:
        db.delete(bookmark)
    else:
        db.add(CommunityPostBookmark(post_id=post.id, user_id=current_user.id))
    commit_or_400(db)
    db.refresh(post)
    return serialize_community_post(db, post, current_user)


@router.post("/community/posts/{post_id}/share", response_model=CommunityPostOut, tags=["community"])
def share_community_post(post_id: uuid.UUID, db: Session = Depends(get_db), current_user: User | None = Depends(get_optional_current_user)) -> dict:
    post = db.get(CommunityPost, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Community post not found")
    post.shares += 1
    commit_or_400(db)
    db.refresh(post)
    return serialize_community_post(db, post, current_user)
