// src/components/recipes/RecipeEmptyState.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RecipeEmptyState = ({ searchQuery }) => (
  <View style={styles.container}>
    <Ionicons name="restaurant-outline" size={64} color="#CCC" />
    <Text style={styles.title}>Không tìm thấy công thức</Text>
    <Text style={styles.subtitle}>
      {searchQuery ? `Không có kết quả cho "${searchQuery}"` : 'Hãy thử điều chỉnh bộ lọc của bạn'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 32 },
  title: { fontSize: 18, fontWeight: '800', color: '#888', marginTop: 16 },
  subtitle: { fontSize: 14, fontWeight: '600', color: '#AAA', marginTop: 6, textAlign: 'center' },
});

export default RecipeEmptyState;
