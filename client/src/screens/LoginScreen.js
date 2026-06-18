// src/screens/LoginScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, StyleSheet, ActivityIndicator, 
  Pressable, Platform, KeyboardAvoidingView, ScrollView, 
  StatusBar 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import ResponsiveContainer from '../components/ResponsiveContainer';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

const LoginScreen = ({ onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, isLoading, error } = useAppStore();

  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('saved_email');
        const savedPassword = await AsyncStorage.getItem('saved_password');
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.log('Lỗi tải tài khoản đã lưu', error);
      }
    };
    loadSavedCredentials();
  }, []);

  const handleLogin = async () => {
    const success = await login(email, password);
    if (success) {
      try {
        if (rememberMe) {
          await AsyncStorage.setItem('saved_email', email);
          await AsyncStorage.setItem('saved_password', password);
        } else {
          await AsyncStorage.removeItem('saved_email');
          await AsyncStorage.removeItem('saved_password');
        }
      } catch (e) {
        console.log('Lỗi lưu tài khoản', e);
      }
    }
  };

  const SocialButton = ({ icon, color }) => (
    <Pressable
      style={({ pressed }) => [
        styles.socialButton,
        pressed && styles.socialButtonPressed
      ]}
    >
      <Ionicons name={icon} size={24} color={color} />
    </Pressable>
  );

  return (
    <ResponsiveContainer useImageBg={true}>
      <View style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoid} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header section outside GlassCard */}
            <View style={styles.header}>
              <Text style={styles.title}>SmartMeal</Text>
              <Text style={styles.subtitle}>Quản lý dinh dưỡng thông minh</Text>
            </View>

            <GlassCard style={styles.card} intensity={80}>
              {/* CỐT LÕI: Bọc nội dung trong View có padding thay vì dùng padding của GlassCard */}
              <View style={styles.cardContent}>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Text style={styles.label}>Tài khoản Email</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#666" style={styles.iconLeft} />
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

                <Text style={styles.label}>Mật khẩu</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.iconLeft} />
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
                    style={styles.iconRight}
                  >
                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
                  </Pressable>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 24 }}>
                  <Pressable 
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <Ionicons name={rememberMe ? "checkbox" : "square-outline"} size={22} color={rememberMe ? COLORS.primary : '#666'} />
                    <Text style={{ marginLeft: 8, color: '#333', fontSize: 14, fontWeight: '600' }}>Nhớ tài khoản</Text>
                  </Pressable>

                  <Pressable>
                    <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                  </Pressable>
                </View>

                {isLoading ? (
                  <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />
                ) : (
                  <CustomButton title="Đăng Nhập" onPress={handleLogin} style={styles.loginBtn} />
                )}
                
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialContainer}>
                  <SocialButton icon="logo-google" color="#DB4437" />
                  <SocialButton icon="logo-facebook" color="#4267B2" />
                  <SocialButton icon="logo-apple" color="#333333" />
                </View>

                <View style={styles.footer}>
                  <Text style={{ color: '#555' }}>Chưa có tài khoản? </Text>
                  <Pressable onPress={onNavigateToRegister}>
                    <Text style={styles.link}>Đăng ký ngay</Text>
                  </Pressable>
                </View>
              </View>
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: '100%',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, 
  },
  keyboardAvoid: { flex: 1, width: '100%' },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  header: { alignItems: 'center', marginBottom: 28 },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.primary,
    textShadowColor: 'rgba(255,255,255,0.8)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10
  },
  subtitle: { fontSize: 16, color: '#9be69e', fontWeight: '600', marginTop: 4 },
  
  card: { width: '100%', maxWidth: 420 },
  cardContent: { padding: 24, width: '100%' }, // Padding nội bộ thay thế padding GlassCard[cite: 1]

  errorText: { color: COLORS.danger, textAlign: 'center', marginBottom: 16, fontWeight: '700' },
  label: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8, marginLeft: 4 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    marginBottom: 20,
    height: 54,
  },
  iconLeft: { paddingHorizontal: 14 },
  iconRight: { paddingHorizontal: 14, height: '100%', justifyContent: 'center' },
  input: { flex: 1, height: '100%', color: '#1A1D1E', fontSize: 16 },
  forgotPasswordText: { color: '#666', fontSize: 14, fontWeight: '600' },
  loginBtn: { width: '100%', borderRadius: 12 },
  
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 28 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(0, 0, 0, 0.1)' },
  dividerText: { marginHorizontal: 12, fontSize: 13, color: '#888', fontWeight: '500' },
  
  socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  socialButton: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center', alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.1)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }
    })
  },
  socialButtonHovered: { backgroundColor: '#FFF', transform: [{ scale: 1.05 }] },
  socialButtonPressed: { opacity: 0.7, transform: [{ scale: 0.95 }] },
  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  link: { color: COLORS.primary, fontWeight: '800' }
});

export default LoginScreen;