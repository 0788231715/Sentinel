import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AppShell } from '../components/layout/AppShell';
const Dashboard = lazy(() => import('../pages/Dashboard'));
const LiveMonitoring = lazy(() => import('../pages/LiveMonitoring'));
const Events = lazy(() => import('../pages/Events'));
const AlertsPage = lazy(() => import('../pages/AlertsPage'));
const DevicesPage = lazy(() => import('../pages/DevicesPage'));
const DeviceDetailPage = lazy(() => import('../pages/DeviceDetailPage'));
const SensorsPage = lazy(() => import('../pages/SensorsPage'));
const SensorDetailPage = lazy(() => import('../pages/SensorDetailPage'));
const TrackingPage = lazy(() => import('../pages/TrackingPage'));
const AIPage = lazy(() => import('../pages/AIPage'));
const RiskPage = lazy(() => import('../pages/RiskPage'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
const TimelinePage = lazy(() => import('../pages/TimelinePage'));
const NetworkPage = lazy(() => import('../pages/NetworkPage'));
const SystemHealthPage = lazy(() => import('../pages/SystemHealthPage'));
const ReportsPage = lazy(() => import('../pages/ReportsPage'));
const AuditPage = lazy(() => import('../pages/AuditPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));

function page(element: ReactNode) {
  return <Suspense fallback={<div role="status" className="p-8 text-sm text-slate-400">Loading page…</div>}>{element}</Suspense>;
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, initialized, initError, initialize } = useAuthStore();
  if (!initialized) {
    return <div className="p-8 text-sm text-slate-400">Checking session…</div>;
  }
  if (initError) {
    return (
      <div role="alert" className="m-8 flex items-center justify-between rounded-lg border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-200">
        <span>Could not verify the saved session: {initError}</span>
        <button onClick={() => void initialize()} className="rounded border border-red-400/40 px-3 py-1.5">Retry</button>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

const router = createBrowserRouter([
  { path: '/login', element: page(<LoginPage />) },
  {
    path: '/',
    element: <RequireAuth><AppShell /></RequireAuth>,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: page(<Dashboard />),
      },
      {
        path: 'monitoring',
        element: page(<LiveMonitoring />),
      },
      {
        path: 'events',
        element: page(<Events />),
      },
      {
        path: 'alerts',
        element: page(<AlertsPage />),
      },
      {
        path: 'devices',
        element: page(<DevicesPage />),
      },
      {
        path: 'devices/:deviceId',
        element: page(<DeviceDetailPage />),
      },
      {
        path: 'sensors',
        element: page(<SensorsPage />),
      },
      {
        path: 'sensors/:sensorId',
        element: page(<SensorDetailPage />),
      },
      {
        path: 'tracking',
        element: page(<TrackingPage />),
      },
      {
        path: 'ai',
        element: page(<AIPage />),
      },
      { path: 'risk', element: page(<RiskPage />) },
      { path: 'analytics', element: page(<AnalyticsPage />) },
      { path: 'timeline', element: page(<TimelinePage />) },
      { path: 'system', element: page(<SystemHealthPage />) },
      { path: 'network', element: page(<NetworkPage />) },
      { path: 'reports', element: page(<ReportsPage />) },
      { path: 'audit', element: page(<AuditPage />) },
      { path: 'settings', element: page(<SettingsPage />) },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
