import apiClient from './client';

export interface AnalyticsSummary {
  space: 'simulation' | 'real';
  generated_at: string;
  sources: { devices: number; sensors: number; telemetry_points: number };
  telemetry: { minimum: number | null; maximum: number | null; average: number | null };
  events_by_severity: Record<string, number>;
  alerts_by_severity: Record<string, number>;
  limitations: string[];
}

export interface CapabilityStatus {
  space: 'simulation' | 'real';
  status: string;
  score?: number | null;
  contributors?: Array<{ name: string; value: number }>;
  detections?: unknown[];
  message: string;
}

export interface NetworkStatus {
  space: 'simulation' | 'real';
  total_devices: number;
  connectivity: Record<string, number>;
  devices: Array<{
    id: string;
    name: string;
    network: string | null;
    connectivity: string;
    last_communication: string | null;
    data_origin: string;
  }>;
  limitations: string[];
}

export interface TrackingData {
  space: 'simulation' | 'real';
  assets: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    location: string;
    status: string;
    timestamp: string | null;
    data_origin: string;
  }>;
  unlocated_devices: number;
  history_available: boolean;
  message: string;
}

export interface TimelineItem {
  id: string;
  kind: 'EVENT' | 'ALERT';
  title: string;
  summary: string;
  severity: string;
  status: string;
  source: string;
  timestamp: string;
}

export interface AuditItem {
  id: string;
  actor_id: string;
  actor_email: string;
  action: string;
  resource: string;
  source_ip: string | null;
  timestamp: string;
}

export interface SearchResult {
  type: 'DEVICE' | 'SENSOR' | 'EVENT' | 'ALERT';
  id: string;
  title: string;
  detail: string;
  href: string;
}

export interface DeviceCredential {
  device_id: string;
  space: 'real';
  credential: string;
  warning: string;
}

export const operationsService = {
  async rotateDeviceCredential(deviceId: string): Promise<DeviceCredential> {
    return (await apiClient.post<DeviceCredential>(
      `/operations/devices/${encodeURIComponent(deviceId)}/credentials`,
    )).data;
  },
  async search(query: string): Promise<SearchResult[]> {
    return (await apiClient.get<{ results: SearchResult[] }>('/operations/search', { params: { query } })).data.results;
  },
  async getAnalytics(): Promise<AnalyticsSummary> {
    return (await apiClient.get<AnalyticsSummary>('/operations/analytics')).data;
  },
  async getRisk(): Promise<CapabilityStatus> {
    return (await apiClient.get<CapabilityStatus>('/operations/risk')).data;
  },
  async getAI(): Promise<CapabilityStatus> {
    return (await apiClient.get<CapabilityStatus>('/operations/ai')).data;
  },
  async getNetwork(): Promise<NetworkStatus> {
    return (await apiClient.get<NetworkStatus>('/operations/network')).data;
  },
  async getTracking(): Promise<TrackingData> {
    return (await apiClient.get<TrackingData>('/operations/tracking')).data;
  },
  async getTimeline(): Promise<{ items: TimelineItem[] }> {
    return (await apiClient.get<{ items: TimelineItem[] }>('/operations/timeline')).data;
  },
  async getAudit(): Promise<{ items: AuditItem[] }> {
    return (await apiClient.get<{ items: AuditItem[] }>('/operations/audit')).data;
  },
  async downloadReport(type: 'devices' | 'sensors' | 'events' | 'alerts'): Promise<Blob> {
    return (await apiClient.get<Blob>(`/operations/reports/${type}`, { responseType: 'blob' })).data;
  },
};
