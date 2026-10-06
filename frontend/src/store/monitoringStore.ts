import { create } from 'zustand';
import { monitoringService, type MonitoringOverview } from '../services/api/monitoring.service';

interface MonitoringState {
  overview: MonitoringOverview | null;
  loading: boolean;
  error: string | null;
  fetchOverview: () => Promise<void>;
}

export const useMonitoringStore = create<MonitoringState>((set) => ({
  overview: null,
  loading: false,
  error: null,
  fetchOverview: async () => {
    set({ loading: true, error: null });
    try {
      const overview = await monitoringService.getOverview();
      set({ overview, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load monitoring overview',
      });
    }
  },
}));
