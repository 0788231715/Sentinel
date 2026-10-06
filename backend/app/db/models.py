from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class DeviceModel(Base):
    __tablename__ = "devices"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    space: Mapped[str] = mapped_column(String(16), nullable=False, default="simulation", index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="UNKNOWN")
    health: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    location: Mapped[str] = mapped_column(String(255), nullable=False, default="Unknown")
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    uptime: Mapped[str] = mapped_column(String(32), nullable=False, default="0%")
    connectivity: Mapped[str] = mapped_column(String(32), nullable=False, default="UNKNOWN")
    battery_percent: Mapped[int | None] = mapped_column(Integer, nullable=True)
    firmware: Mapped[str | None] = mapped_column(String(64), nullable=True)
    network: Mapped[str | None] = mapped_column(String(128), nullable=True)
    last_communication: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    data_origin: Mapped[str] = mapped_column(String(16), nullable=False, default="SIMULATED")
    ingestion_key_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    ingestion_key_created_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_heartbeat_message_id: Mapped[str | None] = mapped_column(String(36), nullable=True)


class SensorModel(Base):
    __tablename__ = "sensors"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    space: Mapped[str] = mapped_column(String(16), nullable=False, default="simulation", index=True)
    sensor_type: Mapped[str] = mapped_column(String(64), nullable=False)
    device_id: Mapped[str] = mapped_column(
        ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True
    )
    current_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    unit: Mapped[str] = mapped_column(String(32), nullable=False)
    threshold: Mapped[float | None] = mapped_column(Float, nullable=True)
    minimum: Mapped[float | None] = mapped_column(Float, nullable=True)
    maximum: Mapped[float | None] = mapped_column(Float, nullable=True)
    average: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_update: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    health: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    calibration_status: Mapped[str] = mapped_column(String(32), nullable=False, default="UNKNOWN")
    data_quality: Mapped[str] = mapped_column(String(16), nullable=False, default="MISSING")
    data_origin: Mapped[str] = mapped_column(String(16), nullable=False, default="SIMULATED")


class TelemetryModel(Base):
    __tablename__ = "telemetry"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    space: Mapped[str] = mapped_column(String(16), nullable=False, default="simulation", index=True)
    sensor_id: Mapped[str] = mapped_column(
        ForeignKey("sensors.id", ondelete="CASCADE"), nullable=False, index=True
    )
    value: Mapped[float] = mapped_column(Float, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True
    )
    quality: Mapped[str] = mapped_column(String(16), nullable=False, default="FRESH")
    data_origin: Mapped[str] = mapped_column(String(16), nullable=False, default="SIMULATED")
    idempotency_key: Mapped[str | None] = mapped_column(String(128), nullable=True, unique=True)


class AlertModel(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    space: Mapped[str] = mapped_column(String(16), nullable=False, default="simulation", index=True)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(16), nullable=False, default="INFO")
    source: Mapped[str] = mapped_column(String(128), nullable=False, default="SYSTEM")
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="ACTIVE")
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )


class EventModel(Base):
    __tablename__ = "events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    space: Mapped[str] = mapped_column(String(16), nullable=False, default="simulation", index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    severity: Mapped[str] = mapped_column(String(16), nullable=False, default="INFO")
    source: Mapped[str] = mapped_column(String(128), nullable=False, default="SYSTEM")
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="ACTIVE")
    location: Mapped[str] = mapped_column(String(255), nullable=False, default="Unknown")
    summary: Mapped[str] = mapped_column(Text, nullable=False)


class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    space: Mapped[str] = mapped_column(String(16), nullable=False, default="simulation", index=True)
    actor_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    actor_email: Mapped[str] = mapped_column(String(320), nullable=False)
    action: Mapped[str] = mapped_column(String(16), nullable=False)
    resource: Mapped[str] = mapped_column(String(512), nullable=False)
    source_ip: Mapped[str | None] = mapped_column(String(64), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True
    )


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(256), nullable=False)
    role: Mapped[str] = mapped_column(String(32), nullable=False, default="viewer")
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
