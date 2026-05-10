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
  
  // KHÔI PHỤC STATE TÌM KIẾM (Đã fix lỗi undefined)
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  
  // State quản lý việc mở modal đánh giá
  const [showReviewForm, setShowReviewForm] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(true);
      return () => {};
    }, [setTabBarVisible])
  );

  // Nhấn vào card sẽ mở form để xem hoặc sửa
  const handleRecipePress = (recipe) => {
    setEditingRecipe(recipe);
    setIsEditingDraft(!!recipe.isDraft);
    setShowForm(true);
  };

  // Mở form đánh giá
  const handleShowReviews = (recipe) => {
    setEditingRecipe(recipe);
    setShowReviewForm(true);
  };

  // Lưu công thức (Đăng bài / Cập nhật)
  const handleSaveForm = (data) => {
    if (editingRecipe && !isEditingDraft) {
      updateMyRecipe(editingRecipe.id, { ...data, id: editingRecipe.id });
    } else {
      addMyRecipe({ ...data, id: `my_${Date.now()}` });
      if (isEditingDraft) deleteDraft(editingRecipe.id);
    }
    setShowForm(false);
    setEditingRecipe(null);
  };

  // Lưu nháp
  const handleSaveDraft = (data) => {
    const draftId = editingRecipe?.id || `draft_${Date.now()}`;
    saveDraft({ ...data, id: draftId, isDraft: true });
    setShowForm(false);
    setEditingRecipe(null);
  };

  const handleExplore = () => setActiveTab('community');
  const handleAIPress = () => navigation.navigate('Scan', { mode: 'recipe' });

  return (
    <ResponsiveContainer useImageBg={false}>
      <View style={styles.container}>
        
        {/* KHÔI PHỤC SEARCH BAR */}
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color="#999" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Tìm công thức..."
              style={styles.searchInput}
            />
          </View>
        </View>

        <RecipeTabBar activeTab={activeTab} onChange={setActiveTab} />

        <View style={styles.content}>
          {activeTab === 'community' && (
            <CommunityRecipesTab
              searchQuery={searchQuery} // TRUYỀN XUỐNG ĐỂ FIX LỖI .TRIM()
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
              onRecipePress={handleRecipePress}
              onEdit={handleRecipePress}
              onSaveToggle={() => {}}
              savedIds={new Set()}
              pantryItems={pantryItems}
              onCreate={() => { setEditingRecipe(null); setIsEditingDraft(false); setShowForm(true); }}
              onDelete={deleteMyRecipe}
              onDeleteDraft={deleteDraft}
              onShowReviews={handleShowReviews}
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

        {activeTab === 'community' && <AIFloatingChip onPress={handleAIPress} />}

        {/* Form Modal (Dùng chung cho xem/sửa) */}
        <RecipeFormModal
          visible={showForm}
          initialData={editingRecipe}
          onClose={() => { setShowForm(false); setEditingRecipe(null); }}
          onSave={handleSaveForm}
          onDraft={handleSaveDraft}
        />
        
        {/* Vùng chờ tích hợp Modal Xem Đánh Giá */}
        {showReviewForm && (
           <View style={{display: 'none'}}>
               {/* Modal Review của bạn sẽ đặt ở đây */}
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
  searchInput: { flex: 1, fontSize: 15, fontWeight: '600', outlineStyle: 'none' },
  content: { flex: 1 },
});

export default RecipesScreen;