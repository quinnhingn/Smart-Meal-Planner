// src/components/GlassCard.js
import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../constants/theme'; // BẮT BUỘC IMPORT COLORS CHỮ HOA

const GlassCard = ({ children, style, intensity = 70 }) => {
  return (
    <View style={[styles.cardContainer, style]}>
      <BlurView intensity={intensity} tint="light" style={styles.blurView}>
        {children}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: COLORS.glass.bg, // SỬA LỖI READING 'glass': Gọi chuẩn COLORS chữ hoa
    borderWidth: 1.5,
    borderColor: COLORS.glass.border,
    marginVertical: 10,
    
    // FIX CẢNH BÁO SHADOW DEPRECATED BẰNG CROSS-PLATFORM LOGIC
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.08)', // Web dùng chuẩn CSS
      },
      default: {
        // Mobile iOS/Android vẫn dùng chuẩn cũ
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 3, 
      }
    })
  },
  blurView: {
    padding: 24,
  },
});

export default GlassCard;