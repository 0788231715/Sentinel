import apiClient from './client';

export interface EventRecord {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  source: string;
  timestamp: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  location: string;
  summary: string;
}

export interface EventListResponse {
  events: EventRecord[];
}

export const eventService = {
  getEvents: async (): Promise<EventListResponse> => {
    const response = await apiClient.get<EventListResponse>('/monitoring/events');
    return response.data;
  },
  updateEvent: async (id: string, changes: Partial<Pick<EventRecord, 'status'>>): Promise<EventRecord> => {
    const response = await apiClient.patch<EventRecord>(`/monitoring/events/${encodeURIComponent(id)}`, changes);
    return response.data;
  },
};
