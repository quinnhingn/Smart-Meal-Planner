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
      return true;
    } else {
      set({ error: response.message, isLoading: false });
      return false;
    }
  },

  register: async ({ name, email, password }) => {
    set({ isLoading: true, error: null });
    const response = await authApi.register(name, email, password);

    if (response.success) {
      set({
        token: response.data.token,
        userProfile: { ...response.data.user, ...response.data.profile },
        hasProfile: false,
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
      set((state) => ({ 
        userProfile: { ...state.userProfile, ...response.data.data },
        hasProfile: true,
        isLoading: false 
      }));
      get().showToast('Chúc mừng! Hồ sơ của bạn đã sẵn sàng.', 'success');
      return true;
    }
    set({ error: response.error || "Lỗi lưu hồ sơ", isLoading: false });
    return false;
  },

  updateProfile: async (updatedData) => {
    set({ isLoading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 1000));

    set((state) => ({ 
      userProfile: { ...state.userProfile, ...updatedData },
      isLoading: false 
    }));

    get().showToast('Đã cập nhật hồ sơ thành công!', 'success');
    return true;
  },

  logout: () => set({ token: null, userProfile: null, hasProfile: false, error: null }),
  clearError: () => set({ error: null }),

  // ==========================================
  // 2. UI STATE (SIDEBAR & TAB BAR)
  // ==========================================
  isDrawerOpen: false,
  setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),

  tabBarVisible: true,
  setTabBarVisible: (visible) => set({ tabBarVisible: visible }),
  lastScrollY: 0,
  setLastScrollY: (y) => set({ lastScrollY: y }),

  // ==========================================
  // 3. DATA STATE (NHẬT KÝ & TỦ LẠNH)
  // ==========================================
  diaryItems: [],
  pantryItems: [],
  pantryHistory: [],              
  isSaving: false, 

  // State của Custom Toast
  toastInfo: { visible: false, message: '', type: 'success' },

  showToast: (message, type = 'success') => {
    set({ toastInfo: { visible: true, message, type } });
    setTimeout(() => {
      set({ toastInfo: { visible: false, message: '', type: 'success' } });
    }, 3000);
  },

  hideToast: () => set((state) => ({ toastInfo: { ...state.toastInfo, visible: false } })),

  // --- DIARY CRUD ---

  addDiaryItem: async (item) => {
    set({ isSaving: true });
    await new Promise(resolve => setTimeout(resolve, 800));

    set((state) => ({
      diaryItems: [
        { 
          ...item, 
          id: item.id || `diary_${Date.now()}`, 
          createdAt: new Date().toISOString() 
        }, 
        ...state.diaryItems
      ],
      isSaving: false
    }));

    get().showToast('Đã thêm món ăn vào Nhật ký!', 'success');
  },

  updateDiaryItem: (updatedItem) => {
    set((state) => ({
      diaryItems: state.diaryItems.map(item => 
        item.id === updatedItem.id ? { ...item, ...updatedItem, updatedAt: new Date().toISOString() } : item
      )
    }));
    get().showToast('Đã cập nhật món ăn!', 'success');
  },

  deleteDiaryItem: (id) => {
    set((state) => ({
      diaryItems: state.diaryItems.filter(item => item.id !== id)
    }));
    get().showToast('Đã xóa món ăn!', 'success');
  },

  // Alias backward compatible
  removeDiaryItem: (id) => get().deleteDiaryItem(id),

  // --- PANTRY CRUD ---

  addPantryItems: async (items) => {
    set({ isSaving: true });
    await new Promise(resolve => setTimeout(resolve, 800));

    set((state) => {
      const now = new Date().toISOString();
      const newItems = items.map(item => ({ 
        ...item, 
        id: item.id || `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        addedAt: now, 
        createdAt: now,
        category: item.category || 'other',
        icon: item.icon || '📦',
      }));
      return { 
        pantryItems: [...newItems, ...state.pantryItems],
        isSaving: false
      };
    });

    get().showToast(`Đã lưu ${items.length} nguyên liệu vào tủ lạnh!`, 'success');
  },

  // Lấy dữ liệu tủ lạnh từ API
  fetchPantryItems: async () => {
    set({ isLoading: true });
    try {
      const response = await recipeApi.getPantryItems();
      console.log("📦 [Pantry Sync] Dữ liệu từ DB:", response);

      if (response.success && response.data && Array.isArray(response.data.data)) {
        const items = response.data.data.map(item => {
          const name = item.name ? item.name.toLowerCase() : '';
          let icon = '📦';
          let category = 'other';

          if (name.includes('tôm') || name.includes('tép') || name.includes('nghêu') || name.includes('ốc') || name.includes('hải sản')) {
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

  // ==========================================
  // 4. PANTRY MANAGEMENT
  // ==========================================

  clearPantryHistory: () => set({ pantryHistory: [] }),

  restorePantryItem: (historyId) => set((state) => {
    const histItem = state.pantryHistory.find(h => h.id === historyId);
    if (!histItem) return state;

    const restoredItem = {
      id: histItem.itemId || `item_${Date.now()}`,
      name: histItem.name,
      quantity: histItem.quantity,
      unit: histItem.unit,
      icon: histItem.icon,
      category: histItem.category || 'other',
      addedAt: new Date().toISOString(),
      expiryDays: histItem.originalExpiryDays || 3,
    };

    return {
      pantryHistory: state.pantryHistory.filter(h => h.id !== historyId),
      pantryItems: [restoredItem, ...state.pantryItems]
    };
  }),

  consumePantryItem: (id, amount, reason = 'consumed') => {
    const item = get().pantryItems.find(i => i.id === id);
    if (!item) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const historyEntry = {
      id: `hist_${Date.now()}`,
      itemId: item.id,
      name: item.name,
      quantity: amountNum,
      unit: item.unit,
      icon: item.icon,
      action: reason,
      usedAt: new Date().toISOString(),
      originalExpiryDays: item.expiryDays,
    };

    if (amountNum >= item.quantity) {
      set((state) => ({
        pantryItems: state.pantryItems.filter(i => i.id !== id),
        pantryHistory: [historyEntry, ...state.pantryHistory]
      }));
    } else {
      set((state) => ({
        pantryItems: state.pantryItems.map(i =>
          i.id === id ? { ...i, quantity: i.quantity - amountNum } : i
        ),
        pantryHistory: [historyEntry, ...state.pantryHistory]
      }));
    }
    get().showToast(`Đã dùng ${amountNum} ${item.unit} ${item.name}`, 'success');
  },

  removePantryItemWithHistory: (id, reason = 'consumed') => {
    const item = get().pantryItems.find(i => i.id === id);
    if (!item) return;

    const historyEntry = {
      id: `hist_${Date.now()}`,
      itemId: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      icon: item.icon,
      action: reason,
      usedAt: new Date().toISOString(),
      originalExpiryDays: item.expiryDays,
      actualDaysUsed: Math.floor((new Date() - new Date(item.addedAt || item.createdAt || new Date())) / (1000 * 60 * 60 * 24)),
    };

    set((state) => ({
      pantryItems: state.pantryItems.filter(i => i.id !== id),
      pantryHistory: [historyEntry, ...state.pantryHistory]
    }));

    const actionText = reason === 'consumed' ? 'đã dùng' : reason === 'expired' ? 'hết hạn' : 'bỏ đi';
    get().showToast(`Đã đánh dấu "${item.name}" ${actionText}`, 'success');
  },

  updatePantryItem: (id, updates) => {
    set((state) => ({
      pantryItems: state.pantryItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  },

  // === FILTER & SORT ===
  selectedCategory: 'all',
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  getFilteredItems: () => {
    const { pantryItems, selectedCategory, searchQuery } = get();

    let filtered = [...pantryItems];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => {
      const daysA = getDaysUntilExpiry(a);
      const daysB = getDaysUntilExpiry(b);
      return daysA - daysB;
    });
  },

  getPantryStats: () => {
    const items = get().pantryItems;
    const history = get().pantryHistory;

    const total = items.length;
    const expired = items.filter(i => getUrgencyLevel(getDaysUntilExpiry(i)) === 'expired').length;
    const urgent = items.filter(i => getUrgencyLevel(getDaysUntilExpiry(i)) === 'urgent').length;
    const warning = items.filter(i => getUrgencyLevel(getDaysUntilExpiry(i)) === 'warning').length;

    const consumed = history.filter(h => h.action === 'consumed').length;
    const discarded = history.filter(h => h.action === 'discarded' || h.action === 'expired').length;
    const totalHistory = history.length;

    return {
      total,
      expired,
      urgent,
      warning,
      safe: total - expired - urgent - warning,
      consumed,
      discarded,
      totalHistory,
      wasteRate: totalHistory > 0 ? Math.round((discarded / totalHistory) * 100) : 0,
    };
  },

  getExpiringItems: () => {
    const { pantryItems } = get();
    return pantryItems
      .map(item => ({
        ...item,
        daysLeft: getDaysUntilExpiry(item),
        urgency: getUrgencyLevel(getDaysUntilExpiry(item))
      }))
      .filter(item => item.urgency !== 'safe')
      .sort((a, b) => a.daysLeft - b.daysLeft);
  },

  // ==========================================
  // 5. RECIPES STATE
  // ==========================================
  savedRecipeIds: new Set(),
  shoppingList: [],
  recipeReviews: [],

  toggleSaveRecipe: (recipeId) => set((state) => {
    const next = new Set(state.savedRecipeIds);
    if (next.has(recipeId)) {
      next.delete(recipeId);
      get().showToast('Đã bỏ lưu công thức', 'success');
    } else {
      next.add(recipeId);
      get().showToast('Đã lưu công thức!', 'success');
    }
    return { savedRecipeIds: next };
  }),

  addToShoppingList: (items) => set((state) => {
    const newItems = items.map(item => ({
      ...item,
      id: `shop_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      checked: false,
      addedAt: new Date().toISOString(),
    }));
    get().showToast(`Đã thêm ${items.length} nguyên liệu vào checklist`, 'success');
    return { shoppingList: [...newItems, ...state.shoppingList] };
  }),

  submitReview: (recipeId, reviewData) => set((state) => {
    const review = {
      id: `review_${Date.now()}`,
      recipeId,
      ...reviewData,
      createdAt: new Date().toISOString(),
    };
    get().showToast('Cảm ơn bạn đã đánh giá!', 'success');
    return { recipeReviews: [review, ...state.recipeReviews] };
  }),

  // ==========================================
  // 6. GAMIFICATION & HEALTH TRACKING
  // ==========================================
  weightHistory: [], 
  currentStreak: 0,  
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

  updateGoalOrActivity: async (field, value) => {
    const state = get();
    const profile = state.userProfile;
    if (!profile) return;

    const formData = {
      gender: profile.gender,
      age: profile.age,
      height: profile.height,
      weight: profile.weight,
      activity: field === 'activity' ? value : profile.activity,
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
  }

}));