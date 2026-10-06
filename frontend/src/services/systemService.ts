import apiClient from './api/client';

export interface SystemHealthResponse {
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
  getHealth: async (): Promise<SystemHealthResponse> => {
    const response = await apiClient.get<SystemHealthResponse>('/system/health');
    return response.data;
  },
};

export const getSystemHealth = async (): Promise<SystemHealthResponse> => systemService.getHealth();
