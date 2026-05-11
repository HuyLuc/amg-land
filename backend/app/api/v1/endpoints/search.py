from app.api.v1.common import *

router = APIRouter()


@router.get("/search", response_model=dict, tags=["search"])
def search_apartments(
    db: Session = Depends(get_db),
    district: str | None = None,
    price_min: int | None = None,
    price_max: int | None = None,
    area_min: float | None = None,
    area_max: float | None = None,
    bedrooms: int | None = None,
    direction: Direction | None = None,
    status: ApartmentStatus | None = None,
    sort: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
) -> dict:
    query = select(Apartment).join(Project).where(Project.deleted_at.is_(None), Project.status == "active")
    filters = []
    if district:
        filters.append(Project.district.ilike(f"%{district}%"))
    if price_min is not None:
        filters.append(Apartment.price >= price_min)
    if price_max is not None:
        filters.append(Apartment.price <= price_max)
    if area_min is not None:
        filters.append(Apartment.area >= area_min)
    if area_max is not None:
        filters.append(Apartment.area <= area_max)
    if bedrooms is not None:
        filters.append(Apartment.bedrooms == bedrooms)
    if direction:
        filters.append(Apartment.direction == direction)
    if status:
        filters.append(Apartment.status == status)
    if filters:
        query = query.where(and_(*filters))
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    if sort == "price_desc":
        query = query.order_by(Apartment.price.desc())
    elif sort == "area_asc":
        query = query.order_by(Apartment.area.asc())
    elif sort == "area_desc":
        query = query.order_by(Apartment.area.desc())
    else:
        query = query.order_by(Apartment.price.asc())
    items = list(db.scalars(query.offset((page - 1) * limit).limit(limit)))
    return {"items": [ApartmentOut.model_validate(item).model_dump(mode="json") for item in items], "total": total or 0, "page": page, "limit": limit}


FENG_SHUI_DIRECTIONS = {
    "Kim": ["W", "NW", "SW"],
    "Moc": ["E", "SE", "S"],
    "Thuy": ["N", "E", "SE"],
    "Hoa": ["S", "E", "SE"],
    "Tho": ["SW", "NE", "W", "NW"],
}


def element_from_birth_date(birth_date: str) -> str:
    year = int(birth_date[:4])
    return ["Kim", "Thuy", "Hoa", "Tho", "Moc"][year % 5]


@router.get("/search/feng-shui", response_model=list[dict], tags=["search"])
def feng_shui_search(birth_date: str, db: Session = Depends(get_db), budget_max: int | None = None, district: str | None = None) -> list[dict]:
    element = element_from_birth_date(birth_date)
    directions = FENG_SHUI_DIRECTIONS[element]
    query = select(Apartment).join(Project).where(Apartment.direction.in_(directions), Project.status == "active", Project.deleted_at.is_(None))
    if budget_max:
        query = query.where(Apartment.price <= budget_max)
    if district:
        query = query.where(Project.district.ilike(f"%{district}%"))
    items = list(db.scalars(query.limit(10)))
    return [{"apartment": ApartmentOut.model_validate(item).model_dump(mode="json"), "score": 90, "reason": f"Hop menh {element}"} for item in items]
