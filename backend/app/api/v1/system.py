import time
import psutil
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import Dict, Any
from app.db.session import get_db, check_db_health
from app.core.config import settings

router = APIRouter()

START_TIME = time.time()

class SystemHealthResponse(BaseModel):
    status: str = Field(..., description="Overall system health status: NORMAL | DEGRADED | CRITICAL")
    app_name: str
    environment: str
    uptime_seconds: float
    timestamp: float
    components: Dict[str, Any]

@router.get("/health", response_model=SystemHealthResponse)
async def get_system_health(db: AsyncSession = Depends(get_db)):
    db_ok = await check_db_health()
    
    cpu_percent = psutil.cpu_percent(interval=None)
    memory = psutil.virtual_memory()
    
    overall_status = "HEALTHY" if db_ok else "DEGRADED"
    
    return SystemHealthResponse(
        status=overall_status,
        app_name=settings.APP_NAME,
        environment=settings.APP_ENV,
        uptime_seconds=round(time.time() - START_TIME, 2),
        timestamp=time.time(),
        components={
            "database": {
                "status": "HEALTHY" if db_ok else "UNHEALTHY",
                "type": settings.DATABASE_URL.split(":")[0]
            },
            "api": {
                "status": "HEALTHY",
                "version": "1.0.0"
            },
            "system_resources": {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_available_mb": round(memory.available / (1024 * 1024), 2)
            }
        }
    )
