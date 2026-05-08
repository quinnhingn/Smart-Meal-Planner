// src/components/MiniMealLog.js
import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from './GlassCard';
import { COLORS } from '../constants/theme';

const MiniMealLog = ({ logs }) => {
  // Hàm render dùng chung cho các item bữa ăn
  const renderMealRow = (icon, title, kcal, isSnack = false) => (
    <View style={styles.mealRow} key={title}>
      <View style={styles.mealLeft}>
        <Ionicons name={icon} size={20} color={kcal ? COLORS.primary : '#888'} />
        <Text style={[styles.mealTitle, !kcal && styles.textDisabled]}>{title}</Text>
      </View>
      <Text style={[styles.mealKcal, !kcal && styles.textDisabled]}>
        {kcal ? `${kcal} kcal` : 'Chưa nhập'}
      </Text>
    </View>
  );

  return (
    <GlassCard style={styles.cardWrapper} intensity={85}>
      <View style={styles.cardContent}>
        {/* Danh sách 3 bữa chính */}
        <View style={styles.logContainer}>
          {renderMealRow('partly-sunny-outline', 'Bữa sáng', logs.breakfast)}
          <View style={styles.divider} />
          {renderMealRow('sunny-outline', 'Bữa trưa', logs.lunch)}
          <View style={styles.divider} />
          {renderMealRow('moon-outline', 'Bữa tối', logs.dinner)}
        </View>

        {/* Danh sách bữa phụ (Snacks) */}
        {logs.snacks && logs.snacks.length > 0 && (
          <View style={styles.snacksContainer}>
            {logs.snacks.map((snack, index) => (
              <React.Fragment key={snack.id}>
                <View style={styles.divider} />
                {renderMealRow('fast-food-outline', snack.name || `Bữa phụ ${index + 1}`, snack.kcal, true)}
              </React.Fragment>
            ))}
          </View>
        )}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  cardWrapper: { width: '100%' },
  cardContent: { padding: 24, backgroundColor: 'transparent' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1D1E' },
  
  addMainBtn: {
    backgroundColor: COLORS.primary,
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  btnHover: { opacity: 0.8 },
  
  logContainer: { width: '100%' },
  snacksContainer: { width: '100%' },
  
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  mealLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mealTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  mealKcal: { fontSize: 15, fontWeight: '700', color: '#1A1D1E' },
  textDisabled: { color: '#999', fontStyle: 'italic', fontWeight: '400' },
  
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', width: '100%', marginVertical: 4 },
  
  addSnackBtn: {
    marginTop: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: '#D1D5DB', borderStyle: 'dashed', borderRadius: 8,
    alignItems: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  addSnackText: { color: '#666', fontWeight: '600', fontSize: 14 },
  snackBtnHover: { backgroundColor: 'rgba(0,0,0,0.02)' }
});

export default MiniMealLog;