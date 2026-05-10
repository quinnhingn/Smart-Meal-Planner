// src/screens/PantryScreen.js
import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Platform, 
  useWindowDimensions, Pressable, TextInput, FlatList, Modal,
  KeyboardAvoidingView, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ResponsiveContainer from '../components/ResponsiveContainer';
import PantryItemCard from '../components/pantry/PantryItemCard';
import HistoryItemCard from '../components/pantry/HistoryItemCard';
import InputField from '../components/InputField'; 
import { useAppStore } from '../store/useAppStore';
import { COLORS } from '../constants/theme';
import { CATEGORIES, getDaysUntilExpiry } from '../utils/mockPantryData';

const UNITS = ['g', 'kg', 'ml', 'l', 'quả', 'bó', 'miếng', 'hộp'];

const EXPIRY_FILTERS = [
  { id: 'all', label: 'Tất cả', color: '#1A1D1E', icon: 'apps' },
  { id: 'expired', label: 'Đã hết hạn', color: '#F44336', icon: 'alert-circle' },
  { id: 'soon', label: 'Sắp hết hạn', color: '#FF9800', icon: 'time' },
  { id: 'warning', label: 'Cần chú ý', color: '#FBC02D', icon: 'warning' },
  { id: 'good', label: 'Còn tốt', color: '#4CAF50', icon: 'checkmark-circle' },
];

const MODAL_CATEGORIES = CATEGORIES.filter(c => c.id !== 'all');

