from app.api.v1.common import *

router = APIRouter()


@router.get("/apartments", response_model=ApartmentPage, tags=["apartments"])
def list_apartments(
    db: Session = Depends(get_db),
    project_id: uuid.UUID | None = None,
    floor: int | None = None,
    bedrooms: int | None = None,
    direction: Direction | None = None,
    status: ApartmentStatus | None = None,
    price_min: int | None = Query(default=None, ge=0),
    price_max: int | None = Query(default=None, ge=0),
    area_min: float | None = Query(default=None, ge=0),
    area_max: float | None = Query(default=None, ge=0),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
) -> dict:
    query = select(Apartment).join(Project).where(Project.deleted_at.is_(None))
    if project_id:
        query = query.where(Apartment.project_id == project_id)
    if floor is not None:
        query = query.where(Apartment.floor == floor)
    if bedrooms is not None:
        query = query.where(Apartment.bedrooms == bedrooms)
    if direction:
        query = query.where(Apartment.direction == direction)
    if status:
        query = query.where(Apartment.status == status)
    if price_min is not None:
        query = query.where(Apartment.price >= price_min)
    if price_max is not None:
        query = query.where(Apartment.price <= price_max)
    if area_min is not None:
        query = query.where(Apartment.area >= area_min)
    if area_max is not None:
        query = query.where(Apartment.area <= area_max)
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    items = list(db.scalars(query.order_by(Apartment.project_id, Apartment.floor, Apartment.code).offset((page - 1) * limit).limit(limit)))
    return page_response(items, total, page, limit)


@router.get("/projects/{project_id}/apartments", response_model=ApartmentPage, tags=["apartments"])
def list_project_apartments(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    floor: int | None = None,
    bedrooms: int | None = None,
    direction: Direction | None = None,
    status: ApartmentStatus | None = None,
    price_min: int | None = Query(default=None, ge=0),
    price_max: int | None = Query(default=None, ge=0),
    area_min: float | None = Query(default=None, ge=0),
    area_max: float | None = Query(default=None, ge=0),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
) -> dict:
    get_project_or_404(db, project_id)
    query = select(Apartment).where(Apartment.project_id == project_id)
    if floor is not None:
        query = query.where(Apartment.floor == floor)
    if bedrooms is not None:
        query = query.where(Apartment.bedrooms == bedrooms)
    if direction:
        query = query.where(Apartment.direction == direction)
    if status:
        query = query.where(Apartment.status == status)
    if price_min is not None:
        query = query.where(Apartment.price >= price_min)
    if price_max is not None:
        query = query.where(Apartment.price <= price_max)
    if area_min is not None:
        query = query.where(Apartment.area >= area_min)
    if area_max is not None:
        query = query.where(Apartment.area <= area_max)
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    items = list(db.scalars(query.order_by(Apartment.floor, Apartment.code).offset((page - 1) * limit).limit(limit)))
    return page_response(items, total, page, limit)


@router.get("/apartments/{apartment_id}", response_model=ApartmentOut, tags=["apartments"])
def get_apartment(apartment_id: uuid.UUID, db: Session = Depends(get_db)) -> Apartment:
    apartment = db.get(Apartment, apartment_id)
    if apartment is None:
        raise HTTPException(status_code=404, detail="Apartment not found")
    return apartment


@router.get("/apartments/{apartment_id}/media", response_model=list[ApartmentMediaOut], tags=["apartments"])
def list_apartment_media(apartment_id: uuid.UUID, db: Session = Depends(get_db)) -> list[ApartmentMedia]:
    if db.get(Apartment, apartment_id) is None:
        raise HTTPException(status_code=404, detail="Apartment not found")
    return list(db.scalars(select(ApartmentMedia).where(ApartmentMedia.apartment_id == apartment_id).order_by(ApartmentMedia.sort_order, ApartmentMedia.id)))


