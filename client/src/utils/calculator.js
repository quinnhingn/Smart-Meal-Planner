// src/utils/calculator.js

export const calculateTDEEAndMacros = (formData) => {
  const { gender, age, height, weight, targetWeight, activity, goal, bodyType, pace } = formData;
  const w = parseFloat(weight) || 0;
  const tw = parseFloat(targetWeight) || w;
  const h = parseFloat(height) || 0;
  const a = parseInt(age, 10) || 0;

  // 1. Tính BMR (Mifflin-St Jeor)
  let bmr = (10 * w) + (6.25 * h) - (5 * a);
  bmr += (gender === 'male') ? 5 : -161;

  // 2. Nhân hệ số vận động
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725
  };
  let tdee = bmr * (activityMultipliers[activity] || 1.2);

  // 3. Điều chỉnh theo mục tiêu & Tốc độ (Pace)
  let deficit = 500;
  if (pace === 'slow') deficit = 250;
  if (pace === 'fast') deficit = 750;

  let estimatedWeeks = 0;
  if (goal === 'lose_weight') {
    tdee -= deficit;
    const diff = w - tw;
    // 1kg mỡ tương đương ~7700 kcal thâm hụt
    if (diff > 0) estimatedWeeks = Math.ceil((diff * 7700) / (deficit * 7));
  } else if (goal === 'gain_muscle') {
    const surplus = pace === 'slow' ? 200 : (pace === 'fast' ? 500 : 300);
    tdee += surplus;
    const diff = tw - w;
    if (diff > 0) estimatedWeeks = Math.ceil(diff / (surplus === 200 ? 0.2 : (surplus === 500 ? 0.4 : 0.25)));
  }

  // Đảm bảo calo tối thiểu 1200 kcal
  tdee = Math.max(tdee, 1200);

  // 4. Tính Macros dựa trên tạng người (Body Type)
  let pRatio = 0.3, cRatio = 0.4, fRatio = 0.3; // Mặc định Mesomorph
  
  if (bodyType === 'ectomorph') {
    pRatio = 0.25; cRatio = 0.55; fRatio = 0.2;
  } else if (bodyType === 'endomorph') {
    pRatio = 0.35; cRatio = 0.25; fRatio = 0.4;
  }

  const protein_g = (tdee * pRatio) / 4;
  const carbs_g = (tdee * cRatio) / 4;
  const fat_g = (tdee * fRatio) / 9;

  return {
    tdee: Math.round(tdee),
    protein_g: Math.round(protein_g),
    carbs_g: Math.round(carbs_g),
    fat_g: Math.round(fat_g),
    estimatedWeeks
  };
};