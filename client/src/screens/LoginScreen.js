// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Sử dụng bộ icon chuẩn
import ResponsiveContainer from '../components/ResponsiveContainer';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

const LoginScreen = ({ onNavigateToRegister }) => {
  const [email, setEmail] = useState('test@gmail.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false); // State bật/tắt mật khẩu
  
  const { login, isLoading, error } = useAppStore();

  const handleLogin = async () => {
    await login(email, password);
  };

  // Component phụ cho Nút Social Login (Kính tròn)
  const SocialButton = ({ icon, color }) => (
    <Pressable
      style={({ pressed, hovered }) => [
        styles.socialButton,
        pressed && styles.socialButtonPressed,
        hovered && styles.socialButtonHovered,
        Platform.OS === 'web' && { cursor: 'pointer' }
      ]}
    >
      <Ionicons name={icon} size={24} color={color} />
    </Pressable>
  );

  return (
    // Bật cờ useImageBg để hiển thị ảnh nền bg.png
    <ResponsiveContainer useImageBg={true} style={styles.center}>
      
      {/* Header ngoài thẻ kính (Tùy chọn) */}
      <View style={styles.header}>
        <Text style={styles.title}>SmartMeal</Text>
        <Text style={styles.subtitle}>Quản lý dinh dưỡng thông minh</Text>
      </View>

      <GlassCard style={styles.card} intensity={80}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Input Email */}
        <Text style={styles.label}>Tài khoản Email</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textLight} style={styles.iconLeft} />
          <TextInput 
            style={styles.input} 
            placeholder="Nhập email của bạn" 
            placeholderTextColor="#A0A0A0"
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address" 
            autoCapitalize="none"
          />
        </View>

        {/* Input Mật khẩu */}
        <Text style={styles.label}>Mật khẩu</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} style={styles.iconLeft} />
          <TextInput 
            style={styles.input} 
            placeholder="Nhập mật khẩu" 
            placeholderTextColor="#A0A0A0"
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry={!showPassword}
          />
          <Pressable 
            onPress={() => setShowPassword(!showPassword)} 
            style={({ hovered }) => [styles.iconRight, Platform.OS === 'web' && hovered && { opacity: 0.7, cursor: 'pointer' }]}
          >
            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={COLORS.textLight} />
          </Pressable>
        </View>

        {/* Quên mật khẩu */}
        <Pressable style={({ hovered }) => [styles.forgotPasswordContainer, Platform.OS === 'web' && hovered && { opacity: 0.7, cursor: 'pointer' }]}>
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
        </Pressable>

        {/* Nút Đăng nhập */}
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />
        ) : (
          <CustomButton title="Đăng Nhập" onPress={handleLogin} style={styles.loginBtn} />
        )}
        
        {/* Divider: Hoặc tiếp tục với */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login Buttons */}
        <View style={styles.socialContainer}>
          <SocialButton icon="logo-google" color="#DB4437" />
          <SocialButton icon="logo-facebook" color="#4267B2" />
          <SocialButton icon="logo-apple" color="#333333" />
        </View>

        {/* Link chuyển sang Đăng ký */}
        <View style={styles.footer}>
          <Text style={{ color: '#555' }}>Chưa có tài khoản? </Text>
          <Pressable onPress={onNavigateToRegister}>
            {({ hovered }) => (
              <Text style={[styles.link, Platform.OS === 'web' && hovered && { textDecorationLine: 'underline', cursor: 'pointer' }]}>
                Đăng ký ngay
              </Text>
            )}
          </Pressable>
        </View>

      </GlassCard>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primary,
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#effaec',
    fontWeight: '600',
  },
  card: { 
    padding: 24, 
    width: '100%', 
    maxWidth: 400,
    // Tinh chỉnh riêng cho Light Glass
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
  },
  errorText: { 
    color: COLORS.danger, 
    textAlign: 'center', 
    marginBottom: 12, 
    fontWeight: 'bold' 
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    marginBottom: 20,
    height: 50,
  },
  iconLeft: {
    paddingHorizontal: 12,
  },
  iconRight: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
  },
  input: { 
    flex: 1,
    height: '100%',
    color: '#1A1D1E', 
    fontSize: 16,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '600',
  },
  loginBtn: {
    marginTop: 0,
    borderRadius: 12,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#666',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-center',
    gap: 20,
    marginBottom: 10,
    alignSelf: 'center',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  socialButtonHovered: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    transform: [{ scale: 1.05 }],
  },
  socialButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 20 
  },
  link: { 
    color: COLORS.primary, 
    fontWeight: 'bold',
  }
});

export default LoginScreen;