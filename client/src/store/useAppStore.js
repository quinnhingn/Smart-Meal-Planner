// src/store/useAppStore.js
import { create } from 'zustand';

// Gộp Import: Dùng API thật từ nhánh main, giữ nguyên các Utils
import { authApi, recipeApi } from '../services/api'; 
import { calculateTDEEAndMacros } from '../utils/calculator';
import { getDaysUntilExpiry, getUrgencyLevel } from '../utils/mockPantryData';

export const useAppStore = create((set, get) => ({
  // ==========================================
  // 1. AUTH & PROFILE STATE
  // ==========================================
  token: null,
  userProfile: null,
  hasProfile: false,
  isLoading: false,
  error: null,
  currentStreak: 0,
  setCurrentStreak: (streak) => set({ currentStreak: streak }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    const response = await authApi.login(email, password);

    if (response.success) {
      set({ 
        token: response.data.token,
        userProfile: { ...response.data.user, ...response.data.profile },
        hasProfile: response.data.has_profile || false,
        isLoading: false 
      });
      console.log('👤 [Auth] UserProfile loaded:', get().userProfile);
      get().fetchFavoriteIds(); 
      get().fetchShoppingList(); // Nạp luôn giỏ hàng khi login
      return true;
    } else {
      set({ error: response.message, isLoading: false });
      return false;
    }
  },

  register: async ({ name, email, password }) => {
    set({ isLoading: true, error: null });
    const response = await authApi.register({ name, email, password });
    if (response.success) {
      set({ isLoading: false });
      return true;
    } else {
      set({ error: response.message, isLoading: false });
      return false;
    }
  },

  logout: () => set({ token: null, userProfile: null, hasProfile: false }),

  // 2. RECIPE & FAVORITES STATE
  // ==========================================
  favoriteIds: [], 

  fetchFavoriteIds: async () => {
    try {
      const response = await recipeApi.getFavoriteIds();
      // FIX: Đảm bảo data là array trước khi map
      const data = response.data?.success ? response.data.data : response.data;
      const ids = Array.isArray(data) ? data.map(id => parseInt(id)) : [];
      set({ favoriteIds: ids });
    } catch (error) {
      console.error("Lỗi fetch favorite IDs:", error);
    }
  },

  toggleFavorite: async (recipeId) => {
    const isFav = get().favoriteIds.includes(recipeId);
    set((state) => ({
      favoriteIds: isFav 
        ? state.favoriteIds.filter(id => id !== recipeId)
        : [...state.favoriteIds, recipeId]
    }));

    try {
      await recipeApi.toggleFavorite(recipeId);
    } catch (error) {
      set((state) => ({
        favoriteIds: isFav 
          ? [...state.favoriteIds, recipeId]
          : state.favoriteIds.filter(id => id !== recipeId)
      }));
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
    set({ isLoading: true });
    try {
      const response = await recipeApi.getDiary();
      if (response.success && response.data && Array.isArray(response.data.data)) {
        set({ diaryItems: response.data.data, isLoading: false });
      } else {
        set({ diaryItems: [], isLoading: false });
      }
    } catch (error) {
      console.error("Lỗi fetch diary items:", error);
      set({ isLoading: false });
    }
  },

  addDiaryItem: async (payload) => {
    try {
      // Map frontend keys to backend keys
      const mealData = {
        meal_name: payload.name,
        meal_type: payload.mealType,
        calories: payload.calo,
        protein: payload.protein || 0,
        carbs: payload.carbs || 0,
        fat: payload.fat || 0,
        servings: payload.servings || 1
      };
      const response = await recipeApi.logMeal(mealData);
      if (response.success) {
        get().showToast("Đã ghi nhật ký ăn uống!", 'success');
        get().fetchDiaryItems();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi add diary item:", error);
      return false;
    }
  },

  deleteDiaryItem: async (logId) => {
    try {
      const response = await recipeApi.deleteDiaryItem(logId);
      if (response.success) {
        set((state) => ({
          diaryItems: state.diaryItems.filter(item => item.id !== logId.toString())
        }));
        get().showToast("Đã xóa nhật ký ăn uống", 'info');
      }
    } catch (error) {
      console.error("Lỗi delete diary item:", error);
    }
  },

  updateDiaryItem: async (payload) => {
    try {
      const { id, ...updates } = payload;
      // Map keys if needed for update
      const backendUpdates = {
        name: updates.name,
        mealType: updates.mealType,
        calo: updates.calo
      };
      const response = await recipeApi.updateDiaryItem(id, backendUpdates);
      if (response.success) {
        get().showToast("Đã cập nhật nhật ký", 'success');
        get().fetchDiaryItems();
      }
    } catch (error) {
      console.error("Lỗi update diary item:", error);
    }
  },

  // 4. PANTRY MANAGEMENT
  // ==========================================
  pantryItems: [],
  pantryHistory: [],

  fetchPantryItems: async () => {
    set({ isLoading: true });
    try {
      const response = await recipeApi.getPantry();
      if (response.success && response.data && Array.isArray(response.data.data)) {
        const items = response.data.data.map(item => {
          const name = item.name.toLowerCase();
          let icon = '📦';
          let category = 'other';

          if (name.includes('nghêu') || name.includes('ốc') || name.includes('hải sản')) {
            icon = '🐚'; category = 'meat';
          } else if (name.includes('tôm') || name.includes('tép')) {
            icon = '🍤'; category = 'meat';
          } else if (name.includes('cá') || name.includes('lươn') || name.includes('philê')) {
            icon = '🐟'; category = 'meat';
          } else if (name.includes('thịt') || name.includes('gà') || name.includes('bò') || name.includes('heo') || name.includes('ba chỉ')) {
            icon = '🥩'; category = 'meat';
          } else if (name.includes('rau') || name.includes('cải') || name.includes('bắp') || name.includes('muống') || name.includes('ngót')) {
            icon = '🥬'; category = 'vegetable';
          } else if (name.includes('cà rốt') || name.includes('cà chua') || name.includes('bí') || name.includes('khoai')) {
            icon = '🥕'; category = 'vegetable';
          } else if (name.includes('gừng') || name.includes('tỏi') || name.includes('hành') || name.includes('ớt') || name.includes('chanh')) {
            icon = '🧄'; category = 'condiment';
          } else if (name.includes('trái') || name.includes('cam') || name.includes('quýt') || name.includes('thơm') || name.includes('long') || name.includes('táo') || name.includes('chuối')) {
            icon = '🍎'; category = 'vegetable';
          } else if (name.includes('sữa') || name.includes('trứng') || name.includes('phô mai')) {
            icon = '🥛'; category = 'dairy';
          }

          return { ...item, icon, category };
        });
        set({ pantryItems: items });
      }
    } catch (error) {
      console.error("Lỗi fetch pantry:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPantryHistory: async () => {
    try {
      const response = await recipeApi.getPantryHistory();
      if (response.success && response.data) {
        const historyData = Array.isArray(response.data.data) ? response.data.data : [];
        set({ pantryHistory: historyData });
      }
    } catch (error) {
      console.error("Lỗi fetch pantry history:", error);
    }
  },

  // 5. SHOPPING LIST (GIỎ HÀNG)
  // ==========================================
  shoppingList: [],

  fetchShoppingList: async () => {
    try {
      const response = await recipeApi.getShoppingList();
      if (response.success && response.data.success) {
        set({ shoppingList: response.data.data || [] });
      }
    } catch (error) {
      console.error("Lỗi fetch shopping list:", error);
    }
  },

  addToShoppingList: async (recipeId, servings) => {
    try {
      const response = await recipeApi.addToShoppingList(recipeId, servings);
      if (response.success && response.data.success) {
        get().showToast(response.data.message, 'success');
        get().fetchShoppingList();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi add to shopping list:", error);
      return false;
    }
  },

  updateShoppingItem: async (itemId, updates) => {
    try {
      set((state) => ({
        shoppingList: state.shoppingList.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        )
      }));
      await recipeApi.updateShoppingItem(itemId, updates);
    } catch (error) {
      console.error("Lỗi update shopping item:", error);
    }
  },

  saveShoppingToPantry: async () => {
    try {
      const response = await recipeApi.saveShoppingToPantry();
      if (response.success && response.data.success) {
        get().showToast(response.data.message, 'success');
        get().fetchShoppingList();
        get().fetchPantryItems();
        get().fetchPantryHistory();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi save shopping to pantry:", error);
      return false;
    }
  },

  clearShoppingList: async () => {
    try {
      const response = await recipeApi.clearShoppingList();
      if (response.success && response.data.success) {
        set({ shoppingList: [] });
        get().showToast("Đã xóa danh sách đi chợ", 'info');
      }
    } catch (error) {
      console.error("Lỗi clear shopping list:", error);
    }
  },

  addManualShoppingItem: async (name, quantity, unit) => {
    try {
      const response = await recipeApi.addManualShoppingItem(name, quantity, unit);
      if (response.success && response.data.success) {
        get().showToast(response.data.message, 'success');
        get().fetchShoppingList();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi manual add shopping item:", error);
      return false;
    }
  },

  toggleAllShoppingItems: async (isBought) => {
    try {
      set((state) => ({
        shoppingList: state.shoppingList.map(item => ({ ...item, isBought }))
      }));
      await recipeApi.toggleAllShoppingItems(isBought);
    } catch (error) {
      console.error("Lỗi toggle all shopping items:", error);
      get().fetchShoppingList();
    }
  },

  // === FILTER & SORT ===
  selectedCategory: 'all',
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  getFilteredItems: () => {
    const { pantryItems, selectedCategory, searchQuery } = get();
    let filtered = pantryItems.filter(item => (item.quantity || 0) > 0);
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item => item.name.toLowerCase().includes(q));
    }
    return filtered.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
  },

  getPantryStats: () => {
    const { pantryItems } = get();
    return {
      total: pantryItems.length,
      expiringSoon: pantryItems.filter(i => getDaysUntilExpiry(i.expiry_date) <= 3).length,
      expired: pantryItems.filter(i => getDaysUntilExpiry(i.expiry_date) < 0).length,
    };
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
      get().fetchPantryItems();
      get().fetchPantryHistory();
      return true;
    }
    return false;
  },
  
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
      const response = await recipeApi.addReview(recipeId, reviewData);
      if (response.success) {
        get().showToast("Cảm ơn bạn đã đánh giá!", 'success');
        get().fetchRecipeReviews(recipeId);
      }
    } catch (error) {
      console.error("Lỗi submit review:", error);
    }
  },
}));