const PantryScreen = ({ navigation }) => {
  const { width: windowWidth } = useWindowDimensions();
  const {
    selectedCategory, setSelectedCategory,
    searchQuery, setSearchQuery, getFilteredItems,
    getPantryStats, pantryHistory, removePantryItemWithHistory,
    clearPantryHistory, addPantryItems, updatePantryItem, showToast,
    consumePantryItem, restorePantryItem, fetchPantryItems, fetchPantryHistory,
    isLoading, pantryItems
  } = useAppStore();

  // TỰ ĐỘNG LOAD DỮ LIỆU KHI MỞ TRANG
  useFocusEffect(
    useCallback(() => {
      if(fetchPantryItems) fetchPantryItems();
      if(fetchPantryHistory) fetchPantryHistory();
    }, [])
  );

  const [activeTab, setActiveTab] = useState('active');
  const [expiryFilter, setExpiryFilter] = useState('all');
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false); 
  const [editingId, setEditingId] = useState(null); 
  
  const [showConsumeModal, setShowConsumeModal] = useState(false);
  const [consumingItem, setConsumingItem] = useState(null);
  const [consumeAmount, setConsumeAmount] = useState('');

  const [itemForm, setItemForm] = useState({ 
    name: '', quantity: '', expiryDays: '', category: 'vegetable', unit: 'g' 
  });

  const isWebLarge = Platform.OS === 'web' && windowWidth > 768;
  const rightColumnWidth = windowWidth * 0.7;
  const numColumns = isWebLarge ? Math.max(2, Math.floor(rightColumnWidth / 300)) : 1;

  const getItemExpiryStatus = (item) => {
    const days = getDaysUntilExpiry(item);
    if (days < 0) return 'expired';
    if (days <= 2) return 'soon';
    if (days <= 7) return 'warning';
    return 'good';
  };

  const baseItems = getFilteredItems();
  const filteredItems = useMemo(() => {
    if (activeTab !== 'active') return baseItems;
    if (expiryFilter === 'all') return baseItems;
    return baseItems.filter(item => getItemExpiryStatus(item) === expiryFilter);
  }, [baseItems, activeTab, expiryFilter]);

  const stats = getPantryStats();

  const handleFindRecipe = (item) => navigation.navigate('Suggestions', { ingredientId: item.id });

  const handleClearHistory = () => {
    clearPantryHistory();
    setShowConfirmModal(false);
    showToast('Đã xóa toàn bộ lịch sử!', 'success');
  };

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
      unit: item.unit || 'g'
    });
    setShowItemModal(true);
  };

  const handleOpenConsume = (item) => {
    setConsumingItem(item);
    setConsumeAmount(item.quantity.toString());
    setShowConsumeModal(true);
  };

  const handleConfirmConsume = () => {
    const amountToConsume = parseFloat(consumeAmount);
    
    if (isNaN(amountToConsume) || amountToConsume <= 0) {
      showToast('Vui lòng nhập số lượng hợp lệ!', 'error');
      return;
    }
    if (consumingItem && amountToConsume > consumingItem.quantity) {
      showToast(`Số lượng không được vượt quá ${consumingItem.quantity} ${consumingItem.unit}`, 'error');
      return;
    }

    if (consumingItem) {
      consumePantryItem(consumingItem.id, amountToConsume);
      setShowConsumeModal(false);
    }
  };

  const handleSaveItem = () => {
    if (!itemForm.name.trim()) {
      showToast('Vui lòng nhập tên nguyên liệu', 'error');
      return;
    }

    const itemData = {
      name: itemForm.name.trim(),
      quantity: Math.max(0, parseFloat(itemForm.quantity) || 1),
      expiryDays: Math.max(0, parseInt(itemForm.expiryDays) || 3),
      category: itemForm.category,
      unit: itemForm.unit,
    };

    if (editingId) {
      updatePantryItem(editingId, itemData);
      showToast('Đã cập nhật nguyên liệu!', 'success');
    } else {
      addPantryItems([{
        ...itemData,
        icon: CATEGORIES.find(c => c.id === itemForm.category)?.icon || '📦',
        addedAt: new Date().toISOString(), 
      }]);
    }
    
    setShowItemModal(false);
  };

  const renderHeaderContent = () => (
    <View style={styles.solidHeaderCard}>
      <View style={styles.internalPadding}>
        
        {/* ROW 1: SEARCH + ADD */}
        <View style={styles.topRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm nguyên liệu..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#BBB"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearch}>
                <Ionicons name="close-circle" size={18} color="#CCC" />
              </Pressable>
            )}
          </View>
          <Pressable style={styles.addIconBtn} onPress={handleOpenAdd}>
            <Ionicons name="add" size={24} color="#FFF" />
          </Pressable>
        </View>

        {/* ROW 2: TABS */}
        <View style={styles.tabContainer}>
          <Pressable 
            style={[styles.tabBtn, activeTab === 'active' && styles.tabBtnActive]} 
            onPress={() => { setActiveTab('active'); setExpiryFilter('all'); }}
          >
            <Ionicons 
              name="cube" 
              size={14} 
              color={activeTab === 'active' ? '#1A1D1E' : '#888'} 
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
              Đang trữ
            </Text>
          </Pressable>
          <Pressable 
            style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]} 
            onPress={() => setActiveTab('history')}
          >
            <Ionicons 
              name="time-outline" 
              size={14} 
              color={activeTab === 'history' ? '#1A1D1E' : '#888'} 
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
              Lịch sử
            </Text>
          </Pressable>
        </View>

        {/* ROW 3: EXPIRY FILTERS */}
        {activeTab === 'active' && (
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionLabel}>Lọc theo hạn sử dụng</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {EXPIRY_FILTERS.map((f) => {
                const isActive = expiryFilter === f.id;
                return (
                  <Pressable
                    key={f.id}
                    style={[
                      styles.filterChip,
                      isActive && { backgroundColor: f.color + '15', borderColor: f.color }
                    ]}
                    onPress={() => setExpiryFilter(f.id)}
                  >
                    <Ionicons 
                      name={f.icon} 
                      size={14} 
                      color={isActive ? f.color : '#888'} 
                    />
                    <Text style={[
                      styles.filterChipText,
                      isActive && { color: f.color, fontWeight: '800' }
                    ]}>
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ROW 4: WASTE WIDGET */}
        {activeTab === 'history' && (
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
                <View style={[styles.wasteIconBox, { backgroundColor: 'rgba(76, 175, 80, 0.12)' }]}>
                  <Ionicons name="restaurant" size={20} color="#4CAF50" />
                </View>
                <View>
                  <Text style={styles.wasteNumber}>{stats.consumed}</Text>
                  <Text style={styles.wasteLabel}>Đã nấu</Text>
                </View>
              </View>
              <View style={styles.wasteDivider} />
              <View style={styles.wasteItem}>
                <View style={[styles.wasteIconBox, { backgroundColor: 'rgba(244, 67, 54, 0.12)' }]}>
                  <Ionicons name="trash" size={20} color="#F44336" />
                </View>
                <View>
                  <Text style={styles.wasteNumber}>{stats.discarded}</Text>
                  <Text style={styles.wasteLabel}>Vứt đi</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <ResponsiveContainer useImageBg={false}>
      <View style={styles.rootLayout}>
        <View style={[styles.contentWrapper, isWebLarge && styles.rowLayout]}>
          
          {isWebLarge && <View style={styles.sidebar}>{renderHeaderContent()}</View>}
          
          <View style={isWebLarge ? styles.mainListCol : styles.mobileListCol}>
            
            {isLoading && pantryItems?.length === 0 ? (
              <View style={styles.centerAll}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 12, color: '#888' }}>Đang kiểm tra tủ lạnh...</Text>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                {/* KHU VỰC ĐÃ FIX: Bỏ flex: 0, sử dụng zIndex và bọc Category Filter với View có minHeight */}
                <View style={{ zIndex: 10, paddingBottom: 8 }}>
                  {!isWebLarge && <View style={{ marginBottom: 12 }}>{renderHeaderContent()}</View>}
                  
                  {/* CATEGORY FILTER */}
                  {activeTab === 'active' && (
                    <View style={{ minHeight: 48, marginBottom: 8 }}>
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        contentContainerStyle={styles.categoryContainer}
                        style={{ flexGrow: 0 }}
                      >
                        {CATEGORIES.map((cat) => (
                          <Pressable 
                            key={cat.id} 
                            style={[
                              styles.categoryChip, 
                              selectedCategory === cat.id && styles.categoryChipActive
                            ]} 
                            onPress={() => setSelectedCategory(cat.id)}
                          >
                            <Text style={styles.categoryIcon}>{cat.icon}</Text>
                            <Text style={[
                              styles.categoryText, 
                              selectedCategory === cat.id && styles.categoryTextActive
                            ]}>
                              {cat.name.replace(/[^\w\s\u00C0-\u1EF9]/g, '')}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* MAIN SCROLLABLE LIST */}
                <View style={{ flex: 1 }}>
                  <FlatList
                    key={`${activeTab}-${numColumns}`} 
                    data={activeTab === 'active' ? filteredItems : pantryHistory}
                    renderItem={({ item }) => (
                      <View style={{ flex: 1, paddingHorizontal: 6, maxWidth: isWebLarge ? `${100 / numColumns}%` : '100%' }}>
                        {activeTab === 'active' ? (
                          <PantryItemCard 
                            item={item} 
                            onUse={() => handleOpenConsume(item)}
                            onDelete={(id) => removePantryItemWithHistory(id, 'discarded')} 
                            onEdit={handleOpenEdit} 
                            onFindRecipe={handleFindRecipe} 
                          />
                        ) : (
                          <HistoryItemCard 
                            item={item} 
                            onUndo={() => restorePantryItem(item.id)}
                          />
                        )}
                      </View>
                    )}
                    keyExtractor={(item) => item.id}
                    numColumns={numColumns}
                    contentContainerStyle={styles.flatListContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                      <View style={styles.emptyContainer}>
                        <Ionicons 
                          name={activeTab === 'active' ? "basket-outline" : "receipt-outline"} 
                          size={48} 
                          color="#DDD" 
                        />
                        <Text style={styles.emptyText}>
                          {activeTab === 'active' 
                            ? 'Không có nguyên liệu nào phù hợp.' 
                            : 'Chưa có lịch sử sử dụng.'}
                        </Text>
                        {activeTab === 'active' && expiryFilter !== 'all' && (
                          <Pressable onPress={() => setExpiryFilter('all')} style={styles.resetFilterBtn}>
                            <Text style={styles.resetFilterText}>Xem tất cả</Text>
                          </Pressable>
                        )}
                      </View>
                    }
                  />
                </View>
              </View>
            )}

          </View>
        </View>
      </View>

      {/* --- CÁC MODALS GIỮ NGUYÊN BÊN DƯỚI --- */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalBox}>
            <View style={styles.confirmIconCircle}>
              <Ionicons name="trash" size={32} color="#F44336" />
            </View>
            <Text style={styles.modalTitle}>Xóa lịch sử?</Text>
            <Text style={styles.modalSubtitle}>
              Tất cả dữ liệu về các món đã dùng và đã vứt sẽ bị xóa vĩnh viễn. Bạn chắc chắn chứ?
            </Text>
            <View style={styles.modalActionRow}>
              <Pressable style={styles.modalBtnCancel} onPress={() => setShowConfirmModal(false)}>
                <Text style={styles.modalBtnCancelText}>Để sau</Text>
              </Pressable>
              <Pressable style={[styles.modalBtnSubmit, { backgroundColor: '#F44336' }]} onPress={handleClearHistory}>
                <Text style={styles.modalBtnSubmitText}>Đồng ý xóa</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showItemModal} transparent animationType="fade">
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.addModalBox}>
            <Text style={styles.modalTitle}>{editingId ? '✏️ Sửa nguyên liệu' : '📦 Thêm nguyên liệu'}</Text>
            
            <InputField 
              label="Tên nguyên liệu *" 
              placeholder="VD: Cà chua..." 
              value={itemForm.name} 
              onChangeText={(text) => setItemForm({ ...itemForm, name: text })} 
            />
            
            <Text style={styles.modalLabel}>Phân loại *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalCategoryScroll}>
              {MODAL_CATEGORIES.map(cat => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.modalCategoryChip, 
                    itemForm.category === cat.id && styles.modalCategoryChipActive
                  ]}
                  onPress={() => setItemForm({ ...itemForm, category: cat.id })}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[
                    styles.modalCategoryText, 
                    itemForm.category === cat.id && styles.modalCategoryTextActive
                  ]}>
                    {cat.name.replace(/[^\w\s\u00C0-\u1EF9]/g, '')}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <InputField 
                  label="Số lượng" 
                  placeholder="500" 
                  value={itemForm.quantity} 
                  onChangeText={(text) => setItemForm({ ...itemForm, quantity: text })} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField 
                  label="Hạn (Ngày)" 
                  placeholder="3" 
                  value={itemForm.expiryDays} 
                  onChangeText={(text) => setItemForm({ ...itemForm, expiryDays: text })} 
                />
              </View>
            </View>

            <Text style={[styles.modalLabel, { marginTop: 4 }]}>Đơn vị đo *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalCategoryScroll}>
              {UNITS.map(u => (
                <Pressable
                  key={u}
                  style={[
                    styles.modalCategoryChip, 
                    itemForm.unit === u && styles.modalCategoryChipActive
                  ]}
                  onPress={() => setItemForm({ ...itemForm, unit: u })}
                >
                  <Text style={[
                    styles.modalCategoryText, 
                    itemForm.unit === u && styles.modalCategoryTextActive
                  ]}>{u}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.modalActionRow}>
              <Pressable style={styles.modalBtnCancel} onPress={() => setShowItemModal(false)}>
                <Text style={styles.modalBtnCancelText}>Hủy</Text>
              </Pressable>
              <Pressable style={styles.modalBtnSubmit} onPress={handleSaveItem}>
                <Text style={styles.modalBtnSubmitText}>{editingId ? 'Cập nhật' : 'Lưu vào tủ'}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showConsumeModal} transparent animationType="fade">
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
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
        </KeyboardAvoidingView>
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

  centerAll: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    minHeight: 200,
  },

  solidHeaderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    width: '100%',
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
      default: { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
    }),
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1D1E',
    padding: 0,
  },
  clearSearch: {
    padding: 2,
  },
  addIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(76,175,80,0.3)' },
      default: { elevation: 3 },
    }),
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#FFF',
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
      default: { elevation: 1 },
    }),
  },
  tabText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#1A1D1E',
    fontWeight: '800',
  },

  filterSection: {
    marginBottom: 4,
  },
  filterSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#AAA',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  filterScroll: {
    gap: 8,
    paddingRight: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },

  categoryContainer: {
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
    flexGrow: 1, 
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    marginRight: 8, 
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary + '12',
    borderColor: COLORS.primary,
  },
  categoryIcon: { fontSize: 15 },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  categoryTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  wasteWidget: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginTop: 4,
  },
  wasteHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  wasteWidgetTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1D1E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearHistoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  clearHistoryText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '700',
  },
  wasteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wasteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  wasteIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wasteNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1D1E',
  },
  wasteLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    marginTop: 2,
  },
  wasteDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 12,
  },

  sidebarAddBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(76,175,80,0.25)' },
      default: { elevation: 2 },
    }),
  },
  sidebarAddText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
    paddingHorizontal: 24,
  },
  emptyText: {
    color: '#AAA',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  resetFilterBtn: {
    marginTop: 8,
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  resetFilterText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 14,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    ...Platform.select({
      web: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 },
    }),
  },
  confirmModalBox: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 30,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
      default: { elevation: 10 },
    }),
  },
  confirmIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(244, 67, 54, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  addModalBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 24,
    ...Platform.select({
      web: { boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
      default: { elevation: 10 },
    }),
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1D1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalLabel: {
    color: '#1A1D1E',
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '800',
  },
  modalCategoryScroll: {
    marginBottom: 12,
  },
  modalCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    marginRight: 8,
    gap: 6,
  },
  modalCategoryChipActive: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
  },
  modalCategoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'capitalize',
  },
  modalCategoryTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    alignItems: 'center',
  },
  modalBtnCancelText: {
    color: '#666',
    fontWeight: '800',
    fontSize: 15,
  },
  modalBtnSubmit: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalBtnSubmitText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
});

export default PantryScreen;