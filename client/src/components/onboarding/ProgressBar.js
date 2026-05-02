// src/components/onboarding/ProgressBar.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme'; // Đảm bảo bạn đã có COLORS.primary

const ProgressBar = ({ currentStep, totalSteps = 4 }) => {
  // Tính toán phần trăm tiến độ
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <View style={[styles.fill, { width: `${progressPercentage}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)', // Nền nhạt
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
    marginVertical: 12,
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS?.primary || '#4CAF50',
    borderRadius: 4,
  },
});

export default ProgressBar;