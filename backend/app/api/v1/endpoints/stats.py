from app.api.v1.common import *

router = APIRouter()


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
    contact_filters = [ContactRequest.status == "new"]
    if period_start is not None:
        event_filters.append(AnalyticsEvent.created_at >= period_start)
        contact_filters.append(ContactRequest.created_at >= period_start)

    visits = db.scalar(select(func.count()).select_from(AnalyticsEvent).where(*event_filters)) or 0
    top_project_query = (
        select(Project.id, Project.name, func.count(AnalyticsEvent.id).label("views"))
        .join(AnalyticsEvent, AnalyticsEvent.project_id == Project.id)
        .where(*event_filters)
        .group_by(Project.id, Project.name)
        .order_by(func.count(AnalyticsEvent.id).desc())
        .limit(5)
    )
    top_apartment_query = (
        select(Apartment.id, Apartment.code, func.count(AnalyticsEvent.id).label("views"))
        .join(AnalyticsEvent, AnalyticsEvent.apartment_id == Apartment.id)
        .where(*event_filters)
        .group_by(Apartment.id, Apartment.code)
        .order_by(func.count(AnalyticsEvent.id).desc())
        .limit(5)
    )
    top_projects = db.execute(
        top_project_query
    ).all()
    top_apartments = db.execute(
        top_apartment_query
    ).all()
    return {
        "period": period,
        "visits": visits,
        "new_contacts": db.scalar(select(func.count()).select_from(ContactRequest).where(*contact_filters)) or 0,
        "top_projects": [{"id": str(row.id), "name": row.name, "views": row.views} for row in top_projects],
        "top_apartments": [{"id": str(row.id), "code": row.code, "views": row.views} for row in top_apartments],
    }
