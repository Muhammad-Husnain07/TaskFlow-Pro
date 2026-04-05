import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authAPI.login(credentials);
          localStorage.setItem('token', data.data.token);
          set({ user: data.data.user, token: data.data.token, isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authAPI.register(userData);
          localStorage.setItem('token', data.data.token);
          set({ user: data.data.user, token: data.data.token, isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Registration failed', isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },

      fetchUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        try {
          const { data } = await authAPI.getMe();
          set({ user: data.data });
        } catch (error) {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);