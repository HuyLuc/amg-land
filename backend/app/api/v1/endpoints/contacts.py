from app.api.v1.common import *

router = APIRouter()


@router.post("/contacts", response_model=ContactOut, status_code=201, tags=["contacts"])
def create_contact(payload: ContactCreate, db: Session = Depends(get_db)) -> ContactRequest:
    contact = ContactRequest(**payload.model_dump(), status="new")
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
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(contact, key, value)
    commit_or_400(db)
    db.refresh(contact)
    return contact
