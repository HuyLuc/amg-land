import argparse
import random
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.activity_log import ActivityLog
from app.models.amenity import Amenity, AmenityCategory, ProjectAmenity
from app.models.analytics_event import AnalyticsEvent
from app.models.apartment import Apartment, ApartmentStatus, Direction
from app.models.auth_token import PasswordResetToken, RefreshToken
from app.models.chat_session import ChatSession
from app.models.contact_request import ContactRequest, ContactStatus
from app.models.floor_plan import FloorPlan
from app.models.post import Post, PostStatus
from app.models.project import Project, ProjectImage, ProjectStatus
from app.models.user import User, UserRole


SEED_PASSWORD = "Demo@12345"


def clear_database(db: Session) -> None:
    for model in [
        AnalyticsEvent,
        ActivityLog,
        PasswordResetToken,
        RefreshToken,
        ChatSession,
        ContactRequest,
        ProjectAmenity,
        FloorPlan,
        ProjectImage,
        Apartment,
        Post,
        Project,
        Amenity,
        User,
    ]:
        db.execute(delete(model))
    db.commit()


def seed_users(db: Session) -> dict[str, User]:
    users = {
        "director": User(
            email=settings.admin_email or "quanly@amgland.vn",
            password_hash=hash_password(settings.admin_password or SEED_PASSWORD),
            full_name="Nguyễn Minh Quân",
            phone="0901000001",
            role=UserRole.admin,
            is_active=True,
        ),
        "sales_1": User(
            email="linh.tran@amgland.vn",
            password_hash=hash_password(SEED_PASSWORD),
            full_name="Trần Khánh Linh",
            phone="0901000002",
            role=UserRole.editor,
            is_active=True,
        ),
        "sales_2": User(
            email="hoang.pham@amgland.vn",
            password_hash=hash_password(SEED_PASSWORD),
            full_name="Phạm Việt Hoàng",
            phone="0901000003",
            role=UserRole.editor,
            is_active=True,
        ),
        "content": User(
            email="mai.do@amgland.vn",
            password_hash=hash_password(SEED_PASSWORD),
            full_name="Đỗ Ngọc Mai",
            phone="0901000004",
            role=UserRole.editor,
            is_active=True,
        ),
        "customer": User(
            email="khachhang.demo@example.com",
            password_hash=hash_password(SEED_PASSWORD),
            full_name="Khách hàng Demo",
            phone="0912345678",
            role=UserRole.customer,
            is_active=True,
        ),
    }
    db.add_all(users.values())
    db.commit()
    for user in users.values():
        db.refresh(user)
    return users


def seed_amenities(db: Session) -> dict[str, Amenity]:
    amenity_rows = [
        ("pool", "Hồ bơi tràn bờ", "waves", AmenityCategory.internal, "Hồ bơi nội khu tiêu chuẩn nghỉ dưỡng"),
        ("gym", "Phòng gym", "dumbbell", AmenityCategory.internal, "Phòng tập đầy đủ thiết bị"),
        ("garden", "Vườn cảnh quan", "trees", AmenityCategory.internal, "Không gian xanh nội khu"),
        ("lounge", "Sảnh lounge", "sofa", AmenityCategory.internal, "Khu tiếp khách cư dân"),
        ("school", "Trường học", "school", AmenityCategory.external, "Trường học trong bán kính 2km"),
        ("hospital", "Bệnh viện", "hospital", AmenityCategory.external, "Cơ sở y tế gần dự án"),
        ("mall", "Trung tâm thương mại", "shopping-bag", AmenityCategory.external, "Kết nối mua sắm, giải trí"),
        ("metro", "Tuyến metro", "train", AmenityCategory.external, "Hạ tầng giao thông công cộng"),
    ]
    amenities = {
        key: Amenity(name=name, icon=icon, category=category, description=description)
        for key, name, icon, category, description in amenity_rows
    }
    db.add_all(amenities.values())
    db.commit()
    return amenities


