// src/screens/PantryScreen.js
import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Platform, 
  useWindowDimensions, Pressable, TextInput, FlatList, Modal,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ResponsiveContainer from '../components/ResponsiveContainer';
import GlassCard from '../components/GlassCard';
import PantryItemCard from '../components/pantry/PantryItemCard';
import HistoryItemCard from '../components/pantry/HistoryItemCard';
import InputField from '../components/InputField'; 
import { useAppStore } from '../store/useAppStore';
import { COLORS } from '../constants/theme';
import { CATEGORIES, getDaysUntilExpiry } from '../utils/mockPantryData';

// DANH SÁCH ĐƠN VỊ ĐO LƯỜNG CHUẨN
const UNITS = ['g', 'kg', 'ml', 'l', 'quả', 'bó', 'miếng', 'hộp'];

const PantryScreen = ({ navigation }) => {
  const { width: windowWidth } = useWindowDimensions();
  const {
    selectedCategory, setSelectedCategory,
    searchQuery, setSearchQuery, getFilteredItems,
    getPantryStats, pantryHistory, removePantryItemWithHistory,
    clearPantryHistory, addPantryItems, updatePantryItem, showToast,
    consumePantryItem, restorePantryItem, fetchPantryItems, isLoading, pantryItems // LẤY HÀM FETCH, LOADING VÀ DATA
  } = useAppStore();

  // TỰ ĐỘNG LOAD DỮ LIỆU KHI MỞ TRANG
  useFocusEffect(
    useCallback(() => {
      fetchPantryItems();
    }, [])
  );

  const [activeTab, setActiveTab] = useState('active');
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false); 
  const [editingId, setEditingId] = useState(null); 
  
  // STATE MỚI: Modal dùng món ăn
  const [showConsumeModal, setShowConsumeModal] = useState(false);
  const [consumingItem, setConsumingItem] = useState(null);
  const [consumeAmount, setConsumeAmount] = useState('');

  // CẬP NHẬT STATE FORM: Thêm unit
  const [itemForm, setItemForm] = useState({ 
    name: '', quantity: '', expiryDays: '', category: 'vegetable', unit: 'g' 
  });

  const filteredItems = getFilteredItems();
  const stats = getPantryStats();

  const isWebLarge = Platform.OS === 'web' && windowWidth > 768;
  const rightColumnWidth = windowWidth * 0.7;
  const numColumns = isWebLarge ? Math.max(2, Math.floor(rightColumnWidth / 300)) : 1;

  const handleFindRecipe = (item) => navigation.navigate('Suggestions', { ingredientId: item.id });

  const handleClearHistory = () => {
    clearPantryHistory();
    setShowConfirmModal(false);
    showToast('Đã xóa toàn bộ lịch sử!', 'success');
  };

  // === XỬ LÝ MỞ MODAL THÊM/SỬA ===
  const handleOpenAdd = () => {
    setEditingId(null);
    setItemForm({ name: '', quantity: '', expiryDays: '', category: 'vegetable', unit: 'g' }); 
    setShowItemModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    const daysLeft = getDaysUntilExpiry(item);
    setItemForm({
      name: item.name,
      quantity: item.quantity.toString(),
      expiryDays: Math.max(0, daysLeft).toString(),
      category: item.category || 'vegetable',
      unit: item.unit || 'g' // Lấy unit hiện tại
    });
    setShowItemModal(true);
  };

  // === XỬ LÝ MỞ MODAL XÁC NHẬN SỐ LƯỢNG DÙNG ===
  const handleOpenConsume = (item) => {
    setConsumingItem(item);
    setConsumeAmount(item.quantity.toString()); // Mặc định gán số lượng dùng = số lượng đang có (Dùng hết)
    setShowConsumeModal(true);
  };

  const handleConfirmConsume = () => {
    if (consumingItem) {
      consumePantryItem(consumingItem.id, consumeAmount); // Trừ kho theo lượng đã chọn
      setShowConsumeModal(false);
    }
  };

  const handleSaveItem = () => {
    if (!itemForm.name.trim()) {
      showToast('Vui lòng nhập tên nguyên liệu', 'error');
      return;
    }

    const itemData = {
      name: itemForm.name,
      quantity: parseFloat(itemForm.quantity) || 1,
      expiryDays: parseInt(itemForm.expiryDays) || 3,
      category: itemForm.category,
      unit: itemForm.unit, // Lưu unit đã chọn
    };

    if (editingId) {
      updatePantryItem(editingId, {
        ...itemData,
        addedAt: new Date().toISOString(), 
      });
      showToast('Đã cập nhật nguyên liệu!', 'success');
    } else {
      addPantryItems([{
        ...itemData,
        icon: CATEGORIES.find(c => c.id === itemForm.category)?.icon || '📦',
      }]);
    }
    
    setShowItemModal(false);
  };

  const renderHeaderContent = () => (
    <GlassCard style={{ width: '100%', padding: 0 }} intensity={85}>
      <View style={styles.internalPadding}>
        <View style={styles.header}>
          <Text style={styles.title}>🛒 Tủ Lạnh</Text>
          <View style={styles.divider} />
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm nguyên liệu..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.tabContainer}>
          <Pressable style={[styles.tabBtn, activeTab === 'active' && styles.tabBtnActive]} onPress={() => setActiveTab('active')}>
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>📦 Đang trữ</Text>
          </Pressable>
          <Pressable style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]} onPress={() => setActiveTab('history')}>
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>🕒 Lịch sử</Text>
          </Pressable>
        </View>
        {activeTab === 'active' ? (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Đang có</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(255, 193, 7, 0.12)' }]}>
              <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{stats.warning + stats.urgent + stats.expired}</Text>
              <Text style={[styles.statLabel, { color: '#F59E0B' }]}>Cần chú ý</Text>
            </View>
          </View>
        ) : (
          <View style={styles.wasteWidget}>
            <View style={styles.wasteHeaderRow}>
              <Text style={styles.wasteWidgetTitle}>Theo dõi lãng phí</Text>
              {pantryHistory?.length > 0 && (
                <Pressable onPress={() => setShowConfirmModal(true)} style={styles.clearHistoryBtn}>
                  <Ionicons name="trash-outline" size={16} color="#F44336" />
                  <Text style={styles.clearHistoryText}>Xóa lịch sử</Text>
                </Pressable>
              )}
            </View>
            <View style={styles.wasteRow}>
              <View style={styles.wasteItem}>
                <View style={[styles.wasteIconBox, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}><Ionicons name="restaurant" size={20} color="#4CAF50" /></View>
                <View><Text style={styles.wasteNumber}>{stats.consumed}</Text><Text style={styles.wasteLabel}>Đã nấu</Text></View>
              </View>
              <View style={styles.wasteDivider} />
              <View style={styles.wasteItem}>
                <View style={[styles.wasteIconBox, { backgroundColor: 'rgba(244, 67, 54, 0.15)' }]}><Ionicons name="trash" size={20} color="#F44336" /></View>
                <View><Text style={styles.wasteNumber}>{stats.discarded}</Text><Text style={styles.wasteLabel}>Vứt đi</Text></View>
              </View>
            </View>
          </View>
        )}
        {activeTab === 'active' && (
          <Pressable style={styles.sidebarAddBtn} onPress={handleOpenAdd}>
            <Ionicons name="add-circle" size={20} color="#FFF" />
            <Text style={styles.sidebarAddText}>Thêm nguyên liệu thủ công</Text>
          </Pressable>
        )}
      </View>
    </GlassCard>
  );

  return (
    <ResponsiveContainer useImageBg={false}>
      <View style={styles.rootLayout}>
        <View style={[styles.contentWrapper, isWebLarge && styles.rowLayout]}>
          {isWebLarge && <View style={styles.sidebar}>{renderHeaderContent()}</View>}
          <View style={isWebLarge ? styles.mainListCol : styles.mobileListCol}>
            {isLoading && pantryItems.length === 0 ? (
              <View style={styles.centerAll}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 12, color: '#888' }}>Đang kiểm tra tủ lạnh...</Text>
              </View>
            ) : (
              <FlatList
                key={`${activeTab}-${numColumns}`} 
                data={activeTab === 'active' ? filteredItems : pantryHistory}
                renderItem={({ item }) => (
                <View style={{ flex: 1, paddingHorizontal: 6, maxWidth: isWebLarge ? `${100 / numColumns}%` : '100%' }}>
                  {activeTab === 'active' ? (
                    <PantryItemCard 
                      item={item} 
                      onUse={() => handleOpenConsume(item)} // GỌI MODAL XÁC NHẬN KHI BẤM DÙNG
                      onDelete={(id) => removePantryItemWithHistory(id, 'discarded')} 
                      onEdit={handleOpenEdit} 
                      onFindRecipe={handleFindRecipe} 
                    />
                  ) : (
                    <HistoryItemCard 
                      item={item} 
                      onUndo={() => restorePantryItem(item.id)} // TRUYỀN PROP HOÀN TÁC
                    />
                  )}
                </View>
              )}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View style={{ paddingBottom: 12 }}>
                  {!isWebLarge && <View style={{ marginBottom: 16 }}>{renderHeaderContent()}</View>}
                  {activeTab === 'active' && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
                      {CATEGORIES.map((cat) => (
                        <Pressable key={cat.id} style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]} onPress={() => setSelectedCategory(cat.id)}>
                          <Text style={styles.categoryIcon}>{cat.icon}</Text>
                          <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>{cat.name.replace(/[^\w\s\u00C0-\u1EF9]/g, '')}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  )}
                </View>
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name={activeTab === 'active' ? "basket-outline" : "receipt-outline"} size={48} color="#CCC" />
                  <Text style={styles.emptyText}>{activeTab === 'active' ? 'Không có nguyên liệu nào.' : 'Chưa có lịch sử sử dụng.'}</Text>
                </View>
                }
              />
            )}
          </View>
        </View>
      </View>

      {/* ========================================== */}
      {/* 1. MODAL XÁC NHẬN XÓA LỊCH SỬ */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalBox}>
            <View style={styles.confirmIconCircle}><Ionicons name="trash" size={32} color="#F44336" /></View>
            <Text style={styles.modalTitle}>Xóa lịch sử?</Text>
            <Text style={styles.modalSubtitle}>Tất cả dữ liệu về các món đã dùng và đã vứt sẽ bị xóa vĩnh viễn. Bạn chắc chắn chứ?</Text>
            <View style={styles.modalActionRow}>
              <Pressable style={styles.modalBtnCancel} onPress={() => setShowConfirmModal(false)}><Text style={styles.modalBtnCancelText}>Để sau</Text></Pressable>
              <Pressable style={[styles.modalBtnSubmit, { backgroundColor: '#F44336' }]} onPress={handleClearHistory}><Text style={styles.modalBtnSubmitText}>Đồng ý xóa</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* 2. MODAL DÙNG CHUNG: THÊM & SỬA NGUYÊN LIỆU (CÓ UNIT PICKER) */}
      <Modal visible={showItemModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.addModalBox}>
            <Text style={styles.modalTitle}>{editingId ? '✏️ Sửa nguyên liệu' : '📦 Thêm nguyên liệu'}</Text>
            
            <InputField label="Tên nguyên liệu *" placeholder="VD: Cà chua..." value={itemForm.name} onChangeText={(text) => setItemForm({ ...itemForm, name: text })} />
            
            <Text style={styles.modalLabel}>Phân loại *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalCategoryScroll}>
              {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                <Pressable
                  key={cat.id}
                  style={[styles.modalCategoryChip, itemForm.category === cat.id && styles.modalCategoryChipActive]}
                  onPress={() => setItemForm({ ...itemForm, category: cat.id })}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[styles.modalCategoryText, itemForm.category === cat.id && styles.modalCategoryTextActive]}>
                    {cat.name.replace(/[^\w\s\u00C0-\u1EF9]/g, '')}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <InputField label="Số lượng" placeholder="500" value={itemForm.quantity} onChangeText={(text) => setItemForm({ ...itemForm, quantity: text })} />
              </View>
              <View style={{ flex: 1 }}>
                <InputField label="Hạn (Ngày)" placeholder="3" value={itemForm.expiryDays} onChangeText={(text) => setItemForm({ ...itemForm, expiryDays: text })} />
              </View>
            </View>

            {/* THÀNH PHẦN MỚI: BỘ CHỌN ĐƠN VỊ (UNIT PICKER) */}
            <Text style={[styles.modalLabel, { marginTop: 4 }]}>Đơn vị đo *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalCategoryScroll}>
              {UNITS.map(u => (
                <Pressable
                  key={u}
                  style={[styles.modalCategoryChip, itemForm.unit === u && styles.modalCategoryChipActive]}
                  onPress={() => setItemForm({ ...itemForm, unit: u })}
                >
                  <Text style={[styles.modalCategoryText, itemForm.unit === u && styles.modalCategoryTextActive]}>{u}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.modalActionRow}>
              <Pressable style={styles.modalBtnCancel} onPress={() => setShowItemModal(false)}><Text style={styles.modalBtnCancelText}>Hủy</Text></Pressable>
              <Pressable style={styles.modalBtnSubmit} onPress={handleSaveItem}>
                <Text style={styles.modalBtnSubmitText}>{editingId ? 'Cập nhật' : 'Lưu vào tủ'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* 3. MODAL XÁC NHẬN SỐ LƯỢNG KHI "ĐÃ DÙNG" */}
      {/* ========================================== */}
      <Modal visible={showConsumeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.addModalBox}>
             <Text style={styles.modalTitle}>🥣 Dùng bao nhiêu?</Text>
             <Text style={styles.modalSubtitle}>
               {consumingItem?.name} (Đang có: {consumingItem?.quantity} {consumingItem?.unit})
             </Text>
             
             <InputField 
               label={`Lượng sử dụng (${consumingItem?.unit})`}
               placeholder="Nhập số lượng..."
               value={consumeAmount}
               onChangeText={setConsumeAmount}
             />

             <View style={styles.modalActionRow}>
               <Pressable style={styles.modalBtnCancel} onPress={() => setShowConsumeModal(false)}>
                 <Text style={styles.modalBtnCancelText}>Hủy</Text>
               </Pressable>
               <Pressable style={styles.modalBtnSubmit} onPress={handleConfirmConsume}>
                 <Text style={styles.modalBtnSubmitText}>Xác nhận</Text>
               </Pressable>
             </View>
          </View>
        </View>
      </Modal>

    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  rootLayout: { flex: 1, padding: 16 },
  contentWrapper: { flex: 1 },
  rowLayout: { flexDirection: 'row', gap: 24 },
  sidebar: { width: 340 },
  internalPadding: { padding: 20 },
  mainListCol: { flex: 1 },
  mobileListCol: { flex: 1 },
  flatListContent: { paddingBottom: 130 },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '900', color: '#1A1D1E' },
  divider: { height: 4, width: 40, backgroundColor: COLORS.primary, borderRadius: 2, marginTop: 8 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16, gap: 10 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1A1D1E', padding: 0 },
  tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 12, padding: 4, marginBottom: 20 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: '#FFF', elevation: 1, ...Platform.select({web: {boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}) },
  tabText: { color: '#888', fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#1A1D1E', fontWeight: '700' },
  statsContainer: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  statNumber: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase' },
  wasteWidget: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F0F0F0' },
  wasteHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  wasteWidgetTitle: { fontSize: 14, fontWeight: '700', color: '#1A1D1E', textTransform: 'uppercase', letterSpacing: 0.5 },
  clearHistoryBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(244, 67, 54, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 4 },
  clearHistoryText: { color: '#F44336', fontSize: 12, fontWeight: '700' },
  wasteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  wasteItem: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  wasteIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  wasteNumber: { fontSize: 20, fontWeight: '800', color: '#1A1D1E' },
  wasteLabel: { fontSize: 12, color: '#888', fontWeight: '600' },
  wasteDivider: { width: 1, height: 40, backgroundColor: '#F0F0F0', marginHorizontal: 12 },
  sidebarAddBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, padding: 14, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 },
  sidebarAddText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  categoryContainer: { gap: 8, paddingHorizontal: 4 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0', gap: 8 },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryIcon: { fontSize: 16 },
  categoryText: { fontSize: 13, fontWeight: '600', color: '#555' },
  categoryTextActive: { color: '#FFF', fontWeight: '700' },
  emptyContainer: { alignItems: 'center', marginTop: 40, gap: 12 },
  emptyText: { color: '#888', fontSize: 15, fontWeight: '500' },

  // ================= STYLE MODAL =================
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24, ...Platform.select({ web: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 } }) },
  confirmModalBox: { width: '100%', maxWidth: 360, backgroundColor: '#FFF', borderRadius: 28, padding: 30, alignItems: 'center', ...Platform.select({ web: { boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }, default: { elevation: 10 } }) },
  confirmIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(244, 67, 54, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  addModalBox: { width: '100%', maxWidth: 400, backgroundColor: '#FFF', borderRadius: 28, padding: 24, ...Platform.select({ web: { boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }, default: { elevation: 10 } }) },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#1A1D1E', marginBottom: 12, textAlign: 'center' },
  modalSubtitle: { fontSize: 15, color: '#666', lineHeight: 22, textAlign: 'center', marginBottom: 24 },
  modalLabel: { color: '#1A1D1E', marginBottom: 8, fontSize: 14, fontWeight: '700' },
  modalCategoryScroll: { marginBottom: 12 },
  modalCategoryChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', marginRight: 8, gap: 6 },
  modalCategoryChipActive: { backgroundColor: 'rgba(76, 175, 80, 0.1)', borderColor: COLORS.primary },
  modalCategoryText: { fontSize: 13, fontWeight: '600', color: '#666', textTransform: 'capitalize' },
  modalCategoryTextActive: { color: COLORS.primary, fontWeight: '700' },
  modalActionRow: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 },
  modalBtnCancel: { flex: 1, paddingVertical: 14, backgroundColor: '#F5F5F5', borderRadius: 12, alignItems: 'center' },
  modalBtnCancelText: { color: '#666', fontWeight: '700', fontSize: 15 },
  modalBtnSubmit: { flex: 1, paddingVertical: 14, backgroundColor: COLORS.primary, borderRadius: 12, alignItems: 'center' },
  modalBtnSubmitText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});

export default PantryScreen;