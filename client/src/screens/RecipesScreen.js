// src/screens/RecipesScreen.js
import React, { useState, useCallback } from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
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

const RecipesScreen = ({ navigation }) => {
  const {
    pantryItems, savedRecipeIds, toggleSaveRecipe,
    setTabBarVisible, myRecipes, draftRecipes,
    addMyRecipe, updateMyRecipe, deleteMyRecipe,
    saveDraft, deleteDraft,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('community');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  
  // STATE MỚI: Quản lý hiển thị form đánh giá
  const [showReviewForm, setShowReviewForm] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(true);
      return () => {};
    }, [setTabBarVisible])
  );

  // LUỒNG 1: Dành cho tab Cộng đồng & Đã lưu -> Mở trang chi tiết
  const handleRecipeDetail = (recipe) => {
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
              searchQuery={searchQuery}
              onRecipePress={handleRecipeDetail} // Truyền Luồng 1
              onSaveToggle={toggleSaveRecipe}
              savedIds={savedRecipeIds}
              pantryItems={pantryItems}
            />
          )}
          {activeTab === 'my' && (
            <MyRecipesTab
              myRecipes={myRecipes}
              drafts={draftRecipes}
              onRecipePress={handleOpenForm} // Truyền Luồng 2
              onEdit={handleOpenForm}        // Truyền Luồng 2
              onShowReviews={handleShowReviews} // Truyền hàm mở Review
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
              onRecipePress={handleRecipeDetail} // Truyền Luồng 1
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