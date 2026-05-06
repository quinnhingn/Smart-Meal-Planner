// src/components/CalorieRing.js
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

// Bọc Circle bằng Animated MẶC ĐỊNH của React Native (Không dùng reanimated)
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CalorieRing = ({ target = 1800, consumed = 0, size = 220 }) => {
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Giới hạn max là 100% vòng
  const safeConsumed = Math.min(consumed, target);
  const targetOffset = circumference - (safeConsumed / target) * circumference;

  // Sử dụng Animated.Value của React Native
  const animatedStrokeOffset = useRef(new Animated.Value(circumference)).current;

  // State cho hiệu ứng đếm số
  const [displayNumber, setDisplayNumber] = useState(0);

  useEffect(() => {
    // 1. Kích hoạt Animation vòng quay
    Animated.timing(animatedStrokeOffset, {
      toValue: targetOffset,
      duration: 1500,
      easing: Easing.out(Easing.cubic), // Gia tốc mượt
      useNativeDriver: false, // Bắt buộc false khi animate thuộc tính SVG
    }).start();

    // 2. Kích hoạt Animation đếm số bằng JS thuần
    let startTimestamp = null;
    const duration = 1500;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); 
      
      setDisplayNumber(Math.floor(easeProgress * consumed));
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };
    
    animationFrameId = requestAnimationFrame(step);

    // Dọn dẹp memory leak nếu component unmount
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [consumed, target, targetOffset, animatedStrokeOffset]);

  const isOverKcal = consumed > target;
  const ringColor = isOverKcal ? '#F44336' : '#4CAF50'; 

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(0,0,0,0.05)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          // Truyền trực tiếp Animated.Value vào thuộc tính
          strokeDashoffset={animatedStrokeOffset} 
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>

      <View style={styles.centerTextContainer}>
        <Text style={[styles.consumedText, isOverKcal && { color: '#F44336' }]}>
          {displayNumber}
        </Text>
        <Text style={styles.divider}>/</Text>
        <Text style={styles.targetText}>{target} kcal</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerTextContainer: { alignItems: 'center', justifyContent: 'center' },
  consumedText: { fontSize: 44, fontWeight: '900', color: '#1A1D1E' },
  divider: { fontSize: 16, color: '#999', marginVertical: -4 },
  targetText: { fontSize: 16, fontWeight: '600', color: '#666' },
});

export default CalorieRing;