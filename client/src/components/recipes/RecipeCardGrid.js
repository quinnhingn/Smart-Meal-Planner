// src/components/recipes/RecipeCardGrid.js
import React, { useState } from 'react';
import { FlatList, View, StyleSheet, Platform } from 'react-native';
import RecipeCard from './RecipeCard';
import { compareWithPantry } from '../../utils/recipeHelpers';

const RecipeCardGrid = ({ 
  recipes, onRecipePress, onSaveToggle, savedIds, pantryItems, 
  isOwner = false, onEdit, onShowReviews 
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const numColumns = Platform.OS === 'web' ? 3 : 2;
  const cardWidth = Math.max(0, (containerWidth - 36) / numColumns); // Đảm bảo width không bị âm

  const renderItem = ({ item: recipe }) => {
    // Chỉ tính toán độ sẵn có nguyên liệu cho tab Cộng đồng (isOwner = false)
    const { missingCount } = isOwner 
      ? { missingCount: 0 } 
      : compareWithPantry(recipe.ingredients || [], pantryItems);

    return (
      <RecipeCard
        recipe={recipe}
        cardWidth={cardWidth}
        onPress={() => isOwner ? onEdit?.(recipe) : onRecipePress?.(recipe)}
        onSaveToggle={() => onSaveToggle?.(recipe.id)}
        isSaved={savedIds?.has(recipe.id)}
        missingCount={missingCount}
        totalIngredients={recipe.ingredients?.length || 0}
        // Props điều khiển giao diện tab Cá nhân
        isOwner={isOwner}
        onEdit={onEdit}
        onShowReviews={onShowReviews}
      />
    );
  };

  return (
    <View style={styles.container} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <FlatList
        data={recipes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={containerWidth} // Re-render Grid khi thiết bị xoay ngang/dọc
        
        // 🔥 FIX LỖI TẠI ĐÂY: Thêm paddingBottom để đẩy list lên trên Bottom Tab
        contentContainerStyle={[
          styles.grid, 
          { paddingBottom: Platform.OS === 'web' ? 60 : 140 }
        ]}
        
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  grid: { padding: 12 },
  row: { justifyContent: 'flex-start', gap: 12 },
});

export default RecipeCardGrid;