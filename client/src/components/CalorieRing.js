// src/components/CalorieRing.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, DropShadow } from 'react-native-svg';
import { COLORS } from '../constants/theme';

const CalorieRing = ({ target = 2000, consumed = 0, size = 200, strokeWidth = 16 }) => {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  
  // Tính toán phần trăm và giới hạn không vượt quá 100% cho hình vẽ
  const percentage = Math.min((consumed / target) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Đổi màu cảnh báo nếu vượt quá mục tiêu
  const isOver = consumed > target;
  const progressColor = isOver ? COLORS.danger : COLORS.primary;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Vòng nền (Kính mờ) */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Vòng tiến độ */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${center} ${center})`} // Xoay để bắt đầu từ đỉnh (12h)
        />
      </Svg>
      
      {/* Thông tin ở giữa vòng tròn */}
      <View style={styles.textContainer}>
        <Text style={styles.consumedText}>{consumed}</Text>
        <Text style={styles.divider}>/</Text>
        <Text style={styles.targetText}>{target} kcal</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  textContainer: { alignItems: 'center', justifyContent: 'center' },
  consumedText: { fontSize: 32, fontWeight: '900', color: '#1A1D1E' },
  divider: { fontSize: 20, color: '#888', marginVertical: -4 },
  targetText: { fontSize: 16, color: '#666', fontWeight: '600' }
});

export default CalorieRing;