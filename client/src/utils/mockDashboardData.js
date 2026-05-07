// src/utils/mockDashboardData.js

export const DASHBOARD_MOCK_TRACKING = { target_kcal: 1800, consumed_kcal: 1250 };

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