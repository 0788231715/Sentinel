import csv
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import secrets
from io import StringIO
from typing import Annotated, Literal
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Response, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import CanReadMonitoring, CanWriteMonitoring, require_permission
from app.db.models import (
    AlertModel,
    AuditLogModel,
    DeviceModel,
    EventModel,
    SensorModel,
    TelemetryModel,
    UserModel,
)
from app.db.session import get_db
from app.services.realtime import monitoring_connections

router = APIRouter()
ingestion_router = APIRouter(prefix="/ingestion/v1")
DbSession = Annotated[AsyncSession, Depends(get_db)]
DataSpace = Literal["simulation", "real"]
CurrentSpace = Annotated[DataSpace, Header(alias="X-Data-Space")]
DeviceIdHeader = Annotated[str, Header(alias="X-Device-ID")]
DeviceKeyHeader = Annotated[str, Header(alias="X-Device-Key")]


class HardwareTelemetryInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    message_id: UUID
    sensor_id: str = Field(min_length=1, max_length=64)
    timestamp: datetime
    value: float = Field(allow_inf_nan=False)
    unit: str = Field(min_length=1, max_length=32)
    quality: Literal["FRESH", "DELAYED"] = "FRESH"


class DeviceHeartbeatInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    message_id: UUID
    timestamp: datetime
    status: Literal["ONLINE", "MAINTENANCE"] = "ONLINE"
    connectivity: Literal["CONNECTED", "DEGRADED"] = "CONNECTED"
    health: int | None = Field(default=None, ge=0, le=100)
    battery_percent: int | None = Field(default=None, ge=0, le=100)
    firmware: str | None = Field(default=None, max_length=64)
    network: str | None = Field(default=None, max_length=128)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)


def _device_key_digest(key: str) -> str:
    pepper = settings.DEVICE_INGESTION_SECRET.encode("utf-8")
    return hmac.new(pepper, key.encode("utf-8"), hashlib.sha256).hexdigest()


def _require_real_space(space: DataSpace) -> None:
    if space != "real":
        raise HTTPException(
            status_code=409,
            detail="Hardware credentials can only be provisioned in the real data space",
        )


async def _authenticated_real_device(
    db: AsyncSession, device_id: str, device_key: str, space: DataSpace
) -> DeviceModel:
    _require_real_space(space)
    device = await db.scalar(
        select(DeviceModel).where(
            DeviceModel.id == device_id,
            DeviceModel.space == "real",
        )
    )
    if (
        device is None
        or device.ingestion_key_hash is None
        or not hmac.compare_digest(device.ingestion_key_hash, _device_key_digest(device_key))
    ):
        raise HTTPException(status_code=401, detail="Invalid device credentials")
    return device


@router.post("/devices/{device_id}/credentials")
async def rotate_device_ingestion_credential(
    device_id: str,
    db: DbSession,
    _admin: Annotated[UserModel, Depends(require_permission("users:manage"))],
    space: CurrentSpace = "simulation",
):
    _require_real_space(space)
    device = await db.scalar(
        select(DeviceModel).where(
            DeviceModel.id == device_id,
            DeviceModel.space == "real",
        )
    )
    if device is None:
        raise HTTPException(status_code=404, detail="Real-space device not found")

    credential = secrets.token_urlsafe(32)
    device.ingestion_key_hash = _device_key_digest(credential)
    device.ingestion_key_created_at = datetime.now(timezone.utc)
    await db.commit()
    return {
        "device_id": device.id,
        "space": "real",
        "credential": credential,
        "warning": "This credential is shown once. Store it securely; rotating it invalidates the previous credential.",
    }


