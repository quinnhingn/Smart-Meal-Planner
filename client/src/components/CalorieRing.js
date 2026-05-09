// src/components/CalorieRing.js
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CalorieRing = ({ target = 1800, consumed = 0, size = 220 }) => {
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const safeConsumed = Math.min(consumed, target);
  const targetOffset = circumference - (safeConsumed / target) * circumference;

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
      
      setDisplayNumber(Math.floor(easeProgress * consumed));
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };
    
    animationFrameId = requestAnimationFrame(step);

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
        <Text style={styles.targetText}>/ {target} kcal</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerTextContainer: { alignItems: 'center', justifyContent: 'center' },
  consumedText: { fontSize: 44, fontWeight: '900', color: '#1A1D1E', lineHeight: 50 },
  targetText: { fontSize: 16, fontWeight: '600', color: '#888', marginTop: 4 },
});

export default CalorieRing;