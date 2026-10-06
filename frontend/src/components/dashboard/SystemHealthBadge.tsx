import React from 'react';
import { useTranslation } from 'react-i18next';
import { Server, Database, Cpu, HardDrive, Clock, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SystemHealthResponse } from '../../services/systemService';

interface SystemHealthBadgeProps {
  health: SystemHealthResponse | null;
  loading: boolean;
  error: string | null;
  lastChecked: Date | null;
  onRefresh: () => void;
}

export const SystemHealthBadge: React.FC<SystemHealthBadgeProps> = ({
  health,
  loading,
  error,
  lastChecked,
  onRefresh,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl max-w-4xl mx-auto my-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            {t('health.title')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t('health.environment')}: <span className="text-slate-200 font-mono">{health?.environment || 'development'}</span> | {t('app.title')} v1.0.0
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{t('common.refresh')}</span>
        </button>
      </div>

      {error ? (
        <div className="bg-rose-950/40 border border-rose-800/50 rounded-lg p-4 flex items-start space-x-3 text-rose-300">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">{t('app.status.offline')}</h4>
            <p className="text-xs text-rose-300/80 mt-1">{error}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* API Server Card */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>{t('health.api_status')}</span>
              <Server className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-slate-100">
                {health?.components.api.status || 'HEALTHY'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block font-mono">
              FastAPI v1.0.0
            </span>
          </div>

          {/* Database Card */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>{t('health.db_status')}</span>
              <Database className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-slate-100 uppercase">
                {health?.components.database.type || 'SQLite / PostgreSQL'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block uppercase font-mono">
              Status: {health?.components.database.status || 'HEALTHY'}
            </span>
          </div>

          {/* CPU Usage Card */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>{t('health.cpu_usage')}</span>
              <Cpu className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-lg font-bold text-slate-100 font-mono">
              {health?.components.system_resources.cpu_percent ?? '--'} %
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${health?.components.system_resources.cpu_percent ?? 0}%` }}
              />
            </div>
          </div>

          {/* Memory Usage Card */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>{t('health.memory_usage')}</span>
              <HardDrive className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-slate-100 font-mono">
              {health?.components.system_resources.memory_percent ?? '--'} %
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {health?.components.system_resources.memory_available_mb ?? '--'} MB Available
            </span>
          </div>
        </div>
      )}

      {lastChecked && (
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{t('health.last_checked')}: {lastChecked.toLocaleTimeString()}</span>
          </div>
          <div className="font-mono text-[11px]">
            {t('health.uptime')}: {health?.uptime_seconds ? `${Math.floor(health.uptime_seconds)}s` : '--'}
          </div>
        </div>
      )}
    </div>
  );
};