@ingestion_router.post("/telemetry", status_code=status.HTTP_201_CREATED)
async def ingest_hardware_telemetry(
    payload: HardwareTelemetryInput,
    db: DbSession,
    response: Response,
    device_id: DeviceIdHeader,
    device_key: DeviceKeyHeader,
    space: CurrentSpace = "simulation",
):
    device = await _authenticated_real_device(db, device_id, device_key, space)

    sensor = await db.scalar(
        select(SensorModel).where(
            SensorModel.id == payload.sensor_id,
            SensorModel.device_id == device.id,
            SensorModel.space == "real",
        )
    )
    if sensor is None:
        raise HTTPException(status_code=404, detail="Sensor is not enrolled to this device")
    if payload.unit.strip() != sensor.unit:
        raise HTTPException(
            status_code=422,
            detail=f"Unit mismatch: enrolled sensor expects {sensor.unit}",
        )
    sensor_id = sensor.id

    timestamp = payload.timestamp
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)
    else:
        timestamp = timestamp.astimezone(timezone.utc)
    if timestamp > datetime.now(timezone.utc) + timedelta(minutes=5):
        raise HTTPException(status_code=422, detail="Telemetry timestamp is too far in the future")

    idempotency_key = f"{device.id}:{payload.message_id}"
    existing = await db.scalar(
        select(TelemetryModel).where(TelemetryModel.idempotency_key == idempotency_key)
    )
    if existing is not None:
        if (
            existing.sensor_id != sensor_id
            or existing.value != payload.value
            or existing.timestamp.replace(tzinfo=existing.timestamp.tzinfo or timezone.utc)
            != timestamp
        ):
            raise HTTPException(
                status_code=409,
                detail="message_id was already used with a different telemetry payload",
            )
        response.status_code = status.HTTP_200_OK
        return {
            "id": existing.id,
            "sensor_id": existing.sensor_id,
            "value": existing.value,
            "timestamp": _timestamp(existing.timestamp),
            "quality": existing.quality,
            "data_origin": existing.data_origin,
            "space": existing.space,
            "duplicate": True,
        }

    point = TelemetryModel(
        id=str(uuid4()),
        space="real",
        sensor_id=sensor.id,
        value=payload.value,
        timestamp=timestamp,
        quality=payload.quality,
        data_origin="PHYSICAL",
        idempotency_key=idempotency_key,
    )
    db.add(point)
    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        existing = await db.scalar(
            select(TelemetryModel).where(TelemetryModel.idempotency_key == idempotency_key)
        )
        if existing is None:
            raise HTTPException(status_code=409, detail="Telemetry message could not be accepted") from None
        if (
            existing.sensor_id != sensor_id
            or existing.value != payload.value
            or existing.timestamp.replace(tzinfo=existing.timestamp.tzinfo or timezone.utc)
            != timestamp
        ):
            raise HTTPException(
                status_code=409,
                detail="message_id was already used with a different telemetry payload",
            ) from None
        response.status_code = status.HTTP_200_OK
        return {
            "id": existing.id,
            "sensor_id": existing.sensor_id,
            "value": existing.value,
            "timestamp": _timestamp(existing.timestamp),
            "quality": existing.quality,
            "data_origin": existing.data_origin,
            "space": existing.space,
            "duplicate": True,
        }

    if sensor.last_update is None or timestamp >= sensor.last_update.replace(
        tzinfo=sensor.last_update.tzinfo or timezone.utc
    ):
        sensor.current_value = payload.value
        sensor.last_update = timestamp
        sensor.data_quality = payload.quality
    sensor.data_origin = "PHYSICAL"
    aggregates = (
        await db.execute(
            select(
                func.min(TelemetryModel.value),
                func.max(TelemetryModel.value),
                func.avg(TelemetryModel.value),
            ).where(
                TelemetryModel.sensor_id == sensor.id,
                TelemetryModel.space == "real",
                TelemetryModel.quality != "INVALID",
            )
        )
    ).one()
    sensor.minimum, sensor.maximum, sensor.average = aggregates
    received_at = datetime.now(timezone.utc)
    device.last_communication = received_at
    device.connectivity = "CONNECTED"
    device.data_origin = "PHYSICAL"
    device.status = "ONLINE"
    await db.commit()
    await db.refresh(point)
    await db.refresh(sensor)

    result = {
        "id": point.id,
        "sensor_id": point.sensor_id,
        "value": point.value,
        "timestamp": _timestamp(point.timestamp),
        "quality": point.quality,
        "data_origin": "PHYSICAL",
        "space": "real",
        "duplicate": False,
    }
    await monitoring_connections.broadcast(
        {"type": "telemetry.created", "data": result},
        space="real",
    )
    return result


