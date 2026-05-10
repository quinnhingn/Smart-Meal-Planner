// src/components/recipe-form/FormSteps.js
import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const FormSteps = ({ steps, onChange }) => {
  const update = (idx, value) => {
    const next = [...steps];
    next[idx] = { ...next[idx], description: value };
    onChange(next);
  };

  const add = () => {
    onChange([...steps, { order: steps.length + 1, description: '', image: null }]);
  };

  const remove = (idx) => {
    const next = steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i + 1 }));
    onChange(next);
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = [...steps];
    [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
    onChange(next.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const moveDown = (idx) => {
    if (idx === steps.length - 1) return;
    const next = [...steps];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next.map((s, i) => ({ ...s, order: i + 1 })));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>🍳 Các bước thực hiện *</Text>
      {steps.map((step, idx) => (
        <View key={idx} style={styles.row}>
          <View style={styles.rowHeader}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{step.order}</Text>
            </View>
            <View style={styles.actions}>
              <Pressable onPress={() => moveUp(idx)} disabled={idx === 0} style={[styles.iconBtn, idx === 0 && styles.iconBtnDisabled]}>
                <Ionicons name="arrow-up" size={14} color="#888" />
              </Pressable>
              <Pressable onPress={() => moveDown(idx)} disabled={idx === steps.length - 1} style={[styles.iconBtn, idx === steps.length - 1 && styles.iconBtnDisabled]}>
                <Ionicons name="arrow-down" size={14} color="#888" />
              </Pressable>
              <Pressable onPress={() => remove(idx)} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={14} color={COLORS.danger} />
              </Pressable>
            </View>
          </View>
          <TextInput
            value={step.description}
            onChangeText={(t) => update(idx, t)}
            placeholder={`Mô tả bước ${step.order}...`}
            placeholderTextColor="#BBB"
            multiline
            numberOfLines={3}
            style={styles.textarea}
            textAlignVertical="top"
          />
        </View>
      ))}
      <Pressable onPress={add} style={styles.addBtn}>
        <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
        <Text style={styles.addText}>Thêm bước</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#1A1D1E', marginBottom: 12 },
  row: {
    backgroundColor: '#F8F9FA', borderRadius: 16, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { fontSize: 13, fontWeight: '900', color: COLORS.primary },
  actions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 6, borderRadius: 8 },
  iconBtnDisabled: { opacity: 0.3 },
  textarea: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 12,
    fontSize: 14, fontWeight: '600', color: '#1A1D1E', minHeight: 80,
    borderWidth: 1, borderColor: '#E8E8E8', lineHeight: 20,
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: 12, borderWidth: 1.5,
    borderColor: COLORS.primary + '40', borderStyle: 'dashed',
  },
  addText: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
});

export default FormSteps;
