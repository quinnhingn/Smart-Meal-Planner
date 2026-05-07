// src/components/InputField.js
import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme'; // Đổi từ colors sang COLORS

export default function InputField({ label, placeholder, secureTextEntry, value, onChangeText, error }) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor="#999" // Dùng mã màu xám an toàn cho Web/Mobile
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { 
    color: '#1A1D1E', // Dùng màu tối chuẩn thay cho colors.text.primary
    marginBottom: 8, 
    fontSize: 14, 
    fontWeight: '700' 
  },
  input: {
    backgroundColor: '#F8F9FA', // Màu nền sáng nhẹ để dễ nhìn hơn
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    color: '#1A1D1E', // Màu chữ nhập vào
    fontSize: 16,
  },
  inputError: { borderColor: COLORS.danger || '#F44336' },
  errorText: { color: COLORS.danger || '#F44336', fontSize: 12, marginTop: 4 },
});