import apiClient from './client';

export interface MonitoringOverview {
  status: string;
  risk_level: string;
  risk_score: number | null;
  network_load: number | null;
  active_alerts: number;
  total_devices: number;
  online_devices: number;
  last_event: string;
  stream_health: Record<string, {
    value: string;
    state: string;
    tone: string;
  }>;
}

export const monitoringService = {
  getOverview: async (): Promise<MonitoringOverview> => {
    const response = await apiClient.get<MonitoringOverview>('/monitoring/overview');
    return response.data;
  },
};
