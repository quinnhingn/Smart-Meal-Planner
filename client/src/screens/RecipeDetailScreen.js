// src/screens/RecipeDetailScreen.js
import React, { useState, useMemo, useCallback } from 'react';
import {
  View, ScrollView, Text, StyleSheet, Platform, useWindowDimensions,
} from 'react-native';
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
import { useAppStore } from '../store/useAppStore';
import { compareWithPantry } from '../utils/recipeHelpers';

const RecipeDetailScreen = ({ route, navigation }) => {
  const { recipe } = route.params;
  const { width: windowWidth } = useWindowDimensions();
  const isWebLarge = Platform.OS === 'web' && windowWidth > 768;

  const {
    pantryItems, savedRecipeIds, toggleSaveRecipe,
    addToShoppingList, submitReview, setTabBarVisible,
  } = useAppStore();

  const [showReview, setShowReview] = useState(false);
  const [showShopping, setShowShopping] = useState(false);

  // Hide tab bar when entering detail
  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      return () => setTabBarVisible(true);
    }, [setTabBarVisible])
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

  const handleShoppingAdd = (items) => {
    addToShoppingList?.(items.map(i => ({ ...i, recipeId: recipe.id, recipeName: recipe.title })));
  };

  const handleLog = () => {
    // Placeholder: navigate to diary or show toast
    // navigation.navigate('MainTabs', { screen: 'Diary' });
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

            {/* Reviews summary */}
            <View style={styles.reviewSummary}>
              <Text style={styles.sectionTitle}>💬 Đánh giá</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.bigRating}>{recipe.reviews.avgRating}</Text>
                <Text style={styles.ratingCount}>· {recipe.reviews.total} đánh giá</Text>
              </View>
            </View>

            {/* Bottom padding for action bar */}
            <View style={{ height: 100 }} />
          </View>
        </ScrollView>

        <RecipeActionBar
          onReview={() => setShowReview(true)}
          onShopping={() => setShowShopping(true)}
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

        <ShoppingChecklist
          visible={showShopping}
          onClose={() => setShowShopping(false)}
          onAdd={handleShoppingAdd}
          ingredients={recipe.ingredients}
          pantryItems={pantryItems}
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
});

export default RecipeDetailScreen;
