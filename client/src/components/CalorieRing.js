// src/components/CalorieRing.js
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { getMacroColor } from '../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CalorieRing = ({ target = 1800, consumed = 0, burned = 0, size = 220 }) => {
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // V2 Net Budget Formula
  const netBudget = Math.max(target - burned, 1); // Clamp to 1 to prevent division by zero
  const percentage = Math.round((consumed / netBudget) * 100) || 0;
  const safePercentage = Math.min(percentage, 100);
  
  const targetOffset = circumference - (safePercentage / 100) * circumference;

  const animatedStrokeOffset = useRef(new Animated.Value(circumference)).current;
  const [displayNumber, setDisplayNumber] = useState(0);

  useEffect(() => {
    Animated.timing(animatedStrokeOffset, {
      toValue: targetOffset,
      duration: 1500,
      easing: Easing.out(Easing.cubic), 
      useNativeDriver: false, 
    }).start();

    let startTimestamp = null;
    const duration = 1500;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); 
      
      setDisplayNumber(Math.floor(easeProgress * percentage));
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };
    
    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [percentage, targetOffset, animatedStrokeOffset]);

  const ringColor = getMacroColor(percentage);

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
          strokeDashoffset={animatedStrokeOffset} 
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>

      <View style={styles.centerTextContainer}>
        <Text style={[styles.consumedText, { color: ringColor }]}>
          {displayNumber}%
        </Text>
        <Text style={styles.targetText}>{consumed} / {netBudget} kcal</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerTextContainer: { alignItems: 'center', justifyContent: 'center' },
  consumedText: { fontSize: 44, fontWeight: '900', color: '#1A1D1E', lineHeight: 50 },
  targetText: { fontSize: 13, fontWeight: '600', color: '#888', marginTop: 4 },
});

export default CalorieRing;