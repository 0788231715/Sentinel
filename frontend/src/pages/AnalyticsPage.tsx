import { QueryNotice } from '../components/dashboard/QueryNotice';
import { SectionCard } from '../components/dashboard/SectionCard';
import { operationsService } from '../services/api/operations.service';
import { useApiResource } from '../hooks/useApiResource';

export default function AnalyticsPage() {
  const { data, loading, error, reload } = useApiResource(operationsService.getAnalytics);
  return (
    <div className="space-y-6">
      <header><h1 className="text-2xl font-bold">Data analytics</h1><p className="text-slate-400">Aggregates from persisted records only; sensor units are not combined.</p></header>
      <QueryNotice loading={loading} error={error} onRetry={() => void reload()} />
      {!loading && !error && data && <>
        <div className="grid gap-4 sm:grid-cols-3">
          {Object.entries(data.sources).map(([label, value]) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-4"><div className="text-sm capitalize text-slate-400">{label.replace('_', ' ')}</div><div className="mt-2 text-3xl font-bold">{value}</div></div>)}
        </div>
        <SectionCard title="Stored telemetry range" subtitle={`Generated ${new Date(data.generated_at).toLocaleString()}`}>
          <div className="grid gap-4 sm:grid-cols-3">{Object.entries(data.telemetry).map(([key, value]) => <div key={key} className="rounded-lg bg-slate-950 p-4"><div className="text-xs uppercase text-slate-500">{key}</div><div className="mt-2 text-xl">{value ?? 'No valid samples'}</div></div>)}</div>
          <p className="mt-4 text-xs text-slate-500">{data.limitations.join(' ')}</p>
        </SectionCard>
        <div className="grid gap-6 md:grid-cols-2">{[['Events', data.events_by_severity], ['Alerts', data.alerts_by_severity]].map(([name, values]) => <SectionCard key={String(name)} title={`${name} by severity`}><div className="space-y-2">{Object.keys(values as Record<string, number>).length ? Object.entries(values as Record<string, number>).map(([severity, count]) => <div key={severity} className="flex justify-between border-b border-slate-800 py-2"><span>{severity}</span><span>{count}</span></div>) : <p className="text-sm text-slate-500">No records.</p>}</div></SectionCard>)}</div>
      </>}
    </div>
  );
}
