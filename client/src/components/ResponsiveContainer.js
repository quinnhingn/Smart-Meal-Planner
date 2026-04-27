// src/components/ResponsiveContainer.js
import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { COLORS, BREAKPOINTS } from '../constants/theme';

const ResponsiveContainer = ({ children, style }) => {
  const { width } = useWindowDimensions();
  const isWebLarge = Platform.OS === 'web' && width > BREAKPOINTS.mobileMax;

  return (
    <View style={[styles.wrapper, style]}>
      {/* Trên Web lớn, ta giới hạn chiều rộng thành một "điện thoại ảo" hoặc grid container */}
      <View style={[styles.container, isWebLarge && styles.webContainer]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center', // Căn giữa trên Web
  },
  container: {
    flex: 1,
    width: '100%',
  },
  webContainer: {
    maxWidth: BREAKPOINTS.mobileMax, // Giới hạn chiều rộng trên màn hình lớn
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: COLORS.surface,
  },
});

export default ResponsiveContainer;