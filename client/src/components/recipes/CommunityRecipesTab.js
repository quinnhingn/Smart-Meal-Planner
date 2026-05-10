// src/components/recipes/CommunityRecipesTab.js
import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import RecipeFilterChips from './RecipeFilterChips';
import RecipeCardGrid from './RecipeCardGrid';
import RecipeEmptyState from './RecipeEmptyState';
import { mockRecipes } from '../../utils/mockRecipes';

const CommunityRecipesTab = ({ searchQuery, onRecipePress, onSaveToggle, savedIds, pantryItems }) => {
  // Chuyển từ activeFilter (chuỗi) sang activeFilters (mảng) để chọn nhiều
  const [activeFilters, setActiveFilters] = useState(['all']);

  const filtered = useMemo(() => {
    let result = [...mockRecipes];

    // 1. Lọc theo tìm kiếm
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.labels.some(l => l.toLowerCase().includes(q)) ||
        r.ingredients.some(i => i.name.toLowerCase().includes(q))
      );
    }

    // 2. Lọc theo bộ lọc Chips (Multi-select)
    if (activeFilters.includes('all')) return result;

    return result.filter(recipe => {
      // Recipe được hiển thị nếu khớp với ÍT NHẤT MỘT bộ lọc đang chọn (OR logic)
      return activeFilters.some(filterId => {
        switch (filterId) {
          case 'cookable':
            const missing = recipe.ingredients.filter(ing =>
              !pantryItems?.some(p => p.name.toLowerCase().includes(ing.name.toLowerCase()))
            );
            return missing.length === 0;
          case 'snack': return recipe.labels.includes('Bữa phụ');
          case 'breakfast': return recipe.labels.includes('Bữa sáng');
          case 'lunch': return recipe.labels.includes('Bữa trưa');
          case 'dinner': return recipe.labels.includes('Bữa tối');
          case 'lowcarb': return recipe.labels.includes('Keto') || recipe.macros.carbs < 20;
          case 'highprotein': return recipe.labels.includes('High Protein') || recipe.macros.protein > 25;
          default: return false;
        }
      });
    });
  }, [searchQuery, activeFilters, pantryItems]);

  return (
    <View style={styles.container}>
      {/* Cập nhật props cho component Chips đã nâng cấp */}
      <RecipeFilterChips 
        activeFilters={activeFilters} 
        onFilterChange={setActiveFilters} 
      />
      
      {/* listContainer giúp cô lập Grid, tránh bị stretch theo chiều dọc của Filter */}
      <View style={styles.listContainer}>
        {filtered.length === 0 ? (
          <RecipeEmptyState tab="community" searchQuery={searchQuery} />
        ) : (
          <RecipeCardGrid
            recipes={filtered}
            onRecipePress={onRecipePress}
            onSaveToggle={onSaveToggle}
            savedIds={savedIds}
            pantryItems={pantryItems}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { flex: 1 }, 
});

export default CommunityRecipesTab;