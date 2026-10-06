Sentinel

# SENTINELNET — COMPLETE FRONTEND ENGINEERING MASTER PROMPT

## 0. ROLE

You are acting as a combined:

* Senior Software Architect
* Senior React/TypeScript Engineer
* Senior UI/UX Engineer
* Data Visualization Engineer
* Real-Time Systems Engineer
* Systems Integration Engineer
* IoT/Edge Systems Engineer
* AI/ML Interface Engineer
* Geospatial Visualization Engineer
* Cybersecurity-Aware Application Architect
* DevOps-Aware Frontend Engineer
* QA/Test Engineer

You are designing and implementing the frontend of **SentinelNet**, an engineering-grade intelligent monitoring, sensing, event-processing, risk-assessment, and decision-support platform.

This is NOT a generic admin dashboard.

The frontend must represent a serious engineering control and monitoring system capable of integrating:

```text
Physical Sensors
      ↓
Edge Devices
      ↓
Network
      ↓
Backend
      ↓
Data Processing
      ↓
AI/ML Detection
      ↓
Event Correlation
      ↓
Risk Assessment
      ↓
Alert Engine
      ↓
SentinelNet Frontend
      ↓
Human Operator / Engineer / Analyst
```

The frontend must be designed from the beginning to support this complete architecture even when some backend and physical hardware components are initially simulated.

---

# 1. PRIMARY OBJECTIVE

Build a professional, scalable, maintainable SentinelNet frontend using:

* React
* TypeScript
* Vite
* Tailwind CSS
* Material UI where appropriate
* Framer Motion
* Lucide React
* Zustand
* React Router
* React Hook Form
* Zod
* Recharts
* React-Leaflet
* Axios or Fetch
* WebSocket/Socket.IO architecture
* i18next / react-i18next
* date-fns

Do not introduce unnecessary libraries.

Every dependency must have a clear engineering reason.

---

# 2. DEVELOPMENT PRINCIPLE

The application must be developed incrementally.

DO NOT attempt to generate the entire application blindly in one step.

Use this sequence:

```text
Architecture
      ↓
Foundation
      ↓
Application Shell
      ↓
Routing
      ↓
Theme
      ↓
Navigation
      ↓
Dashboard
      ↓
Monitoring
      ↓
Devices
      ↓
Sensors
      ↓
Events
      ↓
Alerts
      ↓
Maps
      ↓
Tracking
      ↓
Analytics
      ↓
AI
      ↓
Risk
      ↓
System Health
      ↓
Network
      ↓
Reports
      ↓
Audit
      ↓
Authentication/RBAC
      ↓
Real-Time WebSocket
      ↓
Internationalization
      ↓
Testing
      ↓
Performance
      ↓
Production
```

After every phase:

1. Explain what was implemented.
2. Show files created.
3. Show files modified.
4. Explain why each important file exists.
5. Give exact commands to run.
6. Run or describe tests.
7. Check for TypeScript errors.
8. Check that existing functionality still works.
9. Identify limitations.
10. Only then continue to the next phase.

NEVER destroy working functionality while implementing a new feature.

---

# 3. DEVELOPMENT ENVIRONMENT

The frontend must work independently.

Expected development command:

```bash
npm run dev
```

Docker is NOT required to run the frontend.

The backend/database may continue running separately through Docker.

Architecture:

```text
VS CODE
   │
   ├── React Frontend
   │      localhost:5173
   │
   └── API / WebSocket
          ↓
       Backend
          ↓
       Database
```

The frontend must communicate with backend services through configurable environment variables.

Example:

```text
VITE_API_URL
VITE_WS_URL
VITE_MAP_PROVIDER
VITE_APP_ENV
```

Never hard-code secrets.

---

# 4. COMPLETE SYSTEM ARCHITECTURE

The conceptual system is:

```text
┌───────────────────────────────┐
│       PHYSICAL SENSORS        │
│                               │
│ Temperature                  │
│ Motion                       │
│ Pressure                     │
│ Vibration                    │
│ Environmental                │
│ Position / Location          │
│ Other supported sensors      │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│         EDGE DEVICES          │
│                               │
│ Sensor controllers            │
│ Embedded computers             │
│ Gateways                      │
│ Local processing              │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│            NETWORK            │
│                               │
│ Ethernet                      │
│ Wi-Fi                         │
│ Cellular                      │
│ Other supported links         │
└───────────────┬───────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│             BACKEND                    │
│                                        │
│ REST API                               │
│ WebSocket                              │
│ Authentication                         │
│ Device management                      │
│ Sensor ingestion                       │
│ Event processing                       │
│ Database                               │
└───────────────┬────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│        INTELLIGENCE LAYER              │
│                                        │
│ Data processing                        │
│ Anomaly detection                      │
│ AI/ML classification                   │
│ Event correlation                      │
│ Risk assessment                        │
└───────────────┬────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│           ALERT ENGINE                 │
│                                        │
│ Critical                               │
│ High                                   │
│ Medium                                 │
│ Low                                    │
│ Informational                          │
└───────────────┬────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│          SENTINELNET UI                │
│                                        │
│ Dashboard                              │
│ Live Monitoring                        │
│ Maps                                   │
│ Events                                 │
│ Alerts                                 │
│ Devices                                │
│ Sensors                                │
│ AI Analytics                           │
│ Risk                                   │
│ Reports                                │
│ System Health                          │
└───────────────┬────────────────────────┘
                │
                ▼
          OPERATOR / ENGINEER
```

---

# 5. FRONTEND INTERNAL DATA FLOW

The frontend architecture must follow:

```text
Backend / Mock Data
        │
        ▼
Service Layer
        │
        ▼
State Management
(Zustand)
        │
        ▼
Custom Hooks
        │
        ▼
Pages
        │
        ▼
Feature Components
        │
        ├── Charts
        ├── Maps
        ├── Tables
        ├── Cards
        ├── Forms
        ├── Timelines
        └── Visualization
```

Example:

```text
GET /api/devices
        ↓
devices.service.ts
        ↓
deviceStore.ts
        ↓
useDevices.ts
        ↓
DevicesPage.tsx
        ↓
DeviceTable.tsx
        ↓
DeviceDetails.tsx
```

Real-time example:

```text
Physical Sensor
      ↓
Edge Device
      ↓
Backend
      ↓
WebSocket
      ↓
socket.ts
      ↓
eventHandlers.ts
      ↓
sensorStore.ts
      ↓
useSensorTelemetry.ts
      ↓
SensorTelemetry.tsx
      ↓
Live Chart
```

---

# 6. COMPLETE FRONTEND FILE STRUCTURE

Create a professional structure similar to:

```text
sentinelnet-frontend/
│
├── public/
│   ├── assets/
│   └── favicon/
│
├── src/
│   │
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   ├── providers.tsx
│   │   └── routeConfig.ts
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── components/
│   │   │
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── PageContainer.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   └── MobileNavigation.tsx
│   │   │
│   │   ├── dashboard/
│   │   ├── monitoring/
│   │   ├── devices/
│   │   ├── sensors/
│   │   ├── events/
│   │   ├── alerts/
│   │   ├── tracking/
│   │   ├── maps/
│   │   ├── analytics/
│   │   ├── ai/
│   │   ├── risk/
│   │   ├── system/
│   │   ├── network/
│   │   ├── reports/
│   │   ├── audit/
│   │   ├── notifications/
│   │   ├── charts/
│   │   ├── tables/
│   │   ├── forms/
│   │   └── common/
│   │
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── LiveMonitoring/
│   │   ├── Events/
│   │   ├── Alerts/
│   │   ├── Devices/
│   │   ├── Sensors/
│   │   ├── Tracking/
│   │   ├── AIAnalytics/
│   │   ├── RiskAssessment/
│   │   ├── DataAnalytics/
│   │   ├── Timeline/
│   │   ├── Reports/
│   │   ├── SystemHealth/
│   │   ├── Network/
│   │   ├── AuditLogs/
│   │   ├── Settings/
│   │   ├── Login/
│   │   └── NotFound/
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── devices.service.ts
│   │   │   ├── sensors.service.ts
│   │   │   ├── events.service.ts
│   │   │   ├── alerts.service.ts
│   │   │   ├── tracking.service.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── ai.service.ts
│   │   │   ├── risk.service.ts
│   │   │   ├── reports.service.ts
│   │   │   ├── system.service.ts
│   │   │   └── network.service.ts
│   │   │
│   │   └── websocket/
│   │       ├── socket.ts
│   │       ├── connectionManager.ts
│   │       ├── eventHandlers.ts
│   │       └── eventTypes.ts
│   │
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── deviceStore.ts
│   │   ├── sensorStore.ts
│   │   ├── eventStore.ts
│   │   ├── alertStore.ts
│   │   ├── trackingStore.ts
│   │   ├── analyticsStore.ts
│   │   ├── aiStore.ts
│   │   ├── riskStore.ts
│   │   ├── systemStore.ts
│   │   ├── networkStore.ts
│   │   └── notificationStore.ts
│   │
│   ├── hooks/
│   │   ├── useDevices.ts
│   │   ├── useSensors.ts
│   │   ├── useEvents.ts
│   │   ├── useAlerts.ts
│   │   ├── useTracking.ts
│   │   ├── useAI.ts
│   │   ├── useRisk.ts
│   │   ├── useSystemHealth.ts
│   │   ├── useNetwork.ts
│   │   └── useWebSocket.ts
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── device.ts
│   │   ├── sensor.ts
│   │   ├── event.ts
│   │   ├── alert.ts
│   │   ├── tracking.ts
│   │   ├── analytics.ts
│   │   ├── ai.ts
│   │   ├── risk.ts
│   │   ├── system.ts
│   │   ├── network.ts
│   │   └── common.ts
│   │
│   ├── config/
│   │   ├── environment.ts
│   │   ├── navigation.ts
│   │   ├── permissions.ts
│   │   └── constants.ts
│   │
│   ├── themes/
│   │   ├── lightTheme.ts
│   │   ├── darkTheme.ts
│   │   ├── tokens.ts
│   │   └── themeProvider.tsx
│   │
│   ├── locales/
│   │   ├── en/
│   │   ├── rw/
│   │   ├── fr/
│   │   ├── es/
│   │   └── sw/
│   │
│   ├── mocks/
│   │   ├── devices.ts
│   │   ├── sensors.ts
│   │   ├── events.ts
│   │   ├── alerts.ts
│   │   ├── tracking.ts
│   │   ├── ai.ts
│   │   ├── risk.ts
│   │   └── system.ts
│   │
│   ├── utils/
│   │   ├── date.ts
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   ├── severity.ts
│   │   ├── status.ts
│   │   └── export.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── animations.css
│   │
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── .env
├── .env.example
├── .gitignore
├── eslint.config.js
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── index.html
```

