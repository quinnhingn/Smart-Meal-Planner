import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FoodItem = ({ item, isLast, onEdit, onDelete }) => (
  <View style={[styles.row, !isLast && styles.rowBorder]}>
    <View style={styles.info}>
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
      <View style={styles.nutritionRow}>
         <Text style={styles.calo}>{Number(item.calo || 0).toFixed(1)} kcal</Text>
         <View style={styles.dot} />
         <Text style={styles.macro}>Pro {Number(item.protein || 0).toFixed(0)}g</Text>
         <View style={styles.dot} />
         <Text style={styles.macro}>Carb {Number(item.carbs || 0).toFixed(0)}g</Text>
         <View style={styles.dot} />
         <Text style={styles.macro}>Fat {Number(item.fat || 0).toFixed(0)}g</Text>
      </View>
    </View>
    <View style={styles.actions}>
      <Pressable onPress={() => onEdit(item)} style={styles.iconBtn} hitSlop={10}>
        <Ionicons name="create-outline" size={18} color="#888" />
      </Pressable>
      <Pressable onPress={() => onDelete(item.id)} style={styles.iconBtn} hitSlop={10}>
        <Ionicons name="trash-outline" size={18} color="#E53935" />
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  info: { flex: 1, marginRight: 12 },
  name: { fontSize: 15, fontWeight: '700', color: '#1A1D1E', marginBottom: 4 },
  nutritionRow: { flexDirection: 'row', alignItems: 'center' },
  calo: { fontSize: 13, fontWeight: '800', color: '#4CAF50' },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#CCC', marginHorizontal: 6 },
  macro: { fontSize: 12, fontWeight: '600', color: '#888' },
  actions: { flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 4 },
});

export default FoodItem;