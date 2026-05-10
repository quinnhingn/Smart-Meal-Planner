// src/components/recipes/RecipeFilterChips.js
import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RECIPE_FILTERS } from '../../utils/mockRecipes';
import { COLORS } from '../../constants/theme';

const RecipeFilterChips = ({ activeFilters = ['all'], onFilterChange, hiddenFilters = [] }) => {
  // Lọc bỏ các filter bị ẩn
  const visibleFilters = RECIPE_FILTERS.filter(f => !hiddenFilters.includes(f.id));

  // Logic xử lý chọn nhiều Chip
  const handleToggle = (id) => {
    // Nếu click vào "Tất cả", reset toàn bộ các filter khác
    if (id === 'all') {
      onFilterChange(['all']);
      return;
    }

    // Nếu click vào filter khác, loại bỏ 'all' khỏi danh sách đang chọn
    let newFilters = activeFilters.filter(f => f !== 'all');

    if (newFilters.includes(id)) {
      // Nếu đang chọn thì bỏ chọn
      newFilters = newFilters.filter(f => f !== id);
      // Nếu không còn filter nào được chọn, fallback về "Tất cả"
      if (newFilters.length === 0) newFilters = ['all'];
    } else {
      // Nếu chưa chọn thì thêm vào mảng
      newFilters.push(id);
    }
    
    onFilterChange(newFilters);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {visibleFilters.map((filter) => {
          const isActive = activeFilters.includes(filter.id);
          return (
            <Pressable
              key={filter.id}
              onPress={() => handleToggle(filter.id)}
              style={({ hovered }) => [
                styles.chip,
                isActive && styles.chipActive,
                { cursor: 'pointer' },
                hovered && !isActive && styles.chipHover
              ]}
            >
              {/* Thêm icon Checkmark để rõ ràng hóa UX chọn nhiều */}
              {isActive && filter.id !== 'all' && (
                <Ionicons name="checkmark" size={14} color="#FFF" style={styles.checkIcon} />
              )}
              <Text style={[styles.text, isActive && styles.textActive]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: 60,
    justifyContent: 'center',
    marginBottom: 8,
  },
  scrollView: { flexGrow: 0 },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10, // Khoảng cách giữa các chip
  },
  chip: {
    flexDirection: 'row', // Chứa cả icon và text
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    // Glassmorphism nhẹ
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
      android: { elevation: 2 },
      web: { boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }
    })
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipHover: {
    backgroundColor: '#F0F0F0',
    borderColor: COLORS.primary + '40',
  },
  checkIcon: {
    marginRight: 6, // Khoảng cách giữa icon và chữ
  },
  text: {
    fontSize: 13,
    fontWeight: '800',
    color: '#555',
  },
  textActive: {
    color: '#FFF',
  },
});

export default RecipeFilterChips;