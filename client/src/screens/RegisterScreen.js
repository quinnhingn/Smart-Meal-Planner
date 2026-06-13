// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, ActivityIndicator, 
  Pressable, Platform, KeyboardAvoidingView, ScrollView, 
  StatusBar, useWindowDimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ResponsiveContainer from '../components/ResponsiveContainer';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import { COLORS, BREAKPOINTS } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

const RegisterScreen = ({ onNavigateToLogin }) => {
  const [displayName, setDisplayName] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { width: windowWidth } = useWindowDimensions();
  const { register, isLoading, error } = useAppStore();

  const actualCardWidth = Math.min(windowWidth - 32, 420);

  const handleRegister = async () => {
    if (!displayName.trim()) {
      alert('Vui lòng nhập tên hiển thị!');
      return;
    }
    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    
    await register({
      name: displayName.trim(),
      email: email.trim(),
      password,
    });
  };

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
            <View style={styles.header}>
              <Text style={styles.title}>SmartMeal</Text>
              <Text style={styles.subtitle}>Khởi đầu lối sống lành mạnh</Text>
            </View>

            <GlassCard style={{ width: actualCardWidth }} intensity={80}>
              <View style={styles.cardContent}>
                <Text style={styles.formTitle}>Tạo Tài Khoản</Text>
                
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {/* TRƯỜNG MỚI: TÊN HIỂN THỊ */}
                <Text style={styles.label}>Tên hiển thị</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#666" style={styles.iconLeft} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="Ví dụ: Quỳnh Nhi" 
                    placeholderTextColor="#A0A0A0"
                    value={displayName} 
                    onChangeText={setDisplayName}
                  />
                </View>

                <Text style={styles.label}>Tài khoản Email</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#666" style={styles.iconLeft} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="Nhập email" 
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
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.iconRight}>
                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
                  </Pressable>
                </View>

                <Text style={styles.label}>Xác nhận mật khẩu</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#666" style={styles.iconLeft} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="Nhập lại mật khẩu" 
                    placeholderTextColor="#A0A0A0"
                    value={confirmPassword} 
                    onChangeText={setConfirmPassword} 
                    secureTextEntry={!showPassword}
                  />
                </View>

                {isLoading ? (
                  <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />
                ) : (
                  <CustomButton title="Đăng Ký" onPress={handleRegister} style={styles.registerBtn} />
                )}
                
                <View style={styles.footer}>
                  <Text style={{ color: '#555' }}>Đã có tài khoản? </Text>
                  <Pressable onPress={onNavigateToLogin}>
                    <Text style={styles.link}>Đăng nhập</Text>
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
    flex: 1, width: '100%',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, 
  },
  keyboardAvoid: { flex: 1, width: '100%' },
  scrollContent: {
    flexGrow: 1, justifyContent: 'center', alignItems: 'center',
    paddingVertical: 32, paddingHorizontal: 16,
  },
  header: { alignItems: 'center', marginBottom: 24 },
  title: {
    fontSize: 38, fontWeight: '900', color: COLORS.primary,
    textShadowColor: 'rgba(255,255,255,0.8)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10
  },
  subtitle: { fontSize: 16, color: '#9be69e', fontWeight: '600', marginTop: 4 },
  
  cardContent: { padding: 24, width: '100%' }, // Internal Padding duy trì đúng chỉ dẫn
  formTitle: { fontSize: 22, fontWeight: '800', color: '#333', marginBottom: 20, textAlign: 'center' },

  errorText: { color: COLORS.danger, textAlign: 'center', marginBottom: 16, fontWeight: '700' },
  label: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8, marginLeft: 4 },
  
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12, marginBottom: 16, height: 54,
  },
  iconLeft: { paddingHorizontal: 14 },
  iconRight: { paddingHorizontal: 14, height: '100%', justifyContent: 'center' },
  input: { flex: 1, height: '100%', color: '#1A1D1E', fontSize: 16 },
  
  registerBtn: { width: '100%', borderRadius: 12, marginTop: 10 },
  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  link: { color: COLORS.primary, fontWeight: '800' }
});

export default RegisterScreen;