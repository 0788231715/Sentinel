import { useEffect, useState } from 'react';
import { BellRing, ShieldAlert } from 'lucide-react';
import { SectionCard } from '../components/dashboard/SectionCard';
import { StatusPill } from '../components/dashboard/StatusPill';
import { QueryNotice } from '../components/dashboard/QueryNotice';
import { useAlertStore } from '../store/alertStore';
import { alertService } from '../services/api/alert.service';
import { useAuthStore } from '../store/authStore';
import { canWriteMonitoring } from '../services/permissions';

export default function AlertsPage() {
  const { alerts, stats, loading, error, fetchAlerts } = useAlertStore();
  const { user } = useAuthStore();
  const [severity, setSeverity] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [actionError, setActionError] = useState<string | null>(null);
  useEffect(() => {
    void fetchAlerts();
  }, [fetchAlerts]);
  const updateStatus = async (id: string, nextStatus: 'ACKNOWLEDGED' | 'RESOLVED') => {
    setActionError(null);
    try {
      await alertService.updateAlert(id, { status: nextStatus });
      await fetchAlerts();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not update alert');
    }
  };
  const visibleAlerts = alerts.filter((alert) =>
    (severity === 'ALL' || alert.severity === severity) && (status === 'ALL' || alert.status === status),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Alerts</h1>
          <p className="text-slate-400">Alert queue, triage, and operator response status</p>
        </div>
        <div className="flex gap-2">
          <select aria-label="Filter alerts by severity" value={severity} onChange={(event) => setSeverity(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"><option value="ALL">All severities</option>{['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].map((item) => <option key={item}>{item}</option>)}</select>
          <select aria-label="Filter alerts by status" value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"><option value="ALL">All statuses</option>{['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].map((item) => <option key={item}>{item}</option>)}</select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="text-xs uppercase tracking-wider text-slate-400">Critical</div>
          <div className="mt-4 text-3xl font-bold text-slate-100">{stats.critical}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="text-xs uppercase tracking-wider text-slate-400">High</div>
          <div className="mt-4 text-3xl font-bold text-slate-100">{alerts.filter((alert) => alert.severity === 'HIGH').length}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="text-xs uppercase tracking-wider text-slate-400">Resolved</div>
          <div className="mt-4 text-3xl font-bold text-slate-100">{alerts.filter((alert) => alert.status === 'RESOLVED').length}</div>
        </div>
      </div>

      {actionError && <div role="alert" className="rounded border border-red-700 p-3 text-sm text-red-200">{actionError}</div>}
      <SectionCard title="Alert queue" subtitle="Priority response list">
        <QueryNotice loading={loading} error={error} onRetry={() => void fetchAlerts()} />
        {!loading && !error ? <div className="space-y-3">
          {visibleAlerts.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No matching alerts.</p> : null}
          {visibleAlerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-red-500/10 p-2 text-red-300">
                  <BellRing size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">{alert.id}</span>
                    <StatusPill tone={alert.severity === 'CRITICAL' ? 'danger' : alert.severity === 'HIGH' ? 'warning' : 'info'}>{alert.severity}</StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{alert.message}</p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                    <span>{alert.source}</span>
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    <span className="inline-flex items-center gap-1">
                      <ShieldAlert size={12} />
                      {alert.status}
                    </span>
                  </div>
                </div>
              </div>
              {canWriteMonitoring(user?.role) && alert.status !== 'RESOLVED' && <div className="flex gap-2">
                {alert.status === 'ACTIVE' && <button onClick={() => void updateStatus(alert.id, 'ACKNOWLEDGED')} className="text-xs text-blue-300 hover:text-blue-200">Acknowledge</button>}
                <button onClick={() => void updateStatus(alert.id, 'RESOLVED')} className="text-xs text-blue-300 hover:text-blue-200">Resolve</button>
              </div>}
            </div>
          ))}
        </div> : null}
      </SectionCard>
    </div>
  );
}
