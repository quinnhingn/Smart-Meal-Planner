// src/components/scan/PantryResult.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const UNIT_OPTIONS = ['g', 'kg', 'ml', 'l', 'quả', 'bó', 'hộp', 'gói', 'củ', 'con', 'trái', 'miếng'];
const STORAGE_OPTIONS = [
  { id: 'freezer', label: 'Ngăn đông', icon: 'snow', color: '#2196F3' },
  { id: 'fridge', label: 'Ngăn mát', icon: 'thermometer', color: '#4CAF50' },
  { id: 'veggie_drawer', label: 'Ngăn rau', icon: 'leaf', color: '#8BC34A' }
];

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
      id: `manual-${Date.now()}`,
      name: '',
      quantity: 1,
      unit: 'g',
      storage: 'fridge',
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
          <Text style={styles.title}>Lọc đồ đi chợ ({items.length})</Text>
          <Text style={styles.dateLabel}>Phân loại bởi AI • {dateString}</Text>
        </View>
      </View>
      
      {/* DANH SÁCH ITEMS */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {items.map((item) => {
          const isUrgent = item.expiryDays <= 2;
          const storageInfo = STORAGE_OPTIONS.find(s => s.id === item.storage) || STORAGE_OPTIONS[1];

          return (
            <View key={item.id} style={[styles.itemCard, isUrgent && styles.urgentCard]}>
              
              <View style={styles.cardTopRow}>
                <TextInput 
                  style={styles.nameInput}
                  value={item.name}
                  onChangeText={(text) => updateItem(item.id, 'name', text)}
                  placeholder="Tên nguyên liệu..."
                />
                <Pressable onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                </Pressable>
              </View>

              {/* STORAGE SELECTOR */}
              <View style={styles.storageContainer}>
                {STORAGE_OPTIONS.map((s) => (
                  <Pressable 
                    key={s.id}
                    onPress={() => updateItem(item.id, 'storage', s.id)}
                    style={[
                      styles.storageOption, 
                      item.storage === s.id && { backgroundColor: s.color, borderColor: s.color }
                    ]}
                  >
                    <Ionicons 
                      name={s.icon} 
                      size={14} 
                      color={item.storage === s.id ? '#FFF' : '#888'} 
                    />
                    <Text style={[styles.storageText, item.storage === s.id && { color: '#FFF' }]}>
                      {s.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.cardBottomRow}>
                <View style={styles.controlGroup}>
                  <Text style={styles.controlLabel}>Hạn dùng gợi ý</Text>
                  <View style={styles.controlBox}>
                    <Pressable onPress={() => updateItem(item.id, 'expiryDays', Math.max(0, item.expiryDays - 1))} style={styles.actionBtn}>
                      <Ionicons name="remove" size={16} color="#555" />
                    </Pressable>
                    <Text style={[styles.expiryValue, isUrgent && { color: COLORS.danger }]}>
                      {item.expiryDays} ngày
                    </Text>
                    <Pressable onPress={() => updateItem(item.id, 'expiryDays', item.expiryDays + 1)} style={styles.actionBtn}>
                      <Ionicons name="add" size={16} color="#555" />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.controlGroup}>
                  <Text style={styles.controlLabel}>Khối lượng</Text>
                  <View style={styles.controlBox}>
                    <TextInput 
                      style={styles.qtyInput}
                      value={item.quantity.toString()}
                      onChangeText={(text) => updateItem(item.id, 'quantity', text)}
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

              {isUrgent && (
                <View style={styles.urgentBadge}>
                  <Ionicons name="alert-circle" size={12} color="#FFF" />
                  <Text style={styles.urgentText}>Cần dùng sớm!</Text>
                </View>
              )}
            </View>
          );
        })}

        <Pressable style={styles.addNewBtn} onPress={handleAddNewItem}>
          <Ionicons name="add-circle" size={24} color={COLORS.primary} />
          <Text style={styles.addNewBtnText}>Thêm nguyên liệu thủ công</Text>
        </Pressable>
      </ScrollView>

      {/* NÚT LƯU VÀO TỦ LẠNH */}
      <Pressable style={styles.saveBtn} onPress={() => onSave(items)}>
        <Ionicons name="cube-outline" size={24} color="#FFF" />
        <Text style={styles.saveBtnText}>Nhập {items.length} món vào tủ lạnh</Text>
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
  imageContainer: { height: 180, borderRadius: 20, overflow: 'hidden', marginBottom: 20, backgroundColor: '#E8F5E9' },
  image: { width: '100%', height: '100%' },
  imageBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, alignItems: 'center', gap: 6 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

  header: { marginBottom: 16, paddingBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', color: '#1A1D1E', marginBottom: 4 },
  dateLabel: { fontSize: 13, color: COLORS.primary, fontWeight: '700', textTransform: 'uppercase' },
  
  list: { paddingBottom: 100 },
  
  itemCard: { backgroundColor: '#F8F9FA', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EEE', position: 'relative' },
  urgentCard: { borderColor: '#FFCDD2', backgroundColor: '#FFF9F9' },
  
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  nameInput: { flex: 1, fontSize: 18, fontWeight: '700', color: '#1A1D1E', borderBottomWidth: 1, borderColor: '#E0E0E0', paddingVertical: 4, marginRight: 12 },
  deleteBtn: { padding: 8, backgroundColor: '#FFEBEE', borderRadius: 12 },

  storageContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  storageOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', gap: 4, backgroundColor: '#FFF' },
  storageText: { fontSize: 11, fontWeight: '700', color: '#888' },
  
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  controlGroup: { flex: 1 },
  controlLabel: { fontSize: 11, fontWeight: '700', color: '#9E9E9E', marginBottom: 6, textTransform: 'uppercase' },
  controlBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', overflow: 'hidden' },
  
  actionBtn: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#F5F5F5' },
  expiryValue: { flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#555' },
  
  qtyInput: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#333', paddingVertical: 8 },
  divider: { width: 1, height: '100%', backgroundColor: '#E0E0E0' },
  unitSelector: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8, gap: 2, backgroundColor: '#F8F9FA' },
  unitText: { fontSize: 13, fontWeight: '600', color: '#555' },

  urgentBadge: { position: 'absolute', top: -8, right: 16, backgroundColor: COLORS.danger, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, gap: 4 },
  urgentText: { color: '#FFF', fontSize: 10, fontWeight: '800' },

  addNewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 20, borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed', backgroundColor: 'rgba(76, 175, 80, 0.05)', gap: 8, marginTop: 8 },
  addNewBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },

  saveBtn: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 24, gap: 10, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  saveBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A1D1E', marginBottom: 20, textAlign: 'center' },
  unitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  unitOption: { paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#F0F2F5', borderRadius: 12, minWidth: '28%', alignItems: 'center' },
  unitOptionText: { fontSize: 16, fontWeight: '600', color: '#333' }
});

export default PantryResult;