---

# 7. RESPONSIBILITY OF IMPORTANT FILES

Every important file must have ONE clear responsibility.

## `src/main.tsx`

Application entry point.

Responsibilities:

* Mount React.
* Load providers.
* Load global styles.
* Initialize application.

Do not place business logic here.

---

## `src/app/App.tsx`

Root application component.

Responsibilities:

* Application shell.
* Router integration.
* Global layout.
* Authentication state.

---

## `src/app/router.tsx`

Central routing definition.

Example:

```text
/dashboard
/monitoring
/events
/alerts
/devices
/sensors
/tracking
/ai
/risk
/analytics
/timeline
/reports
/system-health
/network
/audit
/settings
```

---

## `src/services/api/client.ts`

Central API client.

Responsibilities:

* Base URL.
* Headers.
* Authentication.
* Request handling.
* Response handling.
* Error normalization.
* Timeout configuration.

---

## `src/services/api/*.service.ts`

Each service communicates with one backend domain.

Example:

```text
devices.service.ts
      ↓
/api/devices
```

Do not put React UI code in service files.

---

## `src/services/websocket/socket.ts`

Responsible for WebSocket connection.

Must support:

* Connect.
* Disconnect.
* Reconnect.
* Heartbeat.
* Connection state.
* Error handling.
* Graceful offline state.

---

## `src/store/*.ts`

Zustand application state.

Example:

```text
deviceStore.ts
    ↓
devices state
selected device
loading
error
filters
pagination
```

Do not put visual rendering inside stores.

---

## `src/types/*.ts`

Strong TypeScript models.

Never use `any` unless there is an exceptional documented reason.

---

## `src/hooks/*.ts`

Reusable application logic.

Example:

```text
useDevices()
useSensors()
useEvents()
useAlerts()
useWebSocket()
```

Hooks connect pages/components to state and services.

---

# 8. APPLICATION SHELL

Create:

```text
Sidebar
TopBar
Main Content
Status Bar
```

Sidebar navigation:

```text
Overview
Live Monitoring
Events
Alerts
Devices
Sensors
Tracking
AI Analytics
Risk Assessment
Data Analytics
Timeline
Reports
System Health
Network
Audit Logs
Settings
```

Top bar:

```text
System Status
Current Time
Global Search
Notifications
Language
Theme
User
Connection Status
```

---

# 9. DESIGN SYSTEM

The visual identity should communicate:

```text
Engineering
+
Monitoring
+
Reliability
+
Intelligence
+
Operational Awareness
```

Use a primarily black/white/neutral-gray design system.

Semantic colors:

```text
GREEN   = Healthy / Normal
YELLOW  = Warning
ORANGE  = Elevated
RED     = Critical
BLUE    = Information / Communication
PURPLE  = AI / Analytics
GRAY    = Offline / Unknown / Inactive
```

Never rely on color alone.

Use:

* Icons
* Labels
* Patterns
* Status text
* Shapes
* Tooltips

---

# 10. DARK AND LIGHT MODE

Both themes must be professionally designed.

Dark mode:

* Control-room appearance.
* Low glare.
* High information density.
* Clear hierarchy.

Light mode:

* Clean engineering interface.
* High readability.
* Strong contrast.
* Suitable for reports and daytime operation.

Theme preference must persist.

---

# 11. ANIMATION

Use Framer Motion carefully.

Animations should communicate:

* State changes.
* Panel transitions.
* Alert arrival.
* Loading.
* Navigation.
* Data updates.

Do NOT create distracting animations.

Support:

```text
prefers-reduced-motion
```

---

# 12. MULTILINGUAL SYSTEM

Required languages:

```text
English
Kinyarwanda
French
Spanish
Kiswahili
```

Locales:

```text
en
rw
fr
es
sw
```

No hard-coded UI text.

Example:

```text
t("dashboard.activeDevices")
```

rather than:

```text
"Active Devices"
```

Language must be switchable without reloading the entire application.

---

# 13. PAGE-BY-PAGE REQUIREMENTS

# 13.1 OVERVIEW / DASHBOARD

Purpose:

Give the operator an immediate understanding of system state.

Display:

```text
Total Devices
Active Devices
Offline Devices
Active Sensors
Active Alerts
Unresolved Events
Current Risk
AI Detections
System Uptime
Network Health
Data Ingestion Rate
Processing Latency
```

Main areas:

```text
KPI cards
Live map
Active alerts
Recent events
AI activity
Risk trend
System health
Sensor activity
Network status
```

The dashboard must answer:

```text
WHAT is happening?
WHERE is it happening?
WHY is it happening?
HOW serious is it?
HOW healthy is the system?
```

---

# 13.2 LIVE MONITORING

Real-time operational view.

Include:

* Live map.
* Live events.
* Live alerts.
* Sensor telemetry.
* Device status.
* AI detections.
* Connection status.
* Data freshness.

WebSocket updates should update only affected components.

Do not rerender the entire dashboard unnecessarily.

---

# 13.3 EVENTS

Show:

```text
Event ID
Timestamp
Source
Device
Sensor
Location
Event Type
Severity
Confidence
Status
Assigned Operator
```

Lifecycle:

```text
Detected
   ↓
Classified
   ↓
Assessed
   ↓
Acknowledged
   ↓
Investigated
   ↓
Resolved
   ↓
Archived
```

Include:

* Search.
* Filters.
* Severity.
* Time.
* Source.
* Location.
* Status.
* Event details.
* Related events.

---

# 13.4 ALERTS

Alert center.

Levels:

```text
Critical
High
Medium
Low
Informational
```

Actions:

```text
Acknowledge
Assign
Investigate
Resolve
Escalate
```

Show:

* Alert timeline.
* Source.
* Location.
* Confidence.
* Related events.
* Risk contribution.

---

# 13.5 DEVICES

Device inventory.

Each device should show:

```text
Device ID
Name
Type
Status
Connectivity
Power/Battery
Firmware
Network
Last Communication
Location
Sensors
Health
Events
```

Device detail page:

```text
Overview
Telemetry
Events
Alerts
Network
Configuration
History
```

---

# 13.6 SENSORS

Show:

```text
Sensor ID
Sensor Type
Device
Current Value
Unit
Threshold
Min
Max
Average
Last Update
Health
Calibration Status
```

Telemetry charts:

```text
1 hour
6 hours
24 hours
7 days
30 days
Custom
```

Include data-quality indicators:

```text
Fresh
Delayed
Stale
Missing
Invalid
```

---

# 13.7 TRACKING

Tracking interface.

Display:

* Current position.
* Historical path.
* Timestamp.
* Status changes.
* Events along path.
* Timeline playback.

Provide:

```text
Play
Pause
Speed
Time range
Event filtering
```

---

# 13.8 MAP / GEOSPATIAL MONITORING

Map layers:

```text
Devices
Sensors
Events
Alerts
Coverage
Geofences
Historical Activity
```

Features:

* Zoom.
* Pan.
* Clustering.
* Filtering.
* Selecting.
* Details panel.
* Timeline playback.

Do not overload the map.

---

# 13.9 AI ANALYTICS

Clearly distinguish:

```text
AI Prediction
AI Detection
Confirmed Event
Human Verification
```

Display:

```text
Detection
Classification
Confidence
Anomaly Score
Model
Model Version
Inference Latency
Detection Frequency
Performance
```

Explainability panel:

```text
What was detected?
Why was it detected?
What data contributed?
What confidence does the model have?
Which model produced it?
When was it produced?
```

Never present an AI prediction as unquestionable truth.

---

# 13.10 RISK ASSESSMENT

Display:

```text
Current Risk
Risk Trend
Risk Contributors
Affected Areas
Affected Devices
Confidence
Historical Risk
```

Risk must be explainable.

Example:

```text
Risk Score: 72

Contributors:

Sensor anomaly       +25
Device instability   +18
Event frequency      +15
AI confidence        +14
```

Use charts to explain changes over time.

---

# 13.11 DATA ANALYTICS

Provide:

* Time-series charts.
* Bar charts.
* Area charts.
* Scatter plots.
* Distributions.
* Heatmaps.
* Event frequency.
* Sensor trends.
* Device uptime.
* AI detections.
* Risk trends.
* Latency.

Every chart must have:

```text
Title
Description
Units
Legend
Tooltip
Time range
Filters
Loading state
Empty state
Error state
```

---

# 13.12 TIMELINE

Unified chronological view.

Combine:

```text
Sensor events
Device events
Alerts
AI detections
Risk changes
Operator actions
System failures
System recoveries
```

Allow:

* Filtering.
* Zooming.
* Date selection.
* Event selection.
* Correlation.

---

# 13.13 SYSTEM HEALTH

Show:

```text
API
Database
WebSocket
Queue
Processing
CPU
Memory
Storage
Network
Availability
Error Rate
Request Rate
Latency
```

Use system state:

```text
NORMAL
WARNING
DEGRADED
CRITICAL
OFFLINE
UNKNOWN
```

---

# 13.14 NETWORK

