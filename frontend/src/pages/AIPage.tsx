import { BrainCircuit } from 'lucide-react';
import { QueryNotice } from '../components/dashboard/QueryNotice';
import { SectionCard } from '../components/dashboard/SectionCard';
import { operationsService } from '../services/api/operations.service';
import { useApiResource } from '../hooks/useApiResource';

export default function AIPage() {
  const { data, loading, error, reload } = useApiResource(operationsService.getAI);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">AI Intelligence</h1>
        <p className="text-slate-400">Anomaly detection, decision support, and model-driven analysis</p>
      </div>

      <QueryNotice loading={loading} error={error} onRetry={() => void reload()} />
      {!loading && !error && data && <SectionCard title="Inference service" subtitle={`Space: ${data.space}`}>
        <div role="status" className="flex gap-4 rounded-lg border border-purple-800/50 bg-purple-950/20 p-5">
          <BrainCircuit className="shrink-0 text-purple-300" />
          <div><p className="font-semibold">{data.status}</p><p className="mt-2 text-sm text-slate-300">{data.message}</p></div>
        </div>
        <p className="mt-4 text-xs text-slate-500">No detections are displayed until a real inference service supplies model, version, confidence, and explanation metadata.</p>
      </SectionCard>}
    </div>
  );
}
