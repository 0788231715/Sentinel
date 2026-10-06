from collections.abc import AsyncIterator
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import event, inspect
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy import select

from app.core.security import hash_password
from app.core.security import verify_password
from app.db.models import Base, DeviceModel, SensorModel, TelemetryModel, UserModel
from app.db.session import get_db
from app import main
from app.main import app


@pytest_asyncio.fixture
async def api_client(tmp_path) -> AsyncIterator[AsyncClient]:
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'monitoring.db'}")
    @event.listens_for(engine.sync_engine, "connect")
    def enable_foreign_keys(dbapi_connection, _connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    admin_id = str(uuid4())
    viewer_id = str(uuid4())
    async with sessions() as session:
        session.add_all(
            [
                UserModel(
                    id=admin_id,
                    email=f"admin-{admin_id}@example.test",
                    password_hash=hash_password("Admin-password-123"),
                    role="admin",
                ),
                UserModel(
                    id=viewer_id,
                    email=f"viewer-{viewer_id}@example.test",
                    password_hash=hash_password("Viewer-password-123"),
                    role="viewer",
                ),
            ]
        )
        await session.commit()

    async def override_get_db():
        async with sessions() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        client.admin_email = f"admin-{admin_id}@example.test"
        client.viewer_email = f"viewer-{viewer_id}@example.test"
        yield client
    app.dependency_overrides.clear()
    await engine.dispose()


@pytest.mark.asyncio
async def test_monitoring_endpoints_require_auth_and_enforce_write_role(api_client):
    response = await api_client.get("/api/v1/monitoring/devices")
    assert response.status_code == 401

    viewer_response = await api_client.post(
        "/api/v1/auth/login",
        json={"email": api_client.viewer_email, "password": "Viewer-password-123"},
    )
    assert viewer_response.status_code == 200
    viewer_token = viewer_response.json()["access_token"]
    denied = await api_client.post(
        "/api/v1/monitoring/devices",
        headers={"Authorization": f"Bearer {viewer_token}"},
        json={"name": "Denied", "type": "sensor"},
    )
    assert denied.status_code == 403


@pytest.mark.asyncio
async def test_admin_can_create_read_update_and_delete_monitoring_records(api_client):
    login = await api_client.post(
        "/api/v1/auth/login",
        json={"email": api_client.admin_email, "password": "Admin-password-123"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    device_response = await api_client.post(
        "/api/v1/monitoring/devices",
        headers=headers,
        json={"name": "Integration Sensor", "type": "sensor", "status": "ONLINE", "health": 91},
    )
    assert device_response.status_code == 201
    device_id = device_response.json()["id"]
    assert (await api_client.get(f"/api/v1/monitoring/devices/{device_id}", headers=headers)).status_code == 200
    assert (await api_client.patch(
        f"/api/v1/monitoring/devices/{device_id}",
        headers=headers,
        json={"status": "MAINTENANCE"},
    )).json()["status"] == "MAINTENANCE"
    assert (await api_client.delete(f"/api/v1/monitoring/devices/{device_id}", headers=headers)).status_code == 204

    alert_response = await api_client.post(
        "/api/v1/monitoring/alerts",
        headers=headers,
        json={"summary": "Test alert", "severity": "HIGH"},
    )
    assert alert_response.status_code == 201
    alert_id = alert_response.json()["id"]
    assert alert_response.json()["timestamp"]
    assert (await api_client.get("/api/v1/monitoring/alerts", headers=headers)).status_code == 200
    assert (await api_client.patch(
        f"/api/v1/monitoring/alerts/{alert_id}",
        headers=headers,
        json={"status": "ACKNOWLEDGED"},
    )).json()["status"] == "ACKNOWLEDGED"
    assert (await api_client.delete(f"/api/v1/monitoring/alerts/{alert_id}", headers=headers)).status_code == 204

    event_response = await api_client.post(
        "/api/v1/monitoring/events",
        headers=headers,
        json={"title": "Test event", "summary": "Created by API test"},
    )
    assert event_response.status_code == 201
    event_id = event_response.json()["id"]
    assert (await api_client.get("/api/v1/monitoring/events", headers=headers)).status_code == 200
    assert (await api_client.get(f"/api/v1/monitoring/events/{event_id}", headers=headers)).status_code == 200
    assert (await api_client.patch(
        f"/api/v1/monitoring/events/{event_id}",
        headers=headers,
        json={"status": "RESOLVED"},
    )).json()["status"] == "RESOLVED"
    assert (await api_client.delete(f"/api/v1/monitoring/events/{event_id}", headers=headers)).status_code == 204

    user_response = await api_client.post(
        "/api/v1/auth/users",
        headers=headers,
        json={
            "email": f"created-{uuid4()}@example.test",
            "password": "New-user-password-123",
            "role": "operator",
        },
    )
    assert user_response.status_code == 201
    assert user_response.json()["role"] == "operator"
    assert (await api_client.get("/api/v1/auth/users", headers=headers)).status_code == 200


@pytest.mark.asyncio
async def test_simulation_and_real_data_spaces_are_isolated(api_client):
    login = await api_client.post(
        "/api/v1/auth/login",
        json={"email": api_client.admin_email, "password": "Admin-password-123"},
    )
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    simulation_headers = {**headers, "X-Data-Space": "simulation"}
    real_headers = {**headers, "X-Data-Space": "real"}

    created_devices = {}
    created_sensors = {}
    for space, request_headers in (
        ("simulation", simulation_headers),
        ("real", real_headers),
    ):
        device_response = await api_client.post(
            "/api/v1/monitoring/devices",
            headers=request_headers,
            json={"name": f"{space} device", "type": "sensor"},
        )
        assert device_response.status_code == 201
        device = device_response.json()
        created_devices[space] = device
        assert device["space"] == space
        assert device["data_origin"] == (
            "SIMULATED" if space == "simulation" else "UNVERIFIED"
        )

        sensor_response = await api_client.post(
            "/api/v1/monitoring/sensors",
            headers=request_headers,
            json={
                "sensor_type": "Temperature",
                "device_id": device["id"],
                "unit": "C",
            },
        )
        assert sensor_response.status_code == 201
        created_sensors[space] = sensor_response.json()

        telemetry_response = await api_client.post(
            f"/api/v1/monitoring/sensors/{created_sensors[space]['id']}/telemetry",
            headers=request_headers,
            json={"value": 21.5},
        )
        assert telemetry_response.status_code == 201
        assert telemetry_response.json()["space"] == space
        assert telemetry_response.json()["data_origin"] == (
            "SIMULATED" if space == "simulation" else "UNVERIFIED"
        )

        alert_response = await api_client.post(
            "/api/v1/monitoring/alerts",
            headers=request_headers,
            json={"summary": f"{space} alert"},
        )
        assert alert_response.status_code == 201
        assert alert_response.json()["space"] == space

        event_response = await api_client.post(
            "/api/v1/monitoring/events",
            headers=request_headers,
            json={"title": f"{space} event", "summary": "space isolation check"},
        )
        assert event_response.status_code == 201
        assert event_response.json()["space"] == space

    for space, request_headers in (
        ("simulation", simulation_headers),
        ("real", real_headers),
    ):
        other_space = "real" if space == "simulation" else "simulation"
        assert [
            device["id"]
            for device in (await api_client.get(
                "/api/v1/monitoring/devices", headers=request_headers
            )).json()["devices"]
        ] == [created_devices[space]["id"]]
        assert [
            sensor["id"]
            for sensor in (await api_client.get(
                "/api/v1/monitoring/sensors", headers=request_headers
            )).json()["sensors"]
        ] == [created_sensors[space]["id"]]
        assert (await api_client.get(
            f"/api/v1/monitoring/devices/{created_devices[other_space]['id']}",
            headers=request_headers,
        )).status_code == 404
        assert (await api_client.get(
            f"/api/v1/monitoring/sensors/{created_sensors[other_space]['id']}",
            headers=request_headers,
        )).status_code == 404
        assert all(
            item["space"] == space
            for item in (await api_client.get(
                "/api/v1/monitoring/alerts", headers=request_headers
            )).json()["alerts"]
        )
        assert all(
            item["space"] == space
            for item in (await api_client.get(
                "/api/v1/monitoring/events", headers=request_headers
            )).json()["events"]
        )


@pytest.mark.asyncio
async def test_operations_endpoints_use_persisted_values_and_report_unavailable_engines(api_client):
    login = await api_client.post(
        "/api/v1/auth/login",
        json={"email": api_client.admin_email, "password": "Admin-password-123"},
    )
    headers = {
        "Authorization": f"Bearer {login.json()['access_token']}",
        "X-Data-Space": "real",
    }
    created = await api_client.post(
        "/api/v1/monitoring/devices",
        headers=headers,
        json={
            "name": "Mapped test device",
            "type": "sensor",
            "location": "Test site",
            "latitude": -1.95,
            "longitude": 30.06,
        },
    )
    assert created.status_code == 201
    assert created.json()["data_origin"] == "UNVERIFIED"

    tracking = await api_client.get("/api/v1/operations/tracking", headers=headers)
    assert tracking.status_code == 200
    assert tracking.json()["assets"][0]["latitude"] == -1.95
    assert tracking.json()["history_available"] is False

    analytics = await api_client.get("/api/v1/operations/analytics", headers=headers)
    assert analytics.status_code == 200
    assert analytics.json()["sources"]["devices"] == 1
    assert analytics.json()["space"] == "real"

    for endpoint in ("risk", "ai"):
        capability = await api_client.get(f"/api/v1/operations/{endpoint}", headers=headers)
        assert capability.status_code == 200
        assert capability.json()["status"] == "NOT_CONFIGURED"

    report = await api_client.get("/api/v1/operations/reports/devices", headers=headers)
    assert report.status_code == 200
    assert "Mapped test device" in report.text
    real_search = await api_client.get(
        "/api/v1/operations/search?query=Mapped", headers=headers
    )
    assert real_search.status_code == 200
    assert real_search.json()["results"][0]["type"] == "DEVICE"
    simulation_search = await api_client.get(
        "/api/v1/operations/search?query=Mapped",
        headers={**headers, "X-Data-Space": "simulation"},
    )
    assert simulation_search.json()["results"] == []
    blank_search = await api_client.get(
        "/api/v1/operations/search?query=%20%20", headers=headers
    )
    assert blank_search.status_code == 422


@pytest.mark.asyncio
async def test_authenticated_device_ingestion_verifies_origin_and_deduplicates(api_client):
    login = await api_client.post(
        "/api/v1/auth/login",
        json={"email": api_client.admin_email, "password": "Admin-password-123"},
    )
    admin_headers = {
        "Authorization": f"Bearer {login.json()['access_token']}",
        "X-Data-Space": "real",
    }
    device_response = await api_client.post(
        "/api/v1/monitoring/devices",
        headers=admin_headers,
        json={"name": "Ingestion gateway", "type": "ESP32 gateway"},
    )
    assert device_response.status_code == 201
    device_id = device_response.json()["id"]

    sensor_response = await api_client.post(
        "/api/v1/monitoring/sensors",
        headers=admin_headers,
        json={
            "sensor_type": "Temperature",
            "device_id": device_id,
            "unit": "°C",
        },
    )
    assert sensor_response.status_code == 201
    sensor_id = sensor_response.json()["id"]

    simulated_credential_attempt = await api_client.post(
        f"/api/v1/operations/devices/{device_id}/credentials",
        headers={**admin_headers, "X-Data-Space": "simulation"},
    )
    assert simulated_credential_attempt.status_code == 409
    viewer_login = await api_client.post(
        "/api/v1/auth/login",
        json={"email": api_client.viewer_email, "password": "Viewer-password-123"},
    )
    viewer_credential_attempt = await api_client.post(
        f"/api/v1/operations/devices/{device_id}/credentials",
        headers={
            "Authorization": f"Bearer {viewer_login.json()['access_token']}",
            "X-Data-Space": "real",
        },
    )
    assert viewer_credential_attempt.status_code == 403

    credential_response = await api_client.post(
        f"/api/v1/operations/devices/{device_id}/credentials",
        headers=admin_headers,
    )
    assert credential_response.status_code == 200
    credential = credential_response.json()["credential"]
    ingestion_headers = {
        "X-Data-Space": "real",
        "X-Device-ID": device_id,
        "X-Device-Key": credential,
    }
    message_id = str(uuid4())
    body = {
        "message_id": message_id,
        "sensor_id": sensor_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "value": 24.75,
        "unit": "°C",
        "quality": "FRESH",
    }

    rejected = await api_client.post(
        "/api/v1/ingestion/v1/telemetry",
        headers={**ingestion_headers, "X-Device-Key": "not-the-device-secret"},
        json=body,
    )
    assert rejected.status_code == 401

    wrong_unit = await api_client.post(
        "/api/v1/ingestion/v1/telemetry",
        headers=ingestion_headers,
        json={**body, "unit": "F"},
    )
    assert wrong_unit.status_code == 422

    forged_origin = await api_client.post(
        "/api/v1/ingestion/v1/telemetry",
        headers=ingestion_headers,
        json={**body, "data_origin": "PHYSICAL"},
    )
    assert forged_origin.status_code == 422

    ingested = await api_client.post(
        "/api/v1/ingestion/v1/telemetry",
        headers=ingestion_headers,
        json=body,
    )
    assert ingested.status_code == 201
    assert ingested.json()["data_origin"] == "PHYSICAL"
    assert ingested.json()["space"] == "real"
    assert ingested.json()["duplicate"] is False

    retry = await api_client.post(
        "/api/v1/ingestion/v1/telemetry",
        headers=ingestion_headers,
        json=body,
    )
    assert retry.status_code == 200
    assert retry.json()["id"] == ingested.json()["id"]
    assert retry.json()["duplicate"] is True

    reused_message_id = await api_client.post(
        "/api/v1/ingestion/v1/telemetry",
        headers=ingestion_headers,
        json={**body, "value": 30},
    )
    assert reused_message_id.status_code == 409

    status_response = await api_client.get(
        f"/api/v1/monitoring/devices/{device_id}",
        headers=admin_headers,
    )
    assert status_response.json()["data_origin"] == "PHYSICAL"
    assert status_response.json()["connectivity"] == "CONNECTED"
    real_sensor = await api_client.get(
        f"/api/v1/monitoring/sensors/{sensor_id}",
        headers=admin_headers,
    )
    assert real_sensor.json()["current_value"] == 24.75
    assert real_sensor.json()["data_origin"] == "PHYSICAL"

    rotated = await api_client.post(
        f"/api/v1/operations/devices/{device_id}/credentials",
        headers=admin_headers,
    )
    assert rotated.status_code == 200
    rotated_headers = {
        **ingestion_headers,
        "X-Device-Key": rotated.json()["credential"],
    }
    heartbeat_body = {
        "message_id": str(uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "ONLINE",
        "connectivity": "CONNECTED",
        "health": 88,
        "battery_percent": 76,
        "firmware": "esp32-test-1",
        "network": "test-wifi",
        "latitude": -1.95,
        "longitude": 30.06,
    }
    heartbeat = await api_client.post(
        "/api/v1/ingestion/v1/heartbeat",
        headers=rotated_headers,
        json=heartbeat_body,
    )
    assert heartbeat.status_code == 200
    assert heartbeat.json()["data_origin"] == "PHYSICAL"
    assert heartbeat.json()["battery_percent"] == 76
    assert heartbeat.json()["latitude"] == -1.95
    repeated_heartbeat = await api_client.post(
        "/api/v1/ingestion/v1/heartbeat",
        headers=rotated_headers,
        json=heartbeat_body,
    )
    assert repeated_heartbeat.json()["duplicate"] is True

    revoked_key = await api_client.post(
        "/api/v1/ingestion/v1/telemetry",
        headers=ingestion_headers,
        json={**body, "message_id": str(uuid4())},
    )
    assert revoked_key.status_code == 401


@pytest.mark.asyncio
async def test_sensor_inventory_telemetry_and_device_detail(api_client):
    login = await api_client.post(
        "/api/v1/auth/login",
        json={"email": api_client.admin_email, "password": "Admin-password-123"},
    )
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    device = await api_client.post(
        "/api/v1/monitoring/devices",
        headers=headers,
        json={
            "name": "Telemetry Gateway",
            "type": "Gateway",
            "data_origin": "SIMULATED",
        },
    )
    assert device.status_code == 201
    device_id = device.json()["id"]

    sensor_response = await api_client.post(
        "/api/v1/monitoring/sensors",
        headers=headers,
        json={
            "sensor_type": "Temperature",
            "device_id": device_id,
            "unit": "°C",
            "threshold": 40,
            "data_origin": "SIMULATED",
        },
    )
    assert sensor_response.status_code == 201
    sensor_id = sensor_response.json()["id"]
    assert sensor_response.json()["data_quality"] == "MISSING"

    sample = await api_client.post(
        f"/api/v1/monitoring/sensors/{sensor_id}/telemetry",
        headers=headers,
        json={"value": 24.5, "data_origin": "SIMULATED"},
    )
    assert sample.status_code == 201
    assert sample.json()["data_origin"] == "SIMULATED"

    sensor = (await api_client.get(
        f"/api/v1/monitoring/sensors/{sensor_id}", headers=headers
    )).json()
    assert sensor["current_value"] == 24.5
    assert sensor["data_quality"] == "FRESH"
    assert sensor["data_origin"] == "SIMULATED"

    delayed_sample = await api_client.post(
        f"/api/v1/monitoring/sensors/{sensor_id}/telemetry",
        headers=headers,
        json={
            "value": 19.0,
            "timestamp": (datetime.now(timezone.utc) - timedelta(hours=3)).isoformat(),
            "quality": "DELAYED",
            "data_origin": "PHYSICAL",
        },
    )
    assert delayed_sample.status_code == 201
    assert delayed_sample.json()["data_origin"] == "SIMULATED"
    sensor_after_backfill = (await api_client.get(
        f"/api/v1/monitoring/sensors/{sensor_id}", headers=headers
    )).json()
    assert sensor_after_backfill["current_value"] == 24.5
    assert sensor_after_backfill["data_origin"] == "SIMULATED"

    telemetry = (await api_client.get(
        f"/api/v1/monitoring/sensors/{sensor_id}/telemetry?range=6h",
        headers=headers,
    )).json()
    assert telemetry["stats"]["count"] == 2
    assert telemetry["stats"]["minimum"] == 19
    assert telemetry["stats"]["maximum"] == 24.5
    assert telemetry["stats"]["average"] == 21.75
    assert telemetry["data_origin"] == "SIMULATED"

    details = (await api_client.get(
        f"/api/v1/monitoring/devices/{device_id}", headers=headers
    )).json()
    assert details["data_origin"] == "SIMULATED"
    assert details["sensors"][0]["id"] == sensor_id
    assert details["last_communication"]
    assert details["connectivity"] == "CONNECTED"

    invalid_range = await api_client.get(
        f"/api/v1/monitoring/sensors/{sensor_id}/telemetry?start=2026-10-06T14:00:00Z",
        headers=headers,
    )
    assert invalid_range.status_code == 422

    future_sample = await api_client.post(
        f"/api/v1/monitoring/sensors/{sensor_id}/telemetry",
        headers=headers,
        json={
            "value": 99,
            "timestamp": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
        },
    )
    assert future_sample.status_code == 422

    deleted_device = await api_client.delete(
        f"/api/v1/monitoring/devices/{device_id}", headers=headers
    )
    assert deleted_device.status_code == 204
    missing_sensor = await api_client.get(
        f"/api/v1/monitoring/sensors/{sensor_id}", headers=headers
    )
    assert missing_sensor.status_code == 404


@pytest.mark.asyncio
async def test_startup_creates_tables_and_bootstraps_admin_once(tmp_path, monkeypatch):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'startup.db'}")
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    monkeypatch.setattr(main, "engine", engine)
    monkeypatch.setattr(main, "AsyncSessionLocal", sessions)
    monkeypatch.setattr(main.settings, "APP_ENV", "development")
    monkeypatch.setattr(main.settings, "ADMIN_EMAIL", "bootstrap@example.test")
    monkeypatch.setattr(main.settings, "ADMIN_PASSWORD", "Bootstrap-password-123")

    await main.initialize_database()
    await main.initialize_database()
    async with sessions() as session:
        user = await session.scalar(
            select(UserModel).where(UserModel.email == "bootstrap@example.test")
        )
        devices = await session.scalars(select(DeviceModel))
        sensors = await session.scalars(select(SensorModel))
        telemetry = await session.scalars(select(TelemetryModel))
        assert user is not None
        assert user.role == "admin"
        assert verify_password("Bootstrap-password-123", user.password_hash)
        assert len(list(devices)) == 4
        assert len(list(sensors)) == 3
        assert len(list(telemetry)) == 75
    await engine.dispose()


@pytest.mark.asyncio
async def test_startup_adds_phase_four_columns_to_existing_sqlite_tables(tmp_path, monkeypatch):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'legacy.db'}")
    async with engine.begin() as connection:
        await connection.exec_driver_sql(
            "CREATE TABLE devices (id VARCHAR(64) PRIMARY KEY, name VARCHAR(255) NOT NULL, "
            "type VARCHAR(64) NOT NULL, status VARCHAR(32) NOT NULL, health INTEGER NOT NULL, "
            "location VARCHAR(255) NOT NULL, uptime VARCHAR(32) NOT NULL)"
        )
        await connection.exec_driver_sql(
            "CREATE TABLE alerts (id VARCHAR(64) PRIMARY KEY, summary TEXT NOT NULL, "
            "severity VARCHAR(16) NOT NULL, source VARCHAR(128) NOT NULL, status VARCHAR(32) NOT NULL)"
        )
        await connection.exec_driver_sql(
            "CREATE TABLE telemetry (id VARCHAR(64) PRIMARY KEY, sensor_id VARCHAR(64) NOT NULL, "
            "value FLOAT NOT NULL, timestamp DATETIME NOT NULL, quality VARCHAR(16) NOT NULL, "
            "data_origin VARCHAR(16) NOT NULL)"
        )

    sessions = async_sessionmaker(engine, expire_on_commit=False)
    monkeypatch.setattr(main, "engine", engine)
    monkeypatch.setattr(main, "AsyncSessionLocal", sessions)
    monkeypatch.setattr(main.settings, "APP_ENV", "development")
    monkeypatch.setattr(main.settings, "ADMIN_EMAIL", "legacy-admin@example.test")
    monkeypatch.setattr(main.settings, "ADMIN_PASSWORD", "Legacy-admin-password-123")

    await main.initialize_database()
    async with engine.connect() as connection:
        devices = await connection.run_sync(
            lambda sync_connection: {
                column["name"]
                for column in inspect(sync_connection).get_columns("devices")
            }
        )
        alerts = await connection.run_sync(
            lambda sync_connection: {
                column["name"]
                for column in inspect(sync_connection).get_columns("alerts")
            }
        )
        telemetry = await connection.run_sync(
            lambda sync_connection: {
                column["name"]
                for column in inspect(sync_connection).get_columns("telemetry")
            }
        )
        telemetry_indexes = await connection.run_sync(
            lambda sync_connection: {
                index["name"]
                for index in inspect(sync_connection).get_indexes("telemetry")
            }
        )
    assert {
        "connectivity",
        "battery_percent",
        "data_origin",
        "latitude",
        "longitude",
        "ingestion_key_hash",
        "ingestion_key_created_at",
        "last_heartbeat_message_id",
    }.issubset(devices)
    assert "timestamp" in alerts
    assert {"space", "idempotency_key"}.issubset(telemetry)
    assert "uq_telemetry_idempotency_key" in telemetry_indexes
    await engine.dispose()
