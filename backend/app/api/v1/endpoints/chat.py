from app.api.v1.common import *
from app.api.v1.endpoints.search import FENG_SHUI_DIRECTIONS, element_from_birth_date, feng_shui_search
import re
import unicodedata

router = APIRouter()

HOTLINE = settings.support_hotline
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
REAL_ESTATE_KEYWORDS = {
    "bat dong san", "nha dat", "can ho", "chung cu", "du an", "phong ngu", "gia", "ngan sach",
    "ha noi", "quan", "huyen", "phong thuy", "huong", "mua nha", "ban giao", "mat bang", "dau tu",
    "lai suat", "vay mua nha", "tu van", "xem nha", "amenity", "tien ich",
}
DEEP_CONSULT_KEYWORDS = {
    "phap ly", "hop dong", "thue", "sang ten", "vay", "ngan hang", "tra gop", "dau tu sau",
    "phan tich tai chinh", "dong tien", "so huu", "tranh chap", "kiem tra phap ly",
}
GREETING_KEYWORDS = {"xin chao", "chao", "hello", "hi", "alo"}
OUT_OF_SCOPE_KEYWORDS = {
    "mat khau", "tai khoan", "dang nhap", "dang ky", "otp", "ma xac minh", "email", "facebook",
    "youtube", "game", "thoi tiet", "bong da", "lap trinh", "python", "java", "tai lieu hoc",
}


def normalize_text(value: str) -> str:
    ascii_text = unicodedata.normalize("NFD", value.lower())
    ascii_text = "".join(char for char in ascii_text if unicodedata.category(char) != "Mn")
    return re.sub(r"\s+", " ", ascii_text).strip()


def needs_deep_consultation(message: str) -> bool:
    normalized = normalize_text(message)
    return any(keyword in normalized for keyword in DEEP_CONSULT_KEYWORDS)


def contains_phrase(message: str, phrase: str) -> bool:
    return re.search(rf"(?<!\w){re.escape(phrase)}(?!\w)", message) is not None


def is_out_of_scope_question(message: str) -> bool:
    normalized = normalize_text(message)
    return any(contains_phrase(normalized, keyword) for keyword in OUT_OF_SCOPE_KEYWORDS)


def is_real_estate_question(message: str) -> bool:
    normalized = normalize_text(message)
    if is_out_of_scope_question(message):
        return False
    if any(contains_phrase(normalized, keyword) for keyword in REAL_ESTATE_KEYWORDS | GREETING_KEYWORDS):
        return True
    if extract_bedrooms(normalized) is not None:
        return True
    if extract_budget_max(normalized) is not None:
        return True
    if re.search(r"\bcan\b", normalized) or re.search(r"\bphong\b", normalized):
        return True
    return False


def extract_bedrooms(message: str) -> int | None:
    normalized = normalize_text(message)
    match = re.search(r"(\d+)\s*(phong ngu|pn)", normalized)
    if match:
        return int(match.group(1))
    return None


def extract_birth_date(message: str) -> str | None:
    normalized = normalize_text(message)
    year_first = re.search(r"(20\d{2}|19\d{2})[-/](\d{1,2})[-/](\d{1,2})", normalized)
    if year_first:
        return f"{year_first.group(1)}-{int(year_first.group(2)):02d}-{int(year_first.group(3)):02d}"
    day_first = re.search(r"(\d{1,2})[-/](\d{1,2})[-/](20\d{2}|19\d{2})", normalized)
    if day_first:
        return f"{day_first.group(3)}-{int(day_first.group(2)):02d}-{int(day_first.group(1)):02d}"
    return None


def extract_budget_max(message: str) -> int | None:
    normalized = normalize_text(message)
    ty_match = re.search(r"(\d+(?:[.,]\d+)?)\s*(ty|ti)", normalized)
    if ty_match:
        return int(float(ty_match.group(1).replace(",", ".")) * 1_000_000_000)
    trieu_match = re.search(r"(\d+)\s*trieu", normalized)
    if trieu_match:
        return int(trieu_match.group(1)) * 1_000_000
    return None


def extract_district(message: str, db: Session) -> str | None:
    normalized = normalize_text(message)
    districts = db.scalars(select(Project.district).distinct()).all()
    for district in districts:
        if district and normalize_text(district) in normalized:
            return district
    if "ha noi" in normalized:
        return "Hà Nội"
    return None


def serialize_suggested_apartment(apartment: Apartment, project: Project) -> dict:
    return {
        "id": str(apartment.id),
        "project_id": str(project.id),
        "project_name": project.name,
        "project_slug": project.slug,
        "district": project.district,
        "city": project.city,
        "code": apartment.code,
        "bedrooms": apartment.bedrooms,
        "area": float(apartment.area),
        "price": apartment.price,
        "direction": apartment.direction.value,
        "feng_shui_element": apartment.feng_shui_element,
    }


