from typing import List
from pydantic import ConfigDict
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "SentinelNet"
    APP_ENV: str = "development"
    API_V1_STR: str = "/api/v1"
    
    API_HOST: str = "127.0.0.1"
    API_PORT: int = 8000
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./sentinel.db"
    
    # Security
    JWT_SECRET: str = "development-only-change-this-secret-before-deployment"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 480
    DEVICE_INGESTION_SECRET: str = "development-device-ingestion-secret-change-before-deployment"
    ADMIN_EMAIL: str | None = None
    ADMIN_PASSWORD: str | None = None
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    model_config = ConfigDict(env_file=".env", extra="ignore")

settings = Settings()
