// src/components/recipes/RecipeSearchHeader.js
import React from 'react';
import { View, TextInput, ScrollView, Pressable, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { RECIPE_FILTERS } from '../../utils/mockRecipes';

const RecipeSearchHeader = ({ searchQuery, onSearchChange, activeFilter, onFilterChange }) => {
  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Tìm công thức..."
            placeholderTextColor="#AAA"
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => onSearchChange('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#BBB" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {RECIPE_FILTERS.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <Pressable
              key={filter.id}
              onPress={() => onFilterChange(isActive ? 'all' : filter.id)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{filter.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: 'transparent', paddingTop: 8 },
  searchRow: { paddingHorizontal: 16, marginBottom: 12 },
  searchInputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, gap: 10,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
    ...Platform.select({ web: { boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }, default: { elevation: 1 } }),
  },
  searchIcon: { marginTop: 1 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1A1D1E', paddingVertical: 0 },
  chipsContainer: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.06)',
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: '#666' },
  chipTextActive: { color: '#FFF' },
});

export default RecipeSearchHeader;
