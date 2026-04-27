// src/constants/theme.js

export const COLORS = {
  primary: '#4CAF50', // Xanh lá chủ đạo
  secondary: '#FF9800', // Cam nhấn
  aiFocus: '#2196F3', // Xanh dương cho AI/Camera
  danger: '#F44336', // Đỏ cho cảnh báo/xóa
  warning: '#FFC107', // Vàng cho cảnh báo nhẹ (sắp hết hạn)
  
  // Dinh dưỡng
  nutrition: {
    protein: '#E53935',
    carbs: '#29B6F6',
    fat: '#FBC02D',
  },

  // Nền & Chữ
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#333333',
  textLight: '#888888',
  white: '#FFFFFF',
};

// Breakpoints để xử lý layout Đa nền tảng
export const BREAKPOINTS = {
  mobileMax: 768, // Dưới 768px là Mobile, trên là Web/Tablet
};