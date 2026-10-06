import { QueryNotice } from '../components/dashboard/QueryNotice';
import { operationsService } from '../services/api/operations.service';
import { useApiResource } from '../hooks/useApiResource';

export default function TimelinePage() {
  const { data, loading, error, reload } = useApiResource(operationsService.getTimeline);
  return (
    <div className="space-y-6">
      <header><h1 className="text-2xl font-bold">Timeline</h1><p className="text-slate-400">Chronological persisted event and alert history.</p></header>
      <QueryNotice loading={loading} error={error} onRetry={() => void reload()} />
      {!loading && !error && data && <ol className="space-y-3">{data.items.length ? data.items.map((item) => <li key={`${item.kind}-${item.id}`} className="rounded-lg border border-slate-800 bg-slate-900 p-4"><div className="flex flex-wrap justify-between gap-2"><strong>{item.title}</strong><time className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</time></div><p className="mt-2 text-sm text-slate-400">{item.summary}</p><div className="mt-3 text-xs text-slate-500">{item.kind} · {item.severity} · {item.status} · {item.source}</div></li>) : <li className="text-sm text-slate-500">No events or alerts recorded.</li>}</ol>}
    </div>
  );
}
