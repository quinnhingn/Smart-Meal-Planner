// src/components/recipes/RecipeCard.js
import React from 'react';
import {
  View, Text, Pressable, StyleSheet, Image, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { formatCookTime, getAvailabilityInfo } from '../../utils/recipeHelpers';

const RecipeCard = ({ recipe, onPress, onSaveToggle, isSaved, missingCount, totalIngredients, cardWidth }) => {
  const avail = getAvailabilityInfo(missingCount, totalIngredients);

  return (
    <Pressable 
      onPress={onPress} 
      style={({ pressed }) => [
        styles.card, 
        pressed && styles.cardPressed,
        cardWidth ? { width: cardWidth } : null
      ]}
    >
      {/* ẢNH */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: recipe.image }} style={styles.image} resizeMode="cover" />

        <View style={[styles.availBadge, { backgroundColor: avail.bgColor }]}>
          <View style={[styles.dot, { backgroundColor: avail.color }]} />
          <Text style={[styles.availText, { color: avail.color }]}>{avail.label}</Text>
        </View>

        <Pressable
          onPress={(e) => { e.stopPropagation(); onSaveToggle?.(); }}
          style={styles.saveBtn}
          hitSlop={12}
        >
          <Ionicons 
            name={isSaved ? 'heart' : 'heart-outline'} 
            size={18} 
            color={isSaved ? COLORS.danger : '#888'} 
          />
        </Pressable>
      </View>

      {/* THÔNG TIN */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{recipe.title}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color="#999" />
            <Text style={styles.metaText}>{formatCookTime(recipe.cookTime)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="flame-outline" size={13} color="#999" />
            <Text style={styles.metaText}>{recipe.macros.calories} kcal</Text>
          </View>
        </View>

        <View style={styles.macroRow}>
          <MiniMacro icon="nutrition" value={recipe.macros.protein} color={COLORS.macros.protein} />
          <MiniMacro icon="cube" value={recipe.macros.carbs} color={COLORS.macros.carbs} />
          <MiniMacro icon="water" value={recipe.macros.fat} color={COLORS.macros.fat} />
        </View>
      </View>
    </Pressable>
  );
};

const MiniMacro = ({ icon, value, color }) => (
  <View style={styles.miniMacro}>
    <Ionicons name={icon} size={12} color={color} />
    <Text style={[styles.miniMacroText, { color }]}>{value}g</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
      web: { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
    }),
  },
  cardPressed: { transform: [{ scale: 0.98 }], opacity: 0.95 },

  imageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1.1,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  saveBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
      android: { elevation: 2 },
    }),
  },

  info: { padding: 12, gap: 6 },
  title: { fontSize: 15, fontWeight: '800', color: '#1A1D1E', lineHeight: 20 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontWeight: '600', color: '#888' },
  macroRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  miniMacro: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
  },
  miniMacroText: { fontSize: 10, fontWeight: '800' },
});

export default RecipeCard;