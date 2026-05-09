import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, Pressable, TextInput, ScrollView,
  StyleSheet, Platform, KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MEAL_TYPES = ['Sáng', 'Trưa', 'Tối', 'Bữa phụ'];

const DiaryItemModal = ({ visible, onClose, onSave, onDelete, initialData, selectedDate }) => {
  const isEditing = !!initialData?.id;

  const [form, setForm] = useState({
    name: '',
    calo: '',
    protein: '',
    carbs: '',
    fat: '',
    grams: '100',
    desc: '',
    mealType: 'Trưa',
  });

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setForm({
          name: initialData.name || '',
          calo: String(initialData.calo || ''),
          protein: String(initialData.protein || ''),
          carbs: String(initialData.carbs || ''),
          fat: String(initialData.fat || ''),
          grams: String(initialData.grams || initialData.weight || '100'),
          desc: initialData.desc || '',
          mealType: initialData.mealType || 'Trưa',
        });
      } else {
        setForm({
          name: '', calo: '', protein: '', carbs: '', fat: '',
          grams: '100', desc: '', mealType: 'Trưa',
        });
      }
    }
  }, [visible, initialData]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const payload = {
      ...(isEditing ? { id: initialData.id } : { id: `diary_${Date.now()}` }),
      name: form.name.trim(),
      calo: parseInt(form.calo) || 0,
      protein: parseInt(form.protein) || 0,
      carbs: parseInt(form.carbs) || 0,
      fat: parseInt(form.fat) || 0,
      grams: parseInt(form.grams) || 100,
      desc: form.desc.trim(),
      mealType: form.mealType,
      date: selectedDate.toISOString(),
    };
    onSave(payload);
    onClose();
  };

  const handleDelete = () => {
    if (initialData?.id && onDelete) {
      onDelete(initialData.id);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.box}>
          <View style={styles.header}>
            <Text style={styles.title}>{isEditing ? '✏️ Sửa món ăn' : '🍽️ Thêm món ăn'}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#888" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
            {/* Tên món */}
            <Text style={styles.label}>Tên món *</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Cơm gà xối mỡ..."
              value={form.name}
              onChangeText={t => handleChange('name', t)}
              placeholderTextColor="#BBB"
            />

            {/* Bữa ăn */}
            <Text style={styles.label}>Bữa ăn</Text>
            <View style={styles.mealRow}>
              {MEAL_TYPES.map(m => (
                <Pressable
                  key={m}
                  style={[styles.mealChip, form.mealType === m && styles.mealChipActive]}
                  onPress={() => handleChange('mealType', m)}
                >
                  <Text style={[styles.mealChipText, form.mealType === m && styles.mealChipTextActive]}>
                    {m}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Macros */}
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Calories *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={form.calo}
                  onChangeText={t => handleChange('calo', t)}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Grams</Text>
                <TextInput
                  style={styles.input}
                  placeholder="100"
                  keyboardType="numeric"
                  value={form.grams}
                  onChangeText={t => handleChange('grams', t)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Protein (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={form.protein}
                  onChangeText={t => handleChange('protein', t)}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Carbs (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={form.carbs}
                  onChangeText={t => handleChange('carbs', t)}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Fat (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={form.fat}
                  onChangeText={t => handleChange('fat', t)}
                />
              </View>
            </View>

            {/* Mô tả */}
            <Text style={styles.label}>Ghi chú</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="VD: 1 đùi gà + 1 chén cơm..."
              value={form.desc}
              onChangeText={t => handleChange('desc', t)}
              multiline
              numberOfLines={3}
              placeholderTextColor="#BBB"
            />
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            {isEditing && (
              <Pressable style={styles.deleteBtn} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={20} color="#F44336" />
                <Text style={styles.deleteText}>Xóa</Text>
              </Pressable>
            )}
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Hủy</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={handleSubmit}>
              <Text style={styles.saveText}>{isEditing ? 'Cập nhật' : 'Thêm món'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    ...Platform.select({ web: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 } }),
  },
  box: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '90%',
    ...Platform.select({ web: { maxWidth: 500, alignSelf: 'center', width: '100%', borderRadius: 32, marginBottom: 24 } }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '900', color: '#1A1D1E' },
  closeBtn: { padding: 4 },
  form: { paddingHorizontal: 20, paddingBottom: 20 },
  label: { fontSize: 13, fontWeight: '800', color: '#555', marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1D1E',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  row: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  mealRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  mealChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  mealChipActive: { backgroundColor: '#1A1D1E', borderColor: '#1A1D1E' },
  mealChipText: { fontSize: 13, fontWeight: '700', color: '#555' },
  mealChipTextActive: { color: '#FFF' },
  actions: {
    flexDirection: 'row',
    gap: 10,
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FFEBEE',
  },
  deleteText: { color: '#F44336', fontWeight: '800', fontSize: 15 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelText: { color: '#666', fontWeight: '800', fontSize: 15 },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    backgroundColor: '#1A1D1E',
    borderRadius: 16,
    alignItems: 'center',
  },
  saveText: { color: '#FFF', fontWeight: '900', fontSize: 15 },
});

export default DiaryItemModal;