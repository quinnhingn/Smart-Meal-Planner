// src/utils/mockTrackingData.js

export const MOCK_PROFILE_STATS = {
  targetWeight: 50.0,
  targetCalories: 1800,
};

// ... (Hàm generateMockData giữ nguyên từ version trước)
const generateMockData = (days) => {
  const data = [];
  const today = new Date();
  let currentWeight = 58.0;
  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const isCheckInDay = i % 7 === 0;
    if (isCheckInDay) {
      currentWeight -= parseFloat((Math.random() * 0.4).toFixed(1));
      if (currentWeight < 51.0) currentWeight = 51.0;
    }
    const calo = Math.floor(Math.random() * (2000 - 1500 + 1)) + 1500;
    const protein = Math.floor((calo * 0.3) / 4);
    const carbs = Math.floor((calo * 0.4) / 4);
    const fat = Math.floor((calo * 0.3) / 9);
    data.push({ id: `${i}`, date: d.toISOString(), weight: parseFloat(currentWeight.toFixed(1)), calo, protein, carbs, fat, isCheckInDay });
  }
  return data;
};

export const MOCK_180D_TRACKING = generateMockData(180);

// MỚI: Dữ liệu phân tích AI
export const MOCK_AI_INSIGHTS = {
  weight: {
    title: "Phân tích Cân nặng",
    content: "Xu hướng cân nặng của Nhi đang giảm rất ổn định (-1.2kg trong tháng qua). Tuy nhiên, có dấu hiệu chững cân vào tuần thứ 3. Gợi ý: Hãy thử tăng cường các bài tập HIIT và đảm bảo ngủ đủ 7 tiếng để tối ưu trao đổi chất nhé!"
  },
  calories: {
    title: "Phân tích Dinh dưỡng",
    content: "Nhi đang tuân thủ định mức Calo rất tốt (92% số ngày đạt mục tiêu). Nhưng lưu ý: Tỉ lệ Carbs trong 3 ngày gần đây đang hơi cao (>55%). Nhi nên thay thế cơm trắng bằng khoai lang hoặc gạo lứt để giữ năng lượng bền bỉ hơn."
  }
};