import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import ResponsiveContainer from '../components/ResponsiveContainer';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/theme';
import { authApi } from '../services/mockApi';

const RegisterScreen = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setIsLoading(true);
    const res = await authApi.register(email, password);
    setIsLoading(false);
    if (res.success) {
      alert('Đăng ký thành công! Hãy đăng nhập.');
      onNavigateToLogin();
    } else {
      alert(res.message);
    }
  };

  return (
    <ResponsiveContainer style={styles.center}>
      <GlassCard style={styles.card}>
        <Text style={styles.title}>Tạo Tài Khoản</Text>
        
        <TextInput 
          style={styles.input} placeholder="Email" 
          value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
        />
        <TextInput 
          style={styles.input} placeholder="Mật khẩu" 
          value={password} onChangeText={setPassword} secureTextEntry
        />

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 10 }} />
        ) : (
          <CustomButton title="Đăng ký" onPress={handleRegister} />
        )}
        
        <View style={styles.footer}>
          <Text style={{ color: COLORS.textLight }}>Đã có tài khoản? </Text>
          <Text style={styles.link} onPress={onNavigateToLogin}>Đăng nhập</Text>
        </View>
      </GlassCard>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  center: { justifyContent: 'center', padding: 16 },
  card: { padding: 24, width: '100%', maxWidth: 400 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: COLORS.white, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 16, fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  link: { color: COLORS.primary, fontWeight: 'bold', cursor: 'pointer' }
});

export default RegisterScreen;