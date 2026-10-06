import asyncio
from datetime import datetime, timedelta, timezone
import json
from typing import Annotated, Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, Header, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from jose import JWTError, jwt
from pydantic import BaseModel, Field
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import CanReadMonitoring, CanWriteMonitoring
from app.db.models import (
    AlertModel,
    DeviceModel,
    EventModel,
    SensorModel,
    TelemetryModel,
    UserModel,
)
from app.db.session import AsyncSessionLocal, get_db
from app.services.realtime import monitoring_connections

router = APIRouter()
DbSession = Annotated[AsyncSession, Depends(get_db)]
Severity = Literal["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]
AlertStatus = Literal["ACTIVE", "ACKNOWLEDGED", "RESOLVED"]
DeviceStatus = Literal["ONLINE", "OFFLINE", "MAINTENANCE", "UNKNOWN"]
DataSpace = Literal["simulation", "real"]
CurrentSpace = Annotated[DataSpace, Header(alias="X-Data-Space")]
DataQuality = Literal["FRESH", "DELAYED", "STALE", "MISSING", "INVALID"]
TelemetryRange = Literal["1h", "6h", "24h", "7d", "30d"]


class DeviceInput(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    type: str = Field(min_length=1, max_length=64)
    status: DeviceStatus = "UNKNOWN"
    health: int = Field(default=0, ge=0, le=100)
    location: str = Field(default="Unknown", max_length=255)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    uptime: str = Field(default="0%", max_length=32)
    connectivity: str = Field(default="UNKNOWN", max_length=32)
    battery_percent: int | None = Field(default=None, ge=0, le=100)
    firmware: str | None = Field(default=None, max_length=64)
    network: str | None = Field(default=None, max_length=128)
    last_communication: datetime | None = None


class DevicePatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    type: str | None = Field(default=None, min_length=1, max_length=64)
    status: DeviceStatus | None = None
    health: int | None = Field(default=None, ge=0, le=100)
    location: str | None = Field(default=None, max_length=255)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    uptime: str | None = Field(default=None, max_length=32)
    connectivity: str | None = Field(default=None, max_length=32)
    battery_percent: int | None = Field(default=None, ge=0, le=100)
    firmware: str | None = Field(default=None, max_length=64)
    network: str | None = Field(default=None, max_length=128)
    last_communication: datetime | None = None


class SensorInput(BaseModel):
    sensor_type: str = Field(min_length=1, max_length=64)
    device_id: str
    unit: str = Field(min_length=1, max_length=32)
    threshold: float | None = None
    health: int = Field(default=100, ge=0, le=100)
    calibration_status: str = Field(default="UNKNOWN", max_length=32)


class SensorPatch(BaseModel):
    sensor_type: str | None = Field(default=None, min_length=1, max_length=64)
    unit: str | None = Field(default=None, min_length=1, max_length=32)
    threshold: float | None = None
    health: int | None = Field(default=None, ge=0, le=100)
    calibration_status: str | None = Field(default=None, max_length=32)


class TelemetryInput(BaseModel):
    value: float
    timestamp: datetime | None = None
    quality: DataQuality = "FRESH"


class AlertInput(BaseModel):
    summary: str = Field(min_length=1)
    severity: Severity = "INFO"
    source: str = Field(default="SYSTEM", max_length=128)
    status: AlertStatus = "ACTIVE"


class AlertPatch(BaseModel):
    summary: str | None = Field(default=None, min_length=1)
    severity: Severity | None = None
    source: str | None = Field(default=None, max_length=128)
    status: AlertStatus | None = None


class EventInput(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    severity: Severity = "INFO"
    source: str = Field(default="SYSTEM", max_length=128)
    status: AlertStatus = "ACTIVE"
    location: str = Field(default="Unknown", max_length=255)
    summary: str = Field(min_length=1)
    timestamp: datetime | None = None


class EventPatch(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    severity: Severity | None = None
    source: str | None = Field(default=None, max_length=128)
    status: AlertStatus | None = None
    location: str | None = Field(default=None, max_length=255)
    summary: str | None = Field(default=None, min_length=1)
    timestamp: datetime | None = None


def _device_data(device: DeviceModel) -> dict[str, object]:
    return {
        "id": device.id,
        "name": device.name,
        "type": device.type,
        "status": device.status,
        "health": device.health,
        "location": device.location,
        "latitude": device.latitude,
        "longitude": device.longitude,
        "uptime": device.uptime,
        "connectivity": device.connectivity,
        "battery_percent": device.battery_percent,
        "firmware": device.firmware,
        "network": device.network,
        "last_communication": _iso_timestamp(device.last_communication),
        "data_origin": device.data_origin,
        "space": device.space,
        "ingestion_credential_configured": device.ingestion_key_hash is not None,
        "ingestion_credential_created_at": _iso_timestamp(device.ingestion_key_created_at),
    }


def _alert_data(alert: AlertModel) -> dict[str, object]:
    timestamp = alert.timestamp
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)
    return {
        "id": alert.id,
        "summary": alert.summary,
        "severity": alert.severity,
        "source": alert.source,
        "status": alert.status,
        "timestamp": timestamp.isoformat().replace("+00:00", "Z"),
        "space": alert.space,
    }


def _event_data(event: EventModel) -> dict[str, object]:
    timestamp = event.timestamp
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)
    return {
        "id": event.id,
        "title": event.title,
        "severity": event.severity,
        "source": event.source,
        "timestamp": timestamp.isoformat().replace("+00:00", "Z"),
        "status": event.status,
        "location": event.location,
        "summary": event.summary,
        "space": event.space,
    }


def _iso_timestamp(timestamp: datetime | None) -> str | None:
    if timestamp is None:
        return None
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)
    return timestamp.isoformat().replace("+00:00", "Z")


def _freshness(last_update: datetime | None, quality: str | None = None) -> str:
    if quality == "INVALID":
        return "INVALID"
    if quality == "MISSING":
        return "MISSING"
    if last_update is None:
        return "MISSING"
    now = datetime.now(timezone.utc)
    if last_update.tzinfo is None:
        last_update = last_update.replace(tzinfo=timezone.utc)
    age_seconds = (now - last_update).total_seconds()
    if age_seconds < -300:
        return "INVALID"
    computed = "FRESH" if age_seconds <= 60 else "DELAYED" if age_seconds <= 300 else "STALE"
    quality_rank = {"FRESH": 0, "DELAYED": 1, "STALE": 2, "INVALID": 3}
    if quality in quality_rank and quality_rank[quality] > quality_rank[computed]:
        return quality
    return computed


def _sensor_data(sensor: SensorModel, device: DeviceModel | None = None) -> dict[str, object]:
    freshness = _freshness(sensor.last_update, sensor.data_quality)
    return {
        "id": sensor.id,
        "sensor_type": sensor.sensor_type,
        "device_id": sensor.device_id,
        "device_name": device.name if device else None,
        "current_value": sensor.current_value,
        "unit": sensor.unit,
        "threshold": sensor.threshold,
        "minimum": sensor.minimum,
        "maximum": sensor.maximum,
        "average": sensor.average,
        "last_update": _iso_timestamp(sensor.last_update),
        "health": sensor.health,
        "calibration_status": sensor.calibration_status,
        "data_quality": freshness,
        "data_origin": sensor.data_origin,
        "space": sensor.space,
    }


def _telemetry_data(point: TelemetryModel) -> dict[str, object]:
    return {
        "id": point.id,
        "sensor_id": point.sensor_id,
        "value": point.value,
        "timestamp": _iso_timestamp(point.timestamp),
        "quality": point.quality,
        "data_origin": point.data_origin,
        "space": point.space,
    }


async def _record_event(
    db: AsyncSession,
    *,
    title: str,
    summary: str,
    source: str,
    severity: str = "INFO",
    location: str = "Unknown",
    status_value: str = "ACTIVE",
    space: DataSpace = "simulation",
) -> EventModel:
    event = EventModel(
        id=str(uuid4()),
        title=title,
        summary=summary,
        source=source,
        severity=severity,
        location=location,
        status=status_value,
        space=space,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(event)
    await db.flush()
    return event


async def _not_found(db: AsyncSession, model: type, identifier: str, space: DataSpace):
    row = await db.scalar(
        select(model).where(model.id == identifier, model.space == space)
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return row


@router.get("/overview")
async def get_monitoring_overview(
    db: DbSession, _user: CanReadMonitoring, space: CurrentSpace = "simulation"
):
    device_count, online_devices = (
        await db.execute(
            select(
                func.count(DeviceModel.id),
                func.sum(case((DeviceModel.status == "ONLINE", 1), else_=0)),
            ).where(DeviceModel.space == space)
        )
    ).one()
    active_alerts = await db.scalar(
        select(func.count(AlertModel.id)).where(
            AlertModel.status == "ACTIVE", AlertModel.space == space
        )
    )
    last_event = await db.scalar(
        select(EventModel).where(EventModel.space == space).order_by(EventModel.timestamp.desc()).limit(1)
    )
    return {
        "status": "HEALTHY",
        "risk_level": "NOT_CALCULATED",
        "risk_score": None,
        "network_load": None,
        "active_alerts": active_alerts or 0,
        "total_devices": device_count or 0,
        "online_devices": online_devices or 0,
        "last_event": _event_data(last_event)["timestamp"] if last_event else None,
        "stream_health": {},
        "space": space,
    }


@router.get("/devices")
async def get_devices(
    db: DbSession, _user: CanReadMonitoring, space: CurrentSpace = "simulation"
):
    devices = list(
        await db.scalars(
            select(DeviceModel).where(DeviceModel.space == space).order_by(DeviceModel.name)
        )
    )
    sensor_counts = dict(
        (
            await db.execute(
                select(SensorModel.device_id, func.count(SensorModel.id))
                .where(SensorModel.space == space)
                .group_by(SensorModel.device_id)
            )
        ).all()
    )
    counts = {
        status_name.lower(): sum(device.status == status_name for device in devices)
        for status_name in ("ONLINE", "OFFLINE", "MAINTENANCE")
    }
    return {
        "devices": [
            {**_device_data(device), "sensor_count": sensor_counts.get(device.id, 0)}
            for device in devices
        ],
        "stats": {
            "total": len(devices),
            "online": counts["online"],
            "offline": counts["offline"],
            "maintenance": counts["maintenance"],
        },
    }


@router.post("/devices", status_code=status.HTTP_201_CREATED)
async def create_device(
    payload: DeviceInput,
    db: DbSession,
    _user: CanWriteMonitoring,
    space: CurrentSpace = "simulation",
):
    device = DeviceModel(
        id=str(uuid4()),
        space=space,
        data_origin="SIMULATED" if space == "simulation" else "UNVERIFIED",
        **payload.model_dump(),
    )
    db.add(device)
    await db.flush()
    event = await _record_event(
        db,
        title="Device registered",
        summary=f"{device.name} was added to the device inventory.",
        source="API",
        location=device.location,
        space=space,
    )
    await db.commit()
    await db.refresh(device)
    await monitoring_connections.broadcast({"type": "device.created", "data": _device_data(device)}, space=space)
    await monitoring_connections.broadcast({"type": "event.created", "data": _event_data(event)}, space=space)
    return _device_data(device)


@router.get("/devices/{device_id}")
async def get_device(
    device_id: str, db: DbSession, _user: CanReadMonitoring,
    space: CurrentSpace = "simulation",
):
    device = await _not_found(db, DeviceModel, device_id, space)
    sensors = list(
        await db.scalars(
            select(SensorModel)
            .where(SensorModel.device_id == device.id, SensorModel.space == space)
            .order_by(SensorModel.sensor_type)
        )
    )
    events = list(
        await db.scalars(
            select(EventModel)
            .where(EventModel.location == device.location, EventModel.space == space)
            .order_by(EventModel.timestamp.desc())
            .limit(20)
        )
    )
    return {
        **_device_data(device),
        "sensors": [_sensor_data(sensor, device) for sensor in sensors],
        "recent_events": [_event_data(event) for event in events],
    }


@router.get("/sensors")
async def get_sensors(
    db: DbSession,
    _user: CanReadMonitoring,
    space: CurrentSpace = "simulation",
    device_id: str | None = None,
):
    statement = (
        select(SensorModel, DeviceModel)
        .join(
            DeviceModel,
            (DeviceModel.id == SensorModel.device_id)
            & (DeviceModel.space == SensorModel.space),
        )
        .where(SensorModel.space == space)
        .order_by(SensorModel.sensor_type, SensorModel.id)
    )
    if device_id:
        statement = statement.where(SensorModel.device_id == device_id)
    rows = (await db.execute(statement)).all()
    data = [_sensor_data(sensor, device) for sensor, device in rows]
    quality_counts = {
        quality: sum(sensor["data_quality"] == quality for sensor in data)
        for quality in ("FRESH", "DELAYED", "STALE", "MISSING", "INVALID")
    }
    return {"sensors": data, "stats": {"total": len(data), "quality": quality_counts}}


@router.post("/sensors", status_code=status.HTTP_201_CREATED)
async def create_sensor(
    payload: SensorInput,
    db: DbSession,
    _user: CanWriteMonitoring,
    space: CurrentSpace = "simulation",
):
    device = await _not_found(db, DeviceModel, payload.device_id, space)
    sensor = SensorModel(
        id=str(uuid4()),
        space=space,
        sensor_type=payload.sensor_type,
        device_id=payload.device_id,
        unit=payload.unit,
        threshold=payload.threshold,
        health=payload.health,
        calibration_status=payload.calibration_status,
        data_origin="SIMULATED" if space == "simulation" else "UNVERIFIED",
        data_quality="MISSING",
    )
    db.add(sensor)
    await db.commit()
    await db.refresh(sensor)
    data = _sensor_data(sensor, device)
    await monitoring_connections.broadcast({"type": "sensor.created", "data": data}, space=space)
    return data


@router.get("/sensors/{sensor_id}")
async def get_sensor(
    sensor_id: str, db: DbSession, _user: CanReadMonitoring,
    space: CurrentSpace = "simulation",
):
    sensor = await _not_found(db, SensorModel, sensor_id, space)
    device = await _not_found(db, DeviceModel, sensor.device_id, space)
    return _sensor_data(sensor, device)


@router.patch("/sensors/{sensor_id}")
async def update_sensor(
    sensor_id: str,
    payload: SensorPatch,
    db: DbSession,
    _user: CanWriteMonitoring,
    space: CurrentSpace = "simulation",
):
    sensor = await _not_found(db, SensorModel, sensor_id, space)
    changes = payload.model_dump(exclude_unset=True, exclude_none=True)
    if not changes:
        raise HTTPException(status_code=422, detail="At least one non-null field is required")
    for key, value in changes.items():
        setattr(sensor, key, value)
    await db.commit()
    await db.refresh(sensor)
    device = await _not_found(db, DeviceModel, sensor.device_id, space)
    data = _sensor_data(sensor, device)
    await monitoring_connections.broadcast({"type": "sensor.updated", "data": data}, space=space)
    return data


@router.delete("/sensors/{sensor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sensor(
    sensor_id: str, db: DbSession, _user: CanWriteMonitoring,
    space: CurrentSpace = "simulation",
):
    sensor = await _not_found(db, SensorModel, sensor_id, space)
    data = _sensor_data(sensor)
    await db.delete(sensor)
    await db.commit()
    await monitoring_connections.broadcast({"type": "sensor.deleted", "data": data}, space=space)


@router.get("/sensors/{sensor_id}/telemetry")
async def get_sensor_telemetry(
    sensor_id: str,
    db: DbSession,
    _user: CanReadMonitoring,
    range: TelemetryRange = "24h",
    start: datetime | None = None,
    end: datetime | None = None,
    limit: int = Query(default=1000, ge=1, le=5000),
    space: CurrentSpace = "simulation",
):
    await _not_found(db, SensorModel, sensor_id, space)
    if (start is None) != (end is None):
        raise HTTPException(status_code=422, detail="Provide both start and end for a custom range")
    if start is not None and end is not None:
        if start >= end:
            raise HTTPException(status_code=422, detail="Telemetry start must be before end")
        since, until = start, end
        selected_range = "custom"
    else:
        until = datetime.now(timezone.utc)
        durations = {
            "1h": timedelta(hours=1),
            "6h": timedelta(hours=6),
            "24h": timedelta(hours=24),
            "7d": timedelta(days=7),
            "30d": timedelta(days=30),
        }
        since = until - durations[range]
        selected_range = range

    points = list(
        await db.scalars(
            select(TelemetryModel)
            .where(
                TelemetryModel.sensor_id == sensor_id,
                TelemetryModel.space == space,
                TelemetryModel.timestamp >= since,
                TelemetryModel.timestamp <= until,
            )
            .order_by(TelemetryModel.timestamp.desc())
            .limit(limit)
        )
    )
    points.reverse()
    values = [point.value for point in points if point.quality != "INVALID"]
    return {
        "sensor_id": sensor_id,
        "range": selected_range,
        "from": _iso_timestamp(since),
        "to": _iso_timestamp(until),
        "points": [_telemetry_data(point) for point in points],
        "stats": {
            "count": len(points),
            "minimum": min(values) if values else None,
            "maximum": max(values) if values else None,
            "average": sum(values) / len(values) if values else None,
        },
        "data_origin": (
            "SIMULATED"
            if points and all(point.data_origin == "SIMULATED" for point in points)
            else "PHYSICAL"
            if points and all(point.data_origin == "PHYSICAL" for point in points)
            else "MIXED"
            if points
            else "NONE"
        ),
    }


@router.post("/sensors/{sensor_id}/telemetry", status_code=status.HTTP_201_CREATED)
async def ingest_sensor_telemetry(
    sensor_id: str,
    payload: TelemetryInput,
    db: DbSession,
    _user: CanWriteMonitoring,
    space: CurrentSpace = "simulation",
):
    sensor = await _not_found(db, SensorModel, sensor_id, space)
    timestamp = payload.timestamp or datetime.now(timezone.utc)
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    if timestamp > now + timedelta(minutes=5):
        raise HTTPException(status_code=422, detail="Telemetry timestamp is too far in the future")

    point = TelemetryModel(
        id=str(uuid4()),
        space=space,
        sensor_id=sensor.id,
        value=payload.value,
        timestamp=timestamp,
        quality=payload.quality,
        data_origin="SIMULATED" if space == "simulation" else "UNVERIFIED",
    )
    db.add(point)
    if sensor.last_update is None or timestamp >= sensor.last_update.replace(tzinfo=sensor.last_update.tzinfo or timezone.utc):
        if payload.quality != "INVALID":
            sensor.current_value = payload.value
        sensor.last_update = timestamp
        sensor.data_quality = payload.quality
    aggregates = (
        await db.execute(
            select(
                func.min(TelemetryModel.value),
                func.max(TelemetryModel.value),
                func.avg(TelemetryModel.value),
            ).where(
                TelemetryModel.sensor_id == sensor.id,
                TelemetryModel.space == space,
                TelemetryModel.quality != "INVALID",
            )
        )
    ).one()
    sensor.minimum, sensor.maximum, sensor.average = aggregates
    device = await _not_found(db, DeviceModel, sensor.device_id, space)
    received_at = datetime.now(timezone.utc)
    if device.last_communication is None or received_at >= device.last_communication.replace(tzinfo=device.last_communication.tzinfo or timezone.utc):
        device.last_communication = received_at
        device.connectivity = "CONNECTED"
    await db.commit()
    await db.refresh(point)
    await db.refresh(sensor)
    data = _telemetry_data(point)
    await monitoring_connections.broadcast({"type": "telemetry.created", "data": data}, space=space)
    await monitoring_connections.broadcast(
        {"type": "sensor.updated", "data": _sensor_data(sensor, device)}, space=space
    )
    return data


@router.patch("/devices/{device_id}")
async def update_device(
    device_id: str,
    payload: DevicePatch,
    db: DbSession,
    _user: CanWriteMonitoring,
    space: CurrentSpace = "simulation",
):
    device = await _not_found(db, DeviceModel, device_id, space)
    changes = payload.model_dump(exclude_unset=True, exclude_none=True)
    if not changes:
        raise HTTPException(status_code=422, detail="At least one non-null field is required")
    for key, value in changes.items():
        setattr(device, key, value)
    event = await _record_event(
        db,
        title="Device updated",
        summary=f"{device.name} device details were updated.",
        source="API",
        location=device.location,
        space=space,
    )
    await db.commit()
    await db.refresh(device)
    await monitoring_connections.broadcast({"type": "event.created", "data": _event_data(event)}, space=space)
    await monitoring_connections.broadcast({"type": "device.updated", "data": _device_data(device)}, space=space)
    return _device_data(device)


@router.delete("/devices/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_device(
    device_id: str, db: DbSession, _user: CanWriteMonitoring,
    space: CurrentSpace = "simulation",
):
    device = await _not_found(db, DeviceModel, device_id, space)
    data = _device_data(device)
    await db.delete(device)
    event = await _record_event(
        db,
        title="Device removed",
        summary=f"{data['name']} was removed from the device inventory.",
        source="API",
        location=str(data["location"]),
        space=space,
    )
    await db.commit()
    await monitoring_connections.broadcast({"type": "device.deleted", "data": data}, space=space)
    await monitoring_connections.broadcast({"type": "event.created", "data": _event_data(event)}, space=space)


@router.get("/alerts")
async def get_alerts(
    db: DbSession, _user: CanReadMonitoring, space: CurrentSpace = "simulation"
):
    alerts = list(
        await db.scalars(
            select(AlertModel).where(AlertModel.space == space).order_by(AlertModel.id)
        )
    )
    return {
        "alerts": [_alert_data(alert) for alert in alerts],
        "stats": {
            "critical": sum(alert.severity == "CRITICAL" for alert in alerts),
            "active": sum(alert.status == "ACTIVE" for alert in alerts),
        },
    }


@router.post("/alerts", status_code=status.HTTP_201_CREATED)
async def create_alert(
    payload: AlertInput, db: DbSession, _user: CanWriteMonitoring,
    space: CurrentSpace = "simulation",
):
    alert = AlertModel(id=str(uuid4()), space=space, **payload.model_dump())
    db.add(alert)
    await db.flush()
    event = await _record_event(
        db,
        title="Alert created",
        summary=alert.summary,
        source=alert.source,
        severity=alert.severity,
        space=space,
    )
    await db.commit()
    await db.refresh(alert)
    await monitoring_connections.broadcast({"type": "alert.created", "data": _alert_data(alert)}, space=space)
    await monitoring_connections.broadcast({"type": "event.created", "data": _event_data(event)}, space=space)
    return _alert_data(alert)


@router.get("/alerts/{alert_id}")
async def get_alert(
    alert_id: str, db: DbSession, _user: CanReadMonitoring,
    space: CurrentSpace = "simulation",
):
    return _alert_data(await _not_found(db, AlertModel, alert_id, space))


@router.patch("/alerts/{alert_id}")
async def update_alert(
    alert_id: str,
    payload: AlertPatch,
    db: DbSession,
    _user: CanWriteMonitoring,
    space: CurrentSpace = "simulation",
):
    alert = await _not_found(db, AlertModel, alert_id, space)
    changes = payload.model_dump(exclude_unset=True, exclude_none=True)
    if not changes:
        raise HTTPException(status_code=422, detail="At least one non-null field is required")
    for key, value in changes.items():
        setattr(alert, key, value)
    await db.commit()
    await db.refresh(alert)
    await monitoring_connections.broadcast({"type": "alert.updated", "data": _alert_data(alert)}, space=space)
    return _alert_data(alert)


@router.delete("/alerts/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alert(
    alert_id: str, db: DbSession, _user: CanWriteMonitoring,
    space: CurrentSpace = "simulation",
):
    alert = await _not_found(db, AlertModel, alert_id, space)
    data = _alert_data(alert)
    await db.delete(alert)
    await db.commit()
    await monitoring_connections.broadcast({"type": "alert.deleted", "data": data}, space=space)


@router.get("/events")
async def get_events(
    db: DbSession,
    _user: CanReadMonitoring,
    limit: int = Query(default=100, ge=1, le=500),
    space: CurrentSpace = "simulation",
):
    events = list(
        await db.scalars(
            select(EventModel)
            .where(EventModel.space == space)
            .order_by(EventModel.timestamp.desc())
            .limit(limit)
        )
    )
    return {"events": [_event_data(event) for event in events]}


@router.post("/events", status_code=status.HTTP_201_CREATED)
async def create_event(
    payload: EventInput, db: DbSession, _user: CanWriteMonitoring,
    space: CurrentSpace = "simulation",
):
    data = payload.model_dump()
    event = EventModel(
        id=str(uuid4()),
        space=space,
        **{key: value for key, value in data.items() if key != "timestamp"},
        timestamp=data["timestamp"] or datetime.now(timezone.utc),
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    await monitoring_connections.broadcast({"type": "event.created", "data": _event_data(event)}, space=space)
    return _event_data(event)


@router.get("/events/{event_id}")
async def get_event(
    event_id: str, db: DbSession, _user: CanReadMonitoring,
    space: CurrentSpace = "simulation",
):
    return _event_data(await _not_found(db, EventModel, event_id, space))


@router.patch("/events/{event_id}")
async def update_event(
    event_id: str,
    payload: EventPatch,
    db: DbSession,
    _user: CanWriteMonitoring,
    space: CurrentSpace = "simulation",
):
    event = await _not_found(db, EventModel, event_id, space)
    changes = payload.model_dump(exclude_unset=True, exclude_none=True)
    if not changes:
        raise HTTPException(status_code=422, detail="At least one non-null field is required")
    for key, value in changes.items():
        setattr(event, key, value)
    await db.commit()
    await db.refresh(event)
    data = _event_data(event)
    await monitoring_connections.broadcast({"type": "event.updated", "data": data}, space=space)
    return data


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: str, db: DbSession, _user: CanWriteMonitoring,
    space: CurrentSpace = "simulation",
):
    event = await _not_found(db, EventModel, event_id, space)
    data = _event_data(event)
    await db.delete(event)
    await db.commit()
    await monitoring_connections.broadcast({"type": "event.deleted", "data": data}, space=space)


@router.websocket("/ws")
async def monitoring_socket(
    websocket: WebSocket,
    token: str,
    space: DataSpace = Query(default="simulation"),
):
    try:
        claims = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = claims.get("sub")
        if not isinstance(user_id, str) or claims.get("role") not in {
            "viewer",
            "operator",
            "engineer",
            "analyst",
            "admin",
        }:
            raise JWTError("Invalid claims")
    except JWTError:
        await websocket.close(code=1008)
        return

    async with AsyncSessionLocal() as db:
        user = await db.get(UserModel, user_id)
        if user is None or not user.is_active:
            await websocket.close(code=1008)
            return

    await monitoring_connections.connect(websocket, space)
    try:
        while True:
            try:
                message = await asyncio.wait_for(websocket.receive_text(), timeout=30)
            except TimeoutError:
                await websocket.send_text(json.dumps({"type": "heartbeat"}))
                continue
            if message == "ping" or message == '{"type":"ping"}':
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        await monitoring_connections.disconnect(websocket, space)
