// src/components/dashboard/DashboardRecipeSuggestion.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';

const MOCK_SUGGESTIONS = [
  { id: '1', name: 'Nghêu hấp sả gừng', time: '15 phút', difficulty: 'Dễ', image: 'https://images.unsplash.com/photo-1625944227364-793540ce8020?auto=format&fit=crop&w=100&q=80' },
  { id: '2', name: 'Canh rau cải xanh', time: '15 phút', difficulty: 'Dễ', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&w=100&q=80' },
  { id: '3', name: 'Sinh tố Thanh long', time: '5 phút', difficulty: 'Dễ', image: 'https://images.unsplash.com/photo-1628557044797-f21a177c37ec?ixlib=rb-4.0.3&w=100&q=80' }
];

const DashboardRecipeSuggestion = ({ suggestions = MOCK_SUGGESTIONS }) => {
  const navigation = useNavigation();

  const renderItem = ({ item }) => {
    return (
      <View style={styles.recipeItem}>
        <Image source={{ uri: item.image }} style={styles.recipeImage} />
        <View style={styles.recipeTextGroup}>
          <Text style={styles.recipeName}>{item.name}</Text>
          <View style={styles.recipeMeta}>
            <Text style={styles.metaText}><Ionicons name="time-outline" size={12} /> {item.time}</Text>
            <Text style={styles.metaText}>  •  </Text>
            <Text style={styles.metaText}><Ionicons name="restaurant-outline" size={12} /> {item.difficulty}</Text>
          </View>
        </View>
        
        <Pressable 
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Suggestions')}
        >
          <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerWrapper}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Gợi ý món ăn</Text>
          <Ionicons name="sparkles" size={20} color="#F59E0B" />
        </View>
        <Text style={styles.subtitle}>Tận dụng thực phẩm đang có sẵn</Text>
      </View>
      
      <View style={styles.listContainer}>
        {suggestions.map((item) => (
          <React.Fragment key={item.id}>
            {renderItem({ item })}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 12 },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 16px rgba(0,0,0,0.05)' },
    }),
  },
  listContainer: {
    gap: 12,
  },
  headerWrapper: {
    marginBottom: 16,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1D1E' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  recipeItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  recipeImage: { width: 50, height: 50, borderRadius: 12, marginRight: 12, backgroundColor: '#F1F5F9' },
  recipeTextGroup: { flex: 1 },
  recipeName: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  recipeMeta: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: '#888', fontWeight: '500' },
  actionBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center', justifyContent: 'center'
  }
});

export default DashboardRecipeSuggestion;
