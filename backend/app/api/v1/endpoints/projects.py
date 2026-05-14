from app.api.v1.common import *

router = APIRouter()


@router.get("/projects", response_model=ProjectPage, tags=["projects"])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    district: str | None = None,
    status: ProjectStatus | None = None,
    keyword: str | None = None,
) -> dict:
    query = select(Project).where(Project.deleted_at.is_(None))
    if is_consultant_user(current_user):
        query = query.where(consultant_project_condition(current_user))
    if status:
        query = query.where(Project.status == status)
    if district:
        query = query.where(Project.district.ilike(f"%{district}%"))
    if keyword:
        keyword_pattern = f"%{keyword}%"
        query = query.where(
            or_(
                Project.name.ilike(keyword_pattern),
                Project.short_description.ilike(keyword_pattern),
                Project.description.ilike(keyword_pattern),
            )
        )
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    items = list(db.scalars(query.order_by(Project.created_at.desc()).offset((page - 1) * limit).limit(limit)))
    return page_response(items, total, page, limit)


@router.get("/projects/{slug}", response_model=dict, tags=["projects"])
def get_project(slug: str, db: Session = Depends(get_db), current_user: User | None = Depends(get_optional_current_user)) -> dict:
    project = db.scalar(select(Project).where(Project.slug == slug, Project.deleted_at.is_(None)))
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    ensure_project_visible(db, project, current_user)
    return {
        "project_detail": ProjectOut.model_validate(project).model_dump(mode="json"),
        "amenities": [{"id": str(item.amenity.id), "name": item.amenity.name, "category": item.amenity.category.value} for item in project.amenities],
        "floor_plans": [
            {
                "id": str(item.id),
                "project_id": str(item.project_id),
                "floor_number": item.floor_number,
                "image_url": item.image_url,
                "description": item.description,
            }
            for item in project.floor_plans
        ],
        "images": [
            {
                "id": str(item.id),
                "image_url": item.image_url,
                "caption": item.caption,
                "sort_order": item.sort_order,
                "is_thumbnail": item.is_thumbnail,
            }
            for item in sorted(project.images, key=lambda image: (image.sort_order, str(image.id)))
        ],
    }


@router.post("/projects", response_model=ProjectOut, status_code=201, tags=["projects"])
def create_project(payload: ProjectCreate, current_user: AdminUser, db: Session = Depends(get_db)) -> Project:
    validate_consultant_id(db, payload.consultant_id)
    project = Project(**payload.model_dump(), slug=unique_slug(db, Project, payload.name), created_by=current_user.id)
    db.add(project)
    log_activity(db, current_user, "projects.create", "project", None, {"name": payload.name})
    commit_or_400(db)
    db.refresh(project)
    return project


@router.put("/projects/{project_id}", response_model=ProjectOut, tags=["projects"])
def update_project(project_id: uuid.UUID, payload: ProjectUpdate, _: AdminUser, db: Session = Depends(get_db)) -> Project:
    project = get_project_or_404(db, project_id)
    values = payload.model_dump(exclude_unset=True)
    if "consultant_id" in values:
        validate_consultant_id(db, values["consultant_id"])
    if "name" in values and values["name"] != project.name:
        project.slug = unique_slug(db, Project, values["name"], exclude_id=project.id)
    for key, value in values.items():
        setattr(project, key, value)
    log_activity(db, _, "projects.update", "project", project.id)
    commit_or_400(db)
    db.refresh(project)
    return project


@router.delete("/projects/{project_id}", response_model=dict, tags=["projects"])
def delete_project(project_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)) -> dict:
    project = get_project_or_404(db, project_id)
    project.deleted_at = datetime.now(timezone.utc)
    log_activity(db, _, "projects.delete", "project", project.id)
    db.commit()
    return {"message": "Deleted successfully"}


@router.post("/projects/{project_id}/images", response_model=list[dict], tags=["projects"])
def upload_project_images(project_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db), files: list[UploadFile] = File(...)) -> list[dict]:
    get_project_or_404(db, project_id)
    created: list[ProjectImage] = []
    for index, file in enumerate(files):
        stored = upload_project_image(project_id, file)
        image = ProjectImage(
            project_id=project_id,
            image_url=stored.public_url,
            caption=file.filename,
            sort_order=index,
            is_thumbnail=index == 0,
        )
        db.add(image)
        created.append(image)
    log_activity(db, _, "projects.images.upload", "project", project_id, {"count": len(created)})
    commit_or_400(db)
    for image in created:
        db.refresh(image)
    return [{"image_id": str(image.id), "image_url": image.image_url, "is_thumbnail": image.is_thumbnail} for image in created]


