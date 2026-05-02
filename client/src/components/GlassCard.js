// src/components/GlassCard.js
import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

const GlassCard = ({ children, style, intensity = 60 }) => {
  return (
    <View style={[styles.shadowWrapper, style]}>
      <View style={styles.overflowContainer}>
        <BlurView 
          // Tăng cường độ mờ trên Android để kính trông thật hơn
          intensity={Platform.OS === 'android' ? intensity * 1.5 : intensity} 
          tint="light" 
          style={styles.blurView}
        >
          {children}
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowWrapper: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 24,
    backgroundColor: 'transparent', // Giữ trong suốt
    
    // ĐIỂM SỬA QUAN TRỌNG: Quản lý bóng đổ theo từng hệ điều hành
    ...Platform.select({
      web: { 
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.08)' 
      },
      ios: { 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 6 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 16, 
      },
      android: {
        // TẮT HOÀN TOÀN ELEVATION ĐỂ FIX LỖI BÓNG ĐỔ XUYÊN THẤU
        elevation: 0, 
      }
    })
  },

  overflowContainer: {
    flex: 1,
    overflow: 'hidden', 
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)', 
    // Thêm một lớp màu cực nhẹ để Android không bị lỗi mảng đen khi render
    backgroundColor: Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
  },

  blurView: {
    flex: 1,
    padding: 0, 
  },
});

export default GlassCard;