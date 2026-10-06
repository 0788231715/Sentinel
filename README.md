# SentinelNet — Lawful Defensive Monitoring & Decision-Support Platform

SentinelNet is a modular, engineering-grade platform designed for lawful defensive monitoring, environmental and telemetry sensing, event correlation, risk assessment, and decision support.

## Architecture

* **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide React, Zustand, Axios
* **Backend:** FastAPI, Pydantic v2, SQLAlchemy 2.x, Alembic, Pytest, WebSockets
* **Database:** PostgreSQL / SQLite (Development Fallback)
* **Edge / Ingestion:** Physical & Simulated Sensors (MQTT / HTTP)
* **AI / Intelligence:** Anomaly Detection, Explainable AI, Dynamic Risk Assessment Engine

## Quick Start (Development)

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
copy .env.example .env   # Set a unique JWT_SECRET and ADMIN_EMAIL/ADMIN_PASSWORD
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
npm test
npm run build
```

### Monitoring API and roles

The backend creates the SQLite tables at startup and seeds the development database
with sample devices, alerts, and events only when those tables are empty. Set both
`ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env` to bootstrap the first admin;
the account is only created once and the credentials are never reset from the
environment on later starts. Admins can add users with `POST /api/v1/auth/users`.

Roles:

* `viewer`: read monitoring resources
* `operator`: read and create/update/delete monitoring resources
* `engineer`: operator permissions
* `analyst`: read-only monitoring and analytics permissions
* `admin`: operator permissions plus user management

The login endpoint is `POST /api/v1/auth/login`. Send its returned bearer token in
the `Authorization` header. The authenticated WebSocket endpoint is
`/api/v1/monitoring/ws?token=<access_token>&space=simulation|real`; messages are
partitioned by data space and broadcast from the current backend process. REST
requests select their space through `X-Data-Space: simulation|real`. Configure
the frontend API and WebSocket base URLs in `frontend/.env`.

### Device and sensor readiness

The Phase 4 device/sensor pages expose stored inventory and timestamped telemetry,
including device connectivity/power/firmware/network/last communication and
sensor threshold, health, calibration, aggregates, history ranges, and freshness.
Development sensor/device examples and their seeded telemetry are marked
`SIMULATED`; the application keeps Simulation and Real Devices records isolated.
Authenticated operators may submit samples to
`POST /api/v1/monitoring/sensors/{sensor_id}/telemetry`. Operator-entered samples
in Real Devices remain `UNVERIFIED`. Trusted device ingestion is available through
the versioned HTTP contract below; only a device authenticated with its provisioned
key can create records marked `PHYSICAL`.

#### Device onboarding and HTTP ingestion

1. An operator with device-management permission creates a device and its sensors
   in the Real Devices space (`X-Data-Space: real`), recording each sensor's exact
   unit and assigning it to that device.
2. An admin generates or rotates the device key with
   `POST /api/v1/operations/devices/{device_id}/credentials` and
   `X-Data-Space: real`. The response contains the credential once. Store it in
   the device or trusted gateway's secret storage; rotating it immediately
   revokes the previous key. The database stores only an HMAC digest.
3. The device or gateway sends HTTPS requests with `X-Data-Space: real`,
   `X-Device-ID: <device_id>`, and `X-Device-Key: <credential>`.

Telemetry endpoint: `POST /api/v1/ingestion/v1/telemetry`

```json
{
  "message_id": "4d6b25f0-c93d-4a11-8cac-196985bdd507",
  "sensor_id": "enrolled-sensor-id",
  "timestamp": "2025-01-01T12:00:00Z",
  "value": 24.75,
  "unit": "°C",
  "quality": "FRESH"
}
```

`quality` may be `FRESH` or `DELAYED`; `message_id` must be a UUID and is the
retry/idempotency key for that device. First acceptance returns `201`; an
identical retry returns `200` and the original record; reusing the message ID
with a different payload returns `409`. The enrolled sensor must belong to the
authenticated device, and its unit must match exactly. The server assigns
`PHYSICAL` provenance; caller-supplied provenance or other undeclared fields are
rejected.

Heartbeat endpoint: `POST /api/v1/ingestion/v1/heartbeat`. It accepts
`message_id` (UUID), `timestamp`, `status` (`ONLINE` or `MAINTENANCE`), and
`connectivity` (`CONNECTED` or `DEGRADED`), with optional `health`,
`battery_percent`, `firmware`, `network`, `latitude`, and `longitude`. Device
credentials are required for both endpoints. Timestamps more than five minutes
in the future are rejected; older telemetry may be submitted for delayed delivery.

Set a unique `DEVICE_INGESTION_SECRET` (at least 32 characters) in production,
separate from `JWT_SECRET`. Use HTTPS in deployment and protect the one-time device
key as a secret. This contract is transport-level HTTP only: no ESP32 firmware,
native MQTT adapter, physical device, sensor calibration, or end-to-end hardware
deployment has been validated. A board that uses another transport needs firmware
or a trusted gateway adapter to send this contract.

### Operational endpoints

`/api/v1/operations` exposes stored-record analytics, connectivity summaries,
coordinate-backed device locations, a merged event/alert timeline, read-only
audit history, resource search, and CSV exports. Risk and AI endpoints explicitly
report `NOT_CONFIGURED` until validated engines exist. Tracking history, network
latency, packet counters, advanced event correlation, and location history are
not currently ingested.

Successful authenticated write requests are logged to `audit_logs`; secrets and
request bodies are not copied into audit records. Browser theme and language
preferences are stored locally.

Current DB schema creation uses SQLAlchemy metadata during app startup. Alembic
migrations are not yet configured, so this setup is suitable for development but
needs migration management before production schema changes.

---
*Maintained under SentinelNet Engineering Specification.*
