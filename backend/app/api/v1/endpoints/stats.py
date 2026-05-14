from app.api.v1.common import *

router = APIRouter()


def count_scalar(db: Session, query) -> int:
    return db.scalar(query) or 0


@router.get("/stats/dashboard", response_model=dict, tags=["stats"])
def dashboard(_: AdminUser, db: Session = Depends(get_db), period: str = "week") -> dict:
    now = datetime.now(timezone.utc)
    period_start_by_name = {
        "day": now - timedelta(days=1),
        "week": now - timedelta(days=7),
        "month": now - timedelta(days=30),
        "all": None,
    }
    if period not in period_start_by_name:
        raise HTTPException(status_code=400, detail="period must be one of: day, week, month, all")

    period_start = period_start_by_name[period]
    event_filters = [AnalyticsEvent.event_type == "page_view"]
    contact_filters = []
    if period_start is not None:
        event_filters.append(AnalyticsEvent.created_at >= period_start)
        contact_filters.append(ContactRequest.created_at >= period_start)

    visits = db.scalar(select(func.count()).select_from(AnalyticsEvent).where(*event_filters)) or 0
    total_contacts = count_scalar(db, select(func.count()).select_from(ContactRequest).where(*contact_filters))
    new_contacts = count_scalar(db, select(func.count()).select_from(ContactRequest).where(*contact_filters, ContactRequest.status == ContactStatus.new))
    processing_contacts = count_scalar(db, select(func.count()).select_from(ContactRequest).where(*contact_filters, ContactRequest.status == ContactStatus.processing))
    done_contacts = count_scalar(db, select(func.count()).select_from(ContactRequest).where(*contact_filters, ContactRequest.status == ContactStatus.done))

    project_counts = {
        "total": count_scalar(db, select(func.count()).select_from(Project).where(Project.deleted_at.is_(None))),
        "active": count_scalar(db, select(func.count()).select_from(Project).where(Project.deleted_at.is_(None), Project.status == ProjectStatus.active)),
        "draft": count_scalar(db, select(func.count()).select_from(Project).where(Project.deleted_at.is_(None), Project.status == ProjectStatus.draft)),
        "closed": count_scalar(db, select(func.count()).select_from(Project).where(Project.deleted_at.is_(None), Project.status == ProjectStatus.closed)),
    }
    apartment_counts = {
        "total": count_scalar(db, select(func.count()).select_from(Apartment)),
        "available": count_scalar(db, select(func.count()).select_from(Apartment).where(Apartment.status == ApartmentStatus.available)),
        "reserved": count_scalar(db, select(func.count()).select_from(Apartment).where(Apartment.status == ApartmentStatus.reserved)),
        "sold": count_scalar(db, select(func.count()).select_from(Apartment).where(Apartment.status == ApartmentStatus.sold)),
    }
    post_counts = {
        "total": count_scalar(db, select(func.count()).select_from(Post)),
        "published": count_scalar(db, select(func.count()).select_from(Post).where(Post.status == PostStatus.published)),
        "draft": count_scalar(db, select(func.count()).select_from(Post).where(Post.status == PostStatus.draft)),
        "archived": count_scalar(db, select(func.count()).select_from(Post).where(Post.status == PostStatus.archived)),
    }

    lead_days = 7 if period in {"day", "week"} else 30
    lead_start = now - timedelta(days=lead_days - 1)
    lead_rows = db.execute(
        select(func.date(ContactRequest.created_at).label("day"), ContactRequest.status, func.count(ContactRequest.id))
        .where(ContactRequest.created_at >= lead_start)
        .group_by(func.date(ContactRequest.created_at), ContactRequest.status)
        .order_by(func.date(ContactRequest.created_at))
    ).all()
    lead_bucket: dict[str, dict[str, int]] = {}
    for row in lead_rows:
        key = row.day.isoformat()
        lead_bucket.setdefault(key, {"new": 0, "processing": 0, "done": 0})
        lead_bucket[key][row.status.value if hasattr(row.status, "value") else str(row.status)] = row[2]
    lead_series = []
    for index in range(lead_days):
        day = (lead_start + timedelta(days=index)).date().isoformat()
        values = lead_bucket.get(day, {"new": 0, "processing": 0, "done": 0})
        lead_series.append({"date": day, "total": values["new"] + values["processing"] + values["done"], **values})

    top_project_query = (
        select(Project.id, Project.name, func.count(AnalyticsEvent.id).label("views"))
        .join(AnalyticsEvent, AnalyticsEvent.project_id == Project.id)
        .where(*event_filters)
        .group_by(Project.id, Project.name)
        .order_by(func.count(AnalyticsEvent.id).desc())
        .limit(5)
    )
    top_apartment_query = (
        select(Apartment.id, Apartment.code, Project.name.label("project_name"), func.count(AnalyticsEvent.id).label("views"))
        .join(AnalyticsEvent, AnalyticsEvent.apartment_id == Apartment.id)
        .join(Project, Project.id == Apartment.project_id)
        .where(*event_filters)
        .group_by(Apartment.id, Apartment.code, Project.name)
        .order_by(func.count(AnalyticsEvent.id).desc())
        .limit(5)
    )
    top_projects = db.execute(top_project_query).all()
    top_apartments = db.execute(top_apartment_query).all()
    recent_contacts = db.execute(
        select(ContactRequest, Project.name.label("project_name"), Apartment.code.label("apartment_code"))
        .outerjoin(Project, Project.id == ContactRequest.project_id)
        .outerjoin(Apartment, Apartment.id == ContactRequest.apartment_id)
        .where(ContactRequest.status == ContactStatus.new)
        .order_by(ContactRequest.created_at.desc())
        .limit(5)
    ).all()
    projects_without_images = count_scalar(
        db,
        select(func.count()).select_from(Project).where(
            Project.deleted_at.is_(None),
            ~select(ProjectImage.id).where(ProjectImage.project_id == Project.id).exists(),
        ),
    )
    apartments_without_media = count_scalar(
        db,
        select(func.count()).select_from(Apartment).where(
            ~select(ApartmentMedia.id).where(ApartmentMedia.apartment_id == Apartment.id).exists(),
        ),
    )
    draft_posts_without_links = count_scalar(
        db,
        select(func.count()).select_from(Post).where(Post.status == PostStatus.draft, Post.project_id.is_(None), Post.apartment_id.is_(None)),
    )
    work_items = [
        {"label": "Lead mới cần xử lý", "value": new_contacts, "tone": "urgent" if new_contacts else "ok"},
        {"label": "Dự án chưa có ảnh", "value": projects_without_images, "tone": "warning" if projects_without_images else "ok"},
        {"label": "Căn hộ chưa có media", "value": apartments_without_media, "tone": "warning" if apartments_without_media else "ok"},
        {"label": "Bài nháp chưa gắn dự án/căn hộ", "value": draft_posts_without_links, "tone": "warning" if draft_posts_without_links else "ok"},
    ]

    return {
        "period": period,
        "visits": visits,
        "new_contacts": new_contacts,
        "total_contacts": total_contacts,
        "project_counts": project_counts,
        "apartment_counts": apartment_counts,
        "contact_counts": {"new": new_contacts, "processing": processing_contacts, "done": done_contacts},
        "post_counts": post_counts,
        "lead_series": lead_series,
        "top_projects": [{"id": str(row.id), "name": row.name, "views": row.views} for row in top_projects],
        "top_apartments": [{"id": str(row.id), "code": row.code, "project_name": row.project_name, "views": row.views} for row in top_apartments],
        "recent_contacts": [
            {
                "id": str(contact.id),
                "full_name": contact.full_name,
                "phone": contact.phone,
                "status": contact.status.value,
                "project_name": row.project_name,
                "apartment_code": row.apartment_code,
                "created_at": contact.created_at.isoformat(),
            }
            for row in recent_contacts
            for contact in [row[0]]
        ],
        "work_items": work_items,
    }
