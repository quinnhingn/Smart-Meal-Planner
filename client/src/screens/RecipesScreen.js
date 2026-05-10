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
              dbRecipes={communityRecipes}
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