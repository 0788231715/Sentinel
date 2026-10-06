import apiClient from './client';

export interface AlertRecord {
  id: string;
  summary: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  source: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  timestamp: string;
}

export interface AlertListResponse {
  alerts: AlertRecord[];
  stats: {
    critical: number;
    active: number;
  };
}

export const alertService = {
  getAlerts: async (): Promise<AlertListResponse> => {
    const response = await apiClient.get<AlertListResponse>('/monitoring/alerts');
    return response.data;
  },
  updateAlert: async (id: string, changes: Partial<Pick<AlertRecord, 'status'>>): Promise<AlertRecord> => {
    const response = await apiClient.patch<AlertRecord>(`/monitoring/alerts/${encodeURIComponent(id)}`, changes);
    return response.data;
  },
};
