// src/components/recipes/RecipeCardGrid.js
import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import RecipeCard from './RecipeCard';
import { compareWithPantry } from '../../utils/recipeHelpers';

const RecipeCardGrid = ({ 
  recipes, onRecipePress, onSaveToggle, savedIds, 
  isOwner = false, onEdit, onShowReviews 
}) => {
  return (
    <View style={styles.container}>
      {recipes.map((recipe) => {
        const missingCount = 0;

        return (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            cardWidth="100%"
            onPress={() => isOwner ? onEdit?.(recipe) : onRecipePress?.(recipe)}
            onSaveToggle={() => onSaveToggle?.(recipe.id)}
            isSaved={savedIds?.has(recipe.id)}
            missingCount={missingCount}
            totalIngredients={recipe.ingredients?.length || 0}
            isOwner={isOwner}
            onEdit={onEdit}
            onShowReviews={onShowReviews}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
});

export default RecipeCardGrid;