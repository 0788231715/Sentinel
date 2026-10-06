import { QueryNotice } from '../components/dashboard/QueryNotice';
import { SectionCard } from '../components/dashboard/SectionCard';
import { operationsService } from '../services/api/operations.service';
import { useApiResource } from '../hooks/useApiResource';

export default function NetworkPage() {
  const { data, loading, error, reload } = useApiResource(operationsService.getNetwork);
  return (
    <div className="space-y-6">
      <header><h1 className="text-2xl font-bold">Network</h1><p className="text-slate-400">Device communication status reported by the monitoring backend.</p></header>
      <QueryNotice loading={loading} error={error} onRetry={() => void reload()} />
      {!loading && !error && data && <>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">Inventory: {data.total_devices} devices</div>
        <SectionCard title="Connectivity summary"><div className="flex flex-wrap gap-3">{Object.entries(data.connectivity).map(([state, count]) => <span key={state} className="rounded bg-slate-800 px-3 py-2">{state}: {count}</span>)}</div></SectionCard>
        <SectionCard title="Device links"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="text-slate-500"><th className="p-2">Device</th><th className="p-2">Network</th><th className="p-2">Connectivity</th><th className="p-2">Last communication</th></tr></thead><tbody>{data.devices.map((device) => <tr key={device.id} className="border-t border-slate-800"><td className="p-2">{device.name}</td><td className="p-2">{device.network ?? 'Not reported'}</td><td className="p-2">{device.connectivity}</td><td className="p-2">{device.last_communication ? new Date(device.last_communication).toLocaleString() : 'Never reported'}</td></tr>)}</tbody></table></div><p className="mt-4 text-xs text-amber-300">{data.limitations.join(' ')}</p></SectionCard>
      </>}
    </div>
  );
}
