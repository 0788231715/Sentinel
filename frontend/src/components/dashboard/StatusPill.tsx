interface StatusPillProps {
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: React.ReactNode;
}

const styles = {
  success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
  danger: 'bg-red-500/15 text-red-300 border border-red-500/20',
  info: 'bg-blue-500/15 text-blue-300 border border-blue-500/20',
  neutral: 'bg-slate-700/60 text-slate-200 border border-slate-600',
};

export function StatusPill({ tone = 'neutral', children }: StatusPillProps) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${styles[tone]}`}>{children}</span>;
}
