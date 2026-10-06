import { AlertTriangle, LoaderCircle, RefreshCw } from 'lucide-react';

interface QueryNoticeProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function QueryNotice({ loading, error, onRetry }: QueryNoticeProps) {
  if (loading) {
    return (
      <div role="status" className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
        <LoaderCircle size={16} className="animate-spin text-blue-400" />
        Loading data…
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="flex items-center justify-between gap-4 rounded-lg border border-red-500/30 bg-red-950/30 p-4">
        <div className="flex items-center gap-2 text-sm text-red-200">
          <AlertTriangle size={16} className="shrink-0" />
          {error}
        </div>
        <button onClick={onRetry} className="inline-flex shrink-0 items-center gap-2 rounded-md border border-red-400/30 px-3 py-1.5 text-xs text-red-100 hover:bg-red-500/10">
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    );
  }

  return null;
}
