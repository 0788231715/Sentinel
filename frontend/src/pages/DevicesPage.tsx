import { useEffect } from 'react';
import { Activity, Cpu, Gauge, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionCard } from '../components/dashboard/SectionCard';
import { StatusPill } from '../components/dashboard/StatusPill';
import { QueryNotice } from '../components/dashboard/QueryNotice';
import { useDeviceStore } from '../store/deviceStore';

export default function DevicesPage() {
  const { devices, stats, loading, error, fetchDevices } = useDeviceStore();
  useEffect(() => {
    void fetchDevices();
  }, [fetchDevices]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Devices</h1>
        <p className="text-slate-400">Device inventory, health state, and operational footprint</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between text-slate-400"><span>Total</span><Cpu size={16} /></div>
          <div className="mt-4 text-3xl font-bold text-slate-100">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between text-slate-400"><span>Online</span><Wifi size={16} /></div>
          <div className="mt-4 text-3xl font-bold text-slate-100">{stats.online}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between text-slate-400"><span>Maintenance</span><Activity size={16} /></div>
          <div className="mt-4 text-3xl font-bold text-slate-100">{stats.maintenance}</div>
        </div>
      </div>

      <SectionCard title="Fleet overview" subtitle="Operational status by device">
        <QueryNotice loading={loading} error={error} onRetry={() => void fetchDevices()} />
        {!loading && !error ? <div className="space-y-3">
          {devices.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No devices registered.</p> : null}
          {devices.map((device) => (
            <div key={device.name} className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Link to={`/devices/${encodeURIComponent(device.id)}`} className="font-medium text-blue-300 hover:text-blue-200">{device.name}</Link>
                    <StatusPill tone={device.status === 'ONLINE' ? 'success' : device.status === 'MAINTENANCE' ? 'warning' : 'neutral'}>{device.status}</StatusPill>
                    <StatusPill tone={device.data_origin === 'SIMULATED' ? 'info' : device.data_origin === 'PHYSICAL' ? 'success' : 'warning'}>{device.data_origin}</StatusPill>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{device.id} • {device.type} • {device.location}</div>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">Health</div>
                    <div className="flex items-center gap-2">
                      <Gauge size={14} className="text-blue-400" />
                      <span className="text-sm text-slate-200">{device.health}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">Uptime</div>
                    <span className="text-sm text-slate-200">{device.uptime}</span>
                  </div>
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">Sensors</div>
                    <Link to={`/devices/${encodeURIComponent(device.id)}`} className="text-sm text-blue-300 hover:text-blue-200">{device.sensor_count ?? 0}</Link>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 border-t border-slate-800 pt-3 text-[11px] text-slate-500 sm:grid-cols-2 xl:grid-cols-4">
                <span>Connectivity: <span className="text-slate-300">{device.connectivity}</span></span>
                <span>Battery: <span className="text-slate-300">{device.battery_percent == null ? 'Not reported' : `${device.battery_percent}%`}</span></span>
                <span>Firmware: <span className="text-slate-300">{device.firmware ?? 'Not reported'}</span></span>
                <span>Network: <span className="text-slate-300">{device.network ?? 'Not reported'}</span></span>
                <span className="sm:col-span-2 xl:col-span-4">Last communication: <span className="text-slate-300">{device.last_communication ? new Date(device.last_communication).toLocaleString() : 'Never reported'}</span></span>
              </div>
            </div>
          ))}
        </div> : null}
      </SectionCard>
    </div>
  );
}
