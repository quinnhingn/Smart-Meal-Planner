// src/components/recipes/RecipeCardGrid.js
import React, { useState } from 'react';
import {
  FlatList, View, Text, StyleSheet, Platform, ActivityIndicator, Image, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const PAGE_SIZE = 6;
const GAP = 12;
const PADDING = 12;

const RecipeCardGrid = ({ 
  recipes, onRecipePress, onSaveToggle, savedIds, pantryItems,
  isOwner = false, onEdit, onShowReviews 
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const isWeb = Platform.OS === 'web';

  const getNumColumns = (w) => {
    if (!isWeb) return 2;
    if (w > 1200) return 4;
    if (w > 900) return 3;
    if (w > 600) return 2;
    return 1;
  };

  const numColumns = getNumColumns(containerWidth);
  const availableWidth = Math.max(0, containerWidth - PADDING * 2);
  const cardWidth = numColumns > 1
    ? (availableWidth - GAP * (numColumns - 1)) / numColumns
    : availableWidth;

  const [visibleCount, setVisibleCount] = useState(Math.min(PAGE_SIZE, recipes.length));
  const visibleRecipes = recipes.slice(0, visibleCount);
  const loadingMore = visibleCount < recipes.length;

  const loadMore = () => {
    if (loadingMore) {
      setTimeout(() => setVisibleCount(prev => Math.min(prev + PAGE_SIZE, recipes.length)), 300);
    }
  };

  const renderItem = ({ item: recipe }) => (
    <Pressable 
      // Nhấn vào card sẽ mở Form (Xem hoặc Sửa tùy vai trò)
      onPress={() => isOwner ? onEdit?.(recipe) : onRecipePress?.(recipe)} 
      style={[styles.card, { width: cardWidth }]}
    >
      <Image source={{ uri: recipe.image }} style={styles.cardImage} />
      
      {/* Action Badge: Đổi theo isOwner */}
      <View style={styles.actionBadge}>
        {isOwner ? (
          <Pressable onPress={() => onEdit?.(recipe)}>
            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
          </Pressable>
        ) : (
          <Pressable onPress={() => onSaveToggle?.(recipe.id)}>
            <Ionicons 
              name={savedIds?.has(recipe.id) ? "heart" : "heart-outline"} 
              size={18} 
              color={savedIds?.has(recipe.id) ? COLORS.danger : '#666'} 
            />
          </Pressable>
        )}
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>{recipe.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>⏱ {recipe.cookTime}p</Text>
          <Text style={styles.metaText}>🔥 {recipe.macros?.calories || 0}kcal</Text>
        </View>

        {/* Nút Xem đánh giá: Chỉ hiện cho chủ sở hữu */}
        {isOwner && (
          <Pressable 
            onPress={() => onShowReviews?.(recipe)} 
            style={styles.reviewBtn}
          >
            <Text style={styles.reviewText}>Xem đánh giá</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <FlatList
        data={visibleRecipes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={`${numColumns}-${containerWidth}`}
        contentContainerStyle={[styles.grid, { paddingBottom: isWeb ? 60 : 160 }]}
        columnWrapperStyle={numColumns > 1 ? styles.row : null}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  grid: { paddingHorizontal: PADDING, paddingTop: 4 },
  row: { justifyContent: 'flex-start', gap: GAP },
  card: {
    backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden', marginBottom: GAP,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  cardImage: { width: '100%', height: 150, backgroundColor: '#F5F5F5' },
  actionBadge: {
    position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.9)',
    width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } })
  },
  cardInfo: { padding: 12 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#1A1D1E', marginBottom: 6 },
  metaRow: { flexDirection: 'row', gap: 10 },
  metaText: { fontSize: 11, color: '#888', fontWeight: '600' },
  reviewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 8, marginTop: 8, borderTopWidth: 1, borderTopColor: '#F5F5F5',
  },
  reviewText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
});

export default RecipeCardGrid;