import { create } from 'zustand';
import { systemService, type SystemHealth } from '../services/api/system.service';

interface SystemStoreState {
  health: SystemHealth | null;
  loading: boolean;
  error: string | null;
  lastChecked: Date | null;
  fetchHealth: () => Promise<void>;
}

export const useSystemStore = create<SystemStoreState>((set) => ({
  health: null,
  loading: false,
  error: null,
  lastChecked: null,

  fetchHealth: async () => {
    set({ loading: true, error: null });
    try {
      const data = await systemService.getHealth();
      set({
        health: data,
        loading: false,
        lastChecked: new Date(),
        error: null,
      });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch backend health status',
        lastChecked: new Date(),
      });
    }
  },
}));
