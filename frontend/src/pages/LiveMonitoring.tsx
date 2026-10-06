import { useCallback, useEffect, useState } from 'react';
import { Activity, ArrowUpRight, BellRing, Gauge, ShieldAlert } from 'lucide-react';
import { SectionCard } from '../components/dashboard/SectionCard';
import { StatusPill } from '../components/dashboard/StatusPill';
import { QueryNotice } from '../components/dashboard/QueryNotice';
import { useMonitoringSocket } from '../hooks/useMonitoringSocket';
import { useMonitoringStore } from '../store/monitoringStore';
import { useSystemStore } from '../store/systemStore';

export default function LiveMonitoring() {
  const { overview, loading, error, fetchOverview } = useMonitoringStore();
  const { health, loading: healthLoading, error: healthError, fetchHealth } = useSystemStore();
  const [feedEnabled, setFeedEnabled] = useState(false);
  const refresh = useCallback(() => {
    void fetchOverview();
    void fetchHealth();
  }, [fetchHealth, fetchOverview]);
  const socketState = useMonitoringSocket(feedEnabled, refresh);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const streams = Object.entries(overview?.stream_health ?? {});
  const pageLoading = loading || healthLoading;
  const pageError = error || healthError;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Live Monitoring</h1>
          <p className="text-slate-400">Operational health and persisted monitoring data</p>
        </div>
        <button
          type="button"
          onClick={() => setFeedEnabled((enabled) => !enabled)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          <Activity size={16} />
          {feedEnabled ? 'Stop live feed' : 'Start live feed'}
        </button>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-xs">
        <span className="text-slate-400">WebSocket feed</span>
        <StatusPill tone={socketState === 'connected' ? 'success' : socketState === 'error' ? 'danger' : 'neutral'}>{socketState}</StatusPill>
      </div>

      <QueryNotice loading={pageLoading} error={pageError} onRetry={refresh} />

      {!pageLoading && !pageError ? <>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center justify-between text-slate-400"><span className="text-xs uppercase tracking-wider">Overall health</span><Gauge size={16} className="text-blue-400" /></div>
            <div className="mt-4 text-3xl font-bold text-slate-100">{health?.status ?? overview?.status ?? 'UNKNOWN'}</div>
            <div className="mt-3 text-xs text-slate-500">Database: {health?.components.database.status ?? 'UNKNOWN'}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center justify-between text-slate-400"><span className="text-xs uppercase tracking-wider">Active alerts</span><BellRing size={16} className="text-amber-400" /></div>
            <div className="mt-4 text-3xl font-bold text-slate-100">{overview?.active_alerts ?? 0}</div>
            <div className="mt-3 text-xs text-slate-500">From stored alert records</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center justify-between text-slate-400"><span className="text-xs uppercase tracking-wider">Devices online</span><ArrowUpRight size={16} className="text-emerald-400" /></div>
            <div className="mt-4 text-3xl font-bold text-slate-100">{overview?.online_devices ?? 0}/{overview?.total_devices ?? 0}</div>
            <div className="mt-3 text-xs text-slate-500">From registered inventory</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center justify-between text-slate-400"><span className="text-xs uppercase tracking-wider">Risk posture</span><ShieldAlert size={16} className="text-red-400" /></div>
            <div className="mt-4 text-3xl font-bold text-slate-100">{overview?.risk_level ?? 'UNKNOWN'}</div>
            <div className="mt-3 text-xs text-slate-500">Score {overview?.risk_score ?? '--'} / 100</div>
          </div>
        </div>

        <SectionCard title="Telemetry stream status" subtitle="Backend reported health indicators">
          {streams.length ? <div className="space-y-4">
            {streams.map(([name, stream]) => (
              <div key={name} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-200">{name}</span>
                  <StatusPill tone={stream.tone === 'success' || stream.tone === 'warning' || stream.tone === 'danger' || stream.tone === 'info' ? stream.tone : 'neutral'}>{stream.state}</StatusPill>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400" style={{ width: stream.value }} />
                  </div>
                  <span className="w-16 text-right text-xs font-medium text-slate-300">{stream.value}</span>
                </div>
              </div>
            ))}
          </div> : <p className="text-sm text-slate-500">No telemetry stream health has been reported.</p>}
        </SectionCard>
      </> : null}
    </div>
  );
}
