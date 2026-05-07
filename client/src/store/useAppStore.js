// src/store/useAppStore.js
import { create } from 'zustand';
import { authApi } from '../services/mockApi';
import { calculateTDEEAndMacros } from '../utils/calculator';
import { MOCK_PANTRY_ITEMS, getDaysUntilExpiry, getUrgencyLevel } from '../utils/mockPantryData';

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

  updateProfile: async (updatedData) => {
    set({ isLoading: true, error: null });
    
    // Giả lập API call
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
  // 2. UI STATE (SIDEBAR)
  // ==========================================
  isDrawerOpen: false,
  setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),

  // ==========================================
  // 3. DATA STATE (NHẬT KÝ & TỦ LẠNH)
  // ==========================================
  diaryItems: [],
  pantryItems: MOCK_PANTRY_ITEMS,
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

  // Thêm 1 món ăn vào Nhật ký
  addDiaryItem: async (item) => {
    set({ isSaving: true });
    await new Promise(resolve => setTimeout(resolve, 1500));

    set((state) => ({
      diaryItems: [
        { ...item, id: `diary_${Date.now()}`, createdAt: new Date().toISOString() }, 
        ...state.diaryItems
      ],
      isSaving: false
    }));
    
    get().showToast('Đã thêm món ăn vào Nhật ký!', 'success');
  },

  // Thêm nhiều nguyên liệu vào Tủ lạnh
  addPantryItems: async (items) => {
    set({ isSaving: true });
    
    // Giả lập thời gian Call API (nhanh hơn một chút để UX mượt hơn)
    await new Promise(resolve => setTimeout(resolve, 800));

    set((state) => {
      const now = new Date().toISOString();
      const newItems = items.map(item => ({ 
        ...item, 
        // Tạo ID chuẩn chuỗi
        id: item.id || `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        // FIX BUG: Phải có addedAt để hàm getDaysUntilExpiry tính toán đúng
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

  // Xóa 1 món ăn khỏi Nhật ký
  removeDiaryItem: (id) => set((state) => ({
    diaryItems: state.diaryItems.filter(item => item.id !== id)
  })),

  // ==========================================
  // 4. PANTRY MANAGEMENT
  // ==========================================
  
  clearPantryHistory: () => set({ pantryHistory: [] }),

  // Hoàn tác: Đưa item từ lịch sử quay lại tủ lạnh
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
      addedAt: new Date().toISOString(), // Đặt lại ngày nhập là hôm nay để tính lại hạn
      expiryDays: histItem.originalExpiryDays || 3,
    };

    return {
      pantryHistory: state.pantryHistory.filter(h => h.id !== historyId),
      pantryItems: [restoredItem, ...state.pantryItems]
    };
  }),

  // Dùng một phần: Trừ kho và ghi lịch sử
  consumePantryItem: (id, amount, reason = 'consumed') => {
    const item = get().pantryItems.find(i => i.id === id);
    if (!item) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const historyEntry = {
      id: `hist_${Date.now()}`,
      itemId: item.id,
      name: item.name,
      quantity: amountNum, // Chỉ lưu lượng đã dùng vào lịch sử
      unit: item.unit,
      icon: item.icon,
      action: reason,
      usedAt: new Date().toISOString(),
      originalExpiryDays: item.expiryDays,
    };

    if (amountNum >= item.quantity) {
      // Dùng hết sạch -> Xóa item khỏi tủ
      set((state) => ({
        pantryItems: state.pantryItems.filter(i => i.id !== id),
        pantryHistory: [historyEntry, ...state.pantryHistory]
      }));
    } else {
      // Dùng một phần -> Trừ số lượng hiện có
      set((state) => ({
        pantryItems: state.pantryItems.map(i =>
          i.id === id ? { ...i, quantity: i.quantity - amountNum } : i
        ),
        pantryHistory: [historyEntry, ...state.pantryHistory]
      }));
    }
    get().showToast(`Đã dùng ${amountNum} ${item.unit} ${item.name}`, 'success');
  },
  
  // Xóa nguyên liệu + ghi lịch sử
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
      action: reason, // 'consumed' | 'expired' | 'discarded'
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

  // Cập nhật nguyên liệu
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

  // Lấy danh sách đã lọc & sắp xếp (ưu tiên sắp hết hạn)
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

  // Lấy thống kê tủ lạnh
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

  // Lấy danh sách cần nhắc nhở (sắp hết hạn)
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
  // 5. GAMIFICATION & HEALTH TRACKING
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