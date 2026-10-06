import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Battery, Network, RadioTower } from 'lucide-react';
import { QueryNotice } from '../components/dashboard/QueryNotice';
import { SectionCard } from '../components/dashboard/SectionCard';
import { StatusPill } from '../components/dashboard/StatusPill';
import { useDeviceStore } from '../store/deviceStore';
import { useAuthStore } from '../store/authStore';
import { operationsService } from '../services/api/operations.service';
import { useDataSpaceStore } from '../store/dataSpaceStore';

export default function DeviceDetailPage() {
  const { deviceId = '' } = useParams();
  const { selectedDevice, detailLoading, detailError, fetchDeviceDetail } = useDeviceStore();
  const user = useAuthStore((state) => state.user);
  const space = useDataSpaceStore((state) => state.space);
  const [credential, setCredential] = useState<string | null>(null);
  const [credentialError, setCredentialError] = useState<string | null>(null);
  const [credentialLoading, setCredentialLoading] = useState(false);
  const canProvision = space === 'real' && user?.role === 'admin';

  const rotateCredential = async () => {
    if (!selectedDevice || !canProvision) return;
    if (selectedDevice.ingestion_credential_configured
      && !window.confirm('Rotating this credential immediately invalidates the current device key. Continue?')) return;
    setCredentialLoading(true);
    setCredentialError(null);
    setCredential(null);
    try {
      const result = await operationsService.rotateDeviceCredential(selectedDevice.id);
      setCredential(result.credential);
      await fetchDeviceDetail(selectedDevice.id);
    } catch (cause) {
      setCredentialError(cause instanceof Error ? cause.message : 'Could not provision a device credential');
    } finally {
      setCredentialLoading(false);
    }
  };

  useEffect(() => {
    if (deviceId) void fetchDeviceDetail(deviceId);
  }, [deviceId, fetchDeviceDetail]);

  return (
    <div className="space-y-6">
      <Link to="/devices" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100">
        <ArrowLeft size={15} /> Device inventory
      </Link>
      <QueryNotice loading={detailLoading} error={detailError} onRetry={() => void fetchDeviceDetail(deviceId)} />

      {!detailLoading && !detailError && selectedDevice ? <>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{selectedDevice.name}</h1>
            <p className="mt-1 font-mono text-xs text-slate-500">{selectedDevice.id} · {selectedDevice.type} · {selectedDevice.location}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone={selectedDevice.status === 'ONLINE' ? 'success' : selectedDevice.status === 'MAINTENANCE' ? 'warning' : 'neutral'}>{selectedDevice.status}</StatusPill>
            <StatusPill tone={selectedDevice.connectivity === 'CONNECTED' ? 'success' : 'warning'}>{selectedDevice.connectivity}</StatusPill>
            <StatusPill tone={selectedDevice.data_origin === 'SIMULATED' ? 'info' : selectedDevice.data_origin === 'PHYSICAL' ? 'success' : 'warning'}>{selectedDevice.data_origin}</StatusPill>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">Health</div>
            <div className="mt-3 text-2xl font-bold text-slate-100">{selectedDevice.health}%</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500"><Battery size={14} /> Battery / power</div>
            <div className="mt-3 text-2xl font-bold text-slate-100">{selectedDevice.battery_percent == null ? 'Not reported' : `${selectedDevice.battery_percent}%`}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500"><Network size={14} /> Network</div>
            <div className="mt-3 text-lg font-bold text-slate-100">{selectedDevice.network ?? 'Not reported'}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500"><RadioTower size={14} /> Last communication</div>
            <div className="mt-3 text-sm font-medium text-slate-100">{selectedDevice.last_communication ? new Date(selectedDevice.last_communication).toLocaleString() : 'Never reported'}</div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard title="Sensors" subtitle={`${selectedDevice.sensors.length} sensors registered on this device`}>
            <div className="space-y-3">
              {selectedDevice.sensors.length === 0 ? <p className="text-sm text-slate-500">No sensors linked to this device.</p> : null}
              {selectedDevice.sensors.map((sensor) => (
                <Link key={sensor.id} to={`/sensors/${encodeURIComponent(sensor.id)}`} className="block rounded-lg border border-slate-800 bg-slate-950/50 p-3 hover:border-slate-600">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-200">{sensor.sensor_type}</span>
                    <StatusPill tone={sensor.data_quality === 'FRESH' ? 'success' : sensor.data_quality === 'DELAYED' ? 'warning' : 'danger'}>{sensor.data_quality}</StatusPill>
                  </div>
                  <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-400">
                    <span>{sensor.current_value ?? 'No value'} {sensor.current_value == null ? '' : sensor.unit}</span>
                    <span>Health {sensor.health}%</span>
                    <span>{sensor.data_origin}</span>
                  </div>
                </Link>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Events" subtitle="Events recorded at this device location">
            <div className="space-y-3">
              {selectedDevice.recent_events.length === 0 ? <p className="text-sm text-slate-500">No location-linked events recorded.</p> : null}
              {selectedDevice.recent_events.map((event) => (
                <article key={event.id} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-200">{event.title}</span>
                    <StatusPill tone={event.severity === 'CRITICAL' ? 'danger' : event.severity === 'HIGH' ? 'warning' : 'info'}>{event.severity}</StatusPill>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{event.summary}</p>
                  <p className="mt-2 text-[11px] text-slate-500">{event.source} · {new Date(event.timestamp).toLocaleString()}</p>
                </article>
              ))}
            </div>
          </SectionCard>
        </div>

        {space === 'real' && <SectionCard title="Hardware onboarding" subtitle="Device credentials are created by an administrator and shown only once">
          <div className="space-y-3 text-sm text-slate-300">
            <p>Ingestion credential: {selectedDevice.ingestion_credential_configured ? 'configured' : 'not configured'}.</p>
            {selectedDevice.ingestion_credential_configured && <p className="text-xs text-slate-500">Last rotated: {selectedDevice.ingestion_credential_created_at ? new Date(selectedDevice.ingestion_credential_created_at).toLocaleString() : 'Unknown'}</p>}
            {canProvision && <button type="button" disabled={credentialLoading} onClick={() => void rotateCredential()} className="rounded bg-blue-700 px-4 py-2 text-sm disabled:opacity-50">
              {credentialLoading ? 'Provisioning…' : selectedDevice.ingestion_credential_configured ? 'Rotate device credential' : 'Generate device credential'}
            </button>}
            {credentialError && <p role="alert" className="text-sm text-red-300">{credentialError}</p>}
            {credential && <div className="rounded border border-amber-700/50 bg-amber-950/20 p-4">
              <p className="font-semibold text-amber-200">Copy this key now. It cannot be retrieved later.</p>
              <code className="mt-2 block break-all select-all">{credential}</code>
            </div>}
            {!canProvision && <p className="text-xs text-slate-500">Only administrators can provision or rotate device credentials.</p>}
          </div>
        </SectionCard>}

        <SectionCard title="Configuration and network" subtitle="Reported metadata; no device configuration is sent from this page">
          <dl className="grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <div><dt className="text-xs text-slate-500">Firmware</dt><dd className="mt-1 text-slate-200">{selectedDevice.firmware ?? 'Not reported'}</dd></div>
            <div><dt className="text-xs text-slate-500">Connectivity state</dt><dd className="mt-1 text-slate-200">{selectedDevice.connectivity}</dd></div>
            <div><dt className="text-xs text-slate-500">Uptime</dt><dd className="mt-1 text-slate-200">{selectedDevice.uptime}</dd></div>
            <div><dt className="text-xs text-slate-500">Data source</dt><dd className="mt-1 text-slate-200">{selectedDevice.data_origin}</dd></div>
          </dl>
        </SectionCard>
      </> : null}
    </div>
  );
}
