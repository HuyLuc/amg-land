from fastapi import APIRouter

from app.api.v1.endpoints import auth
from app.api.v1.endpoints import users
from app.api.v1.endpoints import projects
from app.api.v1.endpoints import apartments
from app.api.v1.endpoints import amenities
from app.api.v1.endpoints import categories
from app.api.v1.endpoints import search
from app.api.v1.endpoints import chat
from app.api.v1.endpoints import posts
from app.api.v1.endpoints import contacts
from app.api.v1.endpoints import analytics
from app.api.v1.endpoints import stats


api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(projects.router)
api_router.include_router(apartments.router)
api_router.include_router(amenities.router)
api_router.include_router(categories.router)
api_router.include_router(search.router)
api_router.include_router(chat.router)
api_router.include_router(posts.router)
api_router.include_router(contacts.router)
api_router.include_router(analytics.router)
api_router.include_router(stats.router)
