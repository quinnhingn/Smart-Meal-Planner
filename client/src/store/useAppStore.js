// src/store/useAppStore.js
import { create } from 'zustand';
import { authApi } from '../services/mockApi';

export const useAppStore = create((set, get) => ({
  token: null,
  userProfile: null,
  hasProfile: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    const response = await authApi.login(email, password);
    
    if (response.success) {
      set({ 
        token: response.data.access_token, 
        hasProfile: response.data.has_profile,
        userProfile: response.data.profile || null,
        isLoading: false 
      });
      return true;
    } else {
      set({ error: response.message, isLoading: false });
      return false;
    }
  },

  setupProfile: async (data) => {
    set({ isLoading: true, error: null });
    const response = await authApi.setupProfile(data);
    
    if (response.success) {
      set({ 
        userProfile: response.data,
        hasProfile: true,
        isLoading: false 
      });
      return true;
    }
    set({ error: "Lỗi lưu hồ sơ", isLoading: false });
    return false;
  },

  // Sidebar state
  isDrawerOpen: false,
  setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),

  logout: () => set({ token: null, userProfile: null, hasProfile: false, error: null }),
  clearError: () => set({ error: null })
}));