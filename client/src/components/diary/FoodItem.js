import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FoodItem = ({ item, isLast, onEdit, onDelete }) => (
  <View style={[styles.row, !isLast && styles.rowBorder]}>
    <View style={styles.avatar}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : (
        <Ionicons name="fast-food-outline" size={22} color="#CCC" />
      )}
    </View>
    <View style={styles.info}>
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.desc} numberOfLines={1}>
        {item.desc || `${item.grams || item.weight || 100}g`}
      </Text>
    </View>
    <View style={styles.right}>
      <Text style={styles.calo}>{item.calo} kcal</Text>
      <View style={styles.actions}>
        <Pressable onPress={() => onEdit(item)} style={styles.iconBtn}>
          <Ionicons name="pencil" size={16} color="#888" />
        </Pressable>
        <Pressable onPress={() => onDelete(item.id)} style={styles.iconBtn}>
          <Ionicons name="trash-outline" size={16} color="#F44336" />
        </Pressable>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  avatar: { 
    width: 48, height: 48, borderRadius: 14, backgroundColor: '#F8F9FA',
    justifyContent: 'center', alignItems: 'center', marginRight: 14, overflow: 'hidden' 
  },
  image: { width: '100%', height: '100%' },
  info: { flex: 1, marginRight: 12 },
  name: { fontSize: 15, fontWeight: '800', color: '#1A1D1E', marginBottom: 3 },
  desc: { fontSize: 13, color: '#AAA', fontWeight: '500' },
  right: { alignItems: 'flex-end' },
  calo: { fontSize: 15, fontWeight: '900', color: '#1A1D1E' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  iconBtn: { padding: 4 },
});

export default FoodItem;