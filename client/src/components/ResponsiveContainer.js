// src/components/ResponsiveContainer.js
import React from 'react';
import { StyleSheet, View, ImageBackground } from 'react-native'; // Đã xóa SafeAreaView ở đây
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context'; // FIX: Import từ thư viện chuyên dụng

const ResponsiveContainer = ({ children, style, useImageBg = false }) => {
  return (
    <View style={styles.wrapper}>
      {/* KIỂM TRA ĐIỀU KIỆN RENDER BACKGROUND */}
      {useImageBg ? (
        // Lớp nền 1: Dùng ảnh (Dành cho Login, Register, Onboarding)
        <ImageBackground 
          source={require('../../assets/bg.png')} 
          style={styles.absoluteBackground}
          resizeMode="cover"
        />
      ) : (
        // Lớp nền 2: Dùng Mesh Gradient (Dành cho Dashboard và App chính)
        <>
          <LinearGradient
            colors={['#F5F7FA', '#E4EBF5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.absoluteBackground}
          />
          <View style={[styles.blob, styles.blobTopLeft]} />
          <View style={[styles.blob, styles.blobBottomRight]} />
          <View style={[styles.blob, styles.blobCenter]} />
        </>
      )}

      {/* Lớp 3: Nội dung chính bọc trong SafeAreaView mới */}
      <SafeAreaView style={[styles.safeArea, style]} edges={['top', 'left', 'right']}>
        {children}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#F5F7FA', 
  },
  absoluteBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    width: '100%',
  },
  // Các khối tạo hiệu ứng chiều sâu cho Glassmorphism khi không dùng ảnh
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.6,
  },
  blobTopLeft: {
    width: 350, height: 350,
    backgroundColor: '#D1D9E6',
    top: '-10%', left: '-15%',
  },
  blobBottomRight: {
    width: 450, height: 450,
    backgroundColor: '#CFD9DF',
    bottom: '-15%', right: '-10%',
  },
  blobCenter: {
    width: 250, height: 250,
    backgroundColor: '#E2EBF0',
    top: '30%', left: '20%',
    opacity: 0.4,
  }
});

export default ResponsiveContainer;