// src/components/scan/SessionConfirmSheet.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DetectionCard from './DetectionCard';
import CustomButton from '../CustomButton';
import InteractiveBottomSheet from '../common/InteractiveBottomSheet';
import { COLORS, SHADOWS } from '../../constants/theme';

const SessionConfirmSheet = ({ items, onConfirm, onCancel }) => {
  const [localItems, setLocalItems] = useState(items);
  const insets = useSafeAreaInsets();

  const handleUpdateItem = (updatedItem) => {
    setLocalItems(prev => prev.map(it => it.id === updatedItem.id ? updatedItem : it));
  };

  const handleDeleteItem = (id) => {
    setLocalItems(prev => prev.filter(it => it.id !== id));
  };

  const totalCalo = localItems.reduce((sum, it) => {
    const calo = Number(it.base_calo) || 0;
    const servings = Number(it.servings_input) || 0;
    return sum + Math.round(calo * servings);
  }, 0);

  // Mặc định chọn bữa ăn theo giờ hiện tại
  const [selectedMeal, setSelectedMeal] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 10) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 20) return 'dinner';
    return 'snack';
  });

  const MEAL_TYPES = [
    { id: 'breakfast', label: 'Sáng' },
    { id: 'lunch', label: 'Trưa' },
    { id: 'dinner', label: 'Tối' },
    { id: 'snack', label: 'Phụ' },
  ];

  return (
    <InteractiveBottomSheet 
      isVisible={true} 
      onClose={onCancel}
      snapPoints={[0.55, 0.95]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Xác nhận mâm cơm</Text>
        <Text style={styles.subtitle}>Top {localItems[0]?.candidates?.length || 1} kết quả nhận diện</Text>
      </View>
      
      <FlatList
        data={localItems}
        keyExtractor={it => it.id}
        renderItem={({ item }) => (
          <DetectionCard 
            item={item} 
            onUpdate={handleUpdateItem} 
            onDelete={() => handleDeleteItem(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      
      <View style={styles.mealSelectorWrapper}>
        <Text style={styles.mealSelectorTitle}>Chọn bữa ăn</Text>
        <View style={styles.mealChipsRow}>
          {MEAL_TYPES.map(meal => (
            <Pressable
              key={meal.id}
              style={[styles.mealChip, selectedMeal === meal.id && styles.mealChipActive]}
              onPress={() => setSelectedMeal(meal.id)}
            >
              <Text style={[styles.mealChipText, selectedMeal === meal.id && styles.mealChipTextActive]}>
                {meal.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Tổng Calo ước tính:</Text>
          <Text style={styles.totalValue}>{totalCalo} kcal</Text>
        </View>
        <View style={styles.actionRow}>
          <CustomButton 
            title="HỦY BỎ" 
            type="danger"
            onPress={onCancel} 
            style={{ flex: 1, backgroundColor: '#FFEbee' }}
            textStyle={{ color: '#D32F2F' }} // if CustomButton doesn't support textStyle, we handle it below
          />
          <CustomButton 
            title="LƯU NHẬT KÝ" 
            onPress={() => onConfirm(localItems, selectedMeal)} 
            style={{ flex: 2 }}
          />
        </View>
      </View>
    </InteractiveBottomSheet>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  listContent: {
    padding: 20,
    gap: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFF'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#555'
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#E53935'
  },
  mealSelectorWrapper: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#FFF'
  },
  mealSelectorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
    marginBottom: 8
  },
  mealChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mealChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  mealChipActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: COLORS.primary
  },
  mealChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  mealChipTextActive: {
    color: COLORS.primary,
    fontWeight: '800'
  }
});

export default SessionConfirmSheet;
