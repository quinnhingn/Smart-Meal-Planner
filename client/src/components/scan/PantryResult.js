// src/components/scan/PantryResult.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const UNIT_OPTIONS = ['g', 'kg', 'ml', 'l', 'quả', 'bó', 'hộp', 'gói', 'củ', 'chai'];

// Nhận thêm prop imageUri
const PantryResult = ({ imageUri, data, onSave }) => {
  const [items, setItems] = useState(data || []);
  const [isUnitModalVisible, setUnitModalVisible] = useState(false);
  const [activeItemId, setActiveItemId] = useState(null);

  const today = new Date();
  const dateString = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

  const updateItem = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleAddNewItem = () => {
    const newItem = {
      id: Date.now(),
      name: '',
      quantity: 1,
      unit: 'quả',
      expiryDays: 3
    };
    setItems([...items, newItem]);
  };

  const openUnitSelector = (id) => {
    setActiveItemId(id);
    setUnitModalVisible(true);
  };

  const selectUnit = (unit) => {
    if (activeItemId) updateItem(activeItemId, 'unit', unit);
    setUnitModalVisible(false);
    setActiveItemId(null);
  };

  return (
    <View style={styles.container}>
      {/* ẢNH VỪA CHỤP */}
      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <View style={styles.imageBadge}>
            <Ionicons name="camera" size={14} color="#FFF" />
            <Text style={styles.badgeText}>Ảnh vừa chụp</Text>
          </View>
        </View>
      ) : null}

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Danh sách nguyên liệu ({items.length})</Text>
          <Text style={styles.dateLabel}>Ngày nhập: {dateString}</Text>
        </View>
      </View>
      
      {/* DANH SÁCH ITEMS (Đã đổi ScrollView thành View để tránh lỗi Nested Scroll) */}
      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            
            <View style={styles.cardTopRow}>
              <TextInput 
                style={styles.nameInput}
                value={item.name}
                onChangeText={(text) => updateItem(item.id, 'name', text)}
                placeholder="Nhập tên nguyên liệu..."
                placeholderTextColor="#A0A0A0"
              />
              <Pressable onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
              </Pressable>
            </View>

            <View style={styles.cardBottomRow}>
              <View style={styles.controlGroup}>
                <Text style={styles.controlLabel}>Hạn dùng</Text>
                <View style={styles.controlBox}>
                  <Pressable onPress={() => updateItem(item.id, 'expiryDays', Math.max(0, item.expiryDays - 1))} style={styles.actionBtn}>
                    <Ionicons name="remove" size={16} color="#555" />
                  </Pressable>
                  <Text style={styles.expiryValue}>+{item.expiryDays} ngày</Text>
                  <Pressable onPress={() => updateItem(item.id, 'expiryDays', item.expiryDays + 1)} style={styles.actionBtn}>
                    <Ionicons name="add" size={16} color="#555" />
                  </Pressable>
                </View>
              </View>

              <View style={styles.controlGroup}>
                <Text style={styles.controlLabel}>Định lượng</Text>
                <View style={styles.controlBox}>
                  <TextInput 
                    style={styles.qtyInput}
                    value={item.quantity.toString()}
                    onChangeText={(text) => updateItem(item.id, 'quantity', text.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                  />
                  <View style={styles.divider} />
                  <Pressable style={styles.unitSelector} onPress={() => openUnitSelector(item.id)}>
                    <Text style={styles.unitText}>{item.unit}</Text>
                    <Ionicons name="chevron-down" size={14} color="#888" />
                  </Pressable>
                </View>
              </View>
            </View>

          </View>
        ))}

        <Pressable style={styles.addNewBtn} onPress={handleAddNewItem}>
          <Ionicons name="add-circle" size={24} color={COLORS.primary} />
          <Text style={styles.addNewBtnText}>Nhập thêm nguyên liệu</Text>
        </Pressable>
      </View>

      {/* NÚT LƯU VÀO TỦ LẠNH */}
      <Pressable style={styles.saveBtn} onPress={() => onSave(items)}>
        <Ionicons name="snow-outline" size={24} color="#FFF" />
        <Text style={styles.saveBtnText}>Lưu {items.length} nguyên liệu</Text>
      </Pressable>

      {/* MODAL CHỌN ĐƠN VỊ TÍNH */}
      <Modal visible={isUnitModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setUnitModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn đơn vị tính</Text>
            <View style={styles.unitGrid}>
              {UNIT_OPTIONS.map((u) => (
                <Pressable key={u} style={styles.unitOption} onPress={() => selectUnit(u)}>
                  <Text style={styles.unitOptionText}>{u}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFF' },
  
  // Style cho Ảnh vừa chụp
  imageContainer: { height: 160, borderRadius: 20, overflow: 'hidden', marginBottom: 20, backgroundColor: '#E8F5E9' },
  image: { width: '100%', height: '100%' },
  imageBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, alignItems: 'center', gap: 6 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

  header: { marginBottom: 16, borderBottomWidth: 1, borderColor: '#EEE', paddingBottom: 12 },
  title: { fontSize: 18, fontWeight: '800', color: '#1A1D1E', marginBottom: 4 },
  dateLabel: { fontSize: 14, color: '#888', fontWeight: '600' },
  
  list: { paddingBottom: 24 },
  
  itemCard: { backgroundColor: '#F8F9FA', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EEE' },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  nameInput: { flex: 1, fontSize: 18, fontWeight: '700', color: '#1A1D1E', borderBottomWidth: 1, borderColor: '#E0E0E0', paddingVertical: 4, marginRight: 12 },
  deleteBtn: { padding: 8, backgroundColor: '#FFEBEE', borderRadius: 12 },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  
  controlGroup: { flex: 1 },
  controlLabel: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 6 },
  controlBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', overflow: 'hidden' },
  
  actionBtn: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F0F0F0' },
  expiryValue: { flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#FF9800' },
  
  qtyInput: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#333', paddingVertical: 8 },
  divider: { width: 1, height: '100%', backgroundColor: '#E0E0E0' },
  unitSelector: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, gap: 4, backgroundColor: '#F8F9FA' },
  unitText: { fontSize: 14, fontWeight: '600', color: '#555' },

  addNewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed', backgroundColor: 'rgba(76, 175, 80, 0.05)', gap: 8, marginTop: 8 },
  addNewBtnText: { color: COLORS.primary, fontSize: 16, fontWeight: '700' },

  saveBtn: { backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 24, gap: 8, marginTop: 12 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A1D1E', marginBottom: 20, textAlign: 'center' },
  unitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  unitOption: { paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#F0F2F5', borderRadius: 12, minWidth: '28%', alignItems: 'center' },
  unitOptionText: { fontSize: 16, fontWeight: '600', color: '#333' }
});

export default PantryResult;