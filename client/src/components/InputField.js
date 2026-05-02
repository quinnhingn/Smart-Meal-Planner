// src/components/InputField.js
import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

export default function InputField({ label, placeholder, secureTextEntry, value, onChangeText, error }) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor={colors.text.secondary} // Đổi màu placeholder
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
    color: colors.text.primary, // Đổi màu label thành tối
    marginBottom: 8, 
    fontSize: 14, 
    fontWeight: '600' 
  },
  input: {
    // Nền input sáng hơn một chút để phân biệt với nền kính
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    padding: 14,
    color: colors.text.primary, // Đổi màu chữ nhập liệu
    fontSize: 16,
  },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 4 },
});