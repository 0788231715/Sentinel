import { QueryNotice } from '../components/dashboard/QueryNotice';
import { operationsService } from '../services/api/operations.service';
import { useApiResource } from '../hooks/useApiResource';

export default function AuditPage() {
  const { data, loading, error, reload } = useApiResource(operationsService.getAudit);
  return (
    <div className="space-y-6">
      <header><h1 className="text-2xl font-bold">Audit logs</h1><p className="text-slate-400">Successful authenticated write requests; logs are read-only through this interface.</p></header>
      <QueryNotice loading={loading} error={error} onRetry={() => void reload()} />
      {!loading && !error && data && <div className="overflow-x-auto rounded-lg border border-slate-800"><table className="w-full text-left text-sm"><thead className="bg-slate-900 text-slate-400"><tr>{['Time', 'User', 'Action', 'Resource', 'Source IP'].map((label) => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>{data.items.map((item) => <tr key={item.id} className="border-t border-slate-800"><td className="p-3">{new Date(item.timestamp).toLocaleString()}</td><td className="p-3">{item.actor_email}</td><td className="p-3">{item.action}</td><td className="p-3 font-mono text-xs">{item.resource}</td><td className="p-3">{item.source_ip ?? 'Unavailable'}</td></tr>)}</tbody></table>{data.items.length === 0 && <p className="p-6 text-sm text-slate-500">No audit entries yet.</p>}</div>}
    </div>
  );
}
