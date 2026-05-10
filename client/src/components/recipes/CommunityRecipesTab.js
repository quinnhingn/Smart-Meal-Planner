// src/components/recipes/CommunityRecipesTab.js
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import RecipeFilterChips from './RecipeFilterChips';
import RecipeCardGrid from './RecipeCardGrid';
import RecipeEmptyState from './RecipeEmptyState';
import { mockRecipes } from '../../utils/mockRecipes';

const CommunityRecipesTab = ({ 
  dbRecipes = [], 
  isLoading = false, 
  searchQuery, 
  onRecipePress, 
  onSaveToggle, 
  savedIds, 
  pantryItems 
}) => {
  // Chuyển từ activeFilter (chuỗi) sang activeFilters (mảng) để chọn nhiều
  const [activeFilters, setActiveFilters] = useState(['all']);

  // Ưu tiên dùng dbRecipes từ API, fallback về mockRecipes nếu API chưa có data
  const recipes = dbRecipes.length > 0 ? dbRecipes : mockRecipes;

  const filtered = useMemo(() => {
    let result = [...recipes];

    // 1. Lọc theo tìm kiếm
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title?.toLowerCase().includes(q) ||
        r.labels?.some(l => l.toLowerCase().includes(q)) ||
        r.ingredients?.some(i => i.name?.toLowerCase().includes(q))
      );
    }

    // 2. Lọc theo bộ lọc Chips (Multi-select)
    if (activeFilters.includes('all')) return result;

    return result.filter(recipe => {
      // Recipe được hiển thị nếu khớp với ÍT NHẤT MỘT bộ lọc đang chọn (OR logic)
      return activeFilters.some(filterId => {
        switch (filterId) {
          case 'cookable':
            const missing = recipe.ingredients?.filter(ing =>
              !pantryItems?.some(p => p.name.toLowerCase().includes(ing.name.toLowerCase()))
            );
            return missing?.length === 0;
          case 'snack': return recipe.labels?.includes('Bữa phụ');
          case 'breakfast': return recipe.labels?.includes('Bữa sáng');
          case 'lunch': return recipe.labels?.includes('Bữa trưa');
          case 'dinner': return recipe.labels?.includes('Bữa tối');
          case 'lowcarb': return recipe.labels?.includes('Keto') || recipe.macros?.carbs < 20;
          case 'highprotein': return recipe.labels?.includes('High Protein') || recipe.macros?.protein > 25;
          default: return false;
        }
      });
    });
  }, [recipes, searchQuery, activeFilters, pantryItems]);

  return (
    <View style={styles.container}>
      {/* Cập nhật props cho component Chips đã nâng cấp */}
      <RecipeFilterChips 
        activeFilters={activeFilters} 
        onFilterChange={setActiveFilters} 
      />

      {/* ScrollView thay vì FlatList để tránh lỗi VirtualizedLists nested */}
      <ScrollView 
        style={styles.listContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isLoading && dbRecipes.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1A1D1E" />
          </View>
        ) : filtered.length === 0 ? (
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
});

export default CommunityRecipesTab;