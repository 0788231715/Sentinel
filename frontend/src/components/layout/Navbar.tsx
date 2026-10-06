import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Globe, Activity } from 'lucide-react';

interface NavbarProps {
  status: 'NORMAL' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE';
}

export const Navbar: React.FC<NavbarProps> = ({ status }) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  const statusColors = {
    NORMAL: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    DEGRADED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    CRITICAL: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    OFFLINE: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30">
          <Shield className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wider text-slate-100 uppercase">{t('app.title')}</h1>
          <p className="text-xs text-slate-400">{t('app.subtitle')}</p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider ${statusColors[status]}`}>
          <Activity className="w-4 h-4 animate-pulse" />
          <span>{status === 'NORMAL' ? t('app.status.healthy') : status === 'OFFLINE' ? t('app.status.offline') : status}</span>
        </div>

        <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
          <Globe className="w-4 h-4 text-slate-400" />
          <select
            value={i18n.language.substring(0, 2)}
            onChange={changeLanguage}
            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
          >
            <option value="en" className="bg-slate-900 text-slate-200">English (EN)</option>
            <option value="rw" className="bg-slate-900 text-slate-200">Kinyarwanda (RW)</option>
            <option value="fr" className="bg-slate-900 text-slate-200">Français (FR)</option>
            <option value="es" className="bg-slate-900 text-slate-200">Español (ES)</option>
            <option value="sw" className="bg-slate-900 text-slate-200">Kiswahili (SW)</option>
          </select>
        </div>
      </div>
    </header>
  );
};
