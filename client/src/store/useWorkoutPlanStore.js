import { create } from 'zustand';
import { fetchApi } from '../services/api';

export const useWorkoutPlanStore = create((set, get) => ({
  plans: [],
  isLoading: false,
  error: null,

  fetchCurrentPlan: async () => {
    set({ isLoading: true, error: null });
    try {
      // fetchApi tự động thêm Token từ useAppStore
      const res = await fetchApi('GET', '/workout/current');
      if (res.success) {
        set({ plans: res.data?.data || [], isLoading: false });
      } else {
        set({ error: res.error, isLoading: false });
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  generateNewPlan: async (token, goal, difficulty, durationDays = 7, previewSchedule = null, presetId = null, presetTitle = null, presetImage = null) => {
    // Note: token is passed but actually ignored since fetchApi uses interceptor.
    set({ isLoading: true, error: null });
    try {
      const res = await fetchApi('POST', '/workout/generate', { 
        goal, 
        difficulty, 
        duration_days: durationDays, 
        preview_schedule: previewSchedule,
        preset_id: presetId,
        preset_title: presetTitle,
        preset_image: presetImage
      });
      if (res.success) {
        await get().fetchCurrentPlan(); // Refresh sau khi tạo
      } else {
        set({ error: res.error, isLoading: false });
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  completeDay: async (token, dayId) => {
    try {
      const res = await fetchApi('POST', '/workout/complete-day', { day_id: dayId });
      if (res.success) {
        await get().fetchCurrentPlan(); // Refresh
      }
    } catch (err) {
      console.error("Error completing day:", err);
    }
  },

  saveProgress: async (token, dayId, progressData) => {
    try {
      const res = await fetchApi('POST', '/workout/save-progress', { day_id: dayId, progress_data: progressData });
      if (res.success) {
        await get().fetchCurrentPlan(); // Refresh locally to reflect progress
      }
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  },

  deletePlan: async (planId) => {
    try {
      const { workoutApi } = require('../services/api');
      const res = await workoutApi.deletePlan(planId);
      if (res.success) {
        await get().fetchCurrentPlan(); // Refresh
      }
      return res;
    } catch (err) {
      console.error("Error deleting plan:", err);
      return { success: false, error: err.message };
    }
  }
}));
