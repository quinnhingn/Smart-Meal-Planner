// src/components/common/CustomToast.js
import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

const CustomToast = () => {
  const { toastInfo } = useAppStore();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (toastInfo.visible) {
      // Trượt xuống
      Animated.spring(translateY, {
        toValue: insets.top > 0 ? insets.top + 10 : 40,
        useNativeDriver: true,
        bounciness: 12,
      }).start();
    } else {
      // Trượt lên ẩn đi
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [toastInfo.visible]);

  if (!toastInfo.visible && translateY._value === -100) return null;

  const isSuccess = toastInfo.type === 'success';

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <View style={[styles.toastBox, isSuccess ? styles.successBox : styles.errorBox]}>
        <Ionicons 
            name={isSuccess ? "checkmark-circle" : "alert-circle"} 
            size={24} 
            color={isSuccess ? COLORS.success : COLORS.danger}
        />
        <Text style={styles.message}>{toastInfo.message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999, // Đảm bảo luôn nằm trên cùng
    ...Platform.select({ web: { position: 'fixed' } })
  },
  toastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    minWidth: '70%',
    maxWidth: '90%',
  },
  successBox: { borderLeftWidth: 4, borderLeftColor: COLORS.success }, 
  errorBox: { borderLeftWidth: 4, borderLeftColor: COLORS.danger },   
  message: { fontSize: 14, fontWeight: '700', color: '#333' }
});

export default CustomToast;