def seed_projects(db: Session, users: dict[str, User], amenities: dict[str, Amenity]) -> list[Project]:
    project_specs = [
        {
            "name": "AMG Riverside Residence",
            "slug": "amg-riverside-residence",
            "description": "Tổ hợp căn hộ ven sông với tiện ích nghỉ dưỡng và kết nối nhanh vào trung tâm.",
            "location": "Đường Nguyễn Xiển, phường Đại Kim",
            "district": "Hoàng Mai",
            "city": "Hà Nội",
            "price_from": 2850000000,
            "status": ProjectStatus.active,
            "amenities": ["pool", "gym", "garden", "school", "mall"],
        },
        {
            "name": "AMG Central Park",
            "slug": "amg-central-park",
            "description": "Dự án căn hộ cao cấp cạnh công viên trung tâm, phù hợp gia đình trẻ.",
            "location": "Đường Tố Hữu, phường Trung Văn",
            "district": "Nam Từ Liêm",
            "city": "Hà Nội",
            "price_from": 3200000000,
            "status": ProjectStatus.active,
            "amenities": ["gym", "garden", "lounge", "school", "metro"],
        },
        {
            "name": "AMG Lakeview Garden",
            "slug": "amg-lakeview-garden",
            "description": "Không gian sống hướng hồ, mật độ xây dựng thấp và cảnh quan xanh.",
            "location": "Khu đô thị Văn Quán",
            "district": "Hà Đông",
            "city": "Hà Nội",
            "price_from": 2450000000,
            "status": ProjectStatus.active,
            "amenities": ["pool", "garden", "hospital", "mall"],
        },
        {
            "name": "AMG Sky Square",
            "slug": "amg-sky-square",
            "description": "Dự án đang hoàn thiện pháp lý, dự kiến mở bán trong quý tới.",
            "location": "Đường Phạm Văn Đồng",
            "district": "Bắc Từ Liêm",
            "city": "Hà Nội",
            "price_from": 2600000000,
            "status": ProjectStatus.draft,
            "amenities": ["gym", "garden", "metro"],
        },
        {
            "name": "AMG Pearl Tower",
            "slug": "amg-pearl-tower",
            "description": "Tòa căn hộ đã hoàn tất giỏ hàng sơ cấp, chuyển sang chăm sóc cư dân.",
            "location": "Đường Lê Văn Lương",
            "district": "Thanh Xuân",
            "city": "Hà Nội",
            "price_from": 4100000000,
            "status": ProjectStatus.closed,
            "amenities": ["pool", "gym", "lounge", "mall", "hospital"],
        },
    ]

    projects: list[Project] = []
    for spec in project_specs:
        spec["short_description"] = spec.get("short_description") or spec.get("description")
        amenity_keys = spec.pop("amenities")
        project = Project(**spec, created_by=users["director"].id)
        db.add(project)
        db.flush()
        for index in range(1, 4):
            db.add(
                ProjectImage(
                    project_id=project.id,
                    image_url=f"http://localhost:9000/amg-land-media/demo/projects/{project.slug}/image-{index}.jpg",
                    caption=f"Phối cảnh {project.name} #{index}",
                    sort_order=index,
                    is_thumbnail=index == 1,
                )
            )
        for floor in [1, 12, 24]:
            db.add(
                FloorPlan(
                    project_id=project.id,
                    floor_number=floor,
                    image_url=f"http://localhost:9000/amg-land-media/demo/projects/{project.slug}/floor-{floor}.png",
                    description=f"Mặt bằng tầng {floor}",
                )
            )
        for key in amenity_keys:
            db.add(ProjectAmenity(project_id=project.id, amenity_id=amenities[key].id, note="Tiện ích nổi bật của dự án"))
        projects.append(project)

    db.commit()
    for project in projects:
        db.refresh(project)
    return projects


