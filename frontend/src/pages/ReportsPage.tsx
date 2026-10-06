import { useState } from 'react';
import { operationsService } from '../services/api/operations.service';

const reportTypes = ['devices', 'sensors', 'events', 'alerts'] as const;

export default function ReportsPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const exportReport = async (type: (typeof reportTypes)[number]) => {
    setLoading(type);
    setError(null);
    try {
      const blob = await operationsService.downloadReport(type);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `sentinel-${type}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Report export failed');
    } finally {
      setLoading(null);
    }
  };
  return (
    <div className="space-y-6">
      <header><h1 className="text-2xl font-bold">Reports</h1><p className="text-slate-400">Export actual persisted records for the selected data space.</p></header>
      {error && <div role="alert" className="rounded-lg border border-red-800 bg-red-950/30 p-4 text-red-200">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2">{reportTypes.map((type) => <section key={type} className="rounded-xl border border-slate-800 bg-slate-900 p-5"><h2 className="text-lg font-semibold capitalize">{type} report</h2><p className="mt-2 text-sm text-slate-400">Download current stored {type} as CSV. Values are not synthesized.</p><button disabled={loading !== null} onClick={() => void exportReport(type)} className="mt-4 rounded bg-blue-700 px-4 py-2 text-sm disabled:opacity-50">{loading === type ? 'Preparing…' : 'Export CSV'}</button></section>)}</div>
    </div>
  );
}
