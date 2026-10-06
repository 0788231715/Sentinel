import { create } from 'zustand';
import {
  sensorService,
  type SensorRecord,
  type TelemetryRange,
  type TelemetryResponse,
} from '../services/api/sensor.service';

interface SensorState {
  sensors: SensorRecord[];
  sensor: SensorRecord | null;
  telemetry: TelemetryResponse | null;
  listLoading: boolean;
  listError: string | null;
  detailLoading: boolean;
  detailError: string | null;
  telemetryLoading: boolean;
  telemetryError: string | null;
  fetchSensors: (deviceId?: string) => Promise<void>;
  fetchSensor: (sensorId: string) => Promise<void>;
  fetchTelemetry: (
    sensorId: string,
    range: TelemetryRange,
    customRange?: { start: string; end: string },
  ) => Promise<void>;
}

function messageFor(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export const useSensorStore = create<SensorState>((set) => ({
  sensors: [],
  sensor: null,
  telemetry: null,
  listLoading: false,
  listError: null,
  detailLoading: false,
  detailError: null,
  telemetryLoading: false,
  telemetryError: null,

  fetchSensors: async (deviceId) => {
    set({ listLoading: true, listError: null });
    try {
      const response = await sensorService.getSensors(deviceId);
      set({ sensors: response.sensors, listLoading: false });
    } catch (error) {
      set({ listLoading: false, listError: messageFor(error, 'Failed to load sensors') });
    }
  },

  fetchSensor: async (sensorId) => {
    set({ detailLoading: true, detailError: null, sensor: null });
    try {
      const sensor = await sensorService.getSensor(sensorId);
      set({ sensor, detailLoading: false });
    } catch (error) {
      set({ detailLoading: false, detailError: messageFor(error, 'Failed to load sensor details') });
    }
  },

  fetchTelemetry: async (sensorId, range, customRange) => {
    set({ telemetryLoading: true, telemetryError: null, telemetry: null });
    try {
      const telemetry = await sensorService.getTelemetry(sensorId, range, customRange);
      set({ telemetry, telemetryLoading: false });
    } catch (error) {
      set({ telemetryLoading: false, telemetryError: messageFor(error, 'Failed to load telemetry') });
    }
  },
}));