Show:

```text
Connected Devices
Disconnected Devices
Latency
Packet/message activity
Communication failures
Reconnect attempts
Last seen
```

Provide network topology:

```text
Sensor
  ↓
Device
  ↓
Gateway
  ↓
Network
  ↓
Backend
```

---

# 13.15 REPORTS

Reports should support:

```text
System Health
Events
Alerts
Devices
Sensors
AI
Risk
Operational Statistics
```

Allow:

```text
Date range
Filters
Export
Print-ready view
```

Do not fabricate report data.

---

# 13.16 AUDIT LOGS

Show:

```text
User
Action
Timestamp
Resource
Previous State
New State
Source
IP where appropriate
```

Audit records should be immutable from the UI perspective.

---

# 13.17 SETTINGS

Sections:

```text
Appearance
Language
Notifications
Map
Charts
System
Account
Security
```

---

# 14. EVENT CORRELATION

The UI must visualize relationships such as:

```text
Sensor Anomaly
      ↓
Device Warning
      ↓
AI Detection
      ↓
Risk Increase
      ↓
Alert
      ↓
Operator Action
```

The operator should be able to navigate between related objects.

Example:

```text
Alert
 ↓
Related Event
 ↓
Source Sensor
 ↓
Device
 ↓
Location
 ↓
AI Detection
 ↓
Risk Assessment
```

---

# 15. MOCK DATA ARCHITECTURE

The frontend must initially work even without the complete backend.

Use:

```text
Mock Data
   ↓
Service Layer
   ↓
Zustand
   ↓
Hooks
   ↓
Components
```

Later replace with:

```text
Real Backend
   ↓
Service Layer
   ↓
Zustand
   ↓
Hooks
   ↓
Components
```

Do not rewrite the UI architecture when backend integration begins.

Every mock/simulated value must be clearly identifiable internally.

Never present simulated data as confirmed real-world data.

---

# 16. API ARCHITECTURE

Prepare typed service interfaces for:

```text
/api/auth
/api/devices
/api/sensors
/api/events
/api/alerts
/api/tracking
/api/analytics
/api/ai
/api/risk
/api/reports
/api/system
/api/network
```

Do not invent backend endpoints and claim that they already exist.

If the backend endpoint is not confirmed:

```text
MOCK
SIMULATED
EXPECTED BACKEND CONTRACT
```

must be clearly distinguished.

---

# 17. WEBSOCKET ARCHITECTURE

Support event types:

```text
sensor.update
device.status
event.created
alert.created
alert.updated
ai.detection
risk.updated
system.health
network.status
```

Connection states:

```text
CONNECTED
RECONNECTING
OFFLINE
```

Implement:

* Automatic reconnect.
* Heartbeat.
* Error handling.
* Stale-data detection.
* Connection indicator.
* Graceful fallback.

---

# 18. SECURITY ARCHITECTURE

Prepare for:

```text
Authentication
Authorization
RBAC
Protected routes
Input validation
Secure token handling
Environment configuration
Session management
```

Roles:

```text
Administrator
Engineer
Operator
Analyst
Viewer
```

Permissions must be designed centrally.

Example:

```text
permissions.ts
```

Do not scatter authorization logic throughout random components.

---

# 19. PERFORMANCE

Implement:

* Lazy loading.
* Code splitting.
* Memoization where useful.
* Pagination.
* Virtualized large tables where necessary.
* Debounced search.
* Efficient WebSocket state updates.
* Avoid unnecessary renders.
* Efficient chart rendering.

Real-time updates must not make the entire application slow.

---

# 20. ERROR AND FAILURE DESIGN

The application must never show an unexplained blank screen.

Handle:

```text
Backend unavailable
Database unavailable
WebSocket unavailable
Sensor offline
Device offline
API timeout
Authentication failure
Permission denied
Invalid data
Stale data
Missing data
AI service unavailable
Map unavailable
```

Use clear states:

```text
Loading
Empty
Error
Offline
Stale
Degraded
Unknown
```

---

# 21. DATA QUALITY

Every important data source should be able to indicate:

```text
Fresh
Delayed
Stale
Missing
Invalid
Simulated
Real
AI-generated
Human-confirmed
```

This is essential for an engineering monitoring platform.

---

# 22. OPTIONAL ADVANCED VISUALIZATION

Design the architecture so future versions can include:

```text
3D Facility
3D Sensor Environment
Device Topology
Network Topology
Sensor Coverage
Spatial Relationships
Digital Twin
Historical State
Simulation
```

Do not force 3D everywhere.

Use it only where it improves understanding.

Keep 3D modular so it can be added without rewriting the application.

---

# 23. DIGITAL-TWIN-READY DESIGN

Prepare data models for:

```text
Physical Asset
Device
Sensor
Location
Relationship
State
Historical State
Telemetry
Event
```

Example:

```text
Facility
   ↓
Area
   ↓
Device
   ↓
Sensor
   ↓
Telemetry
   ↓
Event
```

This should allow future mapping of real physical infrastructure into SentinelNet.

---

# 24. SYSTEM PERFORMANCE MONITORING

Track:

```text
Frontend Load Time
API Latency
WebSocket Latency
Event Processing Latency
Data Freshness
Rendering Performance
Error Rate
```

Display these in System Health where appropriate.

---

# 25. GLOBAL SEARCH

Search across:

```text
Devices
Sensors
Events
Alerts
Locations
Reports
Users
```

Search results must indicate the entity type.

Example:

```text
DEVICE
DEV-001

EVENT
EVT-1042

SENSOR
TEMP-07

ALERT
ALT-220
```

---

# 26. NOTIFICATION CENTER

Notifications may include:

```text
Critical Alert
New Event
Device Offline
Sensor Failure
AI Detection
Risk Increase
System Recovery
Network Failure
```

Support:

```text
Unread
Read
Priority
Timestamp
Source
Action
```

---

# 27. DASHBOARD CUSTOMIZATION

Allow users to eventually configure:

```text
Widget visibility
Widget order
Widget size
Preferred charts
Map layers
Data density
Default time range
```

Persist preferences.

---

# 28. RESPONSIVE DESIGN

Primary target:

```text
Desktop
Laptop
```

Secondary:

```text
Tablet
Mobile
```

Do not simply shrink the desktop interface.

For mobile:

* Simplify navigation.
* Prioritize alerts.
* Prioritize system status.
* Provide compact cards.
* Provide usable map controls.

---

# 29. ACCESSIBILITY

Implement:

* Semantic HTML.
* Keyboard navigation.
* ARIA labels.
* Proper focus states.
* Screen-reader support.
* Contrast.
* Non-color status indicators.
* Reduced-motion support.

---

# 30. TESTING

Use:

```text
Vitest
React Testing Library
```

Test:

```text
Components
Hooks
Stores
Services
Forms
Routing
Permissions
Critical user flows
Error states
```

At minimum test:

```text
Dashboard loads
Navigation works
Device list loads
Sensor data renders
Event filtering works
Alert acknowledgement works
WebSocket state changes
Theme switching works
Language switching works
Unauthorized routes are protected
```

---

# 31. FILE DEPENDENCY RULES

Follow these dependency rules:

```text
Pages
  ↓
Components
  ↓
Hooks
  ↓
Stores
  ↓
Services
  ↓
API / WebSocket
```

Do NOT allow:

```text
Component
   ↓
Direct random fetch()
```

Instead:

```text
Component
   ↓
Hook
   ↓
Store / Service
   ↓
API
```

Keep responsibilities separated.

---

# 32. EXAMPLE DEVICE FLOW

A device page should conceptually work as:

```text
DevicesPage.tsx
      ↓
useDevices.ts
      ↓
deviceStore.ts
      ↓
devices.service.ts
      ↓
client.ts
      ↓
GET /api/devices
      ↓
Backend
```

Device updates:

```text
Backend
   ↓
WebSocket
   ↓
socket.ts
   ↓
eventHandlers.ts
   ↓
deviceStore.ts
   ↓
useDevices.ts
   ↓
DeviceStatusCard.tsx
```

---

# 33. EXAMPLE SENSOR FLOW

```text
Physical Sensor
      ↓
Edge Device
      ↓
Gateway
      ↓
Network
      ↓
Backend
      ↓
Sensor API
      ↓
sensors.service.ts
      ↓
sensorStore.ts
      ↓
useSensors.ts
      ↓
SensorsPage.tsx
      ↓
SensorTelemetry.tsx
      ↓
Chart
```

---

# 34. EXAMPLE AI FLOW

```text
Sensor Data
      ↓
Backend
      ↓
AI Model
      ↓
Prediction
      ↓
Confidence
      ↓
Event Engine
      ↓
Risk Engine
      ↓
Alert Engine
      ↓
WebSocket
      ↓
aiStore.ts
      ↓
AIAnalyticsPage.tsx
```

The UI must clearly communicate that the AI output is a prediction/detection unless independently confirmed.

---

# 35. EXAMPLE RISK FLOW

```text
Sensor Data
      +
Events
      +
AI Detections
      +
Device Health
      +
Context
      ↓
Risk Engine
      ↓
Risk Score
      ↓
Risk Contributors
      ↓
riskStore.ts
      ↓
RiskAssessmentPage.tsx
```

---

# 36. EXAMPLE ALERT FLOW

```text
Event
   ↓
Severity Evaluation
   ↓
Alert Engine
   ↓
Alert Created
   ↓
WebSocket
   ↓
alertStore.ts
   ↓
Notification Center
   +
Alert Center
   +
Dashboard
```

---

# 37. SYSTEM TOPOLOGY VIEW

Provide a conceptual topology view:

