// src/screens/ShoppingListScreen.js
import React, { useEffect, useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, 
  TouchableOpacity, Platform, Alert, Modal, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useAppStore } from '../store/useAppStore';
import { COLORS } from '../constants/theme';
import GlassCard from '../components/GlassCard';

const ShoppingListScreen = () => {
  const navigation = useNavigation();
  const { 
    shoppingList, fetchShoppingList, updateShoppingItem, 
    saveShoppingToPantry, clearShoppingList, addManualShoppingItem,
    toggleAllShoppingItems, isLoading 
  } = useAppStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: '1', unit: 'g' });

  useFocusEffect(
    useCallback(() => {
      fetchShoppingList();
    }, [])
  );

  const handleToggleItem = (item) => {
    updateShoppingItem(item.id, { isBought: !item.isBought });
  };

  const handleUpdateQty = (item, delta) => {
    const newQty = Math.max(1, item.quantity + delta);
    updateShoppingItem(item.id, { quantity: newQty });
  };

  const handleManualQty = (item) => {
    if (Platform.OS === 'web') {
      const val = prompt(`Nhập số lượng mới cho ${item.name} (${item.unit}):`, item.quantity);
      if (val !== null && !isNaN(val)) {
        updateShoppingItem(item.id, { quantity: parseFloat(val) });
      }
    }
  };

  const handleManualAdd = async () => {
    if (!newItem.name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên nguyên liệu");
      return;
    }
    const success = await addManualShoppingItem(newItem.name, parseFloat(newItem.quantity) || 1, newItem.unit);
    if (success) {
      setShowAddModal(false);
      setNewItem({ name: '', quantity: '1', unit: 'g' });
    }
  };

  const handleSave = async () => {
    const boughtCount = shoppingList.filter(i => i.isBought).length;
    if (boughtCount === 0) {
      Alert.alert("Thông báo", "Bạn chưa chọn món nào đã mua.");
      return;
    }

    const confirmMsg = `Bạn muốn lưu ${boughtCount} món đã chọn vào tủ lạnh?`;

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        const success = await saveShoppingToPantry();
        if (success) navigation.goBack();
      }
    } else {
      Alert.alert(
        "Xác nhận",
        confirmMsg,
        [
          { text: "Hủy", style: "cancel" },
          { 
            text: "Đồng ý", 
            onPress: async () => {
              const success = await saveShoppingToPantry();
              if (success) navigation.goBack();
            }
          }
        ]
      );
    }
  };

  const handleClear = () => {
    Alert.alert(
      "Xác nhận",
      "Bạn muốn xóa toàn bộ danh sách đi chợ này?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa sạch", style: "destructive", onPress: clearShoppingList }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <Pressable 
      style={[styles.itemCard, item.isBought && styles.itemCardBought]}
      onPress={() => handleToggleItem(item)}
    >
      <View style={[styles.checkbox, item.isBought && styles.checkboxChecked]}>
        {item.isBought && <Ionicons name="checkmark" size={16} color="#FFF" />}
      </View>
      
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, item.isBought && styles.itemNameBought]}>
          {item.name}
        </Text>
        
        <View style={styles.qtyContainer}>
          <TouchableOpacity 
            style={styles.qtyBtn} 
            onPress={() => handleUpdateQty(item, -10)}
          >
            <Ionicons name="remove-circle-outline" size={20} color="#888" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => handleManualQty(item)}>
            <Text style={styles.itemQty}>
              {item.quantity} {item.unit}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.qtyBtn} 
            onPress={() => handleUpdateQty(item, 10)}
          >
            <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {item.recipeId ? (
        <View style={styles.recipeTag}>
          <Ionicons name="restaurant-outline" size={10} color="#666" />
          <Text style={styles.recipeTagText}>Công thức</Text>
        </View>
      ) : (
        <View style={[styles.recipeTag, { backgroundColor: '#E3F2FD' }]}>
          <Ionicons name="person-outline" size={10} color="#1976D2" />
          <Text style={[styles.recipeTagText, { color: '#1976D2' }]}>Mua thêm</Text>
        </View>
      )}
    </Pressable>
  );

  const isAllBought = shoppingList.length > 0 && shoppingList.every(i => i.isBought);

  return (
    <ResponsiveContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#1A1D1E" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Danh sách đi chợ</Text>
            <Text style={styles.subTitle}>{shoppingList.length} nguyên liệu cần mua</Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addIconBtn}>
              <Ionicons name="add-circle" size={32} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
              <Ionicons name="trash-outline" size={22} color="#FF5252" />
            </TouchableOpacity>
          </View>
        </View>

        {shoppingList.length > 0 ? (
          <>
            <View style={styles.listHeader}>
              <Pressable 
                style={styles.selectAllBtn} 
                onPress={() => toggleAllShoppingItems(!isAllBought)}
              >
                <View style={[styles.checkboxSmall, isAllBought && styles.checkboxChecked]}>
                  {isAllBought && <Ionicons name="checkmark" size={12} color="#FFF" />}
                </View>
                <Text style={styles.selectAllText}>
                  {isAllBought ? 'Bỏ chọn tất cả' : 'Chọn tất cả đã mua'}
                </Text>
              </Pressable>
            </View>

            <FlatList
              data={shoppingList}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.footer}>
              <GlassCard style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Đã chọn mua:</Text>
                  <Text style={styles.summaryValue}>
                    {shoppingList.filter(i => i.isBought).length} / {shoppingList.length}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.saveBtn, 
                    shoppingList.filter(i => i.isBought).length === 0 && styles.saveBtnDisabled
                  ]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveBtnText}>LƯU VÀO TỦ LẠNH</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFF" />
                </TouchableOpacity>
              </GlassCard>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="cart-outline" size={64} color="#DDD" />
            </View>
            <Text style={styles.emptyText}>Giỏ hàng đang trống</Text>
            <Text style={styles.emptySubText}>
              Hãy nhấn nút (+) ở trên để thêm đồ cần mua hoặc chọn món ăn từ công thức nhé!
            </Text>
            <TouchableOpacity 
              style={styles.goRecipesBtn}
              onPress={() => navigation.navigate('Recipes')}
            >
              <Text style={styles.goRecipesText}>Xem Công thức</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Modal Thêm món mới */}
        <Modal
          visible={showAddModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={() => setShowAddModal(false)} />
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Thêm món mua ngoài</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tên nguyên liệu</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="Ví dụ: Nước mắm, Rau muống..."
                  value={newItem.name}
                  onChangeText={(t) => setNewItem({...newItem, name: t})}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Số lượng</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="200"
                    keyboardType="numeric"
                    value={newItem.quantity}
                    onChangeText={(t) => setNewItem({...newItem, quantity: t})}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Đơn vị</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="g, ml, quả..."
                    value={newItem.unit}
                    onChangeText={(t) => setNewItem({...newItem, unit: t})}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.modalAddBtn} onPress={handleManualAdd}>
                <Text style={styles.modalAddBtnText}>THÊM VÀO GIỎ</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelBtnText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  backBtn: { padding: 4 },
  headerTitleContainer: { flex: 1, marginLeft: 12 },
  title: { fontSize: 22, fontWeight: '900', color: '#1A1D1E' },
  subTitle: { fontSize: 13, fontWeight: '600', color: '#999', marginTop: 2 },
  addIconBtn: { padding: 0 },
  clearBtn: { padding: 4, justifyContent: 'center' },
  
  listContent: { paddingHorizontal: 20, paddingBottom: 180 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
    })
  },
  itemCardBought: {
    backgroundColor: '#FAFAFA',
    borderColor: 'rgba(0,0,0,0.01)',
    opacity: 0.8,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '800', color: '#1A1D1E' },
  itemNameBought: {
    color: '#AAA',
    textDecorationLine: 'line-through',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  qtyBtn: {
    padding: 2,
  },
  itemQty: { fontSize: 13, fontWeight: '700', color: COLORS.primary, backgroundColor: 'rgba(76, 175, 80, 0.05)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  recipeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  recipeTagText: { fontSize: 10, fontWeight: '700', color: '#666' },

  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  summaryCard: {
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  summaryLabel: { fontSize: 13, fontWeight: '700', color: '#666' },
  summaryValue: { fontSize: 14, fontWeight: '900', color: COLORS.primary },
  saveBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveBtnDisabled: {
    backgroundColor: '#CCC',
    opacity: 0.5,
  },
  saveBtnText: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: { fontSize: 20, fontWeight: '900', color: '#1A1D1E', marginBottom: 8 },
  emptySubText: { fontSize: 14, fontWeight: '600', color: '#999', textAlign: 'center', lineHeight: 20 },
  goRecipesBtn: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  goRecipesText: { color: COLORS.primary, fontSize: 15, fontWeight: '800' },

  // List Header Styles
  listHeader: { paddingHorizontal: 24, paddingBottom: 12, flexDirection: 'row', alignItems: 'center' },
  selectAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkboxSmall: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  selectAllText: { fontSize: 14, fontWeight: '700', color: '#666' },

  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#FFF', borderRadius: 28, padding: 24, width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1A1D1E', marginBottom: 20, textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '800', color: '#999', marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: '#F8F9FA', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1A1D1E' },
  modalAddBtn: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  modalAddBtnText: { color: '#FFF', fontSize: 15, fontWeight: '900' },
  modalCancelBtn: { marginTop: 12, alignItems: 'center' },
  modalCancelBtnText: { color: '#999', fontSize: 14, fontWeight: '700' },
});

export default ShoppingListScreen;
