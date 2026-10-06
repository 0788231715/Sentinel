import apiClient from './client';

export interface DeviceRecord {
  id: string;
  name: string;
  type: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'UNKNOWN';
  health: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  uptime: string;
  connectivity: string;
  battery_percent: number | null;
  firmware: string | null;
  network: string | null;
  last_communication: string | null;
  data_origin: 'SIMULATED' | 'PHYSICAL' | 'UNVERIFIED';
  space: 'simulation' | 'real';
  ingestion_credential_configured: boolean;
  ingestion_credential_created_at: string | null;
  sensor_count?: number;
}

export interface DeviceDetail extends DeviceRecord {
  sensors: import('./sensor.service').SensorRecord[];
  recent_events: import('./event.service').EventRecord[];
}

export interface DeviceListResponse {
  devices: DeviceRecord[];
  stats: {
    total: number;
    online: number;
    offline: number;
    maintenance: number;
  };
}

export const deviceService = {
  getDevices: async (): Promise<DeviceListResponse> => {
    const response = await apiClient.get<DeviceListResponse>('/monitoring/devices');
    return response.data;
  },
  getDevice: async (deviceId: string): Promise<DeviceDetail> => {
    const response = await apiClient.get<DeviceDetail>(`/monitoring/devices/${encodeURIComponent(deviceId)}`);
    return response.data;
  },
};
