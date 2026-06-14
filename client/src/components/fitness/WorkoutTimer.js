import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Audio } from 'expo-av';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const WorkoutTimer = ({ 
  duration, 
  isPaused, 
  onComplete, 
  isRestMode = false 
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(null);
  const totalPausedTimeRef = useRef(0);
  const requestRef = useRef(null);
  const soundRef = useRef(new Audio.Sound());
  
  // Tránh việc beep nhiều lần trong cùng 1 giây
  const lastBeepedSecondRef = useRef(null);

  // Cấu hình SVG
  const size = 200;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Giá trị animation
  const progressAnim = useRef(new Animated.Value(1)).current;

  // Use refs to always access latest props in the animation loop without recreating the loop
  const durationRef = useRef(duration);
  const isPausedRef = useRef(isPaused);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => { durationRef.current = duration; }, [duration]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Load audio 
  useEffect(() => {
    const loadAudio = async () => {
      try {
        await soundRef.current.loadAsync(require('../../../assets/sounds/beep.mp3'));
      } catch (error) {
        console.warn("Could not load beep sound", error);
      }
    };
    loadAudio();
    return () => {
      soundRef.current.unloadAsync();
    };
  }, []);

  const playBeep = async () => {
    try {
      if (soundRef.current._loaded) {
        await soundRef.current.replayAsync();
      }
    } catch (e) {}
  };

  const tick = () => {
    if (isPausedRef.current) {
      requestRef.current = requestAnimationFrame(tick);
      return;
    }

    const now = Date.now();
    const elapsed = now - startTimeRef.current - totalPausedTimeRef.current;
    const remaining = Math.max(0, durationRef.current - elapsed / 1000);
    
    setTimeLeft(remaining);

    const progress = remaining / durationRef.current;
    progressAnim.setValue(progress);

    // Beep tại 3, 2, 1 giây cuối
    const currentSecond = Math.ceil(remaining);
    if (currentSecond <= 3 && currentSecond > 0 && currentSecond !== lastBeepedSecondRef.current) {
      playBeep();
      lastBeepedSecondRef.current = currentSecond;
    }

    if (remaining <= 0) {
      setTimeLeft(0);
      progressAnim.setValue(0);
      onCompleteRef.current();
    } else {
      requestRef.current = requestAnimationFrame(tick);
    }
  };

  useEffect(() => {
    // Reset timer state
    setTimeLeft(duration);
    progressAnim.setValue(1);
    totalPausedTimeRef.current = 0;
    startTimeRef.current = Date.now();
    lastBeepedSecondRef.current = null;
    pausedTimeRef.current = null;
    
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    requestRef.current = requestAnimationFrame(tick);
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [duration]);

  useEffect(() => {
    if (isPaused) {
      pausedTimeRef.current = Date.now();
    } else {
      if (pausedTimeRef.current) {
        totalPausedTimeRef.current += Date.now() - pausedTimeRef.current;
        pausedTimeRef.current = null;
      }
    }
  }, [isPaused]);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0]
  });

  const displayTime = Math.ceil(timeLeft);
  const minutes = Math.floor(displayTime / 60).toString().padStart(2, '0');
  const seconds = (displayTime % 60).toString().padStart(2, '0');

  // Màu sắc dựa trên chế độ (Nghỉ ngơi hay Tập luyện)
  const strokeColor = isRestMode ? '#FFB74D' : '#4CAF50';
  const shadowColor = isRestMode ? 'rgba(255, 183, 77, 0.4)' : 'rgba(76, 175, 80, 0.4)';

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={{
        shadowColor: shadowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 10,
      }}>
        {/* Vòng tròn nền */}
        <Circle
          stroke="rgba(255,255,255,0.1)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Vòng tròn Progress */}
        <AnimatedCircle
          stroke={strokeColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size/2}, ${size/2}`}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.timeText, { color: strokeColor }]}>
          {minutes}:{seconds}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  textContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  }
});

export default WorkoutTimer;
