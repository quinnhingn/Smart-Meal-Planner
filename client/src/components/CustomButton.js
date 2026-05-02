// src/components/CustomButton.js
import React from 'react';
import { Text, StyleSheet, Pressable, Platform, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const CustomButton = ({ title, onPress, type = 'primary', style, isLoading = false, icon, disabled = false }) => {
  const isGlass = type === 'glass';

  const getBgColor = () => {
    if (type === 'secondary') return COLORS.secondary;
    if (type === 'danger') return COLORS.danger;
    if (type === 'ai') return COLORS.aiFocus;
    if (isGlass) return 'rgba(255, 255, 255, 0.45)';
    return COLORS.primary;
  };

  const getTextColor = () => {
    if (isGlass) return COLORS.text?.primary || '#333';
    return '#FFFFFF';
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={({ pressed, hovered }) => [
        styles.button,
        { backgroundColor: getBgColor() },
        isGlass && styles.glassStyle,
        !isGlass && styles.defaultShadow,
        pressed && styles.pressed,
        Platform.OS === 'web' && hovered && styles.hovered,
        (disabled || isLoading) && styles.disabled,
        style
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.contentRow}>
          {icon && <Ionicons name={icon} size={20} color={getTextColor()} style={styles.icon} />}
          {title && <Text style={[styles.text, { color: getTextColor() }]} numberOfLines={2}>{title}</Text>}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // Thêm cursor cho Web như yêu cầu[cite: 1]
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  defaultShadow: {
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.12)' }, // Sửa lỗi shadow deprecated[cite: 1]
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 }
    })
  },
  glassStyle: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  contentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  icon: { marginRight: 8 },
  text: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  hovered: { opacity: 0.92, transform: [{ scale: 1.02 }] },
  disabled: { opacity: 0.5 }
});

export default CustomButton;