```text
┌───────────┐
│  Sensors  │
└─────┬─────┘
      ↓
┌───────────┐
│  Devices  │
└─────┬─────┘
      ↓
┌───────────┐
│  Gateway  │
└─────┬─────┘
      ↓
┌───────────┐
│  Network  │
└─────┬─────┘
      ↓
┌───────────┐
│  Backend  │
└─────┬─────┘
      ↓
┌───────────┐
│ AI Engine │
└─────┬─────┘
      ↓
┌───────────┐
│Event/Risk │
│  Engine   │
└─────┬─────┘
      ↓
┌───────────┐
│ Dashboard │
└───────────┘
```

---

# 38. PAGE COMPONENT ARCHITECTURE

Every page should follow a structure such as:

```text
Page
│
├── Page Header
│
├── Filters
│
├── Summary
│
├── Main Visualization
│
├── Data Table
│
└── Detail Panel
```

For example:

```text
DevicesPage
│
├── DevicePageHeader
├── DeviceFilters
├── DeviceSummaryCards
├── DeviceStatusChart
├── DeviceTable
└── DeviceDetailsDrawer
```

---

# 39. REUSABLE COMPONENTS

Create reusable components such as:

```text
StatusBadge
SeverityBadge
HealthIndicator
MetricCard
LoadingState
EmptyState
ErrorState
OfflineState
DataFreshnessIndicator
SearchInput
FilterPanel
DateRangePicker
DataTable
DetailDrawer
ConfirmDialog
Timeline
ChartContainer
MapContainer
```

Do not recreate the same UI logic repeatedly.

---

# 40. UI STATE MODEL

Use consistent states:

```text
LOADING
READY
EMPTY
ERROR
OFFLINE
STALE
DEGRADED
```

Avoid inconsistent loading/error patterns across pages.

---

# 41. ENGINEERING QUALITY RULES

Follow these rules strictly:

1. TypeScript strict mode.
2. Avoid `any`.
3. Avoid duplicated logic.
4. Avoid giant components.
5. Use reusable components.
6. Keep business logic out of presentation components.
7. Keep API logic out of components.
8. Keep state management centralized.
9. Use meaningful names.
10. Comment complex engineering logic.
11. Do not fabricate backend functionality.
12. Clearly distinguish mock data from real data.
13. Do not break existing functionality.
14. Keep the project runnable after every phase.

---

# 42. PHASED IMPLEMENTATION ROADMAP

## PHASE 1 — FOUNDATION

Implement:

```text
Vite
React
TypeScript
Tailwind
Theme
Basic folder structure
ESLint
Prettier
Environment configuration
```

Verify:

```bash
npm run dev
npm run build
```

---

## PHASE 2 — APPLICATION SHELL

Implement:

```text
AppShell
Sidebar
TopBar
Routing
Theme switching
Responsive layout
```

---

## PHASE 3 — DASHBOARD

Implement:

```text
KPI cards
System status
Live event stream
Alert center
Map
Risk chart
System health
```

Use mock data initially.

---

## PHASE 4 — DEVICES AND SENSORS

Implement:

```text
Device inventory
Device details
Sensor inventory
Sensor telemetry
Charts
Health
Data freshness
```

---

## PHASE 5 — EVENTS AND ALERTS

Implement:

```text
Event management
Alert management
Filtering
Searching
Correlation
Timeline
```

---

## PHASE 6 — MAP AND TRACKING

Implement:

```text
Interactive map
Markers
Clusters
Layers
Tracking
Historical paths
Playback
```

---

## PHASE 7 — ANALYTICS

Implement:

```text
Charts
Filters
Time ranges
Statistics
Performance analytics
```

---

## PHASE 8 — AI

Implement:

```text
AI detections
Confidence
Anomaly scores
Model information
Explainability
AI performance
```

---

## PHASE 9 — RISK

Implement:

```text
Risk score
Risk contributors
Risk trends
Affected areas
Historical risk
```

---

## PHASE 10 — REAL-TIME

Implement:

```text
WebSocket
Reconnect
Heartbeat
Live events
Live sensor updates
Live alerts
Live system health
```

---

## PHASE 11 — SYSTEM HEALTH AND NETWORK

Implement:

```text
Backend health
Database health
Network
Latency
Connectivity
Resource monitoring
```

---

## PHASE 12 — SECURITY

Implement:

```text
Authentication
Protected routes
RBAC
Permissions
Session management
```

---

## PHASE 13 — INTERNATIONALIZATION

Implement:

```text
English
Kinyarwanda
French
Spanish
Kiswahili
```

Verify that no user-facing strings remain hard-coded.

---

## PHASE 14 — REPORTS AND AUDIT

Implement:

```text
Reports
Exports
Audit logs
Historical analysis
```

---

## PHASE 15 — ADVANCED ENGINEERING

Implement where useful:

```text
Topology
Digital twin readiness
3D visualization
Advanced geospatial visualization
System performance monitoring
Advanced event correlation
```

Do not add complexity merely for appearance.

---

## PHASE 16 — TESTING AND HARDENING

Test:

```text
Unit tests
Component tests
Integration tests
Responsive behavior
Accessibility
Performance
Failure states
API failures
WebSocket failures
Authentication failures
```

---

## PHASE 17 — PRODUCTION READINESS

Prepare:

```text
Production build
Environment configuration
Error handling
Logging
Performance optimization
Security review
Documentation
Deployment configuration
```

---

# 43. IMPLEMENTATION RESPONSE FORMAT

After completing each phase, respond using:

```text
PHASE COMPLETED
────────────────

1. What was implemented

2. Architecture changes

3. Files created

4. Files modified

5. Important file responsibilities

6. Dependencies added

7. Commands to run

8. Tests performed

9. Known limitations

10. Next phase
```

Always keep the explanation concise but technically useful.

---

# 44. CRITICAL RULE ABOUT BACKEND

The frontend must never assume that a backend feature exists just because the frontend has a page for it.

If the backend does not currently support something:

```text
Create the frontend contract/interface
+
Use mock data
+
Clearly label it as simulated
+
Prepare the integration point
```

Do not fabricate successful backend responses.

---

# 45. CRITICAL RULE ABOUT PHYSICAL DEVICES

SentinelNet is intended to eventually integrate with physical sensing infrastructure.

Therefore, frontend data models must be compatible with:

```text
Sensor
Device
Gateway
Network
Location
Telemetry
Event
Alert
AI Detection
Risk
```

The frontend should be ready for real physical devices later.

Do not pretend simulated sensor data is coming from physical hardware.

---

# 46. OBSERVABILITY

The system should make its own condition visible.

The operator should be able to determine:

```text
Is the backend healthy?
Is the database healthy?
Is WebSocket connected?
Are devices communicating?
Are sensors producing data?
Is data fresh?
Is AI operating?
Is event processing working?
Is risk processing working?
Is the frontend receiving updates?
```

This is a core requirement, not an optional feature.

---

# 47. VISUALIZATION PRINCIPLES

Every visualization must answer a meaningful engineering question.

Examples:

```text
What changed?
When did it change?
Where did it change?
How severe is the change?
Is the change increasing or decreasing?
Which device caused it?
Which sensor contributed?
What does the AI believe?
What is the confidence?
How does this affect risk?
```

Do not create charts simply to make the dashboard look impressive.

---

# 48. FINAL ARCHITECTURE

The final SentinelNet architecture should conceptually become:

```text
                         SENTINELNET
                              │
             ┌────────────────┴────────────────┐
             │                                 │
        PHYSICAL WORLD                     SOFTWARE
             │                                 │
        ┌────┴────┐                     ┌──────┴──────┐
        │ Sensors │                     │   Backend    │
        └────┬────┘                     └──────┬──────┘
             ↓                                  │
        Edge Devices                            ↓
             ↓                            Data Processing
          Network                              ↓
             ↓                             AI / ML
             └──────────────┐                  ↓
                            │             Event Engine
                            │                  ↓
                            │             Risk Engine
                            │                  ↓
                            │             Alert Engine
                            │                  │
                            └───────┬──────────┘
                                    ↓
                              REST / WebSocket
                                    ↓
                          ┌───────────────────┐
                          │ React Frontend    │
                          │                   │
                          │ Dashboard         │
                          │ Monitoring        │
                          │ Devices           │
                          │ Sensors           │
                          │ Events            │
                          │ Alerts            │
                          │ Maps              │
                          │ Tracking          │
                          │ AI                │
                          │ Risk              │
                          │ Analytics         │
                          │ System Health     │
                          │ Network           │
                          │ Reports           │
                          │ Audit             │
                          └─────────┬─────────┘
                                    ↓
                          Engineer / Operator
```

---

# 49. FINAL QUALITY TARGET

The final frontend must feel like a combination of:

```text
Engineering Monitoring Platform
+
Real-Time Observability System
+
IoT/Sensor Monitoring Platform
+
Geospatial Monitoring Interface
+
Analytics Platform
+
AI Decision-Support Interface
+
System Health Dashboard
```

It must NOT feel like:

```text
Generic Admin Dashboard
```

The final system should be:

* Professional
* Technical
* Scalable
* Explainable
* Responsive
* Accessible
* Real-time ready
* Sensor-ready
* AI-ready
* Backend-ready
* Hardware-integration-ready
* Multilingual
* Secure
* Testable
* Maintainable

---

# 50. FINAL INSTRUCTION TO CLAUDE

Before writing large amounts of code:

1. Inspect the existing project.
2. Do not overwrite working functionality without justification.
3. Present the architecture.
4. Present the folder structure.
5. Explain the important files.
6. Present the data flow.
7. Present the dependency flow.
8. Present the page/component architecture.
9. Identify which backend capabilities are confirmed and which are not.
10. Identify which data will initially be mocked.
11. Then begin implementation with Phase 1.

For every subsequent phase:

