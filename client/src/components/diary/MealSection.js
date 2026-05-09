import React from 'react';
import { View, Text, Pressable, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FoodItem from './FoodItem';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MEAL_THEMES = {
  'Sáng': { icon: 'partly-sunny', bg: '#FFF3E0', color: '#FF9800' },
  'Trưa': { icon: 'sunny', bg: '#E8F5E9', color: '#4CAF50' },
  'Tối': { icon: 'moon', bg: '#E3F2FD', color: '#2196F3' },
  'Bữa phụ': { icon: 'nutrition', bg: '#F3E5F5', color: '#9C27B0' },
};

const MealSection = ({ type, items, totalCalo, isExpanded, onToggle, onEditItem, onDeleteItem, onAddItem }) => {
  const theme = MEAL_THEMES[type];

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle(type);
  };

  return (
    <View style={styles.card}>
      <Pressable style={styles.header} onPress={handleToggle}>
        <View style={[styles.iconBox, { backgroundColor: theme.bg }]}>
          <Ionicons name={theme.icon} size={20} color={theme.color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>Bữa {type.toLowerCase()}</Text>
          <Text style={styles.subtitle}>{items.length} món · {totalCalo} kcal</Text>
        </View>
        <View style={styles.right}>
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#888" />
        </View>
      </Pressable>

      {isExpanded && (
        <View style={styles.content}>
          {items.length === 0 ? (
            <Text style={styles.empty}>Chưa có món ăn nào.</Text>
          ) : (
            items.map((item, idx) => (
              <FoodItem
                key={item.id || idx}
                item={item}
                isLast={idx === items.length - 1}
                onEdit={onEditItem}
                onDelete={onDeleteItem}
              />
            ))
          )}
          <Pressable style={styles.addBtn} onPress={() => onAddItem(type)}>
            <Ionicons name="add-circle-outline" size={20} color="#4CAF50" />
            <Text style={styles.addText}>Thêm món</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    overflow: 'hidden',
    marginBottom: 12,
    ...Platform.select({ web: { boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }, default: { elevation: 1 } })
  },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: '900', color: '#1A1D1E' },
  subtitle: { fontSize: 13, color: '#888', fontWeight: '600', marginTop: 2 },
  right: { padding: 4 },
  content: { paddingHorizontal: 16, paddingBottom: 16 },
  empty: { fontStyle: 'italic', color: '#BBB', textAlign: 'center', marginVertical: 16, fontWeight: '500' },
  addBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, marginTop: 8, backgroundColor: '#F8F9FA', borderRadius: 14, gap: 6 
  },
  addText: { fontSize: 14, fontWeight: '800', color: '#4CAF50' },
});

export default MealSection;