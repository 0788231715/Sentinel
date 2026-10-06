import { useEffect } from 'react';
import { Activity, Gauge, RadioTower } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QueryNotice } from '../components/dashboard/QueryNotice';
import { SectionCard } from '../components/dashboard/SectionCard';
import { StatusPill } from '../components/dashboard/StatusPill';
import { useSensorStore } from '../store/sensorStore';

function qualityTone(quality: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (quality === 'FRESH') return 'success';
  if (quality === 'DELAYED') return 'warning';
  if (quality === 'STALE' || quality === 'INVALID') return 'danger';
  return 'neutral';
}

export default function SensorsPage() {
  const { sensors, listLoading, listError, fetchSensors } = useSensorStore();

  useEffect(() => {
    void fetchSensors();
  }, [fetchSensors]);

  const freshCount = sensors.filter((sensor) => sensor.data_quality === 'FRESH').length;
  const attentionCount = sensors.filter((sensor) =>
    ['STALE', 'MISSING', 'INVALID'].includes(sensor.data_quality),
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Sensors</h1>
        <p className="text-slate-400">Sensor inventory, readings, calibration, and data freshness</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between text-slate-400"><span>Registered</span><RadioTower size={16} /></div>
          <div className="mt-4 text-3xl font-bold text-slate-100">{sensors.length}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between text-slate-400"><span>Fresh data</span><Activity size={16} /></div>
          <div className="mt-4 text-3xl font-bold text-slate-100">{freshCount}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between text-slate-400"><span>Needs attention</span><Gauge size={16} /></div>
          <div className="mt-4 text-3xl font-bold text-slate-100">{attentionCount}</div>
        </div>
      </div>

      <SectionCard title="Sensor inventory" subtitle="Readings are labeled simulated, unverified, or physical after verified hardware ingestion">
        <QueryNotice loading={listLoading} error={listError} onRetry={() => void fetchSensors()} />
        {!listLoading && !listError ? (
          <div className="overflow-x-auto">
            {sensors.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No sensors registered.</p> : null}
            {sensors.length > 0 ? (
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="pb-3 pr-4 font-medium">Sensor</th>
                    <th className="pb-3 pr-4 font-medium">Device</th>
                    <th className="pb-3 pr-4 font-medium">Current</th>
                    <th className="pb-3 pr-4 font-medium">Threshold</th>
                    <th className="pb-3 pr-4 font-medium">Range / Avg</th>
                    <th className="pb-3 pr-4 font-medium">Last update</th>
                    <th className="pb-3 pr-4 font-medium">Health / Calibration</th>
                    <th className="pb-3 pr-4 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {sensors.map((sensor) => (
                    <tr key={sensor.id} className="border-t border-slate-800 align-top">
                      <td className="py-4 pr-4">
                        <Link to={`/sensors/${encodeURIComponent(sensor.id)}`} className="font-medium text-blue-300 hover:text-blue-200">{sensor.sensor_type}</Link>
                        <div className="mt-1 font-mono text-[10px] text-slate-500">{sensor.id}</div>
                      </td>
                      <td className="py-4 pr-4">
                        <Link to={`/devices/${encodeURIComponent(sensor.device_id)}`} className="text-slate-300 hover:text-white">{sensor.device_name ?? sensor.device_id}</Link>
                      </td>
                      <td className="py-4 pr-4 font-mono text-slate-200">{sensor.current_value ?? '—'} {sensor.unit}</td>
                      <td className="py-4 pr-4 text-slate-300">{sensor.threshold ?? '—'} {sensor.unit}</td>
                      <td className="py-4 pr-4 text-xs text-slate-400">
                        {sensor.minimum ?? '—'} / {sensor.maximum ?? '—'} / {sensor.average ?? '—'} {sensor.unit}
                      </td>
                      <td className="py-4 pr-4 text-xs text-slate-400">{sensor.last_update ? new Date(sensor.last_update).toLocaleString() : 'No samples'}</td>
                      <td className="py-4 pr-4 text-xs text-slate-400">{sensor.health}%<br />{sensor.calibration_status}</td>
                      <td className="py-4 pr-4">
                        <div className="flex flex-col items-start gap-2">
                          <StatusPill tone={qualityTone(sensor.data_quality)}>{sensor.data_quality}</StatusPill>
                          <StatusPill tone={sensor.data_origin === 'SIMULATED' ? 'info' : sensor.data_origin === 'PHYSICAL' ? 'success' : 'warning'}>{sensor.data_origin}</StatusPill>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}