def seed_apartments(db: Session, projects: list[Project]) -> list[Apartment]:
    random.seed(20260512)
    directions = [Direction.E, Direction.SE, Direction.S, Direction.NE, Direction.NW, Direction.W]
    elements = ["Kim", "Mộc", "Thủy", "Hỏa", "Thổ"]
    apartments: list[Apartment] = []

    for project_index, project in enumerate(projects):
        for index in range(1, 9):
            bedrooms = random.choice([1, 2, 2, 3])
            area = Decimal(str(random.choice([48.5, 55.0, 63.5, 72.0, 86.0, 96.5])))
            price = project.price_from + random.randint(0, 18) * 75000000 + bedrooms * 220000000
            status = random.choices(
                [ApartmentStatus.available, ApartmentStatus.reserved, ApartmentStatus.sold],
                weights=[6, 2, 2],
            )[0]
            apartment = Apartment(
                project_id=project.id,
                code=f"{chr(65 + project_index)}{index:02d}-{random.choice([8, 12, 18, 22, 28])}",
                floor=random.choice([8, 12, 15, 18, 22, 28]),
                area=area,
                bedrooms=bedrooms,
                bathrooms=1 if bedrooms == 1 else 2,
                direction=random.choice(directions),
                price=price,
                status=status,
                feng_shui_element=random.choice(elements),
            )
            apartments.append(apartment)
            db.add(apartment)

    db.commit()
    for apartment in apartments:
        db.refresh(apartment)
    return apartments


def seed_posts(db: Session, users: dict[str, User]) -> None:
    now = datetime.now(timezone.utc)
    posts = [
        ("Thị trường căn hộ Hà Nội giữ nhịp tăng ổn định", "market", "published", 12),
        ("5 tiêu chí chọn căn hộ cho gia đình trẻ", "analysis", "published", 9),
        ("Chọn hướng căn hộ hợp mệnh trong năm 2026", "feng_shui", "published", 7),
        ("AMG Riverside Residence mở giỏ hàng tòa B", "project_news", "published", 4),
        ("Kinh nghiệm đọc bảng giá và chính sách bán hàng", "analysis", "draft", 2),
        ("Xu hướng căn hộ xanh tại khu Tây Hà Nội", "market", "archived", 35),
    ]
    for title, image_key, status, days_ago in posts:
        db.add(
            Post(
                title=title,
                slug=title.lower().replace(" ", "-").replace("đ", "d"),
                content=f"<p>{title}. Nội dung demo phục vụ kiểm thử CMS AMG Land.</p>",
                images=[f"http://localhost:9000/amg-land-media/demo/posts/{image_key}.jpg"],
                author_id=users["content"].id,
                status=PostStatus(status),
                published_at=now - timedelta(days=days_ago) if status == "published" else None,
            )
        )
    db.commit()


def seed_contacts(db: Session, users: dict[str, User], projects: list[Project], apartments: list[Apartment]) -> list[ContactRequest]:
    now = datetime.now(timezone.utc)
    contacts_data = [
        ("Lê Hoài An", "0912345678", "an.le@gmail.com", "Quan tâm căn 2PN, ngân sách khoảng 3 tỷ.", "new", 0),
        ("Nguyễn Đức Bình", "0988123456", "binh.nd@company.vn", "Muốn xem nhà mẫu cuối tuần này.", "processing", 1),
        ("Phạm Thu Hà", "0904555666", "hapt@gmail.com", "Cần tư vấn căn hướng Đông Nam, tầng trung.", "processing", 2),
        ("Trần Quốc Huy", "0936789123", None, "Đang tìm căn 3PN cho gia đình 4 người.", "new", 3),
        ("Vũ Minh Châu", "0977001122", "chau.vm@gmail.com", "Hỏi chính sách thanh toán và vay ngân hàng.", "done", 4),
        ("Đặng Gia Bảo", "0966111222", "bao.dg@outlook.com", "Quan tâm AMG Central Park, cần nhận bảng giá.", "new", 5),
        ("Hoàng Lan Anh", "0944332211", None, "Muốn căn diện tích 70-80m2, nhận nhà sớm.", "processing", 6),
        ("Bùi Thanh Tùng", "0888999000", "tung.bt@gmail.com", "Cần tư vấn đầu tư cho thuê khu Nam Từ Liêm.", "done", 7),
        ("Ngô Phương Linh", "0923456789", "linh.ngo@gmail.com", "Tìm căn hợp mệnh Mộc, hướng Đông hoặc Đông Nam.", "new", 8),
        ("Đỗ Mạnh Cường", "0911222333", "cuong.dm@company.vn", "Đã xem dự án, cần đặt lịch gặp sale.", "processing", 10),
        ("Mai Thảo Vy", "0899123456", None, "Nhờ gửi thêm mặt bằng tầng và hình ảnh căn hộ.", "new", 12),
        ("Lý Anh Khoa", "0909888777", "khoa.la@gmail.com", "Khách đã chốt nhu cầu, theo dõi chính sách mới.", "done", 15),
    ]
    assignees = [None, users["sales_1"].id, users["sales_2"].id]
    apartments_by_project = {
        project.id: [apartment for apartment in apartments if apartment.project_id == project.id]
        for project in projects
    }
    contacts: list[ContactRequest] = []
    for index, (name, phone, email, message, status, days_ago) in enumerate(contacts_data):
        project = projects[index % len(projects)]
        project_apartments = apartments_by_project.get(project.id, [])
        apartment = project_apartments[index % len(project_apartments)] if project_apartments else None
        contact = ContactRequest(
            full_name=name,
            phone=phone,
            email=email,
            project_id=project.id,
            apartment_id=apartment.id if apartment else None,
            message=message,
            status=ContactStatus(status),
            assigned_to=assignees[index % len(assignees)],
            note="Đã gọi lần 1, chờ phản hồi." if status == "processing" else ("Khách đã được chăm sóc xong." if status == "done" else None),
            created_at=now - timedelta(days=days_ago, hours=index),
        )
        contacts.append(contact)
        db.add(contact)
    db.commit()
    return contacts


