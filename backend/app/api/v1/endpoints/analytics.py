from app.api.v1.common import *

router = APIRouter()


@router.post("/analytics/events", response_model=dict, status_code=201, tags=["analytics"])
def create_analytics_event(payload: AnalyticsEventCreate, db: Session = Depends(get_db)) -> dict:
    if payload.project_id and db.get(Project, payload.project_id) is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if payload.apartment_id and db.get(Apartment, payload.apartment_id) is None:
        raise HTTPException(status_code=404, detail="Apartment not found")
    event = AnalyticsEvent(
        visitor_id=payload.visitor_id,
        session_id=payload.session_id,
        event_type=payload.event_type,
        project_id=payload.project_id,
        apartment_id=payload.apartment_id,
        path=payload.path,
        referrer=payload.referrer,
        metadata_=payload.metadata,
    )
    db.add(event)
    commit_or_400(db)
    db.refresh(event)
    return {"id": str(event.id), "created_at": event.created_at}