@ingestion_router.post("/heartbeat")
async def ingest_device_heartbeat(
    payload: DeviceHeartbeatInput,
    db: DbSession,
    device_id: DeviceIdHeader,
    device_key: DeviceKeyHeader,
    space: CurrentSpace = "simulation",
):
    device = await _authenticated_real_device(db, device_id, device_key, space)
    timestamp = payload.timestamp
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)
    else:
        timestamp = timestamp.astimezone(timezone.utc)
    now = datetime.now(timezone.utc)
    if timestamp > now + timedelta(minutes=5):
        raise HTTPException(status_code=422, detail="Heartbeat timestamp is too far in the future")
    if device.last_heartbeat_message_id == str(payload.message_id):
        return {
            "device_id": device.id,
            "space": "real",
            "data_origin": "PHYSICAL",
            "duplicate": True,
        }

    if device.last_communication is None or timestamp >= device.last_communication.replace(
        tzinfo=device.last_communication.tzinfo or timezone.utc
    ):
        device.status = payload.status
        device.connectivity = payload.connectivity
        device.last_communication = timestamp
        device.last_heartbeat_message_id = str(payload.message_id)
        if payload.health is not None:
            device.health = payload.health
        if payload.battery_percent is not None:
            device.battery_percent = payload.battery_percent
        if payload.firmware is not None:
            device.firmware = payload.firmware
        if payload.network is not None:
            device.network = payload.network
        if payload.latitude is not None:
            device.latitude = payload.latitude
        if payload.longitude is not None:
            device.longitude = payload.longitude
    device.data_origin = "PHYSICAL"
    await db.commit()
    await db.refresh(device)
    data = {
        "device_id": device.id,
        "space": "real",
        "status": device.status,
        "connectivity": device.connectivity,
        "health": device.health,
        "battery_percent": device.battery_percent,
        "firmware": device.firmware,
        "network": device.network,
        "latitude": device.latitude,
        "longitude": device.longitude,
        "last_communication": _timestamp(device.last_communication or now),
        "data_origin": "PHYSICAL",
        "duplicate": False,
    }
    await monitoring_connections.broadcast(
        {"type": "device.status", "data": data},
        space="real",
    )
    return data


def _timestamp(value: datetime) -> str:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.isoformat().replace("+00:00", "Z")


@router.get("/analytics")
async def get_analytics(
    db: DbSession, _user: CanReadMonitoring, space: CurrentSpace = "simulation"
):
    telemetry_count, average_value, low_value, high_value = (
        await db.execute(
            select(
                func.count(TelemetryModel.id),
                func.avg(TelemetryModel.value),
                func.min(TelemetryModel.value),
                func.max(TelemetryModel.value),
            ).where(
                TelemetryModel.space == space,
                TelemetryModel.quality != "INVALID",
            )
        )
    ).one()
    device_count = await db.scalar(
        select(func.count(DeviceModel.id)).where(DeviceModel.space == space)
    )
    sensor_count = await db.scalar(
        select(func.count(SensorModel.id)).where(SensorModel.space == space)
    )
    event_counts = await db.execute(
        select(EventModel.severity, func.count(EventModel.id))
        .where(EventModel.space == space)
        .group_by(EventModel.severity)
    )
    alert_counts = await db.execute(
        select(AlertModel.severity, func.count(AlertModel.id))
        .where(AlertModel.space == space)
        .group_by(AlertModel.severity)
    )
    return {
        "space": space,
        "generated_at": _timestamp(datetime.now(timezone.utc)),
        "sources": {
            "devices": device_count or 0,
            "sensors": sensor_count or 0,
            "telemetry_points": telemetry_count or 0,
        },
        "telemetry": {
            "minimum": low_value,
            "maximum": high_value,
            "average": average_value,
        },
        "events_by_severity": {severity: count for severity, count in event_counts.all()},
        "alerts_by_severity": {severity: count for severity, count in alert_counts.all()},
        "limitations": ["Telemetry values use stored sensor units and are not combined across unlike sensors."],
    }


