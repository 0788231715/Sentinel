import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  status?: 'success' | 'warning' | 'danger' | 'info';
}

export function MetricCard({ label, value, icon: Icon, trend, status = 'info' }: MetricCardProps) {
  const statusColors = {
    success: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    warning: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    danger: 'text-red-400 bg-red-400/10 border-red-400/20',
    info: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1">{value}</h3>
          
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend.isUp ? 'text-emerald-400' : 'text-red-400'}`}>
              <span>{trend.isUp ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-slate-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        
        <div className={`p-2.5 rounded-lg border ${statusColors[status]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
