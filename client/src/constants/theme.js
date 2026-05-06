// src/constants/theme.js

export const COLORS = {
  // 1. System Colors 
  primary: '#4CAF50',
  success: '#4CAF50',    
  secondary: '#FF9800',  
  aiFocus: '#2196F3',    
  danger: '#F44336',     
  warning: '#FFC107',    
  disabled: '#9E9E9E',   
  white: '#FFFFFF',

  // 2. Light Theme Colors (Nested & Flat cho tương thích ngược)
  background: {
    main: '#F4F7F6',     
    surface: '#FFFFFF',  
  },
  text: {
    primary: '#1A1D1E',  
    secondary: '#5C6A72',
    muted: '#9E9E9E',    
    inverse: '#FFFFFF',  
  },
  textLight: '#5C6A72', // Flat backup cho các file cũ

  // 3. Glassmorphism Colors (ĐÂY LÀ OBJECT BỊ THIẾU GÂY RA LỖI)
  glass: {
    bg: 'rgba(255, 255, 255, 0.65)', 
    border: 'rgba(255, 255, 255, 0.8)',
    shadow: 'rgba(0, 0, 0, 0.05)', 
  },

  macros: {
    protein: '#E53935',
    carbs: '#29B6F6',
    fat: '#FBC02D',
  }
};

export const BREAKPOINTS = {
  mobileMax: 768,
};