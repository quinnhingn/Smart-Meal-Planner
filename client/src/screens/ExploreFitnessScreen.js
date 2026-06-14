import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import ResponsiveContainer from '../components/ResponsiveContainer';
import WorkoutPlanCard from '../components/fitness/WorkoutPlanCard';

const EXPLORE_CATEGORIES = ['Tất cả', 'Cardio', 'Strength', 'Yoga', 'HIIT'];
const EXPLORE_EXERCISES = [
  { id:'e1', name_vn:'Chạy tại chỗ', target_muscle:'Cardio', category:'Cardio', duration_seconds:15, met_value:8.0, thumbnail:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&q=80' },
  { id:'e2', name_vn:'Deadlift nhẹ', target_muscle:'Lưng, Đùi', category:'Strength', duration_seconds:15, met_value:6.0, thumbnail:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=80' },
  { id:'e3', name_vn:'Sun Salutation', target_muscle:'Toàn thân', category:'Yoga', duration_seconds:15, met_value:3.0, thumbnail:'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&q=80' },
  { id:'e4', name_vn:'Tabata Burpees', target_muscle:'Toàn thân', category:'HIIT', duration_seconds:15, met_value:10.0, thumbnail:'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=200&q=80' },
  { id:'e5', name_vn:'Bicycle Crunch', target_muscle:'Bụng', category:'Strength', duration_seconds:15, met_value:5.0, thumbnail:'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=200&q=80' },
];

const ExploreFitnessScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Explore filtering
  const filteredExplore = EXPLORE_EXERCISES.filter(ex => {
    const matchCat = selectedCategory === 'Tất cả' || ex.category === selectedCategory;
    const matchSearch = !searchQuery || ex.name_vn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <ResponsiveContainer useImageBg={false}>
      <View style={{ flex: 1 }}>
        {/* Search */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm bài tập..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#ccc" />
            </Pressable>
          )}
        </View>

        {/* Categories */}
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryStrip}>
            {EXPLORE_CATEGORIES.map(cat => (
              <Pressable key={cat} onPress={() => setSelectedCategory(cat)}
                style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}>
                <Text style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}>{cat}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filteredExplore}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120 }}
          renderItem={({ item, index }) => (
            <WorkoutPlanCard item={item} index={index} />
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy bài tập nào</Text>}
        />
      </View>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 12, marginBottom: 16,
    borderRadius: 14, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: '#E8E8E8', gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1A1D1E' },
  categoryStrip: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  catChip: { paddingHorizontal: 16, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 18, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0' },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catChipText: { fontSize: 13, fontWeight: '700', color: '#666', lineHeight: 18 },
  catChipTextActive: { color: '#FFF' },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 40, fontWeight: '600' },
});

export default ExploreFitnessScreen;
