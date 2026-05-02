// src/utils/onboardingData.js

export const ONBOARDING_STEPS = [
  { id: '1', title: 'Hãy cho chúng tôi biết về bạn', subtitle: 'Thông tin này giúp chúng tôi cá nhân hóa kế hoạch luyện tập của bạn.' },
  { id: '2', title: 'Mục tiêu của bạn là gì?', subtitle: 'Chọn mục tiêu phù hợp nhất với thể trạng hiện tại của bạn.' },
  { id: '3', title: 'Bạn vận động như thế nào?', subtitle: 'Điều này giúp chúng tôi tính toán lượng calo cần thiết hàng ngày của bạn.' },
  { id: '4', title: 'Bạn có kiêng kỵ gì không?', subtitle: 'Giúp chúng tôi gợi ý món ăn chính xác hơn.' },
  { id: '5', title: 'Kết quả của bạn', subtitle: 'Mục tiêu calo hàng ngày tối ưu để đạt được vóc dáng của bạn.' },
];

export const GOALS = [
  { id: 'lose_weight', title: 'Giảm cân', description: 'Tạo thâm hụt calo hợp lý', icon: '🔥' },
  { id: 'maintain', title: 'Giữ dáng', description: 'Nạp đủ calo để duy trì', icon: '⚖️' },
  { id: 'gain_muscle', title: 'Tăng cơ', description: 'Nạp đủ protein và năng lượng', icon: '💪' },
];

export const ACTIVITY_LEVELS = [
  { id: 'sedentary', title: 'Ít vận động', description: 'Ngồi nhiều, không tập' },
  { id: 'light', title: 'Nhẹ', description: 'Đi bộ, tập 1-2 buổi/tuần' },
  { id: 'moderate', title: 'Vừa phải', description: 'Tập 3-5 buổi/tuần' },
  { id: 'active', title: 'Năng động', description: 'Tập nặng hàng ngày' },
];

export const ALLERGIES = [
  { id: 'seafood', label: 'Hải sản' },
  { id: 'peanut', label: 'Đậu phộng' },
  { id: 'milk', label: 'Sữa' },
  { id: 'gluten', label: 'Gluten' },
  { id: 'egg', label: 'Trứng' },
];

export const DIETS = [
  { id: 'none', label: 'Bình thường' },
  { id: 'vegetarian', label: 'Chay' },
  { id: 'vegan', label: 'Thuần chay' },
  { id: 'keto', label: 'Keto' },
];