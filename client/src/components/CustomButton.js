// src/components/CustomButton.js
import React from 'react';
import { Text, StyleSheet, Pressable, Platform, ActivityIndicator, View } from 'react-native';
import { COLORS } from '../constants/theme';

const CustomButton = ({ title, onPress, type = 'primary', style, isLoading = false, icon, disabled = false }) => {
  const getBgColor = () => {
    if (type === 'secondary') return COLORS.secondary;
    if (type === 'danger') return COLORS.danger;
    if (type === 'ai') return COLORS.aiFocus;
    if (type === 'glass') return 'rgba(255, 255, 255, 0.6)'; // Nút kính sáng
    return COLORS.primary;
  };

  const getTextColor = () => {
    if (type === 'glass') return COLORS.text?.primary || '#333'; // Chữ tối cho nút kính
    return COLORS.white;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={({ pressed, hovered }) => [
        styles.button,
        { backgroundColor: getBgColor() },
        type === 'glass' && styles.glassBorder, // Thêm viền nếu là nút kính
        pressed && styles.pressed,
        hovered && styles.hovered,
        Platform.OS === 'web' && { cursor: (disabled || isLoading) ? 'not-allowed' : 'pointer' },
        (disabled || isLoading) && styles.disabled,
        style
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          {title && <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  glassBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowOpacity: 0.05,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginHorizontal: 4,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  hovered: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  }
});

export default CustomButton;