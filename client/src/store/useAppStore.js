// src/store/useAppStore.js
import { create } from 'zustand';

// Gộp Import: Dùng API thật từ nhánh main, giữ nguyên các Utils
import { authApi, recipeApi, recommendationApi } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  setAuthData: (token, userProfile, hasProfile) => set({ token, userProfile, hasProfile }),
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
    
    try {
      const response = await authApi.login(email, password);
      
      if (response.success && response.data?.success) {
        const { token, user, has_profile, profile } = response.data.data;
        set({
          token,
          userProfile: profile ? { ...user, ...profile } : user,
          hasProfile: has_profile || false,
          isLoading: false
        });
        console.log('👤 [Auth] User logged in successfully');
        return true;
      } else {
        set({ error: response.error || response.data?.message || 'Đăng nhập thất bại', isLoading: false });
        return false;
      }
    } catch (error) {
      set({ error: 'Lỗi kết nối đến máy chủ', isLoading: false });
      return false;
    }
  },

  register: async ({ name, email, password }) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authApi.register(name, email, password);
      
      if (response.success && response.data?.success) {
        set({
          isLoading: false
        });
        console.log('👤 [Auth] User registered successfully');
        return { success: true, token: response.data.data.token, user: response.data.data.user };
      } else {
        set({ error: response.error || response.data?.message || 'Đăng ký thất bại', isLoading: false });
        return false;
      }
    } catch (error) {
      set({ error: 'Lỗi kết nối đến máy chủ', isLoading: false });
      return false;
    }
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
    try {
      set({ isLoading: true });
      const res = await recipeApi.getDiary();
      if (res.success && res.data?.data) {
        const mealTypeMap = {
          'breakfast': 'Sáng',
          'lunch': 'Trưa',
          'dinner': 'Tối',
          'snack': 'Bữa phụ'
        };
        const formattedData = res.data.data.map(item => ({
          ...item,
          mealType: mealTypeMap[item.mealType] || item.mealType
        }));
        set({ diaryItems: formattedData });
      }
    } catch (e) {
      console.error("Lỗi lấy nhật ký:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  addDiaryItem: async (payload) => {
    try {
      set({ isSaving: true });
      // Map UI fields (calo, name, mealType) or AI fields (calories, meal_name, meal_type) to Backend API fields
      const mealTypeMapping = {
        'Sáng': 'breakfast',
        'Trưa': 'lunch',
        'Tối': 'dinner',
        'Bữa phụ': 'snack'
      };

      const rawMealType = payload.meal_type || payload.mealType || 'Trưa';
      const apiMealType = mealTypeMapping[rawMealType] || rawMealType;

      const apiPayload = {
        meal_name: payload.meal_name || payload.name,
        meal_type: apiMealType,
        calories: payload.calories !== undefined ? payload.calories : (payload.calo || 0),
        protein: payload.protein || 0,
        carbs: payload.carbs || 0,
        fat: payload.fat || 0,
        servings: payload.servings || 1,
        recipe_id: payload.recipe_id
      };
      
      const res = await recipeApi.logMeal(apiPayload);
      if (res.success) {
        get().fetchDiaryItems();
        get().showToast('Thêm món thành công!', 'success');
      } else {
        get().showToast(res.message || 'Lỗi thêm món', 'error');
      }
    } catch (e) {
      console.error(e);
      get().showToast('Lỗi mạng', 'error');
    } finally {
      set({ isSaving: false });
    }
  },

  deleteDiaryItem: async (logId) => {
    try {
      const res = await recipeApi.deleteDiaryItem(logId);
      if (res.success) {
        get().fetchDiaryItems();
        get().showToast("Đã xóa nhật ký ăn uống", 'info');
      } else {
        get().showToast(res.message || 'Lỗi xóa nhật ký', 'error');
      }
    } catch (e) {
      console.error(e);
      get().showToast('Lỗi mạng', 'error');
    }
  },

  updateDiaryItem: async (payload) => {
    try {
      set({ isSaving: true });
      
      const mealTypeMapping = {
        'Sáng': 'breakfast',
        'Trưa': 'lunch',
        'Tối': 'dinner',
        'Bữa phụ': 'snack'
      };
      const apiMealType = mealTypeMapping[payload.mealType] || payload.mealType;

      const updates = {
        name: payload.name,
        mealType: apiMealType,
        calo: payload.calo,
        protein: payload.protein,
        carbs: payload.carbs,
        fat: payload.fat
      };
      
      const res = await recipeApi.updateDiaryItem(payload.id, updates);
      if (res.success) {
        get().fetchDiaryItems();
        get().showToast("Đã cập nhật nhật ký", 'success');
      } else {
        get().showToast(res.message || 'Lỗi cập nhật', 'error');
      }
    } catch (e) {
      console.error(e);
      get().showToast('Lỗi mạng', 'error');
    } finally {
      set({ isSaving: false });
    }
  },

  // 6. DASHBOARD & NUTRITION
  // ==========================================
  submitOnboardingProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.setupProfile(profileData);
      if (response.success && response.data?.success) {
        set((state) => ({
          userProfile: { ...state.userProfile, ...response.data.data },
          hasProfile: true,
          isLoading: false
        }));
        get().showToast('Tạo hồ sơ thành công!', 'success');
        return true;
      } else {
        set({ error: response.error || response.data?.message || 'Lưu hồ sơ thất bại', isLoading: false });
        get().showToast('Lỗi lưu hồ sơ', 'error');
        return false;
      }
    } catch (error) {
      set({ error: 'Lỗi kết nối máy chủ', isLoading: false });
      return false;
    }
  },

  updateProfile: async (updates) => {
    const response = await authApi.setupProfile(updates);
    if (response.success) {
      set((state) => ({
        userProfile: { ...state.userProfile, ...response.data.data }
      }));
      get().showToast('Đã cập nhật hồ sơ!', 'success');
    }
  },

  syncNutritionFields: async (field, value) => {
    const state = get();
    const profile = state.userProfile;
    if (!profile) return;

    const formData = {
      gender: profile.gender, age: profile.age, height: profile.height_cm,
      weight: profile.weight_kg, activity: field === 'activity_level' ? value : profile.activity_level,
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
  // 11. RECOMMENDATIONS
  // ==========================================
  mockRecommendations: [],
  recommendationMessage: "",
  fetchRecommendations: async (mealType = 'dinner') => {
    try {
      const response = await recommendationApi.getRecommendations(mealType);
      if (response.success) {
        set({ 
          mockRecommendations: response.data?.data || [],
          recommendationMessage: response.data?.message || ""
        });
      } else {
        console.error("Lỗi lấy gợi ý: ", response.message);
      }
    } catch (e) {
      console.error("Lỗi gọi API gợi ý:", e);
    }
  },
}));