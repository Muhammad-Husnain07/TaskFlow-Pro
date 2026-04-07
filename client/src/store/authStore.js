import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authAPI.login(credentials);
          localStorage.setItem('token', data.data.token);
          set({ 
            user: data.data.user, 
            token: data.data.token, 
            isAuthenticated: true,
            isLoading: false 
          });
          return data;
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authAPI.register(userData);
          localStorage.setItem('token', data.data.token);
          set({ 
            user: data.data.user, 
            token: data.data.token,
            isAuthenticated: true,
            isLoading: false 
          });
          return data;
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      loadUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isLoading: false });
          return;
        }
        
        set({ isLoading: true });
        try {
          const { data } = await authAPI.getMe();
          set({ user: data.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
          get().logout();
          set({ isLoading: false });
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authAPI.updateProfile(profileData);
          set({ user: data.data, isLoading: false });
          return data;
        } catch (error) {
          const message = error.response?.data?.message || 'Update failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      changePassword: async (passwordData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authAPI.changePassword(passwordData);
          set({ isLoading: false });
          return data;
        } catch (error) {
          const message = error.response?.data?.message || 'Password change failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);