// src/services/api.js
import axios from 'axios';

// Port 5001 dành riêng cho Client Backend (Admin dùng port 5000)
// Dùng IP LAN thay vì localhost để Expo trên điện thoại kết nối được
const BASE_URL = 'http://192.168.1.84:5001/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Interceptor tự động nhét Token vào Header nếu đã đăng nhập
apiClient.interceptors.request.use(
  (config) => {
    // Phá vỡ vòng lặp (circular dependency) bằng cách require trực tiếp trong hàm
    try {
      const { useAppStore } = require('../store/useAppStore');
      const token = useAppStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignore errors during initialization
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Wrapper chuẩn hóa việc gọi API với Try/Catch
export const fetchApi = async (method, endpoint, data = null) => {
  try {
    const response = await apiClient({
      method,
      url: endpoint,
      data,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`[API Error] ${method} ${endpoint}:`, error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Có lỗi kết nối máy chủ. Vui lòng thử lại!'
    };
  }
};

// ===========================================
// AUTH API — Gọi trực tiếp không cần token
// ===========================================
export const authApi = {
  register: async (name, email, password) => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/register`, { name, email, password });
      return res.data; // { success, message, data: { token, user } }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi kết nối máy chủ'
      };
    }
  },

  login: async (email, password) => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
      return res.data; // { success, message, data: { token, user } }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi kết nối máy chủ'
      };
    }
  },

  getProfile: async () => {
    return await fetchApi('GET', '/user/profile');
  },

  setupProfile: async (data) => {
    return await fetchApi('POST', '/user/profile', data);
  }
};

// ===========================================
// RECIPE API — Tra cứu dinh dưỡng & công thức
// ===========================================
export const recipeApi = {
  lookup: async (name) => {
    return await fetchApi('GET', `/recipes/lookup?name=${encodeURIComponent(name)}`);
  },
  logMeal: async (mealData) => {
    return await fetchApi('POST', '/recipes/log', mealData);
  },
  getDailySummary: async () => {
    return await fetchApi('GET', '/recipes/daily-summary');
  },
  importToPantry: async (items) => {
    return await fetchApi('POST', '/recipes/pantry/import', { items });
  }
};

export default apiClient;