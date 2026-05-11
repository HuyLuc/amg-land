from app.api.v1.common import *

router = APIRouter()


@router.get("/projects/{project_id}/apartments", response_model=ApartmentPage, tags=["apartments"])
def list_project_apartments(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    floor: int | None = None,
    bedrooms: int | None = None,
    direction: Direction | None = None,
    status: ApartmentStatus | None = None,
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
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    items = list(db.scalars(query.order_by(Apartment.floor, Apartment.code).offset((page - 1) * limit).limit(limit)))
    return page_response(items, total, page, limit)


@router.get("/apartments/{apartment_id}", response_model=ApartmentOut, tags=["apartments"])
def get_apartment(apartment_id: uuid.UUID, db: Session = Depends(get_db)) -> Apartment:
    apartment = db.get(Apartment, apartment_id)
    if apartment is None:
        raise HTTPException(status_code=404, detail="Apartment not found")
    return apartment


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
