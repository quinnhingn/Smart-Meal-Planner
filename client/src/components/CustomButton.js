// src/components/CustomButton.js
import React from 'react';
import { Text, StyleSheet, Pressable, Platform } from 'react-native';
import { COLORS } from '../constants/theme';

const CustomButton = ({ title, onPress, type = 'primary', style }) => {
  const getBgColor = () => {
    if (type === 'secondary') return COLORS.secondary;
    if (type === 'danger') return COLORS.danger;
    if (type === 'ai') return COLORS.aiFocus;
    return COLORS.primary;
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.button,
        { backgroundColor: getBgColor() },
        pressed && styles.pressed,
        hovered && styles.hovered, // Hiệu ứng hover cho Web
        // Hack JS thuần để ép cursor pointer trên Web
        Platform.OS === 'web' && { cursor: 'pointer' },
        style
      ]}
    >
      <Text style={styles.text}>{title}</Text>
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
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  text: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }], // Nhún nhẹ khi bấm trên Mobile
  },
  hovered: {
    opacity: 0.9,
  },
});

export default CustomButton;