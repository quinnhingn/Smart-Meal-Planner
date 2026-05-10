// src/components/recipes/SavedRecipesTab.js
import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import RecipeCardGrid from './RecipeCardGrid';
import RecipeEmptyState from './RecipeEmptyState';
import { mockRecipes } from '../../utils/mockRecipes';

// LƯU Ý: dbRecipes chỉ hiển thị ở tab Cộng đồng.
// Tab Đã lưu chỉ lọc từ mockRecipes theo savedIds (sau này sẽ chuyển sang API riêng cho saved recipes)
const SavedRecipesTab = ({ savedIds, onRecipePress, onSaveToggle, pantryItems, onExplore }) => {
  const savedRecipes = useMemo(() => {
    return mockRecipes.filter(r => savedIds?.has(r.id));
  }, [savedIds]);

  return (
    <View style={styles.container}>
      {savedRecipes.length === 0 ? (
        <RecipeEmptyState tab="saved" onCta={(action) => action === 'explore' && onExplore?.()} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <RecipeCardGrid
            recipes={savedRecipes}
            onRecipePress={onRecipePress}
            onSaveToggle={onSaveToggle}
            savedIds={savedIds}
            pantryItems={pantryItems}
          />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
});

export default SavedRecipesTab;