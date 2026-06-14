// src/constants/theme.js
// NutriLens V2 — Single source of truth for all design tokens
// Mobile-only (iOS + Android). No web-specific tokens.

import { Platform } from 'react-native';

// ─── COLORS ─────────────────────────────────────────────────────────
export const COLORS = {
  // 1. System / Semantic
  primary: '#4CAF50',
  success: '#4CAF50',
  secondary: '#FF9800',
  aiFocus: '#2196F3',
  danger: '#F44336',
  warning: '#FFC107',
  disabled: '#9E9E9E',
  white: '#FFFFFF',

  // 2. Backgrounds
  pastelBg: '#EFF7EE',          // Soft pastel green — main app background
  pastelSurface: '#FAFFFB',     // GlassCard surface tint

  // 3. Text
  text: {
    primary: '#1A1D1E',
    secondary: '#5C6A72',
    muted: '#9E9E9E',
    inverse: '#FFFFFF',
  },

  // 4. Glassmorphism
  glass: {
    bg: 'rgba(255, 255, 255, 0.65)',
    border: 'rgba(255, 255, 255, 0.8)',
    shadow: 'rgba(0, 0, 0, 0.05)',
  },

  // 5. Macro nutrient colors
  macros: {
    protein: '#E53935',
    carbs: '#29B6F6',
    fat: '#FBC02D',
  },

  // 6. V2 Dynamic Macro Threshold Colors
  // Used by MacroBar to auto-color based on percentage of target
  macroThreshold: {
    under: '#FF9800',    // 🟠 Orange  — 0–89% of target
    onTarget: '#4CAF50', // 🟢 Green   — 90–110% of target
    over: '#E53935',     // 🔴 Red     — >110% of target
  },

  // 7. Dark Mode (Fitness Hub Active Workout)
  dark: {
    bg: '#0D1117',
    surface: '#161B22',
    border: '#30363D',
    text: '#FFFFFF',
    textMuted: '#8B949E',
  },

  // 8. Deep Emerald (Fitness Active Workout V2)
  emerald: {
    bg: '#1B4332',
    surface: '#2D6A4F',
    light: '#40916C',
    accent: '#95D5B2',
    textMuted: 'rgba(255,255,255,0.6)',
  },
};

// ─── FONTS (Plus Jakarta Sans via @expo-google-fonts) ───────────────
export const FONTS = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
};

// ─── SPACING ────────────────────────────────────────────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ─── BORDER RADIUS ──────────────────────────────────────────────────
export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  full: 999,
};

// ─── SHADOWS (iOS + Android native only — no web boxShadow) ────────
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  green: {
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
};

// ─── HELPERS ────────────────────────────────────────────────────────

/**
 * Returns the V2 threshold color for a macro progress bar.
 * @param {number} percentage - consumed/target * 100
 * @returns {string} hex color
 */
export const getMacroColor = (percentage) => {
  if (percentage > 110) return COLORS.macroThreshold.over;
  if (percentage >= 90) return COLORS.macroThreshold.onTarget;
  return COLORS.macroThreshold.under;
};