@router.get("/search")
async def search_resources(
    db: DbSession,
    _user: CanReadMonitoring,
    query: str = Query(min_length=2, max_length=128),
    space: CurrentSpace = "simulation",
):
    normalized_query = query.strip()
    if len(normalized_query) < 2:
        raise HTTPException(status_code=422, detail="Search query must contain at least two characters")
    term = f"%{normalized_query}%"
    devices = list(
        await db.scalars(
            select(DeviceModel)
            .where(
                DeviceModel.space == space,
                (DeviceModel.name.ilike(term) | DeviceModel.id.ilike(term) | DeviceModel.location.ilike(term)),
            )
            .limit(20)
        )
    )
    sensors = list(
        await db.scalars(
            select(SensorModel)
            .where(
                SensorModel.space == space,
                (SensorModel.sensor_type.ilike(term) | SensorModel.id.ilike(term)),
            )
            .limit(20)
        )
    )
    events = list(
        await db.scalars(
            select(EventModel)
            .where(
                EventModel.space == space,
                (EventModel.title.ilike(term) | EventModel.summary.ilike(term) | EventModel.location.ilike(term)),
            )
            .limit(20)
        )
    )
    alerts = list(
        await db.scalars(
            select(AlertModel)
            .where(
                AlertModel.space == space,
                (AlertModel.summary.ilike(term) | AlertModel.source.ilike(term)),
            )
            .limit(20)
        )
    )
    return {
        "results": [
            *({"type": "DEVICE", "id": item.id, "title": item.name, "detail": item.location, "href": f"/devices/{item.id}"} for item in devices),
            *({"type": "SENSOR", "id": item.id, "title": item.sensor_type, "detail": item.id, "href": f"/sensors/{item.id}"} for item in sensors),
            *({"type": "EVENT", "id": item.id, "title": item.title, "detail": item.location, "href": "/events"} for item in events),
            *({"type": "ALERT", "id": item.id, "title": item.summary, "detail": item.source, "href": "/alerts"} for item in alerts),
        ][:50]
    }


@router.get("/risk")
async def get_risk_status(
    _user: CanReadMonitoring, space: CurrentSpace = "simulation"
):
    return {
        "space": space,
        "status": "NOT_CONFIGURED",
        "score": None,
        "contributors": [],
        "message": "No validated risk model is configured; SentinelNet will not fabricate a risk score.",
    }


@router.get("/ai")
async def get_ai_status(
    _user: CanReadMonitoring, space: CurrentSpace = "simulation"
):
    return {
        "space": space,
        "status": "NOT_CONFIGURED",
        "detections": [],
        "message": "No inference service or model is configured. No AI predictions are available.",
    }


@router.get("/network")
async def get_network_status(
    db: DbSession, _user: CanReadMonitoring, space: CurrentSpace = "simulation"
):
    devices = list(
        await db.scalars(
            select(DeviceModel).where(DeviceModel.space == space).order_by(DeviceModel.name)
        )
    )
    counts: dict[str, int] = {}
    for device in devices:
        state = device.connectivity.upper()
        counts[state] = counts.get(state, 0) + 1
    return {
        "space": space,
        "total_devices": len(devices),
        "connectivity": counts,
        "devices": [
            {
                "id": device.id,
                "name": device.name,
                "network": device.network,
                "connectivity": device.connectivity,
                "last_communication": (
                    _timestamp(device.last_communication)
                    if device.last_communication
                    else None
                ),
                "data_origin": device.data_origin,
            }
            for device in devices
        ],
        "limitations": ["Network latency and packet counters are not collected by the current ingestion backend."],
    }


@router.get("/tracking")
async def get_tracking_data(
    db: DbSession, _user: CanReadMonitoring, space: CurrentSpace = "simulation"
):
    devices = list(
        await db.scalars(
            select(DeviceModel).where(DeviceModel.space == space).order_by(DeviceModel.name)
        )
    )
    points = [
        {
            "id": device.id,
            "name": device.name,
            "latitude": device.latitude,
            "longitude": device.longitude,
            "location": device.location,
            "status": device.status,
            "timestamp": (
                _timestamp(device.last_communication)
                if device.last_communication
                else None
            ),
            "data_origin": device.data_origin,
        }
        for device in devices
        if device.latitude is not None and device.longitude is not None
    ]
    return {
        "space": space,
        "assets": points,
        "unlocated_devices": len(devices) - len(points),
        "history_available": False,
        "message": "Historical movement is unavailable because location history is not ingested.",
    }


