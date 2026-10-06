import { ShieldAlert } from 'lucide-react';
import { QueryNotice } from '../components/dashboard/QueryNotice';
import { SectionCard } from '../components/dashboard/SectionCard';
import { operationsService } from '../services/api/operations.service';
import { useApiResource } from '../hooks/useApiResource';

export default function RiskPage() {
  const { data, loading, error, reload } = useApiResource(operationsService.getRisk);
  return (
    <div className="space-y-6">
      <header><h1 className="text-2xl font-bold">Risk assessment</h1><p className="text-slate-400">Decision support from explicitly configured, validated risk models.</p></header>
      <QueryNotice loading={loading} error={error} onRetry={() => void reload()} />
      {!loading && !error && data && <SectionCard title="Risk engine status" subtitle={`Space: ${data.space}`}>
        <div role="status" className="flex gap-4 rounded-lg border border-amber-700/50 bg-amber-950/20 p-5">
          <ShieldAlert className="shrink-0 text-amber-300" />
          <div><p className="font-semibold">{data.status}</p><p className="mt-2 text-sm text-slate-300">{data.message}</p></div>
        </div>
        {data.score != null && <p className="mt-4 text-3xl font-bold">Score {data.score}</p>}
      </SectionCard>}
    </div>
  );
}
