// src/components/recipe-detail/IngredientTable.js
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { compareWithPantry } from '../../utils/recipeHelpers';

const IngredientTable = ({ ingredients, pantryItems }) => {
  const { available, missing } = useMemo(
    () => compareWithPantry(ingredients, pantryItems || []),
    [ingredients, pantryItems]
  );

  const allItems = [
    ...available.map(i => ({ ...i, status: 'available' })),
    ...missing.map(i => ({ ...i, status: 'missing' })),
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📋 Nguyên liệu</Text>

      {/* Table Header */}
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>Nguyên liệu</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1.2 }]}>Khối lượng</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 0.8 }]}>Cal</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 0.7 }]}>P</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 0.7 }]}>C</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 0.7 }]}>F</Text>
      </View>

      {/* Rows */}
      {allItems.map((item, idx) => (
        <View
          key={idx}
          style={[
            styles.row,
            item.status === 'available' && styles.availableRow,
            item.status === 'missing' && styles.missingRow,
          ]}
        >
          <View style={[styles.cell, { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
            <Ionicons
              name={item.status === 'available' ? 'checkmark-circle' : 'ellipse-outline'}
              size={16}
              color={item.status === 'available' ? COLORS.success : '#CCC'}
            />
            <Text style={[styles.cellText, item.status === 'available' && styles.availableText]}>
              {item.name}
            </Text>
          </View>
          <Text style={[styles.cell, styles.cellText, { flex: 1.2 }]}>{item.amount}</Text>
          <Text style={[styles.cell, styles.cellText, { flex: 0.8 }]}>{item.calories}</Text>
          <Text style={[styles.cell, styles.cellText, { flex: 0.7 }]}>{item.protein}g</Text>
          <Text style={[styles.cell, styles.cellText, { flex: 0.7 }]}>{item.carbs}g</Text>
          <Text style={[styles.cell, styles.cellText, { flex: 0.7 }]}>{item.fat}g</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFF', borderRadius: 24, padding: 16, marginHorizontal: 16, marginTop: 16,
    ...Platform.select({ web: { boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }, default: { elevation: 2 } }),
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1A1D1E', marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerRow: { paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: '#E0E0E0' },
  cell: { paddingHorizontal: 4 },
  headerCell: { fontSize: 11, fontWeight: '800', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 },
  cellText: { fontSize: 13, fontWeight: '600', color: '#444' },
  availableRow: { backgroundColor: '#F8FFF8' },
  missingRow: { backgroundColor: '#FFFAFA' },
  availableText: { color: '#888', textDecorationLine: 'line-through' },
});

export default IngredientTable;