def seed_analytics(db: Session, projects: list[Project], apartments: list[Apartment]) -> None:
    now = datetime.now(timezone.utc)
    random.seed(20260512)
    for day in range(0, 21):
        for _ in range(random.randint(8, 20)):
            project = random.choice(projects)
            apartment = random.choice([item for item in apartments if item.project_id == project.id])
            db.add(
                AnalyticsEvent(
                    visitor_id=f"visitor-{random.randint(1000, 9999)}",
                    session_id=f"session-{random.randint(10000, 99999)}",
                    event_type="page_view",
                    project_id=project.id,
                    apartment_id=apartment.id if random.random() > 0.35 else None,
                    path=f"/projects/{project.slug}",
                    referrer=random.choice(["google", "facebook", "direct", "zalo"]),
                    metadata_={"source": "seed", "device": random.choice(["mobile", "desktop"])},
                    created_at=now - timedelta(days=day, minutes=random.randint(0, 1440)),
                )
            )
    db.commit()


def seed_activity_logs(db: Session, users: dict[str, User]) -> None:
    now = datetime.now(timezone.utc)
    logs = [
        ("auth.login", "user", users["director"].id, users["director"].id),
        ("contacts.update", "contact", None, users["sales_1"].id),
        ("projects.create", "project", None, users["director"].id),
        ("posts.create", "post", None, users["content"].id),
    ]
    for index, (action, resource_type, resource_id, actor_id) in enumerate(logs):
        db.add(
            ActivityLog(
                actor_id=actor_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                metadata_={"source": "seed"},
                created_at=now - timedelta(hours=index + 1),
            )
        )
    db.commit()


def run_seed(reset: bool) -> None:
    if settings.app_env == "production":
        raise RuntimeError("Refusing to seed production database")

    with SessionLocal() as db:
        if reset:
            clear_database(db)

        users = seed_users(db)
        amenities = seed_amenities(db)
        projects = seed_projects(db, users, amenities)
        apartments = seed_apartments(db, projects)
        seed_posts(db, users)
        seed_contacts(db, users, projects, apartments)
        seed_analytics(db, projects, apartments)
        seed_activity_logs(db, users)

    print("Seed completed.")
    print(f"Login: {settings.admin_email or 'quanly@amgland.vn'}")
    print(f"Password: {settings.admin_password or SEED_PASSWORD}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed local AMG Land data")
    parser.add_argument("--reset", action="store_true", help="Delete existing seedable data before inserting demo data")
    args = parser.parse_args()
    run_seed(reset=args.reset)


if __name__ == "__main__":
    main()
