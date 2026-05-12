from app.api.v1.common import *

router = APIRouter()


@router.post("/contacts", response_model=ContactOut, status_code=201, tags=["contacts"])
def create_contact(payload: ContactCreate, db: Session = Depends(get_db)) -> ContactRequest:
    values = payload.model_dump()
    if payload.apartment_id:
        apartment = db.get(Apartment, payload.apartment_id)
        if apartment is None:
            raise HTTPException(status_code=404, detail="Apartment not found")
        if payload.project_id and payload.project_id != apartment.project_id:
            raise HTTPException(status_code=400, detail="Apartment does not belong to selected project")
        values["project_id"] = apartment.project_id
    contact = ContactRequest(**values, status="new")
    db.add(contact)
    commit_or_400(db)
    db.refresh(contact)
    return contact


@router.get("/contacts", response_model=ContactPage, tags=["contacts"])
def list_contacts(
    _: StaffUser,
    db: Session = Depends(get_db),
    status: ContactStatus | None = None,
    keyword: str | None = None,
    assigned_to: uuid.UUID | None = None,
    project_id: uuid.UUID | None = None,
    apartment_id: uuid.UUID | None = None,
    created_from: datetime | None = None,
    created_to: datetime | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
) -> dict:
    query = select(ContactRequest)
    if status:
        query = query.where(ContactRequest.status == status)
    if assigned_to:
        query = query.where(ContactRequest.assigned_to == assigned_to)
    if project_id:
        query = query.where(ContactRequest.project_id == project_id)
    if apartment_id:
        query = query.where(ContactRequest.apartment_id == apartment_id)
    if created_from:
        query = query.where(ContactRequest.created_at >= created_from)
    if created_to:
        query = query.where(ContactRequest.created_at <= created_to)
    if keyword:
        pattern = f"%{keyword.strip()}%"
        query = query.where(
            or_(
                ContactRequest.full_name.ilike(pattern),
                ContactRequest.phone.ilike(pattern),
                ContactRequest.email.ilike(pattern),
                ContactRequest.message.ilike(pattern),
                ContactRequest.note.ilike(pattern),
            )
        )
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    items = list(db.scalars(query.order_by(ContactRequest.created_at.desc()).offset((page - 1) * limit).limit(limit)))
    return page_response(items, total, page, limit)


@router.patch("/contacts/{contact_id}", response_model=ContactOut, tags=["contacts"])
def update_contact(contact_id: uuid.UUID, payload: ContactUpdate, _: StaffUser, db: Session = Depends(get_db)) -> ContactRequest:
    contact = db.get(ContactRequest, contact_id)
    if contact is None:
        raise HTTPException(status_code=404, detail="Contact request not found")
    values = payload.model_dump(exclude_unset=True)
    if payload.apartment_id:
        apartment = db.get(Apartment, payload.apartment_id)
        if apartment is None:
            raise HTTPException(status_code=404, detail="Apartment not found")
        contact.project_id = apartment.project_id
    for key, value in values.items():
        setattr(contact, key, value)
    commit_or_400(db)
    db.refresh(contact)
    return contact
