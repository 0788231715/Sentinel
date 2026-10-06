import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPinned } from 'lucide-react';
import { QueryNotice } from '../components/dashboard/QueryNotice';
import { SectionCard } from '../components/dashboard/SectionCard';
import { operationsService } from '../services/api/operations.service';
import { useApiResource } from '../hooks/useApiResource';

export default function TrackingPage() {
  const { data, loading, error, reload } = useApiResource(operationsService.getTracking);
  const center: [number, number] = data?.assets.length
    ? [data.assets[0].latitude, data.assets[0].longitude]
    : [0, 0];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Tracking</h1>
        <p className="text-slate-400">Asset and sensor movement tracking and location visibility</p>
      </div>

      <QueryNotice loading={loading} error={error} onRetry={() => void reload()} />
      {!loading && !error && data && <>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><div className="text-sm text-slate-400">Devices with coordinates</div><div className="mt-3 text-3xl font-bold">{data.assets.length}</div></div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><div className="text-sm text-slate-400">Devices without coordinates</div><div className="mt-3 text-3xl font-bold">{data.unlocated_devices}</div></div>
        </div>
        <SectionCard title="Device map" subtitle="Map markers require coordinates reported by device inventory">
          {data.assets.length ? <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-96 rounded-lg">
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {data.assets.map((asset) => <CircleMarker key={asset.id} center={[asset.latitude, asset.longitude]} radius={8}><Popup>{asset.name} · {asset.status}<br />{asset.location}</Popup></CircleMarker>)}
          </MapContainer> : <div role="status" className="flex h-64 flex-col items-center justify-center gap-2 rounded border border-dashed border-slate-700 text-center text-slate-400"><MapPinned /><p>No coordinates have been ingested. Map is empty until device locations are configured.</p></div>}
        </SectionCard>
        <SectionCard title="Location history" subtitle="Reported current position">
          <p className="text-sm text-slate-400">{data.message}</p>
          {data.assets.map((asset) => <div key={asset.id} className="mt-3 rounded border border-slate-800 p-3"><div className="font-medium">{asset.name}</div><div className="mt-1 text-xs text-slate-500">{asset.location} · {asset.latitude}, {asset.longitude} · {asset.data_origin}</div></div>)}
        </SectionCard>
      </>}
    </div>
  );
}
