import hashlib
import html
import re
from email.utils import parsedate_to_datetime
from urllib.parse import urlencode
from xml.etree import ElementTree

import httpx

from app.api.v1.common import *

router = APIRouter()

GOOGLE_NEWS_RSS_URL = "https://news.google.com/rss/search"
GOOGLE_NEWS_QUERY = '(Ha Noi OR "Hà Nội") AND (bat dong san OR chung cu OR can ho OR nha dat OR "lai suat vay mua nha")'


def external_news_id(article_url: str) -> str:
    return hashlib.sha1(article_url.encode("utf-8")).hexdigest()[:20]


def strip_html(value: str | None) -> str:
    if not value:
        return ""
    text = re.sub(r"<[^>]+>", " ", value)
    text = html.unescape(text).replace("\xa0", " ")
    return re.sub(r"\s+", " ", text).strip()


def serialize_rss_item(item: ElementTree.Element) -> dict:
    article_url = (item.findtext("link") or "").strip()
    source = item.find("source")
    excerpt = strip_html(item.findtext("description")) or "Đang cập nhật mô tả bài viết."
    published_at_raw = item.findtext("pubDate")
    published_at = None
    if published_at_raw:
        try:
            published_at = parsedate_to_datetime(published_at_raw)
        except (TypeError, ValueError, IndexError):
            published_at = None
    return {
        "id": external_news_id(article_url or (item.findtext("guid") or item.findtext("title") or "")),
        "title": (item.findtext("title") or "Tin tức bất động sản").strip(),
        "excerpt": excerpt,
        "content": None,
        "image_url": None,
        "published_at": published_at,
        "source_name": (source.text or "Google News").strip() if source is not None else "Google News",
        "source_url": source.attrib.get("url") if source is not None else None,
        "article_url": article_url,
    }


@router.get("/news/external", response_model=ExternalNewsPage, tags=["news"])
def list_external_news(page: int = Query(1, ge=1), limit: int = Query(12, ge=1, le=20)) -> dict:
    params = {
        "q": GOOGLE_NEWS_QUERY,
        "hl": "vi",
        "gl": "VN",
        "ceid": "VN:vi",
    }

    try:
        response = httpx.get(f"{GOOGLE_NEWS_RSS_URL}?{urlencode(params)}", timeout=15.0)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Unable to reach Google News feed") from exc

    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail="Google News feed returned an error")

    try:
        root = ElementTree.fromstring(response.text)
    except ElementTree.ParseError as exc:
        raise HTTPException(status_code=502, detail="Google News feed returned invalid XML") from exc

    all_items = [serialize_rss_item(item) for item in root.findall("./channel/item")]
    total = len(all_items)
    start = (page - 1) * limit
    end = start + limit
    return {
        "items": all_items[start:end],
        "total": total,
        "page": page,
        "limit": limit,
    }
