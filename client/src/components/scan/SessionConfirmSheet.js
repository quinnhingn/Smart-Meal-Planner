// src/components/scan/SessionConfirmSheet.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
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
    const gram = Number(it.gram_input) || 0;
    return sum + Math.round((calo * gram) / 100);
  }, 0);

  return (
    <InteractiveBottomSheet 
      isVisible={true} 
      onClose={onCancel}
      snapPoints={[0.55, 0.95]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Xác nhận mâm cơm</Text>
        <Text style={styles.subtitle}>Phát hiện {localItems.length} món ăn</Text>
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
            onPress={() => onConfirm(localItems)} 
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
  }
});

export default SessionConfirmSheet;
