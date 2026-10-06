import { create } from 'zustand';
import { alertService, type AlertRecord } from '../services/api/alert.service';

export interface Alert extends AlertRecord {
  message: string;
}

interface AlertStoreState {
  alerts: Alert[];
  stats: {
    critical: number;
    active: number;
  };
  loading: boolean;
  error: string | null;
  fetchAlerts: () => Promise<void>;
}

export const useAlertStore = create<AlertStoreState>((set) => ({
  alerts: [],
  stats: { critical: 0, active: 0 },
  loading: false,
  error: null,

  fetchAlerts: async () => {
    set({ loading: true, error: null });

    try {
      const response = await alertService.getAlerts();
      const formattedAlerts: Alert[] = response.alerts.map((item) => ({
        ...item,
        message: item.summary,
      }));

      set({
        alerts: formattedAlerts,
        stats: {
          critical: response.stats.critical,
          active: response.stats.active,
        },
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch alerts',
      });
    }
  },
}));
