import { create } from 'zustand';
import { deviceService, type DeviceDetail, type DeviceRecord } from '../services/api/device.service';

export interface Device extends DeviceRecord {
  lastSeen?: string;
}

interface DeviceStoreState {
  devices: Device[];
  selectedDevice: DeviceDetail | null;
  stats: {
    total: number;
    online: number;
    offline: number;
    maintenance: number;
  };
  loading: boolean;
  error: string | null;
  detailLoading: boolean;
  detailError: string | null;
  fetchDevices: () => Promise<void>;
  fetchDeviceDetail: (deviceId: string) => Promise<void>;
}

export const useDeviceStore = create<DeviceStoreState>((set) => ({
  devices: [],
  selectedDevice: null,
  stats: { total: 0, online: 0, offline: 0, maintenance: 0 },
  loading: false,
  error: null,
  detailLoading: false,
  detailError: null,

  fetchDevices: async () => {
    set({ loading: true, error: null });

    try {
      const response = await deviceService.getDevices();
      set({
        devices: response.devices,
        stats: {
          total: response.stats.total,
          online: response.stats.online,
          offline: response.stats.offline,
          maintenance: response.stats.maintenance,
        },
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch devices',
      });
    }
  },

  fetchDeviceDetail: async (deviceId) => {
    set({ detailLoading: true, detailError: null, selectedDevice: null });
    try {
      const selectedDevice = await deviceService.getDevice(deviceId);
      set({ selectedDevice, detailLoading: false });
    } catch (error) {
      set({
        detailLoading: false,
        detailError: error instanceof Error ? error.message : 'Failed to load device details',
      });
    }
  },
}));
