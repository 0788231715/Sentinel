import apiClient from './client';

export interface AuthUser {
  id: string;
  email: string;
  role: 'viewer' | 'operator' | 'admin';
  is_active: boolean;
}

interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
  user: AuthUser;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },
  getCurrentUser: async (): Promise<AuthUser> => {
    const response = await apiClient.get<AuthUser>('/auth/me');
    return response.data;
  },
};
