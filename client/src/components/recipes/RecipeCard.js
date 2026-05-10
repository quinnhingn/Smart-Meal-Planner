// src/components/recipes/RecipeCard.js
import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { formatCookTime, getAvailabilityInfo } from '../../utils/recipeHelpers';

// Inline MiniMacro component — hiển thị macro nhỏ gọn trong card
const MiniMacro = ({ icon, value, color }) => (
  <View style={styles.macroPill}>
    <Ionicons name={icon} size={10} color={color} />
    <Text style={[styles.macroPillText, { color }]}>{Math.round(value)}g</Text>
  </View>
);

const RecipeCard = ({ 
  recipe, onPress, onSaveToggle, isSaved, missingCount, totalIngredients, cardWidth,
  isOwner = false, onEdit, onShowReviews 
}) => {
  const avail = getAvailabilityInfo(missingCount, totalIngredients);

  // Fallback colors nếu COLORS.macros không tồn tại
  const macroColors = {
    protein: COLORS?.macros?.protein || '#FF6B6B',
    carbs: COLORS?.macros?.carbs || '#4ECDC4',
    fat: COLORS?.macros?.fat || '#FFE66D',
  };

  return (
    <Pressable 
      onPress={onPress} 
      style={({ pressed }) => [
        styles.card, 
        pressed && styles.cardPressed,
        cardWidth ? { width: cardWidth } : null
      ]}
    >
      {/* PHẦN ẢNH & BADGE */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: recipe.image }} style={styles.image} resizeMode="contain" />

        {/* Chỉ hiện Badge nguyên liệu nếu KHÔNG PHẢI là chủ sở hữu (Tab cộng đồng) */}
        {!isOwner && (
          <View style={[styles.availBadge, { backgroundColor: avail.bgColor }]}>
            <View style={[styles.dot, { backgroundColor: avail.color }]} />
            <Text style={[styles.availText, { color: avail.color }]}>{avail.label}</Text>
          </View>
        )}

        {/* Nút Action góc phải: Tim (Cộng đồng) hoặc Bút chì (Cá nhân) */}
        <Pressable
          onPress={(e) => { 
            e.stopPropagation(); 
            isOwner ? onEdit?.(recipe) : onSaveToggle?.(); 
          }}
          style={styles.actionBtn}
          hitSlop={12}
        >
          {isOwner ? (
            <Ionicons name="create" size={18} color={COLORS.primary} />
          ) : (
            <Ionicons 
              name={isSaved ? 'heart' : 'heart-outline'} 
              size={18} 
              color={isSaved ? COLORS.danger : '#666'} 
            />
          )}
        </Pressable>
      </View>

      {/* THÔNG TIN CHI TIẾT */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{recipe.title}</Text>

        {/* MACRO ROW — mới thêm */}
        <View style={styles.macroRow}>
          <MiniMacro icon="nutrition-outline" value={recipe.macros?.protein || 0} color={macroColors.protein} />
          <MiniMacro icon="cube-outline" value={recipe.macros?.carbs || 0} color={macroColors.carbs} />
          <MiniMacro icon="water-outline" value={recipe.macros?.fat || 0} color={macroColors.fat} />
        </View>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#888" />
            <Text style={styles.metaText}>{formatCookTime(recipe.cookTime)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="flame-outline" size={14} color="#888" />
            <Text style={styles.metaText}>{recipe.macros?.calories || 0} kcal</Text>
          </View>
        </View>

        {/* Nút Xem đánh giá: Chỉ hiện ở tab Cá nhân */}
        {isOwner && (
          <Pressable 
            onPress={(e) => { e.stopPropagation(); onShowReviews?.(recipe); }} 
            style={styles.reviewBtn}
          >
            <Text style={styles.reviewText}>Xem đánh giá</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
      web: { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
    }),
  },
  cardPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },

  imageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1.4,
    backgroundColor: '#F8F9FA',
  },
  image: {
    width: '100%',
    height: '100%',
    padding: 10,
  },
  availBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
      android: { elevation: 2 },
    }),
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  availText: { fontSize: 10, fontWeight: '800' },
  actionBtn: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },

  info: { padding: 12, gap: 6 },
  title: { fontSize: 14, fontWeight: '800', color: '#1A1D1E', lineHeight: 18 },

  // MACRO ROW — style mới
  macroRow: { 
    flexDirection: 'row', 
    gap: 8, 
    marginTop: 2,
    marginBottom: 2,
  },
  macroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  macroPillText: {
    fontSize: 10,
    fontWeight: '700',
  },

  meta: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: '#888', fontWeight: '600' },
  reviewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, marginTop: 4, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  reviewText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
});

export default RecipeCard;