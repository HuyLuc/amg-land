from app.api.v1.common import *

router = APIRouter()


@router.get("/amenities", response_model=list[AmenityOut], tags=["amenities"])
def list_amenities(db: Session = Depends(get_db)) -> list[Amenity]:
    return list(db.scalars(select(Amenity).order_by(Amenity.name)))


@router.post("/amenities", response_model=AmenityOut, status_code=201, tags=["amenities"])
def create_amenity(payload: AmenityCreate, _: AdminUser, db: Session = Depends(get_db)) -> Amenity:
    amenity = Amenity(**payload.model_dump())
    db.add(amenity)
    commit_or_400(db)
    db.refresh(amenity)
    return amenity


@router.put("/amenities/{amenity_id}", response_model=AmenityOut, tags=["amenities"])
def update_amenity(amenity_id: uuid.UUID, payload: AmenityUpdate, _: AdminUser, db: Session = Depends(get_db)) -> Amenity:
    amenity = db.get(Amenity, amenity_id)
    if amenity is None:
        raise HTTPException(status_code=404, detail="Amenity not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(amenity, key, value)
    commit_or_400(db)
    db.refresh(amenity)
    return amenity


@router.delete("/amenities/{amenity_id}", response_model=dict, tags=["amenities"])
def delete_amenity(amenity_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)) -> dict:
    amenity = db.get(Amenity, amenity_id)
    if amenity is None:
        raise HTTPException(status_code=404, detail="Amenity not found")
    for link in db.scalars(select(ProjectAmenity).where(ProjectAmenity.amenity_id == amenity_id)):
        db.delete(link)
    db.delete(amenity)
    db.commit()
    return {"message": "Deleted"}
