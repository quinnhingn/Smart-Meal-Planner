// src/components/MiniMealLog.js
import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from './GlassCard';
import { COLORS } from '../constants/theme';

const MiniMealLog = ({ logs = [], onAddMain, onAddSnack }) => {
  // ... (giữ nguyên logic processedLogs)
  const processedLogs = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snacks: []
  };

  if (Array.isArray(logs)) {
    logs.forEach(meal => {
      const type = meal.type || meal.meal_type;
      const calories = parseFloat(meal.calories || meal.calories_consumed || 0);

      if (type === 'breakfast') processedLogs.breakfast += calories;
      else if (type === 'lunch') processedLogs.lunch += calories;
      else if (type === 'dinner') processedLogs.dinner += calories;
      else processedLogs.snacks.push({
        id: meal.id,
        name: meal.name || meal.meal_name,
        kcal: calories
      });
    });
  }

  // Hàm render dùng chung cho các item bữa ăn
  const renderMealRow = (icon, title, kcal) => (
    <View style={styles.mealRow} key={title}>
      <View style={styles.mealLeft}>
        <Ionicons name={icon} size={20} color={kcal > 0 ? COLORS.primary : '#888'} />
        <Text style={[styles.mealTitle, kcal <= 0 && styles.textDisabled]}>{title}</Text>
      </View>
      <Text style={[styles.mealKcal, kcal <= 0 && styles.textDisabled]}>
        {kcal > 0 ? `${Math.round(kcal)} kcal` : 'Chưa nhập'}
      </Text>
    </View>
  );

  return (
    <GlassCard style={styles.cardWrapper} intensity={85}>
      <View style={styles.cardContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Nhật ký hôm nay</Text>
          <Pressable style={styles.addMainBtn} onPress={onAddMain}>
            <Ionicons name="add" size={20} color="#FFF" />
          </Pressable>
        </View>

        {/* Danh sách 3 bữa chính */}
        <View style={styles.logContainer}>
          {renderMealRow('partly-sunny-outline', 'Bữa sáng', processedLogs.breakfast)}
          <View style={styles.divider} />
          {renderMealRow('sunny-outline', 'Bữa trưa', processedLogs.lunch)}
          <View style={styles.divider} />
          {renderMealRow('moon-outline', 'Bữa tối', processedLogs.dinner)}
        </View>

        {/* Danh sách bữa phụ (Snacks) */}
        {processedLogs.snacks.length > 0 && (
          <View style={styles.snacksContainer}>
            {processedLogs.snacks.map((snack, index) => (
              <React.Fragment key={snack.id || index}>
                <View style={styles.divider} />
                {renderMealRow('fast-food-outline', snack.name || `Bữa phụ ${index + 1}`, snack.kcal)}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Nút thêm bữa phụ */}
        <Pressable style={styles.addSnackBtn} onPress={onAddSnack}>
          <Text style={styles.addSnackText}>+ Thêm bữa phụ</Text>
        </Pressable>
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