@router.get("/timeline")
async def get_timeline(
    db: DbSession,
    _user: CanReadMonitoring,
    space: CurrentSpace = "simulation",
    limit: int = Query(default=200, ge=1, le=500),
):
    events = list(
        await db.scalars(
            select(EventModel)
            .where(EventModel.space == space)
            .order_by(EventModel.timestamp.desc())
            .limit(limit)
        )
    )
    alerts = list(
        await db.scalars(
            select(AlertModel)
            .where(AlertModel.space == space)
            .order_by(AlertModel.timestamp.desc())
            .limit(limit)
        )
    )
    items = [
        {
            "id": event.id,
            "kind": "EVENT",
            "title": event.title,
            "summary": event.summary,
            "severity": event.severity,
            "status": event.status,
            "source": event.source,
            "timestamp": _timestamp(event.timestamp),
        }
        for event in events
    ] + [
        {
            "id": alert.id,
            "kind": "ALERT",
            "title": alert.summary,
            "summary": alert.summary,
            "severity": alert.severity,
            "status": alert.status,
            "source": alert.source,
            "timestamp": _timestamp(alert.timestamp),
        }
        for alert in alerts
    ]
    items.sort(key=lambda item: item["timestamp"], reverse=True)
    return {"space": space, "items": items[:limit]}


@router.get("/audit")
async def get_audit_logs(
    db: DbSession,
    _user: CanReadMonitoring,
    space: CurrentSpace = "simulation",
    limit: int = Query(default=100, ge=1, le=500),
):
    logs = list(
        await db.scalars(
            select(AuditLogModel)
            .where(AuditLogModel.space == space)
            .order_by(AuditLogModel.timestamp.desc())
            .limit(limit)
        )
    )
    return {
        "items": [
            {
                "id": item.id,
                "actor_id": item.actor_id,
                "actor_email": item.actor_email,
                "action": item.action,
                "resource": item.resource,
                "source_ip": item.source_ip,
                "timestamp": _timestamp(item.timestamp),
            }
            for item in logs
        ]
    }


@router.get("/reports/{report_type}")
async def export_report(
    report_type: Literal["devices", "sensors", "events", "alerts"],
    db: DbSession,
    _user: CanReadMonitoring,
    space: CurrentSpace = "simulation",
):
    output = StringIO()
    writer = csv.writer(output)
    if report_type == "devices":
        rows = await db.scalars(
            select(DeviceModel).where(DeviceModel.space == space).order_by(DeviceModel.name)
        )
        writer.writerow(["id", "name", "type", "status", "connectivity", "location", "latitude", "longitude", "data_origin"])
        for row in rows:
            writer.writerow([row.id, row.name, row.type, row.status, row.connectivity, row.location, row.latitude, row.longitude, row.data_origin])
    elif report_type == "sensors":
        rows = await db.scalars(
            select(SensorModel).where(SensorModel.space == space).order_by(SensorModel.id)
        )
        writer.writerow(["id", "device_id", "sensor_type", "current_value", "unit", "threshold", "data_quality", "data_origin"])
        for row in rows:
            writer.writerow([row.id, row.device_id, row.sensor_type, row.current_value, row.unit, row.threshold, row.data_quality, row.data_origin])
    elif report_type == "events":
        rows = await db.scalars(
            select(EventModel).where(EventModel.space == space).order_by(EventModel.timestamp)
        )
        writer.writerow(["id", "timestamp", "title", "severity", "status", "source", "location", "summary"])
        for row in rows:
            writer.writerow([row.id, _timestamp(row.timestamp), row.title, row.severity, row.status, row.source, row.location, row.summary])
    else:
        rows = await db.scalars(
            select(AlertModel).where(AlertModel.space == space).order_by(AlertModel.timestamp)
        )
        writer.writerow(["id", "timestamp", "summary", "severity", "status", "source"])
        for row in rows:
            writer.writerow([row.id, _timestamp(row.timestamp), row.summary, row.severity, row.status, row.source])

    content = output.getvalue()
    output.close()
    return StreamingResponse(
        iter([content]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="sentinel-{space}-{report_type}.csv"'},
    )
