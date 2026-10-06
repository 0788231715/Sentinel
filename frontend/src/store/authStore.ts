import { create } from 'zustand';
import axios from 'axios';
import { authService, type AuthUser } from '../services/api/auth.service';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  initialized: boolean;
  initError: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  initialize: () => Promise<void>;
  logout: () => void;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Authentication request failed';
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('sentinel.accessToken'),
  initialized: false,
  initError: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const result = await authService.login(email, password);
      localStorage.setItem('sentinel.accessToken', result.access_token);
      set({ token: result.access_token, user: result.user, initialized: true, loading: false, initError: null });
    } catch (error) {
      set({ loading: false, error: errorMessage(error) });
      throw error;
    }
  },

  initialize: async () => {
    const token = localStorage.getItem('sentinel.accessToken');
    if (!token) {
      set({ initialized: true, initError: null });
      return;
    }
    try {
      const user = await authService.getCurrentUser();
      set({ user, token, initialized: true, initError: null });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('sentinel.accessToken');
        set({ user: null, token: null, initialized: true, initError: null });
        return;
      }
      set({ initialized: true, initError: errorMessage(error) });
    }
  },

  logout: () => {
    localStorage.removeItem('sentinel.accessToken');
    set({ user: null, token: null, initialized: true, error: null, initError: null });
  },
}));
