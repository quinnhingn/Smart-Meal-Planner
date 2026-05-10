// src/screens/RecipesScreen.js
import React, { useState, useCallback } from 'react';
import { View, TextInput, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ResponsiveContainer from '../components/ResponsiveContainer';
import RecipeTabBar from '../components/recipes/RecipeTabBar';
import CommunityRecipesTab from '../components/recipes/CommunityRecipesTab';
import MyRecipesTab from '../components/recipes/MyRecipesTab';
import SavedRecipesTab from '../components/recipes/SavedRecipesTab';
import RecipeFormModal from '../components/recipe-form/RecipeFormModal';
import AIFloatingChip from '../components/recipes/AIFloatingChip';
import { useAppStore } from '../store/useAppStore';
import { recipeApi } from '../services/api';

const RecipesScreen = ({ navigation }) => {
  const { width: windowWidth } = useWindowDimensions();
  const isWebLarge = Platform.OS === 'web' && windowWidth > 768;

  const {
    pantryItems, savedRecipeIds, toggleSaveRecipe, setTabBarVisible,
    myRecipes, draftRecipes,
    addMyRecipe, updateMyRecipe, deleteMyRecipe,
    saveDraft, deleteDraft,
  } = useAppStore();

  const [dbRecipes, setDbRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      console.log('🚀 [Recipes] Đang gọi API lấy danh sách món ăn...');
      const res = await recipeApi.getAll();
      console.log('📦 [Recipes] Kết quả từ API:', res);

      if (res.success && res.data && res.data.success) {
        console.log('✅ [Recipes] Đã lấy được', res.data.data.length, 'món ăn');
        setDbRecipes(res.data.data);
      } else {
        console.warn('⚠️ [Recipes] API trả về không thành công:', res.error || 'Unknown error');
      }
    } catch (err) {
      console.error('❌ [Recipes] Lỗi khi gọi API:', err);
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

  const handleSaveForm = (data) => {
    if (editingRecipe && !isEditingDraft) {
      updateMyRecipe(editingRecipe.id, { ...data, id: editingRecipe.id });
    } else {
      const newRecipe = { ...data, id: `my_${Date.now()}`, author: { name: 'Bạn', avatar: '' } };
      delete newRecipe.isDraft; // Đảm bảo xóa cờ draft khi đăng
      addMyRecipe(newRecipe);

      // XÓA BẢN NHÁP SAU KHI ĐĂNG THÀNH CÔNG
      if (isEditingDraft) {
        deleteDraft(editingRecipe.id);
      }
    }
    setShowForm(false);
    setEditingRecipe(null);
  };

  const handleSaveDraft = (data) => {
    saveDraft({ ...data, id: editingRecipe?.id || `draft_${Date.now()}`, isDraft: true });
    setShowForm(false);
    setEditingRecipe(null);
  };

  const handleExplore = () => {
    setActiveTab('community');
  };

  const handleAIPress = () => {
    navigation.navigate('Scan', { mode: 'recipe' });
  };

  return (
    <ResponsiveContainer useImageBg={false}>
      <View style={styles.container}>
        {/* Search bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Tìm công thức..."
              placeholderTextColor="#AAA"
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <Ionicons name="close-circle" size={18} color="#BBB" onPress={() => setSearchQuery('')} />
            )}
          </View>
        </View>

        {/* Tab bar */}
        <RecipeTabBar activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab content */}
        <View style={styles.content}>
          {activeTab === 'community' && (
            <CommunityRecipesTab
              dbRecipes={dbRecipes}
              isLoading={isLoading}
              searchQuery={searchQuery}
              onRecipePress={handleRecipePress}
              onSaveToggle={toggleSaveRecipe}
              savedIds={savedRecipeIds}
              pantryItems={pantryItems}
            />
          )}
          {activeTab === 'my' && (
            <MyRecipesTab
              myRecipes={myRecipes}
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
              savedIds={savedRecipeIds}
              onRecipePress={handleRecipePress}
              onSaveToggle={toggleSaveRecipe}
              pantryItems={pantryItems}
              onExplore={handleExplore}
            />
          )}
        </View>

        {/* AI Chip — chỉ hiện ở tab Cộng đồng */}
        {activeTab === 'community' && <AIFloatingChip onPress={handleAIPress} />}

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
      </View>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 4 },
  searchRow: { paddingHorizontal: 16, marginBottom: 8, marginTop: 4 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, gap: 10,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
    ...Platform.select({ web: { boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }, default: { elevation: 1 } }),
  },
  searchIcon: { marginTop: 1 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1A1D1E', paddingVertical: 0, outlineStyle: 'none' },
  content: { flex: 1 },
});

export default RecipesScreen;