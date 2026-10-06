import apiClient from './client';

export type DataQuality = 'FRESH' | 'DELAYED' | 'STALE' | 'MISSING' | 'INVALID';
export type DataOrigin = 'SIMULATED' | 'PHYSICAL' | 'UNVERIFIED' | 'MIXED' | 'NONE';
export type TelemetryRange = '1h' | '6h' | '24h' | '7d' | '30d';

export interface SensorRecord {
  id: string;
  sensor_type: string;
  device_id: string;
  device_name: string | null;
  current_value: number | null;
  unit: string;
  threshold: number | null;
  minimum: number | null;
  maximum: number | null;
  average: number | null;
  last_update: string | null;
  health: number;
  calibration_status: string;
  data_quality: DataQuality;
  data_origin: 'SIMULATED' | 'PHYSICAL' | 'UNVERIFIED';
  space: 'simulation' | 'real';
}

export interface TelemetryPoint {
  id: string;
  sensor_id: string;
  value: number;
  timestamp: string;
  quality: DataQuality;
  data_origin: 'SIMULATED' | 'PHYSICAL' | 'UNVERIFIED';
  space: 'simulation' | 'real';
}

export interface TelemetryResponse {
  sensor_id: string;
  range: TelemetryRange | 'custom';
  from: string;
  to: string;
  points: TelemetryPoint[];
  stats: {
    count: number;
    minimum: number | null;
    maximum: number | null;
    average: number | null;
  };
  data_origin: DataOrigin;
}

export interface SensorListResponse {
  sensors: SensorRecord[];
  stats: {
    total: number;
    quality: Record<DataQuality, number>;
  };
}

export const sensorService = {
  getSensors: async (deviceId?: string): Promise<SensorListResponse> => {
    const response = await apiClient.get<SensorListResponse>('/monitoring/sensors', {
      params: deviceId ? { device_id: deviceId } : undefined,
    });
    return response.data;
  },
  getSensor: async (sensorId: string): Promise<SensorRecord> => {
    const response = await apiClient.get<SensorRecord>(`/monitoring/sensors/${encodeURIComponent(sensorId)}`);
    return response.data;
  },
  getTelemetry: async (
    sensorId: string,
    range: TelemetryRange,
    customRange?: { start: string; end: string },
  ): Promise<TelemetryResponse> => {
    const response = await apiClient.get<TelemetryResponse>(
      `/monitoring/sensors/${encodeURIComponent(sensorId)}/telemetry`,
      {
        params: customRange
          ? { start: customRange.start, end: customRange.end }
          : { range },
      },
    );
    return response.data;
  },
};
