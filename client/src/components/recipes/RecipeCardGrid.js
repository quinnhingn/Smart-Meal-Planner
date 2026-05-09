// src/components/recipes/RecipeCardGrid.js
import React, { useState, useCallback } from 'react';
import {
  FlatList, View, Text, StyleSheet, Platform, ActivityIndicator,
} from 'react-native';
import RecipeCard from './RecipeCard';
import { compareWithPantry } from '../../utils/recipeHelpers';
import { COLORS } from '../../constants/theme';

const PAGE_SIZE = 6;
const GAP = 12;
const PADDING = 12;

const RecipeCardGrid = ({ recipes, onRecipePress, onSaveToggle, savedIds, pantryItems }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const isWeb = Platform.OS === 'web';

  // Responsive columns dựa trên container width thực tế (đo bằng onLayout)
  const getNumColumns = (w) => {
    if (!isWeb) return 2;
    if (w > 1200) return 4;
    if (w > 900) return 3;
    if (w > 600) return 2;
    return 1;
  };

  const numColumns = getNumColumns(containerWidth);

  // Tính card width từ container width thực tế (đã trừ sidebar)
  const availableWidth = Math.max(0, containerWidth - PADDING * 2);
  const cardWidth = numColumns > 1
    ? (availableWidth - GAP * (numColumns - 1)) / numColumns
    : availableWidth;

  // Infinite scroll
  const [visibleCount, setVisibleCount] = useState(Math.min(PAGE_SIZE, recipes.length));
  const [loadingMore, setLoadingMore] = useState(false);

  const visibleRecipes = recipes.slice(0, visibleCount);
  const hasMore = visibleCount < recipes.length;

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + PAGE_SIZE, recipes.length));
      setLoadingMore(false);
    }, 500);
  }, [hasMore, loadingMore, recipes.length]);

  const renderItem = ({ item }) => {
    const { missing } = compareWithPantry(item.ingredients, pantryItems || []);
    const isSaved = savedIds?.has(item.id);

    return (
      <View style={{ width: cardWidth }}>
        <RecipeCard
          recipe={item}
          onPress={() => onRecipePress(item)}
          onSaveToggle={() => onSaveToggle(item.id)}
          isSaved={isSaved}
          missingCount={missing.length}
          totalIngredients={item.ingredients.length}
          cardWidth={cardWidth}
        />
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore && visibleRecipes.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Đã hiển thị tất cả {recipes.length} công thức</Text>
        </View>
      );
    }
    if (loadingMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={[styles.footerText, { marginTop: 8 }]}>Đang tải thêm...</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View 
      style={styles.container}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <FlatList
        data={visibleRecipes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={`${numColumns}-${containerWidth}`} // Force re-render khi width/columns đổi
        contentContainerStyle={[
          styles.grid,
          { paddingBottom: isWeb ? 60 : 160 }
        ]}
        columnWrapperStyle={numColumns > 1 ? styles.row : null}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    paddingHorizontal: PADDING,
    paddingTop: 4,
  },
  row: {
    justifyContent: 'flex-start',
    gap: GAP,
    paddingBottom: GAP,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#AAA',
  },
});

export default RecipeCardGrid;