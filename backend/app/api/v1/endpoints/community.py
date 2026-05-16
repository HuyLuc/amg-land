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


def serialize_comment(comment: CommunityComment, replies_by_parent: dict[uuid.UUID, list[CommunityComment]]) -> dict:
    return {
        "id": comment.id,
        "parent_id": comment.parent_id,
        "author": author_payload(comment.author),
        "content": comment.content,
        "created_at": comment.created_at,
        "replies": [serialize_comment(reply, replies_by_parent) for reply in replies_by_parent.get(comment.id, [])],
    }


def serialize_community_post(db: Session, post: CommunityPost, current_user: User | None = None) -> dict:
    liked = False
    bookmarked = False
    if current_user is not None:
        liked = db.get(CommunityPostLike, {"post_id": post.id, "user_id": current_user.id}) is not None
        bookmarked = db.get(CommunityPostBookmark, {"post_id": post.id, "user_id": current_user.id}) is not None
    images = list(post.images or [])
    if not images and post.image_url:
        images = [post.image_url]
    ordered_comments = sorted(post.comments, key=lambda item: item.created_at)
    replies_by_parent: dict[uuid.UUID, list[CommunityComment]] = {}
    root_comments: list[CommunityComment] = []
    comment_ids = {comment.id for comment in ordered_comments}
    for comment in ordered_comments:
        if comment.parent_id and comment.parent_id in comment_ids:
            replies_by_parent.setdefault(comment.parent_id, []).append(comment)
        else:
            root_comments.append(comment)
    return {
        "id": post.id,
        "author": author_payload(post.author),
        "title": post.title,
        "content": post.content,
        "category": post.category,
        "image_url": post.image_url,
        "images": images,
        "created_at": post.created_at,
        "likes": db.scalar(select(func.count()).select_from(CommunityPostLike).where(CommunityPostLike.post_id == post.id)) or 0,
        "shares": post.shares,
        "liked": liked,
        "bookmarked": bookmarked,
        "comments": [serialize_comment(comment, replies_by_parent) for comment in root_comments],
    }


def ensure_can_manage_community_post(post: CommunityPost, current_user: User) -> None:
    if current_user.role == UserRole.admin:
        return
    if post.author_id == current_user.id:
        return
    raise HTTPException(status_code=403, detail="You can only manage your own community posts")


def ensure_can_delete_community_comment(comment: CommunityComment, current_user: User) -> None:
    if current_user.role == UserRole.admin:
        return
    if comment.author_id == current_user.id:
        return
    raise HTTPException(status_code=403, detail="You can only delete your own comments")


@router.get("/community/posts", response_model=CommunityPostPage, tags=["community"])
def list_community_posts(
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
    category: str | None = None,
    mine: bool = False,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
) -> dict:
    query = select(CommunityPost)
    if category:
        query = query.where(CommunityPost.category == category)
    if mine:
        if current_user is None:
            raise HTTPException(status_code=401, detail="Not authenticated")
        query = query.where(CommunityPost.author_id == current_user.id)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    posts = list(db.scalars(query.order_by(CommunityPost.created_at.desc()).offset((page - 1) * limit).limit(limit)))
    return page_response([serialize_community_post(db, post, current_user) for post in posts], total, page, limit)


@router.post("/community/posts", response_model=CommunityPostOut, status_code=201, tags=["community"])
def create_community_post(payload: CommunityPostCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    images = [image.strip() for image in payload.images if image.strip()]
    if not images and payload.image_url:
        images = [payload.image_url.strip()]
    post = CommunityPost(
        author_id=current_user.id,
        title=payload.title.strip(),
        content=payload.content.strip(),
        category=payload.category.strip(),
        image_url=images[0] if images else None,
        images=images,
    )
    db.add(post)
    commit_or_400(db)
    db.refresh(post)
    return serialize_community_post(db, post, current_user)


@router.patch("/community/posts/{post_id}", response_model=CommunityPostOut, tags=["community"])
def update_community_post(post_id: uuid.UUID, payload: CommunityPostUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    post = db.get(CommunityPost, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Community post not found")
    ensure_can_manage_community_post(post, current_user)

    values = payload.model_dump(exclude_unset=True)
    if "images" in values and values["images"] is not None:
        values["images"] = [image.strip() for image in values["images"] if image.strip()]
        values["image_url"] = values["images"][0] if values["images"] else None
    elif "image_url" in values:
        image_url = values["image_url"].strip() if values["image_url"] else None
        values["image_url"] = image_url
        values["images"] = [image_url] if image_url else []
    for key, value in values.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(post, key, value)

    commit_or_400(db)
    db.refresh(post)
    return serialize_community_post(db, post, current_user)


@router.delete("/community/posts/{post_id}", response_model=dict, tags=["community"])
def delete_community_post(post_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    post = db.get(CommunityPost, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Community post not found")
    ensure_can_manage_community_post(post, current_user)

    db.delete(post)
    db.commit()
    return {"message": "Deleted"}


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
    parent_comment = None
    if payload.parent_id is not None:
        parent_comment = db.get(CommunityComment, payload.parent_id)
        if parent_comment is None or parent_comment.post_id != post.id:
            raise HTTPException(status_code=400, detail="Parent comment not found in this post")
    comment = CommunityComment(
        post_id=post.id,
        author_id=current_user.id,
        parent_id=parent_comment.id if parent_comment is not None else None,
        content=payload.content.strip(),
    )
    db.add(comment)
    commit_or_400(db)
    db.refresh(post)
    return serialize_community_post(db, post, current_user)


@router.delete("/community/posts/{post_id}/comments/{comment_id}", response_model=CommunityPostOut, tags=["community"])
def delete_community_comment(post_id: uuid.UUID, comment_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    post = db.get(CommunityPost, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Community post not found")

    comment = db.get(CommunityComment, comment_id)
    if comment is None or comment.post_id != post.id:
        raise HTTPException(status_code=404, detail="Community comment not found")

    ensure_can_delete_community_comment(comment, current_user)
    db.delete(comment)
    db.commit()
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
