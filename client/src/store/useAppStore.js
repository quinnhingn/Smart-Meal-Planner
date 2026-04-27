// src/store/useAppStore.js
import { create } from 'zustand';

export const useAppStore = create((set) => ({
  userProfile: null,
  pantryItems: [],
  token: null,

  // Actions
  setAuth: (token, profile) => set({ token, userProfile: profile }),
  logout: () => set({ token: null, userProfile: null, pantryItems: [] }),
  setPantry: (items) => set({ pantryItems: items }),
}));