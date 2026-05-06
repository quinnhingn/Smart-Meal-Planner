// src/store/useAppStore.js
import { create } from 'zustand';
import { authApi } from '../services/mockApi';
import { calculateTDEEAndMacros } from '../utils/calculator';

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
    
    // Giả lập API call (1 giây)
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
  pantryItems: [],
  isSaving: false, // Trạng thái Loading khi lưu DB
  
  // State của Custom Toast
  toastInfo: { visible: false, message: '', type: 'success' },

  showToast: (message, type = 'success') => {
    set({ toastInfo: { visible: true, message, type } });
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
      set({ toastInfo: { visible: false, message: '', type: 'success' } });
    }, 3000);
  },

  hideToast: () => set((state) => ({ toastInfo: { ...state.toastInfo, visible: false } })),

  // Thêm 1 món ăn vào Nhật ký (Có giả lập API Loading)
  addDiaryItem: async (item) => {
    set({ isSaving: true });
    
    // Giả lập thời gian Call API lên Neon DB mất 1.5s
    await new Promise(resolve => setTimeout(resolve, 1500));

    set((state) => ({
      diaryItems: [
        { ...item, id: Date.now(), createdAt: new Date().toISOString() }, 
        ...state.diaryItems
      ],
      isSaving: false
    }));
    
    get().showToast('Đã thêm món ăn vào Nhật ký!', 'success');
  },

  // Thêm nhiều nguyên liệu vào Tủ lạnh
  addPantryItems: async (items) => {
    set({ isSaving: true });
    await new Promise(resolve => setTimeout(resolve, 1500));

    set((state) => {
      const newItems = items.map(item => ({ 
        ...item, 
        id: item.id || Date.now() + Math.random(),
        createdAt: new Date().toISOString() 
      }));
      return { 
        pantryItems: [...newItems, ...state.pantryItems],
        isSaving: false
      };
    });

    get().showToast(`Đã nhập ${items.length} nguyên liệu vào tủ lạnh!`, 'success');
  },

  // Xóa 1 món ăn khỏi Nhật ký
  removeDiaryItem: (id) => set((state) => ({
    diaryItems: state.diaryItems.filter(item => item.id !== id)
  })),

  // Xóa 1 nguyên liệu khỏi Tủ lạnh
  removePantryItem: (id) => set((state) => ({
    pantryItems: state.pantryItems.filter(item => item.id !== id)
  })),

  // ==========================================
  // 4. GAMIFICATION & HEALTH TRACKING
  // ==========================================
  weightHistory: [], // Lịch sử cân nặng: [{ date, weight }]
  currentStreak: 0,  // Chuỗi ngày kỷ luật
  lastLogDate: null, // Ngày log bữa ăn gần nhất

  // Gọi hàm này mỗi khi user thêm món ăn vào Nhật ký
  logMeal: () => set((state) => {
    const today = new Date().toDateString();
    if (state.lastLogDate !== today) {
      return { 
        currentStreak: state.currentStreak + 1,
        lastLogDate: today
      };
    }
    return state; // Đã log hôm nay rồi thì không tăng nữa
  }),

  // Gọi hàm này khi Weekly Check-in (Cập nhật cân nặng)
  checkInWeight: async (newWeight) => {
    const state = get();
    const profile = state.userProfile;
    if (!profile) return false;

    // 1. Lưu vào lịch sử
    const newRecord = { date: new Date().toISOString(), weight: newWeight };
    set({ weightHistory: [...state.weightHistory, newRecord] });

    // 2. Tính toán lại TDEE & Macros dựa trên cân nặng mới
    const formData = {
      gender: profile.gender || 'female',
      age: profile.age,
      height: profile.height,
      weight: newWeight,
      activity: profile.activity || 'light',
      goal: profile.goal || 'lose_weight'
    };
    const newMacros = calculateTDEEAndMacros(formData);

    // 3. Cập nhật Profile
    const newProfileData = {
      weight: newWeight,
      targetCalories: newMacros.tdee,
      protein_g: newMacros.protein_g,
      carbs_g: newMacros.carbs_g,
      fat_g: newMacros.fat_g,
    };

    return await state.updateProfile(newProfileData);
  },

  // Gọi hàm này khi user sửa Goal hoặc Activity từ Profile
  updateGoalOrActivity: async (field, value) => {
    const state = get();
    const profile = state.userProfile;
    if (!profile) return;

    // 1. Cập nhật field mới vào form ảo
    const formData = {
      gender: profile.gender,
      age: profile.age,
      height: profile.height,
      weight: profile.weight,
      activity: field === 'activity' ? value : profile.activity,
      goal: field === 'goal' ? value : profile.goal
    };

    // 2. Tự động tính toán lại
    const newMacros = calculateTDEEAndMacros(formData);

    // 3. Lưu toàn bộ lên DB
    await state.updateProfile({
      [field]: value,
      targetCalories: newMacros.tdee,
      protein_g: newMacros.protein_g,
      carbs_g: newMacros.carbs_g,
      fat_g: newMacros.fat_g,
    });
  }

}));