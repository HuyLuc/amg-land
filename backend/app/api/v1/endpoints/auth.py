from app.api.v1.common import *

router = APIRouter()


@router.post("/auth/login", response_model=TokenResponse, tags=["auth"])
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email))
    now = datetime.now(timezone.utc)
    if user is not None and user.locked_until is not None and user.locked_until > now:
        raise HTTPException(status_code=423, detail="Account is temporarily locked")

    if user is None or not user.is_active or not verify_password(payload.password, user.password_hash):
        if user is not None and user.is_active:
            user.failed_attempts += 1
            if user.failed_attempts >= settings.max_failed_login_attempts:
                user.locked_until = now + timedelta(minutes=settings.account_lock_minutes)
            db.commit()
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user.failed_attempts = 0
    user.locked_until = None
    user.last_login = now
    refresh_plain = generate_opaque_token()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(refresh_plain),
            expires_at=now + timedelta(days=30),
            created_at=now,
        )
    )
    log_activity(db, user, "auth.login", "user", user.id)
    db.commit()
    access_token = create_access_token(str(user.id), {"role": user.role.value})
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_plain,
        user_info={"id": str(user.id), "email": user.email, "full_name": user.full_name, "role": user.role.value},
    )


@router.post("/auth/refresh", response_model=dict, tags=["auth"])
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)) -> dict:
    token = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_token(payload.refresh_token)))
    if token is None or token.revoked_at is not None or token.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = db.get(User, token.user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="Inactive or missing user")
    return {"access_token": create_access_token(str(user.id), {"role": user.role.value}), "token_type": "bearer"}


@router.post("/auth/logout", response_model=dict, tags=["auth"])
def logout(payload: LogoutRequest | None = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    if payload and payload.refresh_token:
        token = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_token(payload.refresh_token), RefreshToken.user_id == current_user.id))
        if token is not None:
            token.revoked_at = datetime.now(timezone.utc)
    log_activity(db, current_user, "auth.logout", "user", current_user.id)
    db.commit()
    return {"message": "Logged out"}


@router.post("/auth/forgot-password", response_model=dict, tags=["auth"])
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)) -> dict:
    user = db.scalar(select(User).where(User.email == payload.email))
    response = {"message": "If the email exists, a reset link will be sent"}
    if user is None:
        return response
    reset_plain = generate_opaque_token()
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=hash_token(reset_plain),
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
            created_at=datetime.now(timezone.utc),
        )
    )
    db.commit()
    if os.getenv("APP_ENV", "development") == "development":
        response["reset_token"] = reset_plain
    return response


@router.post("/auth/reset-password", response_model=dict, tags=["auth"])
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> dict:
    token = db.scalar(select(PasswordResetToken).where(PasswordResetToken.token_hash == hash_token(payload.token)))
    if token is None or token.used_at is not None or token.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid reset token")
    user = db.get(User, token.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.password_hash = hash_password(payload.new_password)
    token.used_at = datetime.now(timezone.utc)
    log_activity(db, user, "auth.reset_password", "user", user.id)
    db.commit()
    return {"message": "Password updated"}
