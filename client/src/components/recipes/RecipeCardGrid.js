// src/components/recipes/RecipeCardGrid.js
import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import RecipeCard from './RecipeCard';
import { compareWithPantry } from '../../utils/recipeHelpers';

const RecipeCardGrid = ({ 
  recipes, onRecipePress, onSaveToggle, savedIds, pantryItems, 
  isOwner = false, onEdit, onShowReviews 
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const numColumns = Platform.OS === 'web' ? 3 : 2;
  const cardWidth = Math.max(0, (containerWidth - 36) / numColumns);

  // Chia recipes thành từng hàng để render grid
  const rows = [];
  for (let i = 0; i < recipes.length; i += numColumns) {
    rows.push(recipes.slice(i, i + numColumns));
  }

  return (
    <View style={styles.container} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((recipe) => {
            // Chỉ tính toán độ sẵn có nguyên liệu cho tab Cộng đồng (isOwner = false)
            // compareWithPantry trả về { available: [], missing: [] }
            const { missing } = isOwner 
              ? { missing: [] } 
              : compareWithPantry(recipe.ingredients || [], pantryItems || []);

            const missingCount = missing.length;

            return (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                cardWidth={cardWidth}
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
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'flex-start', 
    gap: 12, 
    paddingHorizontal: 12,
    marginBottom: 12,
  },
});

export default RecipeCardGrid;