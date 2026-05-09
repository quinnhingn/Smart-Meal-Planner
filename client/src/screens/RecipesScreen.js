// src/screens/RecipesScreen.js
import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ResponsiveContainer from '../components/ResponsiveContainer';
import RecipeSearchHeader from '../components/recipes/RecipeSearchHeader';
import RecipeCardGrid from '../components/recipes/RecipeCardGrid';
import RecipeEmptyState from '../components/recipes/RecipeEmptyState';
import AIFloatingChip from '../components/recipes/AIFloatingChip';
import { useAppStore } from '../store/useAppStore';
import { mockRecipes } from '../utils/mockRecipes';

const RecipesScreen = ({ navigation }) => {
  const { width: windowWidth } = useWindowDimensions();
  const isWebLarge = Platform.OS === 'web' && windowWidth > 768;

  const { pantryItems, savedRecipeIds, toggleSaveRecipe, setTabBarVisible } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Show tab bar when screen is focused
  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(true);
      return () => {};
    }, [setTabBarVisible])
  );

  const filteredRecipes = useMemo(() => {
    let result = [...mockRecipes];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.labels.some(l => l.toLowerCase().includes(q)) ||
        r.ingredients.some(i => i.name.toLowerCase().includes(q))
      );
    }

    // Filter
    switch (activeFilter) {
      case 'cookable':
        result = result.filter(r => {
          const missing = r.ingredients.filter(ing =>
            !pantryItems?.some(p => p.name.toLowerCase().includes(ing.name.toLowerCase()))
          );
          return missing.length === 0;
        });
        break;
      case 'snack':  // ← ĐỔI từ 'saved' thành 'snack' (Bữa phụ)
        result = result.filter(r => r.labels.includes('Bữa phụ'));
        break;
      case 'breakfast':
        result = result.filter(r => r.labels.includes('Bữa sáng'));
        break;
      case 'lunch':
        result = result.filter(r => r.labels.includes('Bữa trưa'));
        break;
      case 'dinner':
        result = result.filter(r => r.labels.includes('Bữa tối'));
        break;
      case 'lowcarb':
        result = result.filter(r => r.labels.includes('Keto') || r.macros.carbs < 20);
        break;
      case 'highprotein':
        result = result.filter(r => r.labels.includes('High Protein') || r.macros.protein > 25);
        break;
      default:
        break;
    }

    return result;
  }, [searchQuery, activeFilter, savedRecipeIds, pantryItems]);

  const handleRecipePress = (recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  const handleAIPress = () => {
    navigation.navigate('Scan', { mode: 'recipe' });
  };

  return (
    <ResponsiveContainer useImageBg={false}>
      <View style={styles.container}>
        <RecipeSearchHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {filteredRecipes.length === 0 ? (
          <RecipeEmptyState searchQuery={searchQuery} />
        ) : (
          <RecipeCardGrid
            recipes={filteredRecipes}
            onRecipePress={handleRecipePress}
            onSaveToggle={toggleSaveRecipe}
            savedIds={savedRecipeIds}
            pantryItems={pantryItems}
          />
        )}

        <AIFloatingChip onPress={handleAIPress} />
      </View>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 4,
  },
});

export default RecipesScreen;