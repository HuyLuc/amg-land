from app.api.v1.common import *

router = APIRouter()


@router.get("/amenities", response_model=list[AmenityOut], tags=["amenities"])
def list_amenities(db: Session = Depends(get_db)) -> list[Amenity]:
    return list(db.scalars(select(Amenity).order_by(Amenity.name)))


@router.post("/amenities", response_model=AmenityOut, status_code=201, tags=["amenities"])
def create_amenity(payload: AmenityCreate, _: StaffUser, db: Session = Depends(get_db)) -> Amenity:
    amenity = Amenity(**payload.model_dump())
    db.add(amenity)
    commit_or_400(db)
    db.refresh(amenity)
    return amenity
