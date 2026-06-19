// src/screens/RecipesScreen.js
import React, { useState, useCallback } from 'react';
import { View, TextInput, StyleSheet, Platform, useWindowDimensions, Modal, Text, Pressable, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ResponsiveContainer from '../components/ResponsiveContainer';
import RecipeTabBar from '../components/recipes/RecipeTabBar';
import CommunityRecipesTab from '../components/recipes/CommunityRecipesTab';
import MyRecipesTab from '../components/recipes/MyRecipesTab';
import SavedRecipesTab from '../components/recipes/SavedRecipesTab';
import RecipeFormModal from '../components/recipe-form/RecipeFormModal';
import { useAppStore } from '../store/useAppStore';
import { recipeApi } from '../services/api';
import { RECIPE_FILTERS } from '../utils/mockRecipes';
import { COLORS } from '../constants/theme';

const RecipesScreen = ({ navigation }) => {
  const { width: windowWidth } = useWindowDimensions();

  const {
    pantryItems, savedRecipeIds, toggleSaveRecipe, setTabBarVisible,
    myRecipes, draftRecipes,
    addMyRecipe, updateMyRecipe, deleteMyRecipe,
    saveDraft, deleteDraft,
    userProfile
  } = useAppStore();

  const [dbRecipes, setDbRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // LỌC CÔNG THỨC: Phân loại dữ liệu từ Database
  // Lấy User ID chuẩn (thường là user_id hoặc id của user gốc)
  const currentUserId = userProfile?.user_id || userProfile?.userId || userProfile?.id;
  console.log('🆔 [ID dùng để lọc]:', currentUserId);
  
  // Cộng đồng = Tất cả món KHÔNG PHẢI của mình tạo
  const communityRecipes = dbRecipes.filter(r => String(r.createdBy) !== String(currentUserId));
  
  // Do bạn tạo = Chỉ những món do chính mình tạo
  const myDbRecipes = dbRecipes.filter(r => {
    if (!currentUserId || !r.createdBy) return false;
    return String(r.createdBy).trim() === String(currentUserId).trim();
  });

  // 3. Đã lưu = Những món có ID nằm trong danh sách yêu thích
  const savedRecipes = dbRecipes.filter(r => savedRecipeIds.has(Number(r.id)));

  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      const res = await recipeApi.getAll();
      if (res.success && res.data && res.data.success) {
        setDbRecipes(res.data.data);
      }
    } catch (err) {
      console.error('❌ [Recipes] Lỗi fetch:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // HÀM TẠO MOCK DATA (Theo ý Ngân)
  const handleCreateMockRecipe = async () => {
    try {
      setIsLoading(true);
      const mockData = {
        name_vn: "Sườn xào chua ngọt của Ngân",
        image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
        calories: 450,
        protein: 30,
        carbs: 20,
        fat: 15,
        ingredients: [{ name: "Sườn non", amount: "500g" }, { name: "Hành tây", amount: "1 củ" }],
        steps: ["Rửa sạch sườn", "Chiên vàng", "Xào với sốt chua ngọt"],
        cooking_time: "45 phút",
        servings: "2 người"
      };

      const res = await recipeApi.create(mockData);
      if (res.success) {
        alert("🎉 Món 'Sườn xào chua ngọt' đã được lưu vào DB!");
        await fetchRecipes(); // Tải lại danh sách để hiện món mới
      }
    } catch (error) {
      alert("Lỗi khi tạo món mẫu");
    } finally {
      setIsLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState('community');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);

  // STATE MỚI: Quản lý hiển thị form đánh giá
  const [showReviewForm, setShowReviewForm] = useState(false);

  // STATE MỚI: Quản lý Header Động và Lọc
  const [activeFilters, setActiveFilters] = useState(['all']);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Show tab bar and fetch data
  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(true);
      fetchRecipes();
      return () => {};
    }, [setTabBarVisible])
  );

  // LUỒNG 1: Dành cho tab Cộng đồng & Đã lưu -> Mở trang chi tiết
  const handleRecipePress = (recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  // LUỒNG 2: Dành cho tab Cá nhân -> Mở Form để Xem/Sửa
  const handleOpenForm = (recipe) => {
    setEditingRecipe(recipe);
    setIsEditingDraft(!!recipe.isDraft);
    setShowForm(true);
  };

  // Dành cho nút Xem đánh giá
  const handleShowReviews = (recipe) => {
    setEditingRecipe(recipe);
    setShowReviewForm(true);
  };

  const handleSaveForm = async (data) => {
    try {
      setIsLoading(true);
      let finalImageUrl = data.image;

      // KIỂM TRA: Nếu ảnh là link cục bộ (từ máy) thì phải upload lên Cloudinary trước
      if (data.image && (data.image.startsWith('file:') || data.image.startsWith('blob:') || !data.image.startsWith('http'))) {
        console.log('☁️ [Upload] Đang tải ảnh lên Cloudinary...');
        const uploadRes = await recipeApi.uploadImage(data.image);
        if (uploadRes.success && uploadRes.data.data.url) {
          finalImageUrl = uploadRes.data.data.url;
          console.log('✅ [Upload] Ảnh đã lên mây:', finalImageUrl);
        } else {
          alert("⚠️ Không thể tải ảnh lên Cloudinary. Vui lòng thử lại!");
          setIsLoading(false);
          return;
        }
      }

      // Gửi dữ liệu lên Backend
      const recipePayload = {
        name_vn: data.title,
        image_url: finalImageUrl,
        calories: data.macros?.calories || 0,
        protein: data.macros?.protein || 0,
        carbs: data.macros?.carbs || 0,
        fat: data.macros?.fat || 0,
        ingredients: data.ingredients || [],
        steps: data.steps || [],
        cooking_time: data.cookTime || "30",
        servings: data.servings || "1",
        category: data.category || "Do bạn tạo",
        goals: data.goals || [],
        meal_times: data.mealTimes || []
      };

      let res;
      if (editingRecipe && !isEditingDraft) {
        // TRƯỜNG HỢP: Cập nhật món cũ
        console.log('🔄 [Update] Đang cập nhật công thức ID:', editingRecipe.id);
        res = await recipeApi.update(editingRecipe.id, recipePayload);
      } else {
        // TRƯỜNG HỢP: Tạo món mới hoàn toàn
        console.log('✨ [Create] Đang tạo công thức mới...');
        res = await recipeApi.create(recipePayload);
      }

      if (res.success) {
        alert("✅ Đã lưu công thức mới vào Database thành công!");
        await fetchRecipes(); // Tải lại danh sách để hiện món vừa tạo
      } else {
        alert("⚠️ Lỗi: " + res.error);
      }
    } catch (error) {
      console.error("❌ Lỗi lưu form:", error);
    } finally {
      setIsLoading(false);
      setShowForm(false);
      setEditingRecipe(null);
    }
  };

  const handleSaveDraft = (data) => {
    saveDraft({ ...data, id: editingRecipe?.id || `draft_${Date.now()}`, isDraft: true });
    setShowForm(false);
    setEditingRecipe(null);
  };

  const handleExplore = () => {
    setActiveTab('community');
  };

  return (
    <ResponsiveContainer useImageBg={false}>
      <View style={styles.container}>
        {/* Dynamic Header */}
        <View style={styles.headerRow}>
          {!isSearchExpanded ? (
            <>
              {/* Tab Bar takes up remaining space */}
              <RecipeTabBar activeTab={activeTab} onChange={setActiveTab} />
              
              {/* Action Buttons */}
              <View style={styles.headerActions}>
                <Pressable onPress={() => setIsSearchExpanded(true)} style={styles.iconButton}>
                  <Ionicons name="search" size={20} color="#1A1D1E" />
                </Pressable>
                
                <Pressable onPress={() => setIsFilterModalVisible(true)} style={styles.iconButton}>
                  <Ionicons name="options-outline" size={20} color="#1A1D1E" />
                  {/* Badge for active filters */}
                  {activeFilters.length > 0 && !activeFilters.includes('all') && (
                    <View style={styles.filterBadge} />
                  )}
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.expandedSearchWrap}>
              <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
              <TextInput
                autoFocus
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Tìm công thức..."
                placeholderTextColor="#AAA"
                style={styles.searchInput}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearchBtn} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color="#BBB" />
                </Pressable>
              )}
              <Pressable onPress={() => setIsSearchExpanded(false)} style={styles.closeSearchBtn}>
                <Text style={styles.closeSearchText}>Đóng</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Tab content */}
        <View style={styles.content}>
          {activeTab === 'community' && (
            <CommunityRecipesTab
              dbRecipes={communityRecipes}
              isLoading={isLoading}
              searchQuery={searchQuery}
              activeFilters={activeFilters}
              onRecipePress={handleRecipePress}
              onSaveToggle={toggleSaveRecipe}
              savedIds={savedRecipeIds}
              pantryItems={pantryItems}
            />
          )}
          {activeTab === 'my' && (
            <MyRecipesTab
              myRecipes={myDbRecipes}
              drafts={draftRecipes}
              onRecipePress={handleOpenForm}
              onEdit={handleOpenForm}
              onShowReviews={handleShowReviews}
              onSaveToggle={() => {}}
              savedIds={new Set()}
              pantryItems={pantryItems}
              onCreate={() => { setEditingRecipe(null); setIsEditingDraft(false); setShowForm(true); }}
              onDelete={deleteMyRecipe}
              onDeleteDraft={deleteDraft}
            />
          )}
          {activeTab === 'saved' && (
            <SavedRecipesTab
              recipes={savedRecipes}
              savedIds={savedRecipeIds}
              onRecipePress={handleRecipePress}
              onSaveToggle={toggleSaveRecipe}
              pantryItems={pantryItems}
              onExplore={handleExplore}
            />
          )}
        </View>

        {/* Form Modal */}
        <RecipeFormModal
          visible={showForm}
          onClose={() => { setShowForm(false); setEditingRecipe(null); }}
          onSave={handleSaveForm}
          onDraft={handleSaveDraft}
          initialData={editingRecipe}
        />

        {/* Chờ tích hợp Modal Đánh Giá */}
        {showReviewForm && (
           <View style={{display: 'none'}}>
               {/* Đặt component ReviewModal của bạn ở đây */}
           </View>
        )}

        {/* Filter Bottom Sheet / Modal */}
        <Modal visible={isFilterModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Bộ lọc tìm kiếm</Text>
                <Pressable onPress={() => setIsFilterModalVisible(false)} hitSlop={10}>
                  <Ionicons name="close" size={24} color="#1A1D1E" />
                </Pressable>
              </View>
              
              <ScrollView contentContainerStyle={styles.sheetContent}>
                <View style={styles.filterGrid}>
                  {RECIPE_FILTERS.map((filter) => {
                    const isActive = activeFilters.includes(filter.id);
                    return (
                      <Pressable
                        key={filter.id}
                        onPress={() => {
                          if (filter.id === 'all') {
                            setActiveFilters(['all']);
                          } else {
                            let newFilters = activeFilters.filter(f => f !== 'all');
                            if (newFilters.includes(filter.id)) {
                              newFilters = newFilters.filter(f => f !== filter.id);
                              if (newFilters.length === 0) newFilters = ['all'];
                            } else {
                              newFilters.push(filter.id);
                            }
                            setActiveFilters(newFilters);
                          }
                        }}
                        style={[styles.filterChip, isActive && styles.filterChipActive]}
                      >
                        {isActive && filter.id !== 'all' && (
                          <Ionicons name="checkmark" size={14} color="#FFF" style={{marginRight: 4}} />
                        )}
                        <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{filter.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
              
              <View style={styles.sheetFooter}>
                <Pressable onPress={() => setIsFilterModalVisible(false)} style={styles.applyBtn}>
                  <Text style={styles.applyBtnText}>Áp dụng ({activeFilters.includes('all') ? 'Tất cả' : activeFilters.length})</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 4, paddingBottom: 90 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, marginTop: 4, height: 44 },
  headerActions: { flexDirection: 'row', gap: 8, marginLeft: 12 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  filterBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.danger, borderWidth: 1, borderColor: '#FFF' },
  expandedSearchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 22, paddingHorizontal: 14, height: 44, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', ...Platform.select({ web: { boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }, default: { elevation: 1 } }) },
  clearSearchBtn: { padding: 4 },
  closeSearchBtn: { marginLeft: 8, paddingHorizontal: 8, justifyContent: 'center' },
  closeSearchText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  searchIcon: { marginTop: 1 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1A1D1E', paddingVertical: 0, outlineStyle: 'none' },
  content: { flex: 1 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, maxHeight: '80%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#1A1D1E' },
  sheetContent: { paddingBottom: 20 },
  filterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: 14, fontWeight: '600', color: '#555' },
  filterChipTextActive: { color: '#FFF' },
  sheetFooter: { marginTop: 10 },
  applyBtn: { backgroundColor: '#1A1D1E', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  applyBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});

export default RecipesScreen;