```text
IMPLEMENT
↓
VERIFY
↓
TEST
↓
DOCUMENT
↓
PRESERVE EXISTING FUNCTIONALI# SENTINELNET — COMPLETE FRONTEND ENGINEERING MASTER PROMPT

## 0. ROLE

You are acting as a combined:

* Senior Software Architect
* Senior React/TypeScript Engineer
* Senior UI/UX Engineer
* Data Visualization Engineer
* Real-Time Systems Engineer
* Systems Integration Engineer
* IoT/Edge Systems Engineer
* AI/ML Interface Engineer
* Geospatial Visualization Engineer
* Cybersecurity-Aware Application Architect
* DevOps-Aware Frontend Engineer
* QA/Test Engineer

You are designing and implementing the frontend of **SentinelNet**, an engineering-grade intelligent monitoring, sensing, event-processing, risk-assessment, and decision-support platform.

This is NOT a generic admin dashboard.

The frontend must represent a serious engineering control and monitoring system capable of integrating:

```text
Physical Sensors
      ↓
Edge Devices
      ↓
Network
      ↓
Backend
      ↓
Data Processing
      ↓
AI/ML Detection
      ↓
Event Correlation
      ↓
Risk Assessment
      ↓
Alert Engine
      ↓
SentinelNet Frontend
      ↓
Human Operator / Engineer / Analyst
```

The frontend must be designed from the beginning to support this complete architecture even when some backend and physical hardware components are initially simulated.

---

# 1. PRIMARY OBJECTIVE

Build a professional, scalable, maintainable SentinelNet frontend using:

* React
* TypeScript
* Vite
* Tailwind CSS
* Material UI where appropriate
* Framer Motion
* Lucide React
* Zustand
* React Router
* React Hook Form
* Zod
* Recharts
* React-Leaflet
* Axios or Fetch
* WebSocket/Socket.IO architecture
* i18next / react-i18next
* date-fns

Do not introduce unnecessary libraries.

Every dependency must have a clear engineering reason.

---

# 2. DEVELOPMENT PRINCIPLE

The application must be developed incrementally.

DO NOT attempt to generate the entire application blindly in one step.

Use this sequence:

```text
Architecture
      ↓
Foundation
      ↓
Application Shell
      ↓
Routing
      ↓
Theme
      ↓
Navigation
      ↓
Dashboard
      ↓
Monitoring
      ↓
Devices
      ↓
Sensors
      ↓
Events
      ↓
Alerts
      ↓
Maps
      ↓
Tracking
      ↓
Analytics
      ↓
AI
      ↓
Risk
      ↓
System Health
      ↓
Network
      ↓
Reports
      ↓
Audit
      ↓
Authentication/RBAC
      ↓
Real-Time WebSocket
      ↓
Internationalization
      ↓
Testing
      ↓
Performance
      ↓
Production
```

After every phase:

1. Explain what was implemented.
2. Show files created.
3. Show files modified.
4. Explain why each important file exists.
5. Give exact commands to run.
6. Run or describe tests.
7. Check for TypeScript errors.
8. Check that existing functionality still works.
9. Identify limitations.
10. Only then continue to the next phase.

NEVER destroy working functionality while implementing a new feature.

---

# 3. DEVELOPMENT ENVIRONMENT

The frontend must work independently.

Expected development command:

```bash
npm run dev
```

Docker is NOT required to run the frontend.

The backend/database may continue running separately through Docker.

Architecture:

```text
VS CODE
   │
   ├── React Frontend
   │      localhost:5173
   │
   └── API / WebSocket
          ↓
       Backend
          ↓
       Database
```

The frontend must communicate with backend services through configurable environment variables.

Example:

```text
VITE_API_URL
VITE_WS_URL
VITE_MAP_PROVIDER
VITE_APP_ENV
```

Never hard-code secrets.

---

# 4. COMPLETE SYSTEM ARCHITECTURE

The conceptual system is:

```text
┌───────────────────────────────┐
│       PHYSICAL SENSORS        │
│                               │
│ Temperature                  │
│ Motion                       │
│ Pressure                     │
│ Vibration                    │
│ Environmental                │
│ Position / Location          │
│ Other supported sensors      │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│         EDGE DEVICES          │
│                               │
│ Sensor controllers            │
│ Embedded computers             │
│ Gateways                      │
│ Local processing              │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│            NETWORK            │
│                               │
│ Ethernet                      │
│ Wi-Fi                         │
│ Cellular                      │
│ Other supported links         │
└───────────────┬───────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│             BACKEND                    │
│                                        │
│ REST API                               │
│ WebSocket                              │
│ Authentication                         │
│ Device management                      │
│ Sensor ingestion                       │
│ Event processing                       │
│ Database                               │
└───────────────┬────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│        INTELLIGENCE LAYER              │
│                                        │
│ Data processing                        │
│ Anomaly detection                      │
│ AI/ML classification                   │
│ Event correlation                      │
│ Risk assessment                        │
└───────────────┬────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│           ALERT ENGINE                 │
│                                        │
│ Critical                               │
│ High                                   │
│ Medium                                 │
│ Low                                    │
│ Informational                          │
└───────────────┬────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│          SENTINELNET UI                │
│                                        │
│ Dashboard                              │
│ Live Monitoring                        │
│ Maps                                   │
│ Events                                 │
│ Alerts                                 │
│ Devices                                │
│ Sensors                                │
│ AI Analytics                           │
│ Risk                                   │
│ Reports                                │
│ System Health                          │
└───────────────┬────────────────────────┘
                │
                ▼
          OPERATOR / ENGINEER
```

---

# 5. FRONTEND INTERNAL DATA FLOW

The frontend architecture must follow:

```text
Backend / Mock Data
        │
        ▼
Service Layer
        │
        ▼
State Management
(Zustand)
        │
        ▼
Custom Hooks
        │
        ▼
Pages
        │
        ▼
Feature Components
        │
        ├── Charts
        ├── Maps
        ├── Tables
        ├── Cards
        ├── Forms
        ├── Timelines
        └── Visualization
```

Example:

```text
GET /api/devices
        ↓
devices.service.ts
        ↓
deviceStore.ts
        ↓
useDevices.ts
        ↓
DevicesPage.tsx
        ↓
DeviceTable.tsx
        ↓
DeviceDetails.tsx
```

Real-time example:

```text
Physical Sensor
      ↓
Edge Device
      ↓
Backend
      ↓
WebSocket
      ↓
socket.ts
      ↓
eventHandlers.ts
      ↓
sensorStore.ts
      ↓
useSensorTelemetry.ts
      ↓
SensorTelemetry.tsx
      ↓
