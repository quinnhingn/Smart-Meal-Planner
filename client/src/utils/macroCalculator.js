// src/utils/macroCalculator.js

// Bóc tách khối lượng thành số (gram)
export const parseAmountToGrams = (amountStr) => {
  if (!amountStr) return 0;
  // Tìm các cụm số và đơn vị đi kèm (g, kg, ml, l)
  const match = amountStr.toString().toLowerCase().match(/([\d.]+)\s*(g|kg|ml|l)?/);
  if (!match) return 0;
  
  let value = parseFloat(match[1]);
  const unit = match[2];
  
  if (unit === 'kg' || unit === 'l') value *= 1000;
  // ml quy đổi tương đương g cho nguyên liệu lỏng thông thường
  return value;
};

// Tính toán vĩ mô dựa trên 100g chuẩn
export const calculateRowMacros = (baseMacros, amountStr) => {
  const grams = parseAmountToGrams(amountStr);
  const ratio = grams / 100;
  
  return {
    calories: Math.round(baseMacros.calories * ratio) || 0,
    protein: Math.round(baseMacros.protein * ratio * 10) / 10 || 0,
    carbs: Math.round(baseMacros.carbs * ratio * 10) / 10 || 0,
    fat: Math.round(baseMacros.fat * ratio * 10) / 10 || 0,
  };
};