def serialize_feng_shui_suggestion(apartment_data: dict, db: Session) -> dict:
    project = db.get(Project, apartment_data["project_id"])
    return {
        "id": apartment_data["id"],
        "project_id": apartment_data["project_id"],
        "project_name": project.name if project is not None else "Dự án AMG Land",
        "project_slug": project.slug if project is not None else "",
        "district": project.district if project is not None else "",
        "city": project.city if project is not None else "",
        "code": apartment_data["code"],
        "bedrooms": apartment_data["bedrooms"],
        "area": float(apartment_data["area"]),
        "price": apartment_data["price"],
        "direction": apartment_data["direction"],
        "feng_shui_element": apartment_data.get("feng_shui_element"),
    }


def build_inventory_context(db: Session) -> str:
    rows = db.execute(
        select(Apartment, Project)
        .join(Project, Apartment.project_id == Project.id)
        .where(
            Apartment.status == ApartmentStatus.available,
            Project.status == ProjectStatus.active,
            Project.deleted_at.is_(None),
        )
        .order_by(Project.name.asc(), Apartment.price.asc())
        .limit(8)
    ).all()
    if not rows:
        return "Chưa có dữ liệu căn hộ khả dụng."

    lines: list[str] = []
    for apartment, project in rows:
        lines.append(
            f"- {project.name} | {project.district}, {project.city} | căn {apartment.code} | "
            f"{apartment.bedrooms} PN | {float(apartment.area):.0f} m2 | {apartment.price} VND | hướng {apartment.direction.value}"
        )
    return "\n".join(lines)


def build_suggestion_context(suggestions: list[dict]) -> str:
    if not suggestions:
        return "Không có căn gợi ý nhanh từ bộ lọc rule-based."
    lines: list[str] = []
    for item in suggestions:
        lines.append(
            f"- {item['project_name']} | {item['district']}, {item['city']} | căn {item['code']} | "
            f"{item['bedrooms']} PN | {float(item['area']):.0f} m2 | {item['price']} VND | hướng {item['direction']}"
        )
    return "\n".join(lines)


def call_gemini_chat(message: str, db: Session, suggestions: list[dict], deep_consult: bool) -> str | None:
    if not settings.gemini_api_key:
        return None

    system_prompt = (
        "Bạn là chatbot tư vấn của AMG Land. Chỉ trả lời bằng tiếng Việt và chỉ trong lĩnh vực bất động sản. "
        "Bạn được phép hỗ trợ các chủ đề: dự án, căn hộ, số phòng ngủ, ngân sách, khu vực Hà Nội, hướng nhà, phong thủy cơ bản, mua ở, đầu tư cơ bản. "
        "Nếu người dùng hỏi ngoài lĩnh vực bất động sản thì từ chối ngắn gọn và nói rằng AMG Land chỉ hỗ trợ bất động sản. "
        f"Nếu câu hỏi cần tư vấn sâu về pháp lý, hợp đồng, vay vốn, chiến lược đầu tư, tranh chấp hoặc phân tích tài chính, hãy khuyên liên hệ hotline {HOTLINE}. "
        "Khi có dữ liệu căn hộ gợi ý thì ưu tiên tham chiếu chúng. "
        "Trả lời thật ngắn gọn, tối đa 3 câu hoặc 1 đoạn ngắn. Không lặp ý, không lan man, không dùng bullet nếu không cần. "
        "Không bịa thông tin, không nói mình đã kiểm tra thứ không có trong dữ liệu."
    )
    user_prompt = (
        f"Câu hỏi khách hàng: {message}\n\n"
        f"Các căn gợi ý nhanh:\n{build_suggestion_context(suggestions)}\n\n"
        f"Dữ liệu căn hộ khả dụng khác:\n{build_inventory_context(db)}\n\n"
        f"Yêu cầu tư vấn sâu: {'có' if deep_consult else 'không'}"
    )

    payload = {
        "system_instruction": {
            "parts": [{"text": system_prompt}],
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": user_prompt}],
            }
        ],
        "generationConfig": {
            "temperature": 0.25,
            "maxOutputTokens": 180,
        },
    }

    try:
        response = httpx.post(
            f"{GEMINI_URL}?key={settings.gemini_api_key}",
            json=payload,
            timeout=20.0,
        )
        response.raise_for_status()
        data = response.json()
        candidates = data.get("candidates") or []
        parts = candidates[0].get("content", {}).get("parts", []) if candidates else []
        text = "".join(part.get("text", "") for part in parts).strip()
        return squeeze_reply(text) if text else None
    except httpx.HTTPError:
        return None


