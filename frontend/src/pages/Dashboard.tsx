import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Cpu, 
  AlertTriangle, 
  ShieldCheck, 
  Activity,
  Zap,
  Clock,
  ExternalLink
} from 'lucide-react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { useDeviceStore } from '../store/deviceStore';
import { useAlertStore } from '../store/alertStore';
import { useSystemStore } from '../store/systemStore';
import { useMonitoringStore } from '../store/monitoringStore';
import { useDataSpaceStore } from '../store/dataSpaceStore';
import { QueryNotice } from '../components/dashboard/QueryNotice';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

const mockRiskData = [
  { time: '00:00', risk: 10 },
  { time: '04:00', risk: 15 },
  { time: '08:00', risk: 45 },
  { time: '12:00', risk: 30 },
  { time: '16:00', risk: 55 },
  { time: '20:00', risk: 40 },
  { time: '23:59', risk: 25 },
];

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const { t } = useTranslation();
  const { stats: deviceStats, fetchDevices, loading: devicesLoading, error: devicesError } = useDeviceStore();
  const { stats: alertStats, alerts, fetchAlerts, loading: alertsLoading, error: alertsError } = useAlertStore();
  const { health, loading: healthLoading, error: healthError, fetchHealth } = useSystemStore();
  const { overview, error: overviewError, fetchOverview } = useMonitoringStore();
  const space = useDataSpaceStore((store) => store.space);

  useEffect(() => {
    void fetchDevices();
    void fetchAlerts();
    void fetchOverview();
    void fetchHealth();
  }, [fetchDevices, fetchAlerts, fetchHealth, fetchOverview]);

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{t('dashboard.title')}</h1>
          <p className="text-sm text-slate-400">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-2">
            <Clock size={14} className="text-slate-500" />
            <span className="text-xs font-mono text-slate-300">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
          <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2">
            <span>Live Feed</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      <QueryNotice loading={devicesLoading} error={devicesError} onRetry={() => void fetchDevices()} />
      <QueryNotice loading={alertsLoading} error={alertsError} onRetry={() => void fetchAlerts()} />
      <QueryNotice loading={healthLoading} error={healthError} onRetry={() => void fetchHealth()} />
      <QueryNotice loading={false} error={overviewError} onRetry={() => void fetchOverview()} />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label={t('dashboard.activeDevices')} 
          value={`${deviceStats.online}/${deviceStats.total}`} 
          icon={Cpu}
          trend={{ value: 4, isUp: true }}
          status="info"
        />
        <MetricCard 
          label={t('dashboard.activeAlerts')} 
          value={alertStats.active} 
          icon={AlertTriangle}
          status={alertStats.critical > 0 ? 'danger' : 'warning'}
        />
        <MetricCard 
          label="Risk Level" 
          value={overview?.risk_level ?? 'Unavailable'}
          icon={ShieldCheck}
          status="success"
        />
        <MetricCard 
          label="API Status" 
          value={health?.components.api.status ?? 'Unavailable'} 
          icon={Zap}
          trend={{ value: 12, isUp: true }}
          status="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Activity size={16} className="text-blue-500" />
              Operational Risk Trend (24h)
            </h3>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded uppercase tracking-wider">
                {space === 'simulation' ? 'Sample data' : 'Awaiting hardware data'}
              </span>
            </div>
          </div>
          {space === 'simulation' ? <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRiskData}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="risk" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorRisk)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div> : (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-800 text-sm text-slate-500">
              No verified risk trend is available until real hardware data is connected.
            </div>
          )}
        </div>

        {/* Recent Alerts Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Recent Alerts</h3>
            <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded">Live</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {alerts.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8 italic">No active alerts</p>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="group border-l-2 border-red-500 bg-slate-950/50 p-3 rounded-r-lg hover:bg-slate-950 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium line-clamp-2">{alert.message}</p>
                  <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1 uppercase tracking-widest">
                    Source: <span className="text-slate-400">{alert.source}</span>
                  </p>
                </div>
              ))
            )}
          </div>
          <button className="p-3 text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest border-t border-slate-800 transition-colors">
            View All Alerts
          </button>
        </div>
      </div>
    </div>
  );
}
