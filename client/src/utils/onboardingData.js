// src/utils/onboardingData.js

export const ONBOARDING_STEPS = [
  { id: '1', title: 'Thông tin cơ bản', subtitle: 'Để tính toán chỉ số cơ thể của bạn.' },
  { id: '2', title: 'Mục tiêu', subtitle: 'Bạn muốn đạt được điều gì?' },
  { id: '3', title: 'Thể trạng & Tốc độ', subtitle: 'Tối ưu hóa kế hoạch theo cơ địa của bạn.' },
  { id: '4', title: 'Vận động', subtitle: 'Mức độ hoạt động hàng ngày của bạn.' },
  { id: '5', title: 'Sở thích ăn uống', subtitle: 'Món bạn thích và thực phẩm cần tránh.' },
  { id: '6', title: 'Kế hoạch của bạn', subtitle: 'Lộ trình tối ưu để đạt mục tiêu.' },
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

export const DISLIKES = [
  { id: 'cilantro', label: 'Rau mùi' },
  { id: 'bitter_melon', label: 'Mướp đắng' },
  { id: 'onion', label: 'Hành tây' },
  { id: 'garlic', label: 'Tỏi' },
  { id: 'durian', label: 'Sầu riêng' },
];

export const BODY_TYPES = [
  { id: 'ectomorph', title: 'Gầy', description: 'Khó tăng cân, người mỏng', icon: 'body-outline' },
  { id: 'mesomorph', title: 'Cân đối', description: 'Dễ tăng cơ, dáng người chuẩn', icon: 'man-outline' },
  { id: 'endomorph', title: 'Tròn trịa', description: 'Dễ tích mỡ, xương to', icon: 'accessibility-outline' },
];

export const PACE_OPTIONS = [
  { id: 'slow', title: 'Từ từ', description: 'Dễ duy trì, thoải mái' },
  { id: 'normal', title: 'Tiêu chuẩn', description: 'Khuyến nghị bởi chuyên gia' },
  { id: 'fast', title: 'Thần tốc', description: 'Cần kỷ luật cao' },
];