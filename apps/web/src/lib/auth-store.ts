import { create } from 'zustand';
import { api, setTokens, clearTokens } from './api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
  loadProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  login: async (email, password) => {
    const res = await api.post<{ accessToken: string; refreshToken: string; user: User }>(
      '/auth/login',
      { email, password },
    );
    setTokens(res.accessToken, res.refreshToken);
    set({ user: res.user, isLoading: false });
  },

  register: async (data) => {
    const res = await api.post<{ accessToken: string; refreshToken: string; user: User }>(
      '/auth/register',
      data,
    );
    setTokens(res.accessToken, res.refreshToken);
    set({ user: res.user, isLoading: false });
  },

  logout: () => {
    clearTokens();
    set({ user: null });
    if (typeof window !== 'undefined') window.location.href = '/login';
  },

  loadProfile: async () => {
    try {
      const user = await api.get<User>('/users/me');
      set({ user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));