Live Chart
```

---

# 6. COMPLETE FRONTEND FILE STRUCTURE

Create a professional structure similar to:

```text
sentinelnet-frontend/
│
├── public/
│   ├── assets/
│   └── favicon/
│
├── src/
│   │
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   ├── providers.tsx
│   │   └── routeConfig.ts
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── components/
│   │   │
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── PageContainer.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   └── MobileNavigation.tsx
│   │   │
│   │   ├── dashboard/
│   │   ├── monitoring/
│   │   ├── devices/
│   │   ├── sensors/
│   │   ├── events/
│   │   ├── alerts/
│   │   ├── tracking/
│   │   ├── maps/
│   │   ├── analytics/
│   │   ├── ai/
│   │   ├── risk/
│   │   ├── system/
│   │   ├── network/
│   │   ├── reports/
│   │   ├── audit/
│   │   ├── notifications/
│   │   ├── charts/
│   │   ├── tables/
│   │   ├── forms/
│   │   └── common/
│   │
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── LiveMonitoring/
│   │   ├── Events/
│   │   ├── Alerts/
│   │   ├── Devices/
│   │   ├── Sensors/
│   │   ├── Tracking/
│   │   ├── AIAnalytics/
│   │   ├── RiskAssessment/
│   │   ├── DataAnalytics/
│   │   ├── Timeline/
│   │   ├── Reports/
│   │   ├── SystemHealth/
│   │   ├── Network/
│   │   ├── AuditLogs/
│   │   ├── Settings/
│   │   ├── Login/
│   │   └── NotFound/
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── devices.service.ts
│   │   │   ├── sensors.service.ts
│   │   │   ├── events.service.ts
│   │   │   ├── alerts.service.ts
│   │   │   ├── tracking.service.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── ai.service.ts
│   │   │   ├── risk.service.ts
│   │   │   ├── reports.service.ts
│   │   │   ├── system.service.ts
│   │   │   └── network.service.ts
│   │   │
│   │   └── websocket/
│   │       ├── socket.ts
│   │       ├── connectionManager.ts
│   │       ├── eventHandlers.ts
│   │       └── eventTypes.ts
│   │
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── deviceStore.ts
│   │   ├── sensorStore.ts
│   │   ├── eventStore.ts
│   │   ├── alertStore.ts
│   │   ├── trackingStore.ts
│   │   ├── analyticsStore.ts
│   │   ├── aiStore.ts
│   │   ├── riskStore.ts
│   │   ├── systemStore.ts
│   │   ├── networkStore.ts
│   │   └── notificationStore.ts
│   │
│   ├── hooks/
│   │   ├── useDevices.ts
│   │   ├── useSensors.ts
│   │   ├── useEvents.ts
│   │   ├── useAlerts.ts
│   │   ├── useTracking.ts
│   │   ├── useAI.ts
│   │   ├── useRisk.ts
│   │   ├── useSystemHealth.ts
│   │   ├── useNetwork.ts
│   │   └── useWebSocket.ts
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── device.ts
│   │   ├── sensor.ts
│   │   ├── event.ts
│   │   ├── alert.ts
│   │   ├── tracking.ts
│   │   ├── analytics.ts
│   │   ├── ai.ts
│   │   ├── risk.ts
│   │   ├── system.ts
│   │   ├── network.ts
│   │   └── common.ts
│   │
│   ├── config/
│   │   ├── environment.ts
│   │   ├── navigation.ts
│   │   ├── permissions.ts
│   │   └── constants.ts
│   │
│   ├── themes/
│   │   ├── lightTheme.ts
│   │   ├── darkTheme.ts
│   │   ├── tokens.ts
│   │   └── themeProvider.tsx
│   │
│   ├── locales/
│   │   ├── en/
│   │   ├── rw/
│   │   ├── fr/
│   │   ├── es/
│   │   └── sw/
│   │
│   ├── mocks/
│   │   ├── devices.ts
│   │   ├── sensors.ts
│   │   ├── events.ts
│   │   ├── alerts.ts
│   │   ├── tracking.ts
│   │   ├── ai.ts
│   │   ├── risk.ts
│   │   └── system.ts
│   │
│   ├── utils/
│   │   ├── date.ts
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   ├── severity.ts
│   │   ├── status.ts
│   │   └── export.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── animations.css
│   │
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── .env
├── .env.example
├── .gitignore
├── eslint.config.js
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── index.html
```

---

# 7. RESPONSIBILITY OF IMPORTANT FILES

Every important file must have ONE clear responsibility.

## `src/main.tsx`

Application entry point.

Responsibilities:

* Mount React.
* Load providers.
* Load global styles.
* Initialize application.

Do not place business logic here.

---

## `src/app/App.tsx`

Root application component.

Responsibilities:

* Application shell.
* Router integration.
* Global layout.
* Authentication state.

---

## `src/app/router.tsx`

Central routing definition.

Example:

```text
/dashboard
/monitoring
/events
/alerts
/devices
/sensors
/tracking
/ai
/risk
/analytics
/timeline
/reports
/system-health
/network
/audit
/settings
```

---

## `src/services/api/client.ts`

Central API client.

Responsibilities:

* Base URL.
* Headers.
* Authentication.
* Request handling.
* Response handling.
* Error normalization.
* Timeout configuration.

---

## `src/services/api/*.service.ts`

Each service communicates with one backend domain.

Example:

```text
devices.service.ts
      ↓
/api/devices
```

Do not put React UI code in service files.

---

## `src/services/websocket/socket.ts`

Responsible for WebSocket connection.

Must support:

* Connect.
* Disconnect.
* Reconnect.
* Heartbeat.
* Connection state.
* Error handling.
* Graceful offline state.

---

## `src/store/*.ts`

Zustand application state.

Example:

```text
deviceStore.ts
    ↓
devices state
selected device
loading
error
filters
pagination
```

Do not put visual rendering inside stores.

---

## `src/types/*.ts`

Strong TypeScript models.

Never use `any` unless there is an exceptional documented reason.

---

## `src/hooks/*.ts`

Reusable application logic.

Example:

```text
useDevices()
useSensors()
useEvents()
useAlerts()
useWebSocket()
```

Hooks connect pages/components to state and services.

---

# 8. APPLICATION SHELL

Create:

```text
Sidebar
TopBar
Main Content
Status Bar
```

Sidebar navigation:

```text
Overview
Live Monitoring
Events
Alerts
Devices
Sensors
Tracking
AI Analytics
Risk Assessment
Data Analytics
Timeline
Reports
System Health
Network
Audit Logs
Settings
```

Top bar:

```text
System Status
Current Time
Global Search
Notifications
Language
Theme
User
Connection Status
```

---

# 9. DESIGN SYSTEM

The visual identity should communicate:

```text
Engineering
+
Monitoring
+
Reliability
+
Intelligence
+
Operational Awareness
```

Use a primarily black/white/neutral-gray design system.

Semantic colors:

```text
GREEN   = Healthy / Normal
YELLOW  = Warning
ORANGE  = Elevated
RED     = Critical
BLUE    = Information / Communication
PURPLE  = AI / Analytics
GRAY    = Offline / Unknown / Inactive
```

Never rely on color alone.

Use:

* Icons
* Labels
* Patterns
* Status text
* Shapes
* Tooltips

---

# 10. DARK AND LIGHT MODE

Both themes must be professionally designed.

Dark mode:

* Control-room appearance.
* Low glare.
* High information density.
* Clear hierarchy.

Light mode:

* Clean engineering interface.
* High readability.
* Strong contrast.
* Suitable for reports and daytime operation.

Theme preference must persist.

---

# 11. ANIMATION

Use Framer Motion carefully.

Animations should communicate:

* State changes.
* Panel transitions.
* Alert arrival.
* Loading.
* Navigation.
* Data updates.

Do NOT create distracting animations.

Support:

```text
prefers-reduced-motion
```

---

# 12. MULTILINGUAL SYSTEM

Required languages:

```text
English
Kinyarwanda
French
Spanish
Kiswahili
```

Locales:

```text
en
rw
fr
es
sw
```

No hard-coded UI text.

Example:

```text
t("dashboard.activeDevices")
```

rather than:

```text
"Active Devices"
```

Language must be switchable without reloading the entire application.

---

# 13. PAGE-BY-PAGE REQUIREMENTS

# 13.1 OVERVIEW / DASHBOARD

Purpose:

Give the operator an immediate understanding of system state.

Display:

```text
Total Devices
Active Devices
Offline Devices
Active Sensors
Active Alerts
Unresolved Events
Current Risk
AI Detections
System Uptime
Network Health
Data Ingestion Rate
Processing Latency
```

Main areas:

```text
KPI cards
Live map
Active alerts
Recent events
AI activity
Risk trend
System health
Sensor activity
Network status
```

The dashboard must answer:

```text
WHAT is happening?
WHERE is it happening?
WHY is it happening?
HOW serious is it?
HOW healthy is the system?
```

---

# 13.2 LIVE MONITORING

Real-time operational view.

Include:

* Live map.
* Live events.
* Live alerts.
* Sensor telemetry.
* Device status.
* AI detections.
* Connection status.
* Data freshness.

WebSocket updates should update only affected components.

Do not rerender the entire dashboard unnecessarily.

---

# 13.3 EVENTS

Show:

```text
Event ID
Timestamp
Source
Device
Sensor
Location
Event Type
Severity
Confidence
Status
Assigned Operator
```

Lifecycle:

```text
Detected
   ↓
Classified
   ↓
Assessed
   ↓
Acknowledged
   ↓
Investigated
   ↓
Resolved
   ↓
Archived
```

Include:

* Search.
* Filters.
* Severity.
* Time.
* Source.
* Location.
* Status.
* Event details.
* Related events.

---

# 13.4 ALERTS

Alert center.

Levels:

```text
Critical
High
Medium
Low
Informational
```

Actions:

```text
Acknowledge
Assign
Investigate
Resolve
Escalate
```

Show:

* Alert timeline.
* Source.
* Location.
* Confidence.
* Related events.
* Risk contribution.

---

# 13.5 DEVICES

Device inventory.

Each device should show:

```text
Device ID
Name
Type
Status
Connectivity
Power/Battery
Firmware
Network
Last Communication
Location
Sensors
Health
Events
```

Device detail page:

```text
Overview
Telemetry
Events
Alerts
Network
Configuration
History
```

---

# 13.6 SENSORS

Show:

```text
Sensor ID
Sensor Type
Device
Current Value
Unit
Threshold
Min
Max
Average
Last Update
Health
Calibration Status
```

Telemetry charts:

```text
1 hour
6 hours
24 hours
7 days
30 days
Custom
```

Include data-quality indicators:

```text
Fresh
Delayed
Stale
Missing
Invalid
```

---

# 13.7 TRACKING

Tracking interface.

Display:

* Current position.
* Historical path.
* Timestamp.
* Status changes.
* Events along path.
* Timeline playback.

Provide:

```text
Play
Pause
Speed
Time range
Event filtering
```

---

# 13.8 MAP / GEOSPATIAL MONITORING

Map layers:

```text
Devices
Sensors
Events
Alerts
Coverage
Geofences
Historical Activity
```

Features:

* Zoom.
* Pan.
* Clustering.
* Filtering.
* Selecting.
* Details panel.
* Timeline playback.

Do not overload the map.

---

# 13.9 AI ANALYTICS

Clearly distinguish:

```text
AI Prediction
AI Detection
Confirmed Event
Human Verification
```

Display:

```text
Detection
Classification
Confidence
Anomaly Score
Model
Model Version
Inference Latency
Detection Frequency
Performance
```

Explainability panel:

```text
What was detected?
Why was it detected?
What data contributed?
What confidence does the model have?
Which model produced it?
When was it produced?
```

Never present an AI prediction as unquestionable truth.

---

# 13.10 RISK ASSESSMENT

Display:

```text
Current Risk
Risk Trend
Risk Contributors
Affected Areas
Affected Devices
Confidence
Historical Risk
```

Risk must be explainable.

Example:

```text
Risk Score: 72

Contributors:

Sensor anomaly       +25
Device instability   +18
Event frequency      +15
AI confidence        +14
```

Use charts to explain changes over time.

---

# 13.11 DATA ANALYTICS

Provide:

* Time-series charts.
* Bar charts.
* Area charts.
* Scatter plots.
* Distributions.
* Heatmaps.
* Event frequency.
* Sensor trends.
* Device uptime.
* AI detections.
* Risk trends.
* Latency.

Every chart must have:

```text
Title
Description
Units
Legend
Tooltip
Time range
Filters
Loading state
Empty state
Error state
```

---

# 13.12 TIMELINE

Unified chronological view.

Combine:

```text
Sensor events
Device events
Alerts
AI detections
Risk changes
Operator actions
System failures
System recoveries
```

Allow:

* Filtering.
* Zooming.
* Date selection.
* Event selection.
* Correlation.

---

# 13.13 SYSTEM HEALTH

Show:

```text
API
Database
WebSocket
Queue
Processing
CPU
Memory
Storage
Network
Availability
Error Rate
Request Rate
Latency
```

Use system state:

```text
NORMAL
WARNING
DEGRADED
CRITICAL
OFFLINE
UNKNOWN
```

---

# 13.14 NETWORK

Show:

```text
Connected Devices
Disconnected Devices
Latency
Packet/message activity
Communication failures
Reconnect attempts
Last seen
```

Provide network topology:

```text
Sensor
  ↓
Device
  ↓
Gateway
  ↓
Network
  ↓
Backend
```

---

# 13.15 REPORTS

Reports should support:

```text
System Health
Events
Alerts
Devices
Sensors
AI
Risk
Operational Statistics
```

Allow:

```text
Date range
Filters
Export
Print-ready view
```

Do not fabricate report data.

---

# 13.16 AUDIT LOGS

Show:

```text
User
Action
Timestamp
Resource
Previous State
New State
Source
IP where appropriate
```

Audit records should be immutable from the UI perspective.

---

# 13.17 SETTINGS

Sections:

```text
Appearance
Language
Notifications
Map
Charts
System
Account
Security
```

---

# 14. EVENT CORRELATION

The UI must visualize relationships such as:

```text
Sensor Anomaly
      ↓
Device Warning
      ↓
AI Detection
      ↓
Risk Increase
      ↓
Alert
      ↓
Operator Action
```

The operator should be able to navigate between related objects.

Example:

```text
Alert
 ↓
Related Event
 ↓
Source Sensor
 ↓
Device
 ↓
Location
 ↓
AI Detection
 ↓
Risk Assessment
```

---

# 15. MOCK DATA ARCHITECTURE

The frontend must initially work even without the complete backend.

Use:

```text
Mock Data
   ↓
Service Layer
   ↓
Zustand
   ↓
Hooks
   ↓
Components
```

Later replace with:

```text
Real Backend
   ↓
Service Layer
   ↓
Zustand
   ↓
Hooks
   ↓
Components
```

Do not rewrite the UI architecture when backend integration begins.

Every mock/simulated value must be clearly identifiable internally.

Never present simulated data as confirmed real-world data.

---

# 16. API ARCHITECTURE

Prepare typed service interfaces for:

```text
/api/auth
/api/devices
/api/sensors
/api/events
/api/alerts
/api/tracking
/api/analytics
/api/ai
/api/risk
/api/reports
/api/system
/api/network
```

Do not invent backend endpoints and claim that they already exist.

If the backend endpoint is not confirmed:

```text
MOCK
SIMULATED
EXPECTED BACKEND CONTRACT
```

must be clearly distinguished.

---

# 17. WEBSOCKET ARCHITECTURE

Support event types:

```text
sensor.update
device.status
event.created
alert.created
alert.updated
ai.detection
risk.updated
system.health
network.status
```

Connection states:

```text
CONNECTED
RECONNECTING
OFFLINE
```

Implement:

* Automatic reconnect.
* Heartbeat.
* Error handling.
* Stale-data detection.
* Connection indicator.
* Graceful fallback.

---

# 18. SECURITY ARCHITECTURE

Prepare for:

```text
Authentication
Authorization
RBAC
Protected routes
Input validation
Secure token handling
Environment configuration
Session management
```

Roles:

```text
Administrator
Engineer
Operator
Analyst
Viewer
```

Permissions must be designed centrally.

Example:

```text
permissions.ts
```

Do not scatter authorization logic throughout random components.

---

# 19. PERFORMANCE

Implement:

* Lazy loading.
* Code splitting.
* Memoization where useful.
* Pagination.
* Virtualized large tables where necessary.
* Debounced search.
* Efficient WebSocket state updates.
* Avoid unnecessary renders.
* Efficient chart rendering.

Real-time updates must not make the entire application slow.

---

# 20. ERROR AND FAILURE DESIGN

The application must never show an unexplained blank screen.

Handle:

```text
Backend unavailable
Database unavailable
WebSocket unavailable
Sensor offline
Device offline
API timeout
Authentication failure
Permission denied
Invalid data
Stale data
Missing data
AI service unavailable
Map unavailable
```

Use clear states:

```text
Loading
Empty
Error
Offline
Stale
Degraded
Unknown
```

---

# 21. DATA QUALITY

Every important data source should be able to indicate:

```text
Fresh
Delayed
Stale
Missing
Invalid
Simulated
Real
AI-generated
Human-confirmed
```

This is essential for an engineering monitoring platform.

---

# 22. OPTIONAL ADVANCED VISUALIZATION

Design the architecture so future versions can include:

```text
3D Facility
3D Sensor Environment
Device Topology
Network Topology
Sensor Coverage
Spatial Relationships
Digital Twin
Historical State
Simulation
```

Do not force 3D everywhere.

Use it only where it improves understanding.

Keep 3D modular so it can be added without rewriting the application.

---

# 23. DIGITAL-TWIN-READY DESIGN

Prepare data models for:

```text
Physical Asset
Device
Sensor
Location
Relationship
State
Historical State
Telemetry
Event
```

Example:

```text
Facility
   ↓
Area
   ↓
Device
   ↓
Sensor
   ↓
Telemetry
   ↓
Event
```

This should allow future mapping of real physical infrastructure into SentinelNet.

---

# 24. SYSTEM PERFORMANCE MONITORING

Track:

```text
Frontend Load Time
API Latency
WebSocket Latency
Event Processing Latency
Data Freshness
Rendering Performance
Error Rate
```

Display these in System Health where appropriate.

---

# 25. GLOBAL SEARCH

Search across:

```text
Devices
Sensors
Events
Alerts
Locations
Reports
Users
```

Search results must indicate the entity type.

Example:

```text
DEVICE
DEV-001

EVENT
EVT-1042

SENSOR
TEMP-07

ALERT
ALT-220
```

---

# 26. NOTIFICATION CENTER

Notifications may include:

```text
Critical Alert
New Event
Device Offline
Sensor Failure
AI Detection
Risk Increase
System Recovery
Network Failure
```

Support:

```text
Unread
Read
Priority
Timestamp
Source
Action
```

---

# 27. DASHBOARD CUSTOMIZATION

Allow users to eventually configure:

```text
Widget visibility
Widget order
Widget size
Preferred charts
Map layers
Data density
Default time range
```

Persist preferences.

---

# 28. RESPONSIVE DESIGN

Primary target:

```text
Desktop
Laptop
```

Secondary:

```text
Tablet
Mobile
```

Do not simply shrink the desktop interface.

For mobile:

* Simplify navigation.
* Prioritize alerts.
* Prioritize system status.
* Provide compact cards.
* Provide usable map controls.

---

# 29. ACCESSIBILITY

Implement:

* Semantic HTML.
* Keyboard navigation.
* ARIA labels.
* Proper focus states.
* Screen-reader support.
* Contrast.
* Non-color status indicators.
* Reduced-motion support.

---

# 30. TESTING

Use:

```text
Vitest
React Testing Library
```

Test:

```text
Components
Hooks
Stores
Services
Forms
Routing
Permissions
Critical user flows
Error states
```

At minimum test:

```text
Dashboard loads
Navigation works
Device list loads
Sensor data renders
Event filtering works
Alert acknowledgement works
WebSocket state changes
Theme switching works
Language switching works
Unauthorized routes are protected
```

---

# 31. FILE DEPENDENCY RULES

Follow these dependency rules:

```text
Pages
  ↓
Components
  ↓
Hooks
  ↓
Stores
  ↓
Services
  ↓
API / WebSocket
```

Do NOT allow:

```text
Component
   ↓
Direct random fetch()
```

Instead:

```text
Component
   ↓
Hook
   ↓
Store / Service
   ↓
API
```

Keep responsibilities separated.

---

# 32. EXAMPLE DEVICE FLOW

A device page should conceptually work as:

```text
DevicesPage.tsx
      ↓
useDevices.ts
      ↓
deviceStore.ts
      ↓
devices.service.ts
      ↓
client.ts
      ↓
GET /api/devices
      ↓
Backend
```

Device updates:

```text
Backend
   ↓
WebSocket
   ↓
socket.ts
   ↓
eventHandlers.ts
   ↓
deviceStore.ts
   ↓
useDevices.ts
   ↓
DeviceStatusCard.tsx
```

---

# 33. EXAMPLE SENSOR FLOW

```text
Physical Sensor
      ↓
Edge Device
      ↓
Gateway
      ↓
Network
      ↓
Backend
      ↓
Sensor API
      ↓
sensors.service.ts
      ↓
sensorStore.ts
      ↓
useSensors.ts
      ↓
SensorsPage.tsx
      ↓
SensorTelemetry.tsx
      ↓
Chart
```

---

# 34. EXAMPLE AI FLOW

```text
Sensor Data
      ↓
Backend
      ↓
AI Model
      ↓
Prediction
      ↓
Confidence
      ↓
Event Engine
      ↓
Risk Engine
      ↓
Alert Engine
      ↓
WebSocket
      ↓
aiStore.ts
      ↓
AIAnalyticsPage.tsx
```

The UI must clearly communicate that the AI output is a prediction/detection unless independently confirmed.

---

# 35. EXAMPLE RISK FLOW

```text
Sensor Data
      +
Events
      +
AI Detections
      +
Device Health
      +
Context
      ↓
Risk Engine
      ↓
Risk Score
      ↓
Risk Contributors
      ↓
riskStore.ts
      ↓
RiskAssessmentPage.tsx
```

---

# 36. EXAMPLE ALERT FLOW

```text
Event
   ↓
Severity Evaluation
   ↓
Alert Engine
   ↓
Alert Created
   ↓
WebSocket
   ↓
alertStore.ts
   ↓
Notification Center
   +
Alert Center
   +
Dashboard
```

---

# 37. SYSTEM TOPOLOGY VIEW

Provide a conceptual topology view:

```text
┌───────────┐
│  Sensors  │
└─────┬─────┘
      ↓
┌───────────┐
│  Devices  │
└─────┬─────┘
      ↓
┌───────────┐
│  Gateway  │
└─────┬─────┘
      ↓
┌───────────┐
│  Network  │
└─────┬─────┘
      ↓
┌───────────┐
│  Backend  │
└─────┬─────┘
      ↓
┌───────────┐
│ AI Engine │
└─────┬─────┘
      ↓
┌───────────┐
│Event/Risk │
│  Engine   │
└─────┬─────┘
      ↓
┌───────────┐
│ Dashboard │
└───────────┘
```

---

# 38. PAGE COMPONENT ARCHITECTURE

Every page should follow a structure such as:

```text
Page
│
├── Page Header
│
├── Filters
│
├── Summary
│
├── Main Visualization
│
├── Data Table
│
└── Detail Panel
```

For example:

```text
DevicesPage
│
├── DevicePageHeader
├── DeviceFilters
├── DeviceSummaryCards
├── DeviceStatusChart
├── DeviceTable
└── DeviceDetailsDrawer
```

---

# 39. REUSABLE COMPONENTS

Create reusable components such as:

```text
StatusBadge
SeverityBadge
HealthIndicator
MetricCard
LoadingState
EmptyState
ErrorState
OfflineState
DataFreshnessIndicator
SearchInput
FilterPanel
DateRangePicker
DataTable
DetailDrawer
ConfirmDialog
Timeline
ChartContainer
MapContainer
```

Do not recreate the same UI logic repeatedly.

---

# 40. UI STATE MODEL

Use consistent states:

```text
LOADING
READY
EMPTY
ERROR
OFFLINE
STALE
DEGRADED
```

Avoid inconsistent loading/error patterns across pages.

---

# 41. ENGINEERING QUALITY RULES

Follow these rules strictly:

1. TypeScript strict mode.
2. Avoid `any`.
3. Avoid duplicated logic.
4. Avoid giant components.
5. Use reusable components.
6. Keep business logic out of presentation components.
7. Keep API logic out of components.
8. Keep state management centralized.
9. Use meaningful names.
10. Comment complex engineering logic.
11. Do not fabricate backend functionality.
12. Clearly distinguish mock data from real data.
13. Do not break existing functionality.
14. Keep the project runnable after every phase.

---

# 42. PHASED IMPLEMENTATION ROADMAP

## PHASE 1 — FOUNDATION

Implement:

```text
Vite
React
TypeScript
Tailwind
Theme
Basic folder structure
ESLint
Prettier
Environment configuration
```

Verify:

```bash
npm run dev
npm run build
```

---

## PHASE 2 — APPLICATION SHELL

Implement:

```text
AppShell
Sidebar
TopBar
Routing
Theme switching
Responsive layout
```

---

## PHASE 3 — DASHBOARD

Implement:

```text
KPI cards
System status
Live event stream
Alert center
Map
Risk chart
System health
```

Use mock data initially.

---

## PHASE 4 — DEVICES AND SENSORS

Implement:

```text
Device inventory
Device details
Sensor inventory
Sensor telemetry
Charts
Health
Data freshness
```

---

## PHASE 5 — EVENTS AND ALERTS

Implement:

```text
Event management
Alert management
Filtering
Searching
Correlation
Timeline
```

---

## PHASE 6 — MAP AND TRACKING

Implement:

```text
Interactive map
Markers
Clusters
Layers
Tracking
Historical paths
Playback
```

---

## PHASE 7 — ANALYTICS

Implement:

```text
Charts
Filters
Time ranges
Statistics
Performance analytics
```

---

## PHASE 8 — AI

Implement:

```text
AI detections
Confidence
Anomaly scores
Model information
Explainability
AI performance
```

---

## PHASE 9 — RISK

Implement:

```text
Risk score
Risk contributors
Risk trends
Affected areas
Historical risk
```

---

## PHASE 10 — REAL-TIME

Implement:

```text
WebSocket
Reconnect
Heartbeat
Live events
Live sensor updates
Live alerts
Live system health
```

---

## PHASE 11 — SYSTEM HEALTH AND NETWORK

Implement:

```text
Backend health
Database health
Network
Latency
Connectivity
Resource monitoring
```

---

## PHASE 12 — SECURITY

Implement:

```text
Authentication
Protected routes
RBAC
Permissions
Session management
```

---

## PHASE 13 — INTERNATIONALIZATION

Implement:

```text
English
Kinyarwanda
French
Spanish
Kiswahili
```

Verify that no user-facing strings remain hard-coded.

---

## PHASE 14 — REPORTS AND AUDIT

Implement:

```text
Reports
Exports
Audit logs
Historical analysis
```

---

## PHASE 15 — ADVANCED ENGINEERING

Implement where useful:

```text
Topology
Digital twin readiness
3D visualization
Advanced geospatial visualization
System performance monitoring
Advanced event correlation
```

Do not add complexity merely for appearance.

---

## PHASE 16 — TESTING AND HARDENING

Test:

```text
Unit tests
Component tests
Integration tests
Responsive behavior
Accessibility
Performance
Failure states
API failures
WebSocket failures
Authentication failures
```

---

## PHASE 17 — PRODUCTION READINESS

Prepare:

```text
Production build
Environment configuration
Error handling
Logging
Performance optimization
Security review
Documentation
Deployment configuration
```

---

# 43. IMPLEMENTATION RESPONSE FORMAT

After completing each phase, respond using:

```text
PHASE COMPLETED
────────────────

1. What was implemented

2. Architecture changes

3. Files created

4. Files modified

5. Important file responsibilities

6. Dependencies added

7. Commands to run

8. Tests performed

9. Known limitations

10. Next phase
```

Always keep the explanation concise but technically useful.

---

# 44. CRITICAL RULE ABOUT BACKEND

The frontend must never assume that a backend feature exists just because the frontend has a page for it.

If the backend does not currently support something:

```text
Create the frontend contract/interface
+
Use mock data
+
Clearly label it as simulated
+
Prepare the integration point
```

Do not fabricate successful backend responses.

---

# 45. CRITICAL RULE ABOUT PHYSICAL DEVICES

SentinelNet is intended to eventually integrate with physical sensing infrastructure.

Therefore, frontend data models must be compatible with:

```text
Sensor
Device
Gateway
Network
Location
Telemetry
Event
Alert
AI Detection
Risk
```

The frontend should be ready for real physical devices later.

Do not pretend simulated sensor data is coming from physical hardware.

---

# 46. OBSERVABILITY

The system should make its own condition visible.

The operator should be able to determine:

```text
Is the backend healthy?
Is the database healthy?
Is WebSocket connected?
Are devices communicating?
Are sensors producing data?
Is data fresh?
Is AI operating?
Is event processing working?
Is risk processing working?
Is the frontend receiving updates?
```

This is a core requirement, not an optional feature.

---

# 47. VISUALIZATION PRINCIPLES

Every visualization must answer a meaningful engineering question.

Examples:

```text
What changed?
When did it change?
Where did it change?
How severe is the change?
Is the change increasing or decreasing?
Which device caused it?
Which sensor contributed?
What does the AI believe?
What is the confidence?
How does this affect risk?
```

Do not create charts simply to make the dashboard look impressive.

---

# 48. FINAL ARCHITECTURE

The final SentinelNet architecture should conceptually become:

```text
                         SENTINELNET
                              │
             ┌────────────────┴────────────────┐
             │                                 │
        PHYSICAL WORLD                     SOFTWARE
             │                                 │
        ┌────┴────┐                     ┌──────┴──────┐
        │ Sensors │                     │   Backend    │
        └────┬────┘                     └──────┬──────┘
             ↓                                  │
        Edge Devices                            ↓
             ↓                            Data Processing
          Network                              ↓
             ↓                             AI / ML
             └──────────────┐                  ↓
                            │             Event Engine
                            │                  ↓
                            │             Risk Engine
                            │                  ↓
                            │             Alert Engine
                            │                  │
                            └───────┬──────────┘
                                    ↓
                              REST / WebSocket
                                    ↓
                          ┌───────────────────┐
                          │ React Frontend    │
                          │                   │
                          │ Dashboard         │
                          │ Monitoring        │
                          │ Devices           │
                          │ Sensors           │
                          │ Events            │
                          │ Alerts            │
                          │ Maps              │
                          │ Tracking          │
                          │ AI                │
                          │ Risk              │
                          │ Analytics         │
                          │ System Health     │
                          │ Network           │
                          │ Reports           │
                          │ Audit             │
                          └─────────┬─────────┘
                                    ↓
                          Engineer / Operator
```

---

# 49. FINAL QUALITY TARGET

The final frontend must feel like a combination of:

```text
Engineering Monitoring Platform
+
Real-Time Observability System
+
IoT/Sensor Monitoring Platform
+
Geospatial Monitoring Interface
+
Analytics Platform
+
AI Decision-Support Interface
+
System Health Dashboard
```

It must NOT feel like:

```text
Generic Admin Dashboard
```

The final system should be:

* Professional
* Technical
* Scalable
* Explainable
* Responsive
* Accessible
* Real-time ready
* Sensor-ready
* AI-ready
* Backend-ready
* Hardware-integration-ready
* Multilingual
* Secure
* Testable
* Maintainable

---

# 50. FINAL INSTRUCTION TO CLAUDE

Before writing large amounts of code:

1. Inspect the existing project.
2. Do not overwrite working functionality without justification.
3. Present the architecture.
4. Present the folder structure.
5. Explain the important files.
6. Present the data flow.
7. Present the dependency flow.
8. Present the page/component architecture.
9. Identify which backend capabilities are confirmed and which are not.
10. Identify which data will initially be mocked.
11. Then begin implementation with Phase 1.

For every subsequent phase:

```text
IMPLEMENT
↓
VERIFY
↓
TEST
↓
DOCUMENT
↓
PRESERVE EXISTING FUNCTIONALITY
↓
CONTINUE
```

Never skip verification.

Never fabricate functionality.

Never confuse mock data with real sensor data.

Never create unnecessary complexity.

Build SentinelNet as a serious engineering platform from the foundation upward.
TY
↓
CONTINUE
```

Never skip verification.

Never fabricate functionality.

Never confuse mock data with real sensor data.

Never create unnecessary complexity.

Build SentinelNet as a serious engineering platform from the foundation upward.
