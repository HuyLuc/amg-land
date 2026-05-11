from app.api.v1.common import *
from app.api.v1.endpoints.search import FENG_SHUI_DIRECTIONS, element_from_birth_date, feng_shui_search

router = APIRouter()


@router.post("/chat/message", response_model=dict, tags=["chat"])
def chat_message(payload: ChatMessageRequest, db: Session = Depends(get_db)) -> dict:
    session_id = payload.session_id or str(uuid.uuid4())
    session = db.scalar(select(ChatSession).where(ChatSession.session_id == session_id))
    messages = [{"role": "user", "content": payload.message, "ts": datetime.now(timezone.utc).isoformat()}]
    reply = "Cam on ban da lien he AMG Land. Hien tai bot dang o che do fallback, vui long de lai thong tin tu van."
    messages.append({"role": "assistant", "content": reply, "ts": datetime.now(timezone.utc).isoformat()})
    if session is None:
        session = ChatSession(session_id=session_id, user_info=payload.user_info, messages=messages)
        db.add(session)
    else:
        session.messages = [*session.messages, *messages]
    db.commit()
    return {"reply": reply, "suggested_apartments": [], "session_id": session_id}


@router.get("/chat/{session_id}", response_model=dict, tags=["chat"])
def get_chat(session_id: str, db: Session = Depends(get_db)) -> dict:
    session = db.scalar(select(ChatSession).where(ChatSession.session_id == session_id))
    if session is None:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return {"messages": session.messages, "created_at": session.created_at}


@router.post("/chat/feng-shui", response_model=dict, tags=["chat"])
def chat_feng_shui(payload: FengShuiRequest, db: Session = Depends(get_db)) -> dict:
    element = element_from_birth_date(payload.birth_date)
    suggestions = feng_shui_search(payload.birth_date, db, payload.budget, payload.district)[:5]
    return {"element": element, "compatible_directions": FENG_SHUI_DIRECTIONS[element], "suggested_apartments": suggestions}
