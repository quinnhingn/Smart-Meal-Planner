// src/components/recipe-detail/MacroChips.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const MacroChips = ({ macros }) => {
  const items = [
    { icon: 'nutrition', label: 'Protein', value: macros.protein, color: COLORS.macros.protein },
    { icon: 'cube', label: 'Carbs', value: macros.carbs, color: COLORS.macros.carbs },
    { icon: 'water', label: 'Fat', value: macros.fat, color: COLORS.macros.fat },
    { icon: 'flame', label: 'Calories', value: macros.calories, color: '#FF6B6B', isCal: true },
  ];

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.label} style={styles.chip}>
          <View style={[styles.iconWrap, { backgroundColor: item.color + '18' }]}>
            <Ionicons name={item.icon} size={16} color={item.color} />
          </View>
          <View>
            <Text style={styles.value}>{item.isCal ? `${item.value}` : `${item.value}g`}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
  chip: {
    width: '48%', flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10,
    backgroundColor: '#FFF', borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  iconWrap: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  value: { fontSize: 14, fontWeight: '900', color: '#1A1D1E' },
  label: { fontSize: 10, fontWeight: '700', color: '#999', marginTop: 1 },
});

export default MacroChips;
