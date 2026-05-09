// src/utils/recipeHelpers.js

import { getDaysUntilExpiry } from './mockPantryData';

/**
 * Parse amount string like "200g", "1 quả", "300 ml" → { value, unit }
 */
export const parseAmount = (amountStr) => {
  if (!amountStr) return { value: 0, unit: '' };
  const match = amountStr.match(/^([0-9./]+)\s*(.*)$/);
  if (!match) return { value: 0, unit: amountStr };

  let value = match[1];
  if (value.includes('/')) {
    const [num, den] = value.split('/').map(Number);
    value = num / den;
  } else {
    value = Number(value);
  }

  return { value: isNaN(value) ? 0 : value, unit: match[2].trim() };
};

/**
 * Normalize name for fuzzy comparison
 */
const normalizeName = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
};

/**
 * Check if two ingredient names match (fuzzy)
 */
const namesMatch = (recipeName, pantryName) => {
  const r = normalizeName(recipeName);
  const p = normalizeName(pantryName);

  // Exact or contains
  if (r === p) return true;
  if (r.includes(p) || p.includes(r)) return true;

  // Word overlap
  const rWords = r.split(/\s+/);
  const pWords = p.split(/\s+/);
  const overlap = rWords.filter(w => pWords.includes(w));
  if (overlap.length >= Math.min(rWords.length, pWords.length) * 0.5) return true;

  return false;
};

/**
 * Compare recipe ingredients with pantry items
 * Returns: { available: [], missing: [] }
 */
export const compareWithPantry = (recipeIngredients, pantryItems) => {
  const available = [];
  const missing = [];

  recipeIngredients.forEach((ing) => {
    const match = pantryItems.find(p => namesMatch(ing.name, p.name));
    if (match) {
      available.push({ ...ing, pantryItem: match });
    } else {
      missing.push(ing);
    }
  });

  return { available, missing };
};

/**
 * Calculate total nutrition from ingredients
 */
export const calculateTotalNutrition = (ingredients) => {
  return ingredients.reduce(
    (acc, ing) => {
      acc.calories += ing.calories || 0;
      acc.protein += ing.protein || 0;
      acc.carbs += ing.carbs || 0;
      acc.fat += ing.fat || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
};

/**
 * Format cook time
 */
export const formatCookTime = (minutes) => {
  if (minutes < 60) return `${minutes} phút`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}g ${m}p` : `${h} giờ`;
};

/**
 * Get availability label and color
 */
export const getAvailabilityInfo = (missingCount, totalCount) => {
  if (missingCount === 0) {
    return { label: 'Đủ nguyên liệu', color: '#4CAF50', bgColor: '#E8F5E9' };
  }
  if (missingCount <= 2) {
    return { label: `Thiếu ${missingCount} nguyên liệu`, color: '#FF9800', bgColor: '#FFF3E0' };
  }
  return { label: `Thiếu ${missingCount} nguyên liệu`, color: '#F44336', bgColor: '#FFEBEE' };
};
