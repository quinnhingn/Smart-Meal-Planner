// src/services/api.js
import axios from 'axios';
import { useAppStore } from '../store/useAppStore';

// Thay bằng IP máy của bạn khi chạy Flask (VD: http://192.168.1.x:5000)
// Trên Web có thể dùng localhost
const BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Interceptor tự động nhét Token vào Header nếu đã đăng nhập
apiClient.interceptors.request.use(
  (config) => {
    const token = useAppStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    // Fallback UI xịn xò: trả về object báo lỗi thay vì quăng Exception gây crash màn hình
    console.error(`[API Error] ${method} ${endpoint}:`, error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Có lỗi kết nối máy chủ. Vui lòng thử lại!' 
    };
  }
};

export default apiClient;