@router.post("/apartments/{apartment_id}/media", response_model=ApartmentMediaOut, status_code=201, tags=["apartments"])
def upload_apartment_media_item(
    apartment_id: uuid.UUID,
    current_user: StaffUser,
    db: Session = Depends(get_db),
    media_type: ApartmentMediaType = Form(...),
    caption: str | None = Form(default=None),
    file: UploadFile = File(...),
) -> ApartmentMedia:
    if db.get(Apartment, apartment_id) is None:
        raise HTTPException(status_code=404, detail="Apartment not found")

    stored = upload_apartment_media(apartment_id, file, media_type.value)
    is_thumbnail = False
    if media_type == ApartmentMediaType.image:
        is_thumbnail = db.scalar(
            select(func.count()).select_from(ApartmentMedia).where(ApartmentMedia.apartment_id == apartment_id, ApartmentMedia.media_type == ApartmentMediaType.image)
        ) == 0
    sort_order = db.scalar(select(func.count()).select_from(ApartmentMedia).where(ApartmentMedia.apartment_id == apartment_id)) or 0
    media = ApartmentMedia(apartment_id=apartment_id, media_type=media_type, url=stored.public_url, caption=caption, sort_order=sort_order, is_thumbnail=is_thumbnail)
    db.add(media)
    log_activity(db, current_user, "apartments.media.upload", "apartment", apartment_id, {"media_type": media_type.value})
    commit_or_400(db)
    db.refresh(media)
    return media


@router.put("/apartment-media/{media_id}", response_model=ApartmentMediaOut, tags=["apartments"])
def update_apartment_media_item(media_id: uuid.UUID, payload: ApartmentMediaUpdate, current_user: StaffUser, db: Session = Depends(get_db)) -> ApartmentMedia:
    media = db.get(ApartmentMedia, media_id)
    if media is None:
        raise HTTPException(status_code=404, detail="Apartment media not found")

    values = payload.model_dump(exclude_unset=True)
    if values.get("is_thumbnail") is True:
        if media.media_type != ApartmentMediaType.image:
            raise HTTPException(status_code=400, detail="Only images can be used as thumbnail")
        for item in db.scalars(select(ApartmentMedia).where(ApartmentMedia.apartment_id == media.apartment_id, ApartmentMedia.media_type == ApartmentMediaType.image, ApartmentMedia.id != media.id)):
            item.is_thumbnail = False

    for key, value in values.items():
        setattr(media, key, value)
    log_activity(db, current_user, "apartments.media.update", "apartment", media.apartment_id, {"media_id": str(media.id)})
    commit_or_400(db)
    db.refresh(media)
    return media


@router.delete("/apartment-media/{media_id}", response_model=dict, tags=["apartments"])
def delete_apartment_media_item(media_id: uuid.UUID, current_user: StaffUser, db: Session = Depends(get_db)) -> dict:
    media = db.get(ApartmentMedia, media_id)
    if media is None:
        raise HTTPException(status_code=404, detail="Apartment media not found")
    apartment_id = media.apartment_id
    media_url = media.url
    db.delete(media)
    log_activity(db, current_user, "apartments.media.delete", "apartment", apartment_id, {"media_id": str(media_id)})
    db.commit()
    delete_public_object(media_url)
    return {"message": "Deleted"}


@router.post("/apartments", response_model=ApartmentOut, status_code=201, tags=["apartments"])
def create_apartment(payload: ApartmentCreate, _: StaffUser, db: Session = Depends(get_db)) -> Apartment:
    get_project_or_404(db, payload.project_id)
    apartment = Apartment(**payload.model_dump())
    db.add(apartment)
    commit_or_400(db)
    db.refresh(apartment)
    return apartment


@router.put("/apartments/{apartment_id}", response_model=ApartmentOut, tags=["apartments"])
def update_apartment(apartment_id: uuid.UUID, payload: ApartmentUpdate, _: StaffUser, db: Session = Depends(get_db)) -> Apartment:
    apartment = db.get(Apartment, apartment_id)
    if apartment is None:
        raise HTTPException(status_code=404, detail="Apartment not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(apartment, key, value)
    commit_or_400(db)
    db.refresh(apartment)
    return apartment


@router.delete("/apartments/{apartment_id}", response_model=dict, tags=["apartments"])
def delete_apartment(apartment_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)) -> dict:
    apartment = db.get(Apartment, apartment_id)
    if apartment is None:
        raise HTTPException(status_code=404, detail="Apartment not found")
    db.delete(apartment)
    db.commit()
    return {"message": "Deleted"}
