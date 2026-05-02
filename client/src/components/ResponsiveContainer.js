// src/components/ResponsiveContainer.js
import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform, ImageBackground } from 'react-native';
import { COLORS, BREAKPOINTS } from '../constants/theme';

const bgImage = require('../../assets/bg.png'); 

const ResponsiveContainer = ({ children, style, useImageBg = false }) => {
  const { width } = useWindowDimensions();
  const isWebLarge = Platform.OS === 'web' && width > BREAKPOINTS.mobileMax;

  // Nội dung lõi (Các form nhập liệu)
  const innerContent = (
    <View style={[
      styles.container, 
      isWebLarge && styles.webContainer, 
      style
    ]}>
      {children}
    </View>
  );

  // Nếu dùng ảnh nền (Cho màn Login, Register, Onboarding)
  if (useImageBg) {
    return (
      <ImageBackground source={bgImage} style={styles.fullScreenBg} resizeMode="cover">
        <View style={styles.overlay}>
          {innerContent}
        </View>
      </ImageBackground>
    );
  }

  // Nếu dùng nền màu trơn (Cho các màn Main App như Dashboard)
  return (
    <View style={[styles.fullScreenBg, { backgroundColor: COLORS.background?.main || '#F4F7F6' }]}>
      <View style={styles.overlay}>
         {innerContent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenBg: {
    flex: 1,
    width: '100%',
    height: '100%', // Bắt buộc để Web phủ background ra sát mép trình duyệt
  },
  overlay: {
    flex: 1,
    width: '100%',
    alignItems: 'center',     // Căn giữa Form theo chiều ngang
    justifyContent: 'center', // Căn giữa Form theo chiều dọc
    backgroundColor: 'rgba(0, 0, 0, 0.15)', // Lớp phủ làm tối ảnh nền 1 chút để GlassCard trắng nổi bật hơn
  },
  container: {
    flex: 1,
    width: '100%',
    padding: 16,
    justifyContent: 'center',
  },
  webContainer: {
    flex: 'none',
    maxWidth: 480,
    width: '100%',
    padding: 0,
    marginVertical: 30,
  },
});

export default ResponsiveContainer;