import apiClient from './client';

export interface SystemHealth {
  status: string;
  app_name: string;
  environment: string;
  uptime_seconds: number;
  timestamp: number;
  components: {
    database: {
      status: string;
      type?: string;
    };
    api: {
      status: string;
      version?: string;
    };
    system_resources: {
      cpu_percent: number;
      memory_percent: number;
      memory_available_mb: number;
    };
  };
}

export const systemService = {
  getHealth: async (): Promise<SystemHealth> => {
    const response = await apiClient.get<SystemHealth>('/system/health');
    return response.data;
  },
};
