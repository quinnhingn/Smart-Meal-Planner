// src/screens/RecipeDetailScreen.js
import React, { useState, useMemo, useCallback } from 'react';
import {
  View, ScrollView, Text, StyleSheet, Platform, useWindowDimensions, Alert,
  Modal, TouchableOpacity, Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ResponsiveContainer from '../components/ResponsiveContainer';
import RecipeHeroSection from '../components/recipe-detail/RecipeHeroSection';
import MacroChips from '../components/recipe-detail/MacroChips';
import RecipeMetaInfo from '../components/recipe-detail/RecipeMetaInfo';
import IngredientTable from '../components/recipe-detail/IngredientTable';
import CookingSteps from '../components/recipe-detail/CookingSteps';
import RecipeActionBar from '../components/recipe-detail/RecipeActionBar';
import ReviewBottomSheet from '../components/recipe-detail/ReviewBottomSheet';
import ShoppingChecklist from '../components/recipe-detail/ShoppingChecklist';
import RecipeVideo from '../components/recipe-detail/RecipeVideo';
import ReviewItem from '../components/recipe-detail/ReviewItem';
import { useAppStore } from '../store/useAppStore';
import { compareWithPantry } from '../utils/recipeHelpers';
import { COLORS } from '../constants/theme';

const RecipeDetailScreen = ({ route, navigation }) => {
  const { recipe } = route.params;
  const { width: windowWidth } = useWindowDimensions();

  const {
    pantryItems, savedRecipeIds, toggleSaveRecipe,
    addToShoppingList, submitReview, setTabBarVisible,
    recipeReviews, fetchRecipeReviews, userProfile,
    logRecipeMeal,
  } = useAppStore();

  const [showReview, setShowReview] = useState(false);
  const [currentStats, setCurrentStats] = useState(recipe.reviews);

  // Hide tab bar when entering detail & Fetch reviews
  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      
      const loadData = async () => {
        const stats = await fetchRecipeReviews(recipe.id);
        if (stats) setCurrentStats(stats);
      };
      loadData();

      return () => setTabBarVisible(true);
    }, [setTabBarVisible, recipe.id, fetchRecipeReviews])
  );

  const isSaved = savedRecipeIds?.has(recipe.id);

  const { missing } = useMemo(
    () => compareWithPantry(recipe.ingredients, pantryItems || []),
    [recipe.ingredients, pantryItems]
  );

  const hasMissingIngredients = missing.length > 0;

  const handleSave = () => toggleSaveRecipe?.(recipe.id);

  const handleReviewSubmit = (reviewData) => {
    submitReview?.(recipe.id, reviewData);
  };

  const handleShoppingAdd = () => {
    const servings = parseInt(recipe.servings) || 2;
    Alert.alert(
      "Lên kế hoạch đi chợ",
      `Bạn muốn tính toán nguyên liệu thiếu cho mấy người ăn?`,
      [
        { text: "Hủy", style: "cancel" },
        { text: `1 người`, onPress: () => addToShoppingList(recipe.id, 1) },
        { text: `${servings} người`, onPress: () => addToShoppingList(recipe.id, servings) },
        { text: `${servings * 2} người`, onPress: () => addToShoppingList(recipe.id, servings * 2) },
      ]
    );
  };

  const handleLog = () => {
    const servings = parseInt(recipe.servings) || 2;
    Alert.alert(
      "Ghi nhận bữa ăn",
      `Bạn nấu món này cho mấy người ăn?`,
      [
        { text: "Hủy", style: "cancel" },
        { text: `1 người`, onPress: () => logRecipeMeal(recipe.id, 1) },
        { text: `${servings} người (Chuẩn)`, onPress: () => logRecipeMeal(recipe.id, servings) },
        { text: `${servings * 2} người`, onPress: () => logRecipeMeal(recipe.id, servings * 2) },
      ]
    );
  };

  return (
    <ResponsiveContainer useImageBg={false}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <RecipeHeroSection
            recipe={recipe}
            onBack={() => navigation.goBack()}
            onSave={handleSave}
            isSaved={isSaved}
          />

          <View style={styles.content}>
            <MacroChips macros={recipe.macros} />
            <RecipeMetaInfo
              cookTime={recipe.cookTime}
              servings={recipe.servings}
              difficulty={recipe.difficulty}
              author={recipe.author}
            />

            <RecipeVideo videoUrl={recipe.videoUrl} />

            <IngredientTable ingredients={recipe.ingredients} pantryItems={pantryItems} />
            <CookingSteps steps={recipe.steps} />

            {/* Reviews summary & List */}
            <View style={styles.reviewSummary}>
              <Text style={styles.sectionTitle}>💬 Đánh giá</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.bigRating}>{currentStats.avgRating}</Text>
                <View>
                  <Text style={styles.ratingCount}>{currentStats.total} đánh giá từ cộng đồng</Text>
                </View>
              </View>

              <View style={styles.reviewList}>
                {recipeReviews.filter(r => String(r.recipeId) === String(recipe.id)).length > 0 ? (
                  recipeReviews.filter(r => String(r.recipeId) === String(recipe.id)).map(review => (
                    <ReviewItem 
                      key={review.id} 
                      review={review} 
                      currentUserId={userProfile?.id}
                    />
                  ))
                ) : (
                  <View style={styles.emptyReviews}>
                    <Ionicons name="chatbubble-ellipses-outline" size={32} color="#DDD" />
                    <Text style={styles.emptyReviewText}>Chưa có nhận xét nào cho món này.</Text>
                    <Text style={styles.emptyReviewSubText}>Hãy là người đầu tiên đánh giá!</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Bottom padding for action bar */}
            <View style={{ height: 100 }} />
          </View>
        </ScrollView>

        <RecipeActionBar
          onReview={() => setShowReview(true)}
          onShopping={handleShoppingAdd}
          onLog={handleLog}
          onSave={handleSave}
          isSaved={isSaved}
          showShopping={hasMissingIngredients}
        />

        <ReviewBottomSheet
          visible={showReview}
          onClose={() => setShowReview(false)}
          onSubmit={handleReviewSubmit}
          recipeTitle={recipe.title}
        />
      </View>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 0 },
  content: { paddingTop: 16, gap: 0 },
  videoPlaceholder: {
    backgroundColor: '#1A1D1E', borderRadius: 20, marginHorizontal: 16, marginTop: 16,
    height: 200, justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  videoLabel: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  videoNote: { fontSize: 12, fontWeight: '600', color: '#888' },
  noVideoBox: {
    backgroundColor: '#FFF', borderRadius: 20, marginHorizontal: 16, marginTop: 16,
    padding: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
    borderStyle: 'dashed',
  },
  noVideoText: { fontSize: 13, fontWeight: '700', color: '#BBB' },
  reviewSummary: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 16, marginHorizontal: 16, marginTop: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1A1D1E', marginBottom: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  bigRating: { fontSize: 32, fontWeight: '900', color: '#1A1D1E' },
  ratingCount: { fontSize: 14, fontWeight: '700', color: '#999' },
  reviewList: { marginTop: 16 },
  emptyReviews: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyReviewText: { fontSize: 14, fontWeight: '800', color: '#CCC', marginTop: 8 },
  emptyReviewSubText: { fontSize: 12, fontWeight: '600', color: '#DDD' },
});

export default RecipeDetailScreen;
