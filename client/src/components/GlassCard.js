// src/components/GlassCard.js
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../constants/theme';

const GlassCard = ({ children, style, intensity = 50 }) => {
  return (
    <View style={[styles.cardContainer, style]}>
      <BlurView intensity={intensity} tint="light" style={styles.blurView}>
        {children}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Fallback màu nền trong suốt
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)', // Viền kính
    marginVertical: 8,
  },
  blurView: {
    padding: 16,
  },
});

export default GlassCard;