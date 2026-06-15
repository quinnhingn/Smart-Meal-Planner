// src/components/recipes/RecipeCard.js
import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { formatCookTime, getAvailabilityInfo } from '../../utils/recipeHelpers';
import Svg, { Circle } from 'react-native-svg';

const MatchRing = ({ percentage, size = 48 }) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  const color = percentage >= 90 ? COLORS.macroThreshold.onTarget : 
                percentage >= 80 ? COLORS.macroThreshold.under : 
                COLORS.macroThreshold.over;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(0,0,0,0.05)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <Text style={[styles.ringText, { color }]}>{percentage}%</Text>
    </View>
  );
};

const MiniMacroBar = ({ label, percentage, color, absoluteValue }) => {
  // If percentage is undefined, fallback to a relative visual fill (max 100g = 100%)
  const safePercentage = Math.min(percentage !== undefined ? percentage : Math.min(absoluteValue, 100), 100);
  return (
    <View style={styles.miniBarContainer}>
      <View style={styles.miniBarHeader}>
        <Text style={styles.miniBarLabel}>{label}</Text>
        <Text style={styles.miniBarAbsolute}>{Math.round(absoluteValue)}g</Text>
      </View>
      <View style={styles.miniBarBg}>
        <View style={[styles.miniBarFill, { width: `${safePercentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const RecipeCard = ({ 
  recipe, onPress, onSaveToggle, isSaved, missingCount, totalIngredients, cardWidth,
  isOwner = false, onEdit, onShowReviews 
}) => {
  const avail = getAvailabilityInfo(missingCount, totalIngredients);

  return (
    <View style={[styles.cardWrapper, cardWidth ? { width: cardWidth } : null]}>
      <View style={styles.shadowBlock} />
      <Pressable 
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={onPress}
      >
        {/* Nút Action góc trên phải */}
        <Pressable
          onPress={(e) => { 
            e.stopPropagation(); 
            isOwner ? onEdit?.(recipe) : onSaveToggle?.(); 
          }}
          style={styles.actionBtn}
          hitSlop={12}
        >
          {isOwner ? (
            <Ionicons name="create" size={18} color="#1A1D1E" />
          ) : (
            <Ionicons 
              name={isSaved ? 'heart' : 'heart-outline'} 
              size={18} 
              color={isSaved ? COLORS.danger : '#1A1D1E'} 
            />
          )}
        </Pressable>

        <View style={styles.cardTop}>
          <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
          
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeName} numberOfLines={2}>{recipe.title || recipe.name}</Text>
            
            <Text style={styles.recipeMeta}>
              <Ionicons name="time-outline" size={14} /> {formatCookTime(recipe.cookTime || recipe.time)}  •  {recipe.macros?.calories || recipe.calories || 0} kcal
            </Text>

            {/* Chỉ hiện Badge nguyên liệu nếu KHÔNG PHẢI là chủ sở hữu (Tab cộng đồng) */}
            {!isOwner && (
              <View style={[styles.availBadge, { backgroundColor: avail.bgColor }]}>
                <View style={[styles.dot, { backgroundColor: avail.color }]} />
                <Text style={[styles.availText, { color: avail.color }]}>{avail.label}</Text>
              </View>
            )}
          </View>
          
          {recipe.match_percent && <MatchRing percentage={recipe.match_percent} />}
        </View>

        <View style={styles.macroGaps}>
          <MiniMacroBar label="Pro" percentage={recipe.fill_percent?.protein} color="#E53935" absoluteValue={recipe.macros?.protein || 0} />
          <MiniMacroBar label="Carb" percentage={recipe.fill_percent?.carbs} color="#29B6F6" absoluteValue={recipe.macros?.carbs || 0} />
          <MiniMacroBar label="Fat" percentage={recipe.fill_percent?.fat} color="#FBC02D" absoluteValue={recipe.macros?.fat || 0} />
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
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  // Neo-brutalism Card Style
  cardWrapper: {
    position: 'relative',
    marginBottom: 16,
    width: '100%',
  },
  shadowBlock: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: '#1A1D1E',
    borderRadius: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1A1D1E',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  cardPressed: { transform: [{ scale: 0.98 }] },
  
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  recipeImage: { width: 70, height: 70, borderRadius: 12, borderWidth: 1, borderColor: '#1A1D1E', backgroundColor: '#F8F9FA' },
  recipeInfo: { flex: 1, marginHorizontal: 12, justifyContent: 'center' },
  recipeName: { fontSize: 16, fontWeight: '800', color: '#1A1D1E', marginBottom: 6, lineHeight: 20, paddingRight: 20 },
  recipeMeta: { fontSize: 13, color: '#666', fontWeight: '500', marginBottom: 6 },
  
  ringText: { fontSize: 13, fontWeight: '800', position: 'absolute' },
  
  availBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  availText: { fontSize: 10, fontWeight: '800' },
  
  actionBtn: { 
    position: 'absolute', 
    top: 12, 
    right: 12, 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#1A1D1E',
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 10,
  },

  macroGaps: { flexDirection: 'row', gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  miniBarContainer: { flex: 1 },
  miniBarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  miniBarLabel: { fontSize: 11, fontWeight: '700', color: '#888', textTransform: 'uppercase' },
  miniBarAbsolute: { fontSize: 11, fontWeight: '800', color: '#1A1D1E' },
  miniBarBg: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: 3 },
  
  reviewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, marginTop: 12, borderTopWidth: 1, borderTopColor: '#1A1D1E', borderStyle: 'dashed' },
  reviewText: { fontSize: 13, fontWeight: '800', color: '#1A1D1E' },
});

export default RecipeCard;