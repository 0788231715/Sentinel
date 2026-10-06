import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  Database, 
  AlertTriangle, 
  Cpu, 
  Settings,
  Shield,
  Map as MapIcon,
  TrendingUp,
  History,
  ChartNoAxesCombined,
  FileText,
  Network,
  RadioTower,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { icon: LayoutDashboard, label: 'navigation.dashboard', path: '/dashboard' },
  { icon: Activity, label: 'navigation.monitoring', path: '/monitoring' },
  { icon: Database, label: 'navigation.events', path: '/events' },
  { icon: AlertTriangle, label: 'navigation.alerts', path: '/alerts' },
  { icon: Cpu, label: 'navigation.devices', path: '/devices' },
  { icon: RadioTower, label: 'navigation.sensors', path: '/sensors' },
  { icon: MapIcon, label: 'navigation.tracking', path: '/tracking' },
  { icon: TrendingUp, label: 'navigation.ai', path: '/ai' },
  { icon: ChartNoAxesCombined, label: 'navigation.analytics', path: '/analytics' },
  { icon: History, label: 'navigation.timeline', path: '/timeline' },
  { icon: Shield, label: 'navigation.risk', path: '/risk' },
  { icon: Network, label: 'navigation.systemHealth', path: '/system' },
  { icon: Network, label: 'navigation.network', path: '/network' },
  { icon: History, label: 'navigation.audit', path: '/audit' },
  { icon: FileText, label: 'navigation.reports', path: '/reports' },
  { icon: Settings, label: 'navigation.settings', path: '/settings' },
];

export function Sidebar() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Shield className="text-blue-500" />
          <span>SentinelNet</span>
        </h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
              ${isActive 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
            `}
          >
            <item.icon size={18} />
            <span className="text-sm font-medium">{t(item.label)}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
            OP
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.email ?? 'Unknown user'}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.role ?? 'No role'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
