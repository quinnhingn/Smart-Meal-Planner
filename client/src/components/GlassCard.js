// src/components/GlassCard.js
import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../constants/theme';

const GlassCard = ({ children, style, intensity = 75 }) => {
  return (
    <View style={[styles.shadowWrapper, style]}>
      <View style={styles.overflowContainer}>
        <BlurView 
          intensity={intensity} 
          tint="light" 
          style={styles.blurView}
        >
          {/* 
            Nhi lưu ý: Padding đã được đưa về 0. 
            Mọi khoảng cách lề (padding) nên được định nghĩa ở Screen hoặc Container con 
            để đảm bảo FlatList có thể chạy full-width bên trong thẻ kính.
          */}
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
    backgroundColor: 'transparent',
    ...Platform.select({
      web: { 
        // Dùng boxShadow thay vì shadow* để tránh cảnh báo deprecation trên Web
        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)' 
      },
      default: { 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 8 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 20, 
        elevation: 4 
      }
    })
  },

  overflowContainer: {
    flex: 1,
    overflow: 'hidden', // Quan trọng: Giữ cho nội dung không tràn khỏi bo góc 24px
    borderRadius: 24,
    // Giữ nguyên màu Glass cũ của Nhi
    backgroundColor: COLORS?.glass?.bg || 'rgba(255, 255, 255, 0.78)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },

  blurView: {
    width: '100%',
    height: '100%',
    padding: 0, // Đã đưa về 0 để tối ưu cho các luồng trượt (Slider/FlatList)
  },
});

export default GlassCard;