@router.put("/project-images/{image_id}", response_model=dict, tags=["projects"])
def update_project_image(image_id: uuid.UUID, payload: ProjectImageUpdate, current_user: AdminUser, db: Session = Depends(get_db)) -> dict:
    image = db.get(ProjectImage, image_id)
    if image is None:
        raise HTTPException(status_code=404, detail="Project image not found")

    values = payload.model_dump(exclude_unset=True)
    if values.get("is_thumbnail") is True:
        for item in db.scalars(select(ProjectImage).where(ProjectImage.project_id == image.project_id, ProjectImage.id != image.id)):
            item.is_thumbnail = False

    for key, value in values.items():
        setattr(image, key, value)

    log_activity(db, current_user, "projects.images.update", "project", image.project_id, {"image_id": str(image.id)})
    commit_or_400(db)
    db.refresh(image)
    return {
        "id": str(image.id),
        "image_url": image.image_url,
        "caption": image.caption,
        "sort_order": image.sort_order,
        "is_thumbnail": image.is_thumbnail,
    }


@router.delete("/project-images/{image_id}", response_model=dict, tags=["projects"])
def delete_project_image(image_id: uuid.UUID, current_user: AdminUser, db: Session = Depends(get_db)) -> dict:
    image = db.get(ProjectImage, image_id)
    if image is None:
        raise HTTPException(status_code=404, detail="Project image not found")

    project_id = image.project_id
    image_url = image.image_url
    db.delete(image)
    log_activity(db, current_user, "projects.images.delete", "project", project_id, {"image_id": str(image_id)})
    db.commit()
    delete_public_object(image_url)
    return {"message": "Deleted"}


@router.post("/projects/{project_id}/floor-plans", response_model=FloorPlanOut, status_code=201, tags=["projects"])
def create_floor_plan(
    project_id: uuid.UUID,
    current_user: AdminUser,
    db: Session = Depends(get_db),
    floor_number: int = Form(..., gt=0),
    description: str | None = Form(default=None),
    image: UploadFile = File(...),
) -> FloorPlan:
    get_project_or_404(db, project_id)
    stored = upload_floor_plan_image(project_id, image)
    floor_plan = FloorPlan(project_id=project_id, floor_number=floor_number, image_url=stored.public_url, description=description)
    db.add(floor_plan)
    log_activity(db, current_user, "projects.floor_plans.create", "project", project_id)
    commit_or_400(db)
    db.refresh(floor_plan)
    return floor_plan


@router.get("/projects/{project_id}/floor-plans", response_model=list[FloorPlanOut], tags=["projects"])
def list_floor_plans(project_id: uuid.UUID, db: Session = Depends(get_db)) -> list[FloorPlan]:
    get_project_or_404(db, project_id)
    return list(db.scalars(select(FloorPlan).where(FloorPlan.project_id == project_id).order_by(FloorPlan.floor_number)))


@router.delete("/floor-plans/{floor_plan_id}", response_model=dict, tags=["projects"])
def delete_floor_plan(floor_plan_id: uuid.UUID, current_user: AdminUser, db: Session = Depends(get_db)) -> dict:
    floor_plan = db.get(FloorPlan, floor_plan_id)
    if floor_plan is None:
        raise HTTPException(status_code=404, detail="Floor plan not found")
    project_id = floor_plan.project_id
    image_url = floor_plan.image_url
    db.delete(floor_plan)
    log_activity(db, current_user, "projects.floor_plans.delete", "project", project_id)
    db.commit()
    delete_public_object(image_url)
    return {"message": "Deleted"}


@router.post("/projects/{project_id}/amenities", response_model=dict, tags=["projects"])
def assign_project_amenity(project_id: uuid.UUID, payload: ProjectAmenityAssign, current_user: AdminUser, db: Session = Depends(get_db)) -> dict:
    get_project_or_404(db, project_id)
    if db.get(Amenity, payload.amenity_id) is None:
        raise HTTPException(status_code=404, detail="Amenity not found")
    existing = db.get(ProjectAmenity, {"project_id": project_id, "amenity_id": payload.amenity_id})
    if existing is None:
        db.add(ProjectAmenity(project_id=project_id, amenity_id=payload.amenity_id, note=payload.note))
    else:
        existing.note = payload.note
    log_activity(db, current_user, "projects.amenities.assign", "project", project_id, {"amenity_id": str(payload.amenity_id)})
    commit_or_400(db)
    return {"message": "Assigned"}


@router.delete("/projects/{project_id}/amenities/{amenity_id}", response_model=dict, tags=["projects"])
def unassign_project_amenity(project_id: uuid.UUID, amenity_id: uuid.UUID, current_user: AdminUser, db: Session = Depends(get_db)) -> dict:
    link = db.get(ProjectAmenity, {"project_id": project_id, "amenity_id": amenity_id})
    if link is None:
        raise HTTPException(status_code=404, detail="Project amenity not found")
    db.delete(link)
    log_activity(db, current_user, "projects.amenities.unassign", "project", project_id, {"amenity_id": str(amenity_id)})
    db.commit()
    return {"message": "Unassigned"}
