import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.api.v1.schemas import ProfileOut
from app.models.activity_log import ActivityLog
from app.models.community import CommunityPost, CommunityPostBookmark
from app.models.contact_request import ContactRequest, ContactStatus
from app.models.project import Project, ProjectImage
from app.models.user import User


router = APIRouter()


CONTACT_STATUS_LABELS = {
    ContactStatus.new: "Đã gửi yêu cầu tư vấn",
    ContactStatus.processing: "Yêu cầu tư vấn đang được xử lý",
    ContactStatus.done: "Yêu cầu tư vấn đã hoàn tất",
}

ACTIVITY_LABELS = {
    "auth.login": "Đã đăng nhập tài khoản",
    "auth.register": "Đã tạo tài khoản khách hàng",
    "auth.logout": "Đã đăng xuất tài khoản",
}


def contact_owner_filter(user: User):
    filters = []
    if user.email:
        filters.append(func.lower(ContactRequest.email) == user.email.lower())
    if user.phone:
        filters.append(ContactRequest.phone == user.phone)
    return or_(*filters) if filters else ContactRequest.id.is_(None)


def project_from_contact(contact: ContactRequest) -> Project | None:
    if contact.project is not None:
        return contact.project
    if contact.apartment is not None:
        return contact.apartment.project
    return None


def project_image_map(db: Session, project_ids: list[uuid.UUID]) -> dict[uuid.UUID, str]:
    if not project_ids:
        return {}

    images = db.execute(
        select(ProjectImage.project_id, ProjectImage.image_url)
        .where(ProjectImage.project_id.in_(project_ids))
        .order_by(ProjectImage.is_thumbnail.desc(), ProjectImage.sort_order.asc())
    ).all()
    result: dict[uuid.UUID, str] = {}
    for project_id, image_url in images:
        result.setdefault(project_id, image_url)
    return result


def activity_label(log: ActivityLog) -> str:
    if log.action in ACTIVITY_LABELS:
        return ACTIVITY_LABELS[log.action]
    return "Tài khoản đã có cập nhật mới"


@router.get("/profile/me", response_model=ProfileOut, tags=["profile"])
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    contacts = list(
        db.scalars(
            select(ContactRequest)
            .where(contact_owner_filter(current_user))
            .order_by(ContactRequest.created_at.desc())
            .limit(50)
        )
    )

    project_by_id: dict[uuid.UUID, Project] = {}
    for contact in contacts:
        project = project_from_contact(contact)
        if project is not None and project.deleted_at is None:
            project_by_id[project.id] = project

    images_by_project = project_image_map(db, list(project_by_id))
    interested_projects = [
        {
            "id": project.id,
            "name": project.name,
            "slug": project.slug,
            "location": project.location,
            "district": project.district,
            "city": project.city,
            "price_from": project.price_from,
            "status": project.status,
            "image_url": images_by_project.get(project.id),
        }
        for project in project_by_id.values()
    ]

    consultations = []
    for contact in contacts[:10]:
        project = project_from_contact(contact)
        consultations.append(
            {
                "id": contact.id,
                "project_name": project.name if project else contact.project_name,
                "project_slug": project.slug if project else None,
                "apartment_code": contact.apartment.code if contact.apartment else contact.apartment_code,
                "message": contact.message,
                "status": contact.status,
                "created_at": contact.created_at,
            }
        )

    account_logs = list(
        db.scalars(
            select(ActivityLog)
            .where(ActivityLog.actor_id == current_user.id)
            .order_by(ActivityLog.created_at.desc())
            .limit(5)
        )
    )
    contact_activities = [
        {
            "id": str(contact.id),
            "label": CONTACT_STATUS_LABELS.get(contact.status, "Đã gửi yêu cầu tư vấn"),
            "created_at": contact.created_at,
        }
        for contact in contacts[:5]
    ]
    account_activities = [
        {
            "id": str(log.id),
            "label": activity_label(log),
            "created_at": log.created_at,
        }
        for log in account_logs
    ]
    activities = sorted(contact_activities + account_activities, key=lambda item: item["created_at"], reverse=True)[:5]

    saved_posts = list(
        db.scalars(
            select(CommunityPost)
            .join(CommunityPostBookmark, CommunityPostBookmark.post_id == CommunityPost.id)
            .where(CommunityPostBookmark.user_id == current_user.id)
            .order_by(CommunityPost.created_at.desc())
            .limit(10)
        )
    )
    saved_community_posts = [
        {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "category": post.category,
            "images": list(post.images or ([post.image_url] if post.image_url else [])),
            "created_at": post.created_at,
            "author_name": post.author.full_name if post.author else "Thành viên AMG Land",
        }
        for post in saved_posts
    ]

    return {
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "phone": current_user.phone,
            "role": current_user.role,
            "is_active": current_user.is_active,
            "created_at": current_user.created_at,
            "last_login": current_user.last_login,
        },
        "stats": {
            "interested_projects": len(interested_projects),
            "consultation_requests": len(contacts),
            "unread_notifications": 0,
        },
        "interested_projects": interested_projects,
        "consultations": consultations,
        "activities": activities,
        "saved_community_posts": saved_community_posts,
    }
