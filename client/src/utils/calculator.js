// src/utils/calculator.js

export const calculateTDEEAndMacros = (formData) => {
  const { gender, age, height, weight, activity, goal } = formData;
  const w = parseFloat(weight) || 0;
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

  // 3. Điều chỉnh theo mục tiêu
  if (goal === 'lose_weight') tdee -= 500;
  if (goal === 'gain_muscle') tdee += 300;

  // Đảm bảo calo không tụt xuống mức nguy hiểm (tối thiểu 1200 kcal)
  tdee = Math.max(tdee, 1200);

  // 4. Tính Macros
  const protein_g = (tdee * 0.3) / 4; // 1g Protein = 4 kcal
  const carbs_g = (tdee * 0.45) / 4;  // 1g Carbs = 4 kcal
  const fat_g = (tdee * 0.25) / 9;    // 1g Fat = 9 kcal

  return {
    tdee: Math.round(tdee),
    protein_g: Math.round(protein_g),
    carbs_g: Math.round(carbs_g),
    fat_g: Math.round(fat_g)
  };
};