// src/store/useAppStore.js
import { create } from 'zustand';
import { authApi } from '../services/api';

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
        // Gộp thông tin User (có name) và Profile (có calories) lại làm một
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
        // Gộp tương tự cho lúc đăng ký
        userProfile: { ...response.data.user, ...response.data.profile },
        hasProfile: false, // Sau đăng ký sẽ được đưa sang Onboarding
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
  }))
}));