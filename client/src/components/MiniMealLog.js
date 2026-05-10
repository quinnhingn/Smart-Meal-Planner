// src/components/MiniMealLog.js
import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from './GlassCard';
import { COLORS } from '../constants/theme';

const MiniMealLog = ({ logs = [], onAddMain, onAddSnack }) => {
  const processedLogs = {
    breakfast: { total: 0, items: [] },
    lunch: { total: 0, items: [] },
    dinner: { total: 0, items: [] },
    snacks: { total: 0, items: [] }
  };

  if (Array.isArray(logs)) {
    logs.forEach(meal => {
      const type = (meal.type || meal.meal_type || '').toLowerCase();
      const calories = parseFloat(meal.calories || meal.calories_consumed || 0);
      const itemData = {
        id: meal.id,
        name: meal.name || meal.meal_name,
        kcal: calories
      };

      if (type === 'breakfast' || type === 'sáng' || type === 'bữa sáng') {
        processedLogs.breakfast.total += calories;
        processedLogs.breakfast.items.push(itemData);
      } else if (type === 'lunch' || type === 'trưa' || type === 'bữa trưa') {
        processedLogs.lunch.total += calories;
        processedLogs.lunch.items.push(itemData);
      } else if (type === 'dinner' || type === 'tối' || type === 'bữa tối') {
        processedLogs.dinner.total += calories;
        processedLogs.dinner.items.push(itemData);
      } else {
        processedLogs.snacks.total += calories;
        processedLogs.snacks.items.push(itemData);
      }
    });
  }

  const renderMealSection = (icon, title, data, isLast = false) => {
    const hasItems = data.items.length > 0;
    
    return (
      <View key={title}>
        <View style={styles.mealRow}>
          <View style={styles.mealLeft}>
            <View style={[styles.iconCircle, { backgroundColor: hasItems ? COLORS.primary + '15' : '#F5F5F5' }]}>
              <Ionicons name={icon} size={18} color={hasItems ? COLORS.primary : '#AAA'} />
            </View>
            <Text style={[styles.mealTitle, !hasItems && styles.textDisabled]}>{title}</Text>
          </View>
          <Text style={[styles.mealKcal, !hasItems && styles.textDisabled]}>
            {hasItems ? `${Math.round(data.total)} kcal` : 'Chưa nhập'}
          </Text>
        </View>

        {/* Danh sách món ăn trong bữa */}
        {hasItems && (
          <View style={styles.itemsList}>
            {data.items.map((item, idx) => (
              <View key={item.id || idx} style={styles.itemRow}>
                <View style={styles.itemDot} />
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemKcal}>{Math.round(item.kcal)} kcal</Text>
              </View>
            ))}
          </View>
        )}
        
        {!isLast && <View style={styles.divider} />}
      </View>
    );
  };

  return (
    <GlassCard style={styles.cardWrapper} intensity={85}>
      <View style={styles.cardContent}>
        {onAddMain && (
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Nhật ký hôm nay</Text>
            <Pressable style={styles.addMainBtn} onPress={onAddMain}>
              <Ionicons name="add" size={20} color="#FFF" />
            </Pressable>
          </View>
        )}

        <View style={styles.logContainer}>
          {renderMealSection('partly-sunny-outline', 'Bữa sáng', processedLogs.breakfast)}
          {renderMealSection('sunny-outline', 'Bữa trưa', processedLogs.lunch)}
          {renderMealSection('moon-outline', 'Bữa tối', processedLogs.dinner)}
          
          {/* Bữa phụ */}
          {processedLogs.snacks.items.length > 0 && 
            renderMealSection('fast-food-outline', 'Bữa phụ', processedLogs.snacks, true)
          }
        </View>

        {onAddSnack && (
          <Pressable style={styles.addSnackBtn} onPress={onAddSnack}>
            <Text style={styles.addSnackText}>+ Thêm bữa phụ</Text>
          </Pressable>
        )}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  cardWrapper: { width: '100%' },
  cardContent: { padding: 20, backgroundColor: 'transparent' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1A1D1E' },
  addMainBtn: {
    backgroundColor: COLORS.primary,
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  
  logContainer: { width: '100%' },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  mealLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  mealTitle: { fontSize: 15, fontWeight: '700', color: '#1A1D1E' },
  mealKcal: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  textDisabled: { color: '#AAA', fontWeight: '500' },
  
  itemsList: { paddingLeft: 48, paddingBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  itemDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#DDD', marginRight: 8 },
  itemName: { flex: 1, fontSize: 13, color: '#666', fontWeight: '600' },
  itemKcal: { fontSize: 12, color: '#999', fontWeight: '700' },
  
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.04)', width: '100%', marginVertical: 4 },
  
  addSnackBtn: {
    marginTop: 16, paddingVertical: 12,
    borderWidth: 1.5, borderColor: '#EEE', borderStyle: 'dashed', borderRadius: 14,
    alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  addSnackText: { color: '#888', fontWeight: '700', fontSize: 14 },
});

export default MiniMealLog;