// src/components/recipe-detail/ShoppingChecklist.js
import React, { useMemo, useState } from 'react';
import {
  View, Text, Modal, Pressable, ScrollView, StyleSheet, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { compareWithPantry } from '../../utils/recipeHelpers';

const ShoppingChecklist = ({ visible, onClose, onAdd, ingredients, pantryItems }) => {
  const { available, missing } = useMemo(
    () => compareWithPantry(ingredients, pantryItems || []),
    [ingredients, pantryItems]
  );

  const [checkedMissing, setCheckedMissing] = useState(() =>
    new Set(missing.map((_, i) => i))
  );

  const toggleMissing = (idx) => {
    setCheckedMissing(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleAdd = () => {
    const toAdd = missing.filter((_, i) => checkedMissing.has(i));
    onAdd?.(toAdd);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>Thêm vào checklist đi chợ</Text>
          <Text style={styles.subtitle}>Chọn nguyên liệu cần mua</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
            {/* Available items (grayed out) */}
            {available.map((item, idx) => (
              <View key={`avail-${idx}`} style={[styles.row, styles.rowDisabled]}>
                <View style={[styles.checkbox, styles.checkboxDisabled]}>
                  <Ionicons name="checkmark" size={14} color="#BBB" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNameDisabled}>{item.name}</Text>
                  <Text style={styles.itemAmountDisabled}>{item.amount} · Đã có</Text>
                </View>
              </View>
            ))}

            {/* Missing items */}
            {missing.map((item, idx) => {
              const isChecked = checkedMissing.has(idx);
              return (
                <Pressable key={`miss-${idx}`} onPress={() => toggleMissing(idx)} style={styles.row}>
                  <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                    {isChecked && <Ionicons name="checkmark" size={14} color="#FFF" />}
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemAmount}>{item.amount}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable onPress={onClose} style={styles.skipBtn}>
              <Text style={styles.skipText}>BỎ QUA</Text>
            </Pressable>
            <Pressable onPress={handleAdd} style={styles.addBtn}>
              <Text style={styles.addText}>
                THÊM {checkedMissing.size} MÓN
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    maxHeight: '80%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#DDD', alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '900', color: '#1A1D1E', textAlign: 'center' },
  subtitle: { fontSize: 13, fontWeight: '600', color: '#999', textAlign: 'center', marginTop: 4, marginBottom: 16 },
  list: { maxHeight: 400 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  rowDisabled: { opacity: 0.5 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#CCC',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxDisabled: { borderColor: '#DDD', backgroundColor: '#F5F5F5' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#1A1D1E' },
  itemNameDisabled: { fontSize: 15, fontWeight: '600', color: '#BBB', textDecorationLine: 'line-through' },
  itemAmount: { fontSize: 12, fontWeight: '600', color: '#999', marginTop: 2 },
  itemAmountDisabled: { fontSize: 12, fontWeight: '600', color: '#CCC', marginTop: 2 },
  footer: { flexDirection: 'row', gap: 12, marginTop: 16 },
  skipBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16,
    borderRadius: 16, backgroundColor: '#F5F5F5',
  },
  skipText: { fontSize: 14, fontWeight: '800', color: '#888' },
  addBtn: {
    flex: 2, alignItems: 'center', justifyContent: 'center', paddingVertical: 16,
    borderRadius: 16, backgroundColor: COLORS.primary,
  },
  addText: { fontSize: 14, fontWeight: '900', color: '#FFF' },
});

export default ShoppingChecklist;