def squeeze_reply(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", text).strip()
    cleaned = re.sub(r"\s*([,.!?;:])\s*", r"\1 ", cleaned).strip()
    sentences = re.split(r"(?<=[.!?])\s+", cleaned)
    concise = " ".join(sentence.strip() for sentence in sentences[:3] if sentence.strip())
    if len(concise) <= 320:
        return concise
    clipped = concise[:320].rsplit(" ", 1)[0].rstrip(",;:- ")
    return f"{clipped}..."


def search_quick_apartments(message: str, db: Session) -> list[dict]:
    normalized = normalize_text(message)
    bedrooms = extract_bedrooms(normalized)
    budget_max = extract_budget_max(normalized)
    district = extract_district(normalized, db)

    query = (
        select(Apartment, Project)
        .join(Project, Apartment.project_id == Project.id)
        .where(
            Apartment.status == ApartmentStatus.available,
            Project.status == ProjectStatus.active,
            Project.deleted_at.is_(None),
        )
    )

    if bedrooms is not None:
        query = query.where(Apartment.bedrooms == bedrooms)
    if budget_max is not None:
        query = query.where(Apartment.price <= budget_max)
    if district and district != "Hà Nội":
        query = query.where(Project.district.ilike(f"%{district}%"))
    elif "ha noi" in normalized:
        query = query.where(or_(Project.city.ilike("%Hà Nội%"), Project.location.ilike("%Hà Nội%"), Project.district.ilike("%Hà Nội%")))

    rows = db.execute(query.order_by(Apartment.price.asc()).limit(3)).all()
    return [serialize_suggested_apartment(apartment, project) for apartment, project in rows]


def build_reply(message: str, db: Session) -> tuple[str, list[dict]]:
    normalized = normalize_text(message)

    if any(keyword == normalized or normalized.startswith(f"{keyword} ") for keyword in GREETING_KEYWORDS):
        return (
            "Chào bạn, mình có thể hỗ trợ nhanh về dự án, căn hộ, ngân sách và khu vực Hà Nội. Bạn cứ nêu nhu cầu như: căn 2 phòng ngủ dưới 4 tỷ.",
            [],
        )

    if not is_real_estate_question(message):
        return (
            f"AMG Land hiện chỉ hỗ trợ hỏi đáp về bất động sản. Nếu bạn cần tư vấn chuyên sâu, vui lòng liên hệ hotline {HOTLINE}.",
            [],
        )

    if "phong thuy" in normalized or "huong" in normalized:
        birth_date = extract_birth_date(message)
        district = extract_district(message, db)
        budget_max = extract_budget_max(message)
        if birth_date:
            element = element_from_birth_date(birth_date)
            suggestions = feng_shui_search(birth_date, db, budget_max, None if district == "Hà Nội" else district)[:3]
            quick_reply = f"Bạn thuộc mệnh {element}. Mình đã lọc nhanh vài căn có hướng hợp mệnh để bạn tham khảo."
            quick_reply += f" Nếu cần tư vấn phong thủy sâu hơn theo cung mệnh và phương án chọn căn chi tiết, vui lòng liên hệ hotline {HOTLINE}."
            return quick_reply, [serialize_feng_shui_suggestion(item["apartment"], db) for item in suggestions]
        return (
            f"Bạn có thể gửi ngày sinh để mình lọc nhanh căn hợp mệnh. Nếu cần tư vấn phong thủy sâu hơn, vui lòng liên hệ hotline {HOTLINE}.",
            [],
        )

    suggestions = search_quick_apartments(message, db)
    deep_consult = needs_deep_consultation(message)
    gemini_reply = call_gemini_chat(message, db, suggestions, deep_consult)

    if suggestions:
        lead = gemini_reply or "Mình thấy vài căn đang khá sát nhu cầu của bạn."
        if deep_consult and HOTLINE not in lead:
            lead += f" Với phần tư vấn sâu hơn, bạn nên liên hệ hotline {HOTLINE}."
        return lead, suggestions

    fallback = gemini_reply or "Hiện mình chưa thấy căn khớp ngay với tiêu chí bạn vừa nêu trong dữ liệu."
    if deep_consult:
        if HOTLINE not in fallback:
            fallback += f" Với nhu cầu tư vấn sâu hơn, vui lòng liên hệ hotline {HOTLINE}."
    elif gemini_reply is None:
        fallback += " Bạn có thể nói rõ hơn về ngân sách, khu vực hoặc số phòng ngủ."
    return fallback, []


@router.post("/chat/message", response_model=dict, tags=["chat"])
def chat_message(payload: ChatMessageRequest, db: Session = Depends(get_db)) -> dict:
    session_id = payload.session_id or str(uuid.uuid4())
    session = db.scalar(select(ChatSession).where(ChatSession.session_id == session_id))
    reply, suggested_apartments = build_reply(payload.message, db)
    messages = [{"role": "user", "content": payload.message, "ts": datetime.now(timezone.utc).isoformat()}]
    messages.append({"role": "assistant", "content": reply, "ts": datetime.now(timezone.utc).isoformat()})
    if session is None:
        session = ChatSession(session_id=session_id, user_info=payload.user_info, messages=messages)
        db.add(session)
    else:
        session.messages = [*session.messages, *messages]
    db.commit()
    return {"reply": reply, "suggested_apartments": suggested_apartments, "session_id": session_id}


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
