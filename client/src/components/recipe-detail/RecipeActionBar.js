// src/components/recipe-detail/RecipeActionBar.js
import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const ActionBtn = ({ icon, label, onPress, primary, danger, disabled }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.btn,
      primary && styles.btnPrimary,
      danger && styles.btnDanger,
      disabled && styles.btnDisabled,
      pressed && !disabled && styles.btnPressed,
    ]}
  >
    <Ionicons name={icon} size={18} color={primary ? '#FFF' : danger ? COLORS.danger : disabled ? '#BBB' : '#555'} />
    <Text style={[
      styles.btnText,
      primary && styles.btnTextPrimary,
      danger && styles.btnTextDanger,
      disabled && styles.btnTextDisabled,
    ]}>{label}</Text>
  </Pressable>
);

const RecipeActionBar = ({ onReview, onShopping, onLog, onSave, isSaved, showShopping }) => {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <ActionBtn icon="star-outline" label="Đánh giá" onPress={onReview} />
        {showShopping && (
          <ActionBtn icon="cart-outline" label="Chuẩn bị" onPress={onShopping} primary />
        )}
        <ActionBtn icon="create-outline" label="Log" onPress={onLog} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 16, paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 8 },
      web: { boxShadow: '0 -4px 24px rgba(0,0,0,0.08)' },
    }),
  },
  inner: { flexDirection: 'row', gap: 8 },
  btn: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: '#F5F5F5', borderRadius: 16, paddingVertical: 10,
  },
  btnPrimary: { backgroundColor: COLORS.primary },
  btnDanger: { backgroundColor: '#FFEBEE' },
  btnDisabled: { opacity: 0.5 },
  btnPressed: { transform: [{ scale: 0.96 }] },
  btnText: { fontSize: 11, fontWeight: '800', color: '#555' },
  btnTextPrimary: { color: '#FFF' },
  btnTextDanger: { color: COLORS.danger },
  btnTextDisabled: { color: '#BBB' },
});

export default RecipeActionBar;
