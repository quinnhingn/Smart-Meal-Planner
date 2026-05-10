// src/components/recipes/SavedRecipesTab.js
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import RecipeCardGrid from './RecipeCardGrid';
import RecipeEmptyState from './RecipeEmptyState';
import { mockRecipes } from '../../utils/mockRecipes';

const SavedRecipesTab = ({ savedIds, onRecipePress, onSaveToggle, pantryItems, onExplore }) => {
  const savedRecipes = useMemo(() => {
    return mockRecipes.filter(r => savedIds?.has(r.id));
  }, [savedIds]);

  return (
    <View style={styles.container}>
      {savedRecipes.length === 0 ? (
        <RecipeEmptyState tab="saved" onCta={(action) => action === 'explore' && onExplore?.()} />
      ) : (
        <RecipeCardGrid
          recipes={savedRecipes}
          onRecipePress={onRecipePress}
          onSaveToggle={onSaveToggle}
          savedIds={savedIds}
          pantryItems={pantryItems}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default SavedRecipesTab;
