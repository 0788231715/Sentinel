import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Activity, Gauge, Thermometer } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { QueryNotice } from '../components/dashboard/QueryNotice';
import { SectionCard } from '../components/dashboard/SectionCard';
import { StatusPill } from '../components/dashboard/StatusPill';
import type { TelemetryRange } from '../services/api/sensor.service';
import { useSensorStore } from '../store/sensorStore';

const ranges: TelemetryRange[] = ['1h', '6h', '24h', '7d', '30d'];

function localDateTime(date: Date): string {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function freshnessTone(value: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (value === 'FRESH') return 'success';
  if (value === 'DELAYED') return 'warning';
  if (value === 'STALE' || value === 'INVALID') return 'danger';
  return 'neutral';
}

export default function SensorDetailPage() {
  const { sensorId = '' } = useParams();
  const {
    sensor,
    telemetry,
    detailLoading,
    detailError,
    telemetryLoading,
    telemetryError,
    fetchSensor,
    fetchTelemetry,
  } = useSensorStore();
  const [selectedRange, setSelectedRange] = useState<TelemetryRange>('24h');
  const [customStart, setCustomStart] = useState(() => localDateTime(new Date(Date.now() - 24 * 60 * 60 * 1000)));
  const [customEnd, setCustomEnd] = useState(() => localDateTime(new Date()));
  const [customError, setCustomError] = useState<string | null>(null);

  const loadTelemetry = useCallback(() => {
    void fetchTelemetry(sensorId, selectedRange);
  }, [fetchTelemetry, sensorId, selectedRange]);

  useEffect(() => {
    if (sensorId) {
      void fetchSensor(sensorId);
      loadTelemetry();
    }
  }, [fetchSensor, loadTelemetry, sensorId]);

  function loadCustomRange() {
    setCustomError(null);
    const startDate = new Date(customStart);
    const endDate = new Date(customEnd);
    if (!customStart || !customEnd || startDate >= endDate) {
      setCustomError('Choose a valid start and end time.');
      return;
    }
    void fetchTelemetry(sensorId, selectedRange, {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    });
  }

  const points = telemetry?.points.map((point) => ({
    ...point,
    time: new Date(point.timestamp).toLocaleString(),
  })) ?? [];

  return (
    <div className="space-y-6">
      <Link to="/sensors" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100">
        <ArrowLeft size={15} /> Sensor inventory
      </Link>

      <QueryNotice loading={detailLoading} error={detailError} onRetry={() => void fetchSensor(sensorId)} />
      {!detailLoading && !detailError && sensor ? <>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{sensor.sensor_type}</h1>
            <p className="mt-1 font-mono text-xs text-slate-500">{sensor.id} · {sensor.device_name ?? sensor.device_id}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone={freshnessTone(sensor.data_quality)}>{sensor.data_quality}</StatusPill>
            <StatusPill tone={sensor.data_origin === 'SIMULATED' ? 'info' : sensor.data_origin === 'PHYSICAL' ? 'success' : 'warning'}>{sensor.data_origin}</StatusPill>
            <Link to={`/devices/${encodeURIComponent(sensor.device_id)}`} className="rounded-full border border-slate-700 px-3 py-1 text-[10px] font-semibold text-blue-300 hover:border-slate-500">View device</Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500"><Thermometer size={14} /> Current value</div>
            <div className="mt-3 text-2xl font-bold text-slate-100">{sensor.current_value ?? 'No sample'}{sensor.current_value == null ? '' : ` ${sensor.unit}`}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500"><Gauge size={14} /> Sensor health</div>
            <div className="mt-3 text-2xl font-bold text-slate-100">{sensor.health}%</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500"><Activity size={14} /> Threshold</div>
            <div className="mt-3 text-2xl font-bold text-slate-100">{sensor.threshold ?? 'Not set'}{sensor.threshold == null ? '' : ` ${sensor.unit}`}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">Calibration</div>
            <div className="mt-3 text-2xl font-bold text-slate-100">{sensor.calibration_status}</div>
          </div>
        </div>

        <SectionCard title="Telemetry history" subtitle={`Source: ${telemetry?.data_origin ?? sensor.data_origin}; charts show stored samples only`}>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {ranges.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setSelectedRange(range)}
                aria-pressed={selectedRange === range}
                className={`rounded-md border px-3 py-1.5 text-xs ${selectedRange === range ? 'border-blue-500 bg-blue-500/10 text-blue-200' : 'border-slate-700 text-slate-400 hover:text-slate-100'}`}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="mb-5 flex flex-wrap items-end gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
            <label className="text-xs text-slate-400">Custom start<input type="datetime-local" value={customStart} onChange={(event) => setCustomStart(event.target.value)} className="mt-1 block rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-200" /></label>
            <label className="text-xs text-slate-400">Custom end<input type="datetime-local" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} className="mt-1 block rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-200" /></label>
            <button type="button" onClick={loadCustomRange} className="rounded-md bg-slate-700 px-3 py-2 text-xs text-white hover:bg-slate-600">Load custom range</button>
            {customError ? <span role="alert" className="text-xs text-red-300">{customError}</span> : null}
          </div>

          <QueryNotice loading={telemetryLoading} error={telemetryError} onRetry={loadTelemetry} />
          {!telemetryLoading && !telemetryError ? <>
            <div className="mb-3 flex flex-wrap gap-5 text-xs text-slate-400">
              <span>Samples: {telemetry?.stats.count ?? 0}</span>
              <span>Min: {telemetry?.stats.minimum ?? '—'} {sensor.unit}</span>
              <span>Max: {telemetry?.stats.maximum ?? '—'} {sensor.unit}</span>
              <span>Average: {telemetry?.stats.average?.toFixed(2) ?? '—'} {sensor.unit}</span>
            </div>
            {points.length ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={points}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" minTickGap={40} stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} domain={['auto', 'auto']} unit={` ${sensor.unit}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                    {sensor.threshold != null ? <ReferenceLine y={sensor.threshold} stroke="#f59e0b" strokeDasharray="4 4" label="Threshold" /> : null}
                    <Line type="monotone" dataKey="value" stroke="#38bdf8" dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="py-8 text-center text-sm text-slate-500">No telemetry in this time range.</p>}
          </> : null}
        </SectionCard>
      </> : null}
    </div>
  );
}
