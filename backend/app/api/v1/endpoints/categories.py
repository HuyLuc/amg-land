from app.api.v1.common import *

router = APIRouter()


@router.get("/categories", response_model=list[CategoryOut], tags=["categories"])
def list_categories(db: Session = Depends(get_db)) -> list[Category]:
    return list(db.scalars(select(Category).order_by(Category.name)))


@router.post("/categories", response_model=CategoryOut, status_code=201, tags=["categories"])
def create_category(payload: CategoryCreate, current_user: StaffUser, db: Session = Depends(get_db)) -> Category:
    category = Category(name=payload.name, slug=unique_slug(db, Category, payload.name), description=payload.description)
    db.add(category)
    log_activity(db, current_user, "categories.create", "category", None, {"name": payload.name})
    commit_or_400(db)
    db.refresh(category)
    return category


@router.put("/categories/{category_id}", response_model=CategoryOut, tags=["categories"])
def update_category(category_id: uuid.UUID, payload: CategoryCreate, current_user: StaffUser, db: Session = Depends(get_db)) -> Category:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    category.name = payload.name
    category.slug = unique_slug(db, Category, payload.name)
    category.description = payload.description
    log_activity(db, current_user, "categories.update", "category", category.id)
    commit_or_400(db)
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}", response_model=dict, tags=["categories"])
def delete_category(category_id: uuid.UUID, current_user: StaffUser, db: Session = Depends(get_db)) -> dict:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    log_activity(db, current_user, "categories.delete", "category", category.id)
    db.commit()
    return {"message": "Deleted"}
