// src/utils/mockDashboardData.js

export const DASHBOARD_MOCK_TRACKING = { target_kcal: 1800, consumed_kcal: 1250, burned_kcal: 250 };

export const DASHBOARD_MOCK_MACROS = {
  protein: { current: 80, target: 120, color: '#E53935' }, 
  carbs: { current: 140, target: 200, color: '#29B6F6' },  
  fat: { current: 35, target: 50, color: '#FBC02D' },      
};

export const DASHBOARD_MOCK_MEAL_LOGS = { 
  breakfast: 320, 
  lunch: 650, 
  dinner: null,
  snacks: [
    { id: 's1', name: 'Bữa phụ 1', kcal: 120 }
  ] 
};

export const DASHBOARD_MOCK_PANTRY_ALERTS = [
  { id: '1', name: 'Thịt bò nguội', status: 'out_of_stock', msg: 'Đã hết hàng' },
  { id: '2', name: 'Sữa tươi', status: 'expiring', msg: 'Hết hạn trong 1 ngày' },
];

export const DASHBOARD_MOCK_STREAK = {
  days: 5,
  hasLoggedToday: false, // Thay đổi thành true để xem UI biến mất cảnh báo
};

export const DASHBOARD_MOCK_WEEKLY_STATS = [
  { id: '1', day: 'T2', kcal: 1800, target: 1800 },
  { id: '2', day: 'T3', kcal: 1950, target: 1800 }, // Vượt mục tiêu (sẽ hiển thị màu Đỏ)
  { id: '3', day: 'T4', kcal: 1700, target: 1800 },
  { id: '4', day: 'T5', kcal: 1800, target: 1800 },
  { id: '5', day: 'T6', kcal: 450, target: 1800 },  // Hôm nay (mới ăn sáng)
  { id: '6', day: 'T7', kcal: 0, target: 1800 },
  { id: '7', day: 'CN', kcal: 0, target: 1800 },
];

const eightDaysAgo = new Date();
eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

export const DASHBOARD_MOCK_WEIGHT_HISTORY = [
  { date: eightDaysAgo.toISOString(), weight: 55.0 } 
];

export const DASHBOARD_MOCK_RECOMMENDATIONS = [
  {
    id: 'r1',
    name: 'Salad Gà Nướng Mật Ong',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
    time: '20 phút',
    difficulty: 'Dễ',
    match_percent: 95,
    calories: 350,
    fill_percent: { protein: 90, carbs: 20, fat: 40 },
    macros: { protein: 30, carbs: 20, fat: 15 }
  },
  {
    id: 'r2',
    name: 'Cá Hồi Áp Chảo',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=300&q=80',
    time: '25 phút',
    difficulty: 'Trung bình',
    match_percent: 88,
    calories: 420,
    fill_percent: { protein: 85, carbs: 10, fat: 60 },
    macros: { protein: 35, carbs: 5, fat: 25 }
  },
  {
    id: 'r3',
    name: 'Bún Gạo Lứt Trộn',
    image: 'https://images.unsplash.com/photo-1559981421-423c4a037bce?auto=format&fit=crop&w=300&q=80',
    time: '15 phút',
    difficulty: 'Dễ',
    match_percent: 82,
    calories: 310,
    fill_percent: { protein: 30, carbs: 80, fat: 20 },
    macros: { protein: 12, carbs: 50, fat: 8 }
  },
  {
    id: 'r4',
    name: 'Sữa Chua Hy Lạp Trái Cây',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=300&q=80',
    time: '5 phút',
    difficulty: 'Dễ',
    match_percent: 75,
    calories: 200,
    fill_percent: { protein: 40, carbs: 30, fat: 15 },
    macros: { protein: 15, carbs: 25, fat: 5 }
  },
  {
    id: 'r5',
    name: 'Ức Gà Xào Nấm',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=300&q=80',
    time: '18 phút',
    difficulty: 'Dễ',
    match_percent: 70,
    calories: 280,
    fill_percent: { protein: 75, carbs: 15, fat: 30 },
    macros: { protein: 25, carbs: 10, fat: 12 }
  }
];