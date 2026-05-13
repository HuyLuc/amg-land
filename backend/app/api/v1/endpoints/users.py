from app.api.v1.common import *

router = APIRouter()


@router.get("/users", response_model=UserPage, tags=["users"])
def list_users(
    _: AdminUser,
    db: Session = Depends(get_db),
    role: UserRole | None = None,
    is_active: bool | None = None,
    keyword: str | None = Query(default=None, max_length=100),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
) -> dict:
    query = select(User).order_by(User.created_at.desc())
    if role:
        query = query.where(User.role == role)
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    if keyword:
        term = f"%{keyword.strip()}%"
        query = query.where(or_(User.full_name.ilike(term), User.email.ilike(term), User.phone.ilike(term)))
    total = db.scalar(select(func.count()).select_from(query.order_by(None).subquery()))
    items = list(db.scalars(query.offset((page - 1) * limit).limit(limit)))
    return page_response(items, total, page, limit)


@router.post("/users", response_model=UserOut, status_code=201, tags=["users"])
def create_user(payload: UserCreate, _: AdminUser, db: Session = Depends(get_db)) -> User:
    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        phone=payload.phone,
        role=payload.role,
    )
    db.add(user)
    log_activity(db, _, "users.create", "user", None, {"email": payload.email})
    commit_or_400(db)
    db.refresh(user)
    return user


@router.put("/users/{user_id}", response_model=UserOut, tags=["users"])
def update_user(user_id: uuid.UUID, payload: UserUpdate, current_user: AdminUser, db: Session = Depends(get_db)) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user_id == current_user.id and payload.is_active is False:
        raise HTTPException(status_code=400, detail="Cannot deactivate current user")
    if user_id == current_user.id and payload.role is not None and payload.role != UserRole.admin:
        raise HTTPException(status_code=400, detail="Cannot demote current admin")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    log_activity(db, current_user, "users.update", "user", user.id)
    commit_or_400(db)
    db.refresh(user)
    return user


@router.put("/users/{user_id}/password", response_model=dict, tags=["users"])
def update_user_password(user_id: uuid.UUID, payload: UserPasswordUpdate, current_user: AdminUser, db: Session = Depends(get_db)) -> dict:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.password_hash = hash_password(payload.password)
    user.failed_attempts = 0
    user.locked_until = None
    log_activity(db, current_user, "users.password_update", "user", user.id)
    db.commit()
    return {"message": "Password updated"}


@router.delete("/users/{user_id}", response_model=dict, tags=["users"])
def delete_user(user_id: uuid.UUID, current_user: AdminUser, db: Session = Depends(get_db)) -> dict:
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate current user")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    log_activity(db, current_user, "users.deactivate", "user", user.id)
    db.commit()
    return {"message": "Deleted"}
