import { QueryNotice } from '../components/dashboard/QueryNotice';
import { SectionCard } from '../components/dashboard/SectionCard';
import { systemService } from '../services/api/system.service';
import { useApiResource } from '../hooks/useApiResource';

export default function SystemHealthPage() {
  const { data, loading, error, reload } = useApiResource(systemService.getHealth);
  return (
    <div className="space-y-6">
      <header><h1 className="text-2xl font-bold">System health</h1><p className="text-slate-400">Health metrics currently exposed by the backend.</p></header>
      <QueryNotice loading={loading} error={error} onRetry={() => void reload()} />
      {!loading && !error && data && <><div className="grid gap-4 sm:grid-cols-3"><div className="rounded-lg border border-slate-800 bg-slate-900 p-4"><p className="text-sm text-slate-400">Overall</p><p className="mt-2 text-2xl">{data.status}</p></div><div className="rounded-lg border border-slate-800 bg-slate-900 p-4"><p className="text-sm text-slate-400">Uptime</p><p className="mt-2 text-2xl">{Math.floor(data.uptime_seconds / 3600)}h</p></div><div className="rounded-lg border border-slate-800 bg-slate-900 p-4"><p className="text-sm text-slate-400">Environment</p><p className="mt-2 text-2xl">{data.environment}</p></div></div><SectionCard title="Reported components"><div className="grid gap-3 sm:grid-cols-2">{Object.entries(data.components).map(([name, values]) => <div key={name} className="rounded bg-slate-950 p-3"><h2 className="font-semibold capitalize">{name.replace('_', ' ')}</h2><pre className="mt-2 whitespace-pre-wrap text-xs text-slate-400">{JSON.stringify(values, null, 2)}</pre></div>)}</div></SectionCard><p className="text-sm text-amber-300">Queue, processing latency, request rate, error rate, and WebSocket health are not yet instrumented by this backend.</p></>}
    </div>
  );
}
