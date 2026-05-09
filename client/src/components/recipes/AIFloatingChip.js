// src/components/recipes/AIFloatingChip.js
import React, { useEffect, useRef } from 'react';
import { View, Pressable, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const AIFloatingChip = ({ onPress }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Animated.View style={[styles.ring, { transform: [{ scale: pulseAnim }] }]} />
      <View style={styles.button}>
        <Ionicons name="sparkles" size={24} color="#FFF" />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 100, right: 20, zIndex: 50 },
  ring: {
    position: 'absolute', width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.aiFocus + '30',
  },
  button: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.aiFocus,
    justifyContent: 'center', alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: COLORS.aiFocus, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10 },
      android: { elevation: 8 },
      web: { boxShadow: `0 4px 16px ${COLORS.aiFocus}60` },
    }),
  },
});

export default AIFloatingChip;
