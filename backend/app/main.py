import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
import math
from uuid import uuid4

# Force pure-python mode for SQLAlchemy on Windows AppLocker/WDAC environments
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, select
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError, jwt
from app.core.config import settings
from app.api.router import api_router
from app.core.security import hash_password
from app.db.models import (
    AlertModel,
    DeviceModel,
    EventModel,
    SensorModel,
    TelemetryModel,
    UserModel,
)
from app.db.session import AsyncSessionLocal, Base, engine, get_db


async def initialize_database() -> None:
    if bool(settings.ADMIN_EMAIL) != bool(settings.ADMIN_PASSWORD):
        raise RuntimeError("Set both ADMIN_EMAIL and ADMIN_PASSWORD to bootstrap the admin account")
    if settings.APP_ENV.lower() in {"production", "prod"}:
        if settings.JWT_SECRET == "development-only-change-this-secret-before-deployment":
            raise RuntimeError("JWT_SECRET must be explicitly configured in production")
        if len(settings.JWT_SECRET) < 32:
            raise RuntimeError("JWT_SECRET must contain at least 32 characters in production")
        if (
            settings.DEVICE_INGESTION_SECRET
            == "development-device-ingestion-secret-change-before-deployment"
            or len(settings.DEVICE_INGESTION_SECRET) < 32
        ):
            raise RuntimeError(
                "DEVICE_INGESTION_SECRET must be a separate secret of at least 32 characters in production"
            )

    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

        def ensure_legacy_columns(sync_connection) -> None:
            schema_inspector = inspect(sync_connection)
            existing_tables = set(schema_inspector.get_table_names())
            legacy_columns = {
                "alerts": {
                    "timestamp": "DATETIME NOT NULL DEFAULT '1970-01-01 00:00:00'",
                },
                "devices": {
                    "connectivity": "VARCHAR(32) NOT NULL DEFAULT 'UNKNOWN'",
                    "battery_percent": "INTEGER",
                    "firmware": "VARCHAR(64)",
                    "network": "VARCHAR(128)",
                    "last_communication": "DATETIME",
                    "data_origin": "VARCHAR(16) NOT NULL DEFAULT 'SIMULATED'",
                    "latitude": "FLOAT",
                    "longitude": "FLOAT",
                    "ingestion_key_hash": "VARCHAR(64)",
                    "ingestion_key_created_at": "DATETIME",
                    "last_heartbeat_message_id": "VARCHAR(36)",
                },
                "sensors": {},
                "telemetry": {"idempotency_key": "VARCHAR(128)"},
                "events": {},
            }
            for table, new_columns in legacy_columns.items():
                if table in existing_tables:
                    columns = {
                        column["name"]
                        for column in schema_inspector.get_columns(table)
                    }
                    for column, column_type in new_columns.items():
                        if column not in columns:
                            sync_connection.exec_driver_sql(
                                f"ALTER TABLE {table} ADD COLUMN {column} {column_type}"
                            )
                    if "space" not in columns:
                        sync_connection.exec_driver_sql(
                            f"ALTER TABLE {table} ADD COLUMN space VARCHAR(16) "
                            "NOT NULL DEFAULT 'simulation'"
                        )
                    if table == "telemetry":
                        sync_connection.exec_driver_sql(
                            "CREATE UNIQUE INDEX IF NOT EXISTS "
                            "uq_telemetry_idempotency_key ON telemetry (idempotency_key)"
                        )

        await connection.run_sync(ensure_legacy_columns)

    async with AsyncSessionLocal() as session:
        if settings.APP_ENV.lower() not in {"production", "prod"}:
            now = datetime.now(timezone.utc)
            sample_devices = [
                DeviceModel(id="dev-001", space="simulation", name="Gateway-Alpha", type="Gateway", status="ONLINE", health=98, location="North Gate", uptime="99.8%", connectivity="CONNECTED", battery_percent=100, firmware="sim-1.0", network="Development LAN", last_communication=now, data_origin="SIMULATED"),
                DeviceModel(id="dev-002", space="simulation", name="Sensor-Node-01", type="Sensor", status="ONLINE", health=94, location="Server Bay 2", uptime="98.7%", connectivity="CONNECTED", battery_percent=83, firmware="sim-1.0", network="Development LAN", last_communication=now, data_origin="SIMULATED"),
                DeviceModel(id="dev-003", space="simulation", name="Sensor-Node-02", type="Sensor", status="MAINTENANCE", health=64, location="South Yard", uptime="82.0%", connectivity="DEGRADED", battery_percent=29, firmware="sim-0.9", network="Development LAN", last_communication=now - timedelta(hours=2), data_origin="SIMULATED"),
                DeviceModel(id="dev-004", space="simulation", name="Cam-Internal-04", type="Camera", status="ONLINE", health=88, location="North Corridor", uptime="95.2%", connectivity="CONNECTED", battery_percent=None, firmware="sim-1.0", network="Development LAN", last_communication=now, data_origin="SIMULATED"),
            ]
            for device in sample_devices:
                if await session.get(DeviceModel, device.id) is None:
                    session.add(device)
            if await session.scalar(
                select(SensorModel.id).where(SensorModel.space == "simulation").limit(1)
            ) is None:
                sensor_definitions = [
                    ("sns-temp-001", "Temperature", "dev-002", 22.4, "°C", 35.0, 15.0, 28.0, 21.5),
                    ("sns-humidity-001", "Humidity", "dev-002", 44.2, "%RH", 70.0, 30.0, 60.0, 43.8),
                    ("sns-vibration-001", "Vibration", "dev-003", 0.04, "g", 0.25, 0.0, 0.2, 0.035),
                ]
                for sensor_id, sensor_type, device_id, latest, unit, threshold, low, high, average in sensor_definitions:
                    sensor = SensorModel(
                        id=sensor_id,
                        space="simulation",
                        sensor_type=sensor_type,
                        device_id=device_id,
                        current_value=latest,
                        unit=unit,
                        threshold=threshold,
                        minimum=low,
                        maximum=high,
                        average=average,
                        last_update=now,
                        health=97,
                        calibration_status="CALIBRATED",
                        data_quality="FRESH",
                        data_origin="SIMULATED",
                    )
                    session.add(sensor)
                    for point in range(25):
                        timestamp = now - timedelta(hours=24 * (24 - point) / 24)
                        value = latest + math.sin(point / 2.5) * max(abs(latest) * 0.04, 0.01)
                        if point == 24:
                            value = latest
                        session.add(
                            TelemetryModel(
                                id=str(uuid4()),
                                space="simulation",
                                sensor_id=sensor_id,
                                value=round(value, 4),
                                timestamp=timestamp,
                                quality="FRESH",
                                data_origin="SIMULATED",
                            )
                        )
            if await session.scalar(
                select(AlertModel.id).where(AlertModel.space == "simulation").limit(1)
            ) is None:
                session.add_all([
                    AlertModel(id="AL-101", space="simulation", summary="Rogue motion detected near north gate", severity="CRITICAL", source="Perimeter Sensor", status="ACTIVE"),
                    AlertModel(id="AL-102", space="simulation", summary="Thermal drift on UPS channel B", severity="HIGH", source="Infrastructure Monitor", status="ACKNOWLEDGED"),
                    AlertModel(id="AL-103", space="simulation", summary="Storage array saturation warning", severity="MEDIUM", source="Storage Stack", status="ACTIVE"),
                ])
            if await session.scalar(
                select(EventModel.id).where(EventModel.space == "simulation").limit(1)
            ) is None:
                session.add_all([
                    EventModel(id="evt-1001", space="simulation", title="Unauthorized perimeter approach", severity="CRITICAL", source="Perimeter AI", status="ACTIVE", location="Gate A", summary="Motion pattern matched a restricted approach sequence and triggered a high-priority response."),
                    EventModel(id="evt-1002", space="simulation", title="Humidity spike", severity="MEDIUM", source="Environmental Sensor", status="ACKNOWLEDGED", location="Server Bay 2", summary="Relative humidity exceeded expected operating range for 9 minutes."),
                    EventModel(id="evt-1003", space="simulation", title="Camera feed latency increased", severity="HIGH", source="Vision Network", status="ACTIVE", location="North Corridor", summary="Frame queue latency increased beyond the baseline threshold for downstream analytics."),
                ])
        if settings.ADMIN_EMAIL and settings.ADMIN_PASSWORD:
            existing_admin = await session.scalar(
                select(UserModel).where(
                    UserModel.email == settings.ADMIN_EMAIL.lower()
                )
            )
            if existing_admin is None:
                session.add(UserModel(
                    id=str(uuid4()),
                    email=settings.ADMIN_EMAIL.lower(),
                    password_hash=hash_password(settings.ADMIN_PASSWORD),
                    role="admin",
                ))
        elif await session.scalar(select(UserModel.id).limit(1)) is None:
            raise RuntimeError(
                "No users exist. Set ADMIN_EMAIL and ADMIN_PASSWORD to create the first administrator"
            )
        await session.commit()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await initialize_database()
    yield
    await engine.dispose()

