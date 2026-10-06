from fastapi import APIRouter
from app.api.v1 import auth, monitoring, operations, system

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(system.router, prefix="/system", tags=["System Health"])
api_router.include_router(monitoring.router, prefix="/monitoring", tags=["Monitoring"])
api_router.include_router(operations.router, prefix="/operations", tags=["Operations"])
api_router.include_router(operations.ingestion_router, tags=["Device Ingestion"])
