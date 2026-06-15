// src/store/useAppStore.js
import { create } from 'zustand';

// Gộp Import: Dùng API thật từ nhánh main, giữ nguyên các Utils
import { authApi, recipeApi } from '../services/api'; 
import { calculateTDEEAndMacros } from '../utils/calculator';

export const useAppStore = create((set, get) => ({
  // ==========================================
  // 1. UI STATE
  // ==========================================
  tabBarVisible: true,
  setTabBarVisible: (visible) => set({ tabBarVisible: visible }),
  
  isDrawerOpen: false,
  setDrawerOpen: (visible) => set({ isDrawerOpen: visible }),
  
  fabSheetVisible: false,
  setFabSheetVisible: (visible) => set({ fabSheetVisible: visible }),
  
  searchModalVisible: false,
  searchModalOnSelect: null,
  setSearchModalVisible: (visible, onSelect = null) => set({ searchModalVisible: visible, searchModalOnSelect: onSelect }),

  // ==========================================
  // 2. AUTH & PROFILE STATE
  // ==========================================
  token: null,
  userProfile: null,
  hasProfile: false,
  isLoading: false,
  error: null,
  currentStreak: 0,
  setCurrentStreak: (streak) => set({ currentStreak: streak }),
  aiInsight: null,
  burnedCalories: 0,
  
  fetchAIInsight: async (force = false) => {
    const { aiInsight, isLoading } = get();
    if (!force && aiInsight) return; // Nếu đã có rồi thì không gọi lại
    
    set({ isLoading: true });
    try {
      const { aiApi } = await import('../services/api');
      const res = await aiApi.getNutritionInsight();
      if (res.success && res.data.data) {
        set({ aiInsight: res.data.data });
      }
    } catch (error) {
      console.error("Lỗi lấy AI Insight:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    // MOCK-DRIVEN DEVELOPMENT: Bypass real backend
    return new Promise((resolve) => {
      setTimeout(() => {
        set({ 
          token: 'mock-jwt-token-12345',
          userProfile: { 
            id: 1,
            name: 'Nhi Nguyễn', 
            email: email,
            // Để hasProfile = false để test luồng Onboarding
          },
          hasProfile: false, 
          isLoading: false 
        });
        console.log('👤 [Mock Auth] User logged in, routing to Onboarding...');
        resolve(true);
      }, 1000);
    });
  },

  register: async ({ name, email, password }) => {
    set({ isLoading: true, error: null });
    
    // MOCK-DRIVEN DEVELOPMENT
    return new Promise((resolve) => {
      setTimeout(() => {
        set({ isLoading: false });
        console.log('👤 [Mock Auth] User registered successfully');
        resolve(true);
      }, 1000);
    });
  },

  logout: () => set({ token: null, userProfile: null, hasProfile: false }),

  // 2. RECIPE & FAVORITES STATE (Backend API)
  // ==========================================
  savedRecipeIds: new Set(), 

  fetchFavoriteIds: async () => {
    try {
      const response = await recipeApi.getFavoriteIds();
      // FIX: Đảm bảo data là array trước khi map
      const data = response.data?.success ? response.data.data : response.data;
      const ids = Array.isArray(data) ? data.map(id => parseInt(id)) : [];
      set({ savedRecipeIds: new Set(ids) });
    } catch (error) {
      console.error("Lỗi fetch favorite IDs:", error);
    }
  },

  toggleSaveRecipe: async (recipeId) => {
    const id = parseInt(recipeId);
    const isSaved = get().savedRecipeIds.has(id);
    set((state) => {
      const next = new Set(state.savedRecipeIds);
      if (isSaved) next.delete(id);
      else next.add(id);
      return { savedRecipeIds: next };
    });

    try {
      await recipeApi.toggleFavorite(recipeId);
    } catch (error) {
      // Rollback nếu API lỗi
      set((state) => {
        const next = new Set(state.savedRecipeIds);
        if (isSaved) next.add(id);
        else next.delete(id);
        return { savedRecipeIds: next };
      });
    }
  },

  // 3. UI STATE (Drawer, Toast, v.v.)
  // ==========================================
  isDrawerOpen: false,
  setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
  tabBarVisible: true,
  setTabBarVisible: (visible) => set({ tabBarVisible: visible }),

  // FIX: Đổi 'toast' thành 'toastInfo' để khớp với CustomToast.js
  toastInfo: { visible: false, message: '', type: 'info' },
  showToast: (message, type = 'info') => {
    set({ toastInfo: { visible: true, message, type } });
    setTimeout(() => set({ toastInfo: { visible: false, message: '', type: 'info' } }), 3000);
  },

  // 4. DIARY (NHẬT KÝ ĂN UỐNG)
  // ==========================================
  diaryItems: [],
  fetchDiaryItems: async () => {
    // MOCK-DRIVEN DEVELOPMENT: Skip real API call
    set({ isLoading: false });
  },

  addDiaryItem: async (payload) => {
    // MOCK-DRIVEN DEVELOPMENT
    // Chuẩn hóa keys để tương thích với cả form tay và AI Scanner (trả về meal_name, calories...)
    const mockLog = {
      id: payload.id || Math.random().toString(),
      name: payload.meal_name || payload.name,
      mealType: payload.meal_type === 'lunch' ? 'Trưa' : 
                payload.meal_type === 'dinner' ? 'Tối' : 
                payload.meal_type === 'breakfast' ? 'Sáng' : 
                payload.mealType || 'Trưa',
      calo: payload.calories !== undefined ? payload.calories : (payload.calo || 0),
      protein: payload.protein || 0,
      carbs: payload.carbs || 0,
      fat: payload.fat || 0,
      date: payload.created_at || payload.date || new Date().toISOString()
    };
    
    set((state) => ({ diaryItems: [mockLog, ...state.diaryItems] }));
    get().showToast("Đã lưu nhật ký ăn uống!", 'success');
    return true;
  },

  deleteDiaryItem: async (logId) => {
    // MOCK-DRIVEN DEVELOPMENT
    set((state) => ({
      diaryItems: state.diaryItems.filter(item => item.id !== logId.toString() && item.id !== logId)
    }));
    get().showToast("Đã xóa nhật ký ăn uống", 'info');
  },

  updateDiaryItem: async (payload) => {
    // MOCK-DRIVEN DEVELOPMENT
    const { id, ...updates } = payload;
    set((state) => ({
      diaryItems: state.diaryItems.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
    get().showToast("Đã cập nhật nhật ký", 'success');
  },

  // 6. DASHBOARD & NUTRITION
  // ==========================================
  updateProfile: async (updates) => {
    const response = await authApi.updateProfile(updates);
    if (response.success) {
      set((state) => ({
        userProfile: { ...state.userProfile, ...response.data }
      }));
      get().showToast('Đã cập nhật hồ sơ!', 'success');
    }
  },

  syncNutritionFields: async (field, value) => {
    const state = get();
    const profile = state.userProfile;
    if (!profile) return;

    const formData = {
      gender: profile.gender, age: profile.age, height: profile.height,
      weight: profile.weight, activity: field === 'activity' ? value : profile.activity,
      goal: field === 'goal' ? value : profile.goal
    };

    const newMacros = calculateTDEEAndMacros(formData);
    await state.updateProfile({
      [field]: value,
      targetCalories: newMacros.tdee,
      protein_g: newMacros.protein_g,
      carbs_g: newMacros.carbs_g,
      fat_g: newMacros.fat_g,
    });
  },

  logRecipeMeal: async (recipeId, servings) => {
    const response = await recipeApi.logRecipeMeal(recipeId, servings);
    if (response.success && response.data.success) {
      get().showToast(response.data.message, 'success');
      return true;
    }
    return false;
  },

  // 7. REVIEWS (Backend API)
  // ==========================================
  recipeReviews: [],
  fetchRecipeReviews: async (recipeId) => {
    try {
      const response = await recipeApi.getReviews(recipeId);
      if (response.success) {
        const reviews = response.data.data || [];
        set((state) => ({
          recipeReviews: [...state.recipeReviews.filter(r => r.recipeId !== recipeId), ...reviews]
        }));
        return response.data.stats || { total: 0, avgRating: 0 };
      }
    } catch (error) {
      console.error("Lỗi fetch reviews:", error);
    }
    return { total: 0, avgRating: 0 };
  },

  submitReview: async (recipeId, reviewData) => {
    try {
      const response = await recipeApi.addReview({ recipeId, ...reviewData });
      if (response.success) {
        get().showToast("Cảm ơn bạn đã đánh giá!", 'success');
        get().fetchRecipeReviews(recipeId);
      }
    } catch (error) {
      console.error("Lỗi submit review:", error);
    }
  },

  // 8. MY RECIPES & DRAFTS (Local state — chưa có API backend)
  // ==========================================
  myRecipes: [],
  draftRecipes: [],

  addMyRecipe: (recipe) => set((state) => {
    const newRecipe = {
      ...recipe,
      id: recipe.id || `my_${Date.now()}`,
      createdAt: new Date().toISOString(),
      reviews: { avgRating: 0, total: 0 },
      isSaved: false,
    };
    get().showToast('Đã đăng công thức!', 'success');
    return { myRecipes: [newRecipe, ...state.myRecipes] };
  }),

  updateMyRecipe: (id, updates) => set((state) => {
    get().showToast('Đã cập nhật công thức!', 'success');
    return {
      myRecipes: state.myRecipes.map(r =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      ),
    };
  }),

  deleteMyRecipe: (id) => set((state) => {
    get().showToast('Đã xóa công thức!', 'success');
    return { myRecipes: state.myRecipes.filter(r => r.id !== id) };
  }),

  saveDraft: (draft) => set((state) => {
    const existing = state.draftRecipes.find(d => d.id === draft.id);
    let nextDrafts;
    if (existing) {
      nextDrafts = state.draftRecipes.map(d =>
        d.id === draft.id ? { ...draft, updatedAt: new Date().toISOString() } : d
      );
    } else {
      nextDrafts = [{ ...draft, createdAt: new Date().toISOString() }, ...state.draftRecipes];
    }
    get().showToast('Đã lưu nháp!', 'success');
    return { draftRecipes: nextDrafts };
  }),

  deleteDraft: (id) => set((state) => ({
    draftRecipes: state.draftRecipes.filter(d => d.id !== id),
  })),

  // 9. GAMIFICATION & HEALTH TRACKING (Local state)
  // ==========================================
  weightHistory: [], 
  lastLogDate: null, 

  logMeal: () => set((state) => {
    const today = new Date().toDateString();
    if (state.lastLogDate !== today) {
      return { 
        currentStreak: state.currentStreak + 1,
        lastLogDate: today
      };
    }
    return state; 
  }),

  checkInWeight: async (newWeight) => {
    const state = get();
    const profile = state.userProfile;
    if (!profile) return false;

    const newRecord = { date: new Date().toISOString(), weight: newWeight };
    set({ weightHistory: [...state.weightHistory, newRecord] });

    const formData = {
      gender: profile.gender || 'female',
      age: profile.age,
      height: profile.height,
      weight: newWeight,
      activity: profile.activity || 'light',
      goal: profile.goal || 'lose_weight'
    };
    const newMacros = calculateTDEEAndMacros(formData);

    const newProfileData = {
      weight: newWeight,
      targetCalories: newMacros.tdee,
      protein_g: newMacros.protein_g,
      carbs_g: newMacros.carbs_g,
      fat_g: newMacros.fat_g,
    };

    return await state.updateProfile(newProfileData);
  },

  // ==========================================
  // 10. FITNESS & ACTIVITY LOG (Mock)
  // ==========================================
  addActivityLog: (burned) => set((state) => {
    get().showToast(`🔥 Bạn đã tiêu hao ${Math.round(burned)} kcal! Quỹ Calo của bạn đã được cập nhật.`, 'success');
    return { burnedCalories: state.burnedCalories + burned };
  }),

  // ==========================================
  // 11. MOCK RECOMMENDATIONS
  // ==========================================
  mockRecommendations: [],
  fetchMockRecommendations: () => {
    import('../utils/mockDashboardData').then((module) => {
      set({ mockRecommendations: module.DASHBOARD_MOCK_RECOMMENDATIONS });
    });
  },
}));