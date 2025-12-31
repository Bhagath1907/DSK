from fastapi import APIRouter
from app.api.v1.endpoints import auth, admin, services, wallet, chat, jobs, notifications

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(wallet.router, prefix="/wallet", tags=["wallet"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])