app = FastAPI(
    title=settings.APP_NAME,
    description="SentinelNet Lawful Defensive Monitoring & Decision-Support System",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)


@app.middleware("http")
async def record_audit_mutation(request: Request, call_next):
    if request.url.path.startswith("/api/v1/") and not request.url.path.endswith("/auth/login"):
        authorization = request.headers.get("authorization", "")
        if authorization.lower().startswith("bearer "):
            try:
                claims = jwt.decode(
                    authorization[7:], settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
                )
                actor_id = claims.get("sub")
                if isinstance(actor_id, str):
                    request.state.audit_actor_id = actor_id
                    requested_space = request.headers.get("x-data-space", "simulation")
                    request.state.audit_space = (
                        requested_space if requested_space in {"simulation", "real"} else "simulation"
                    )
                    request.state.audit_action = request.method
                    request.state.audit_resource = request.url.path
                    request.state.audit_source_ip = request.client.host if request.client else None
            except JWTError:
                pass
    return await call_next(request)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "status": "OPERATIONAL",
        "documentation": f"{settings.API_V1_STR}/docs",
        "health_check": f"{settings.API_V1_STR}/system/health"
    }

@app.get("/health")
async def top_level_health(db_session: AsyncSession = Depends(get_db)):
    """Alias for top-level health check endpoint."""
    from app.api.v1.system import get_system_health
    return await get_system_health(db=db_session)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.API_HOST, port=settings.API_PORT, reload=True)
