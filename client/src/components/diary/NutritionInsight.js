import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store/useAppStore';
import SuggestedRecipesModal from './SuggestedRecipesModal';
import { aiApi } from '../../services/api';
import { useNavigation } from '@react-navigation/native';

const NutritionInsight = () => {
  const navigation = useNavigation();
  const { aiInsight, fetchAIInsight, isLoading } = useAppStore();
  const [showModal, setShowModal] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);

  useEffect(() => {
    fetchAIInsight(); // Sẽ chỉ gọi API nếu aiInsight chưa có
  }, []);

  const handleShowSuggestions = async () => {
    setShowModal(true);
    setLoadingSuggestions(true);
    try {
      const res = await aiApi.suggestRecipesByPantry();
      if (res.success && res.data.data) {
        setSuggestions(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy món gợi ý:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const insightData = aiInsight || { 
    insight: "Hãy nhớ uống đủ ít nhất 2 lít nước và ăn thêm rau xanh để cơ thể luôn tràn đầy năng lượng mỗi ngày nhé! ✨", 
    missing_nutrient: "None" 
  };

  return (
    <View style={styles.container}>
      <View style={styles.neoCardWrapper}>
        <View style={styles.neoCardShadow} />
        <LinearGradient
        colors={['#F0FDF4', '#DCFCE7']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={12} color="#059669" />
            <Text style={styles.aiText}>AI GỢI Ý</Text>
          </View>
          <Pressable style={styles.refreshBtn} onPress={() => fetchAIInsight(true)} disabled={isLoading}>
            <Ionicons name="refresh" size={14} color={isLoading ? "#CCC" : "#059669"} />
          </Pressable>
        </View>

        <Text style={styles.insightText}>
          {insightData.insight}
        </Text>

        <View style={styles.footer}>
          <Pressable style={styles.actionBtn} onPress={handleShowSuggestions}>
            <Text style={styles.actionText}>Xem món gợi ý</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFF" />
          </Pressable>
        </View>
      </LinearGradient>
      </View>

      <SuggestedRecipesModal 
        visible={showModal} 
        onClose={() => setShowModal(false)}
        recipes={suggestions}
        loading={loadingSuggestions}
        navigation={navigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 16, marginBottom: 8 },
  neoCardWrapper: {
    position: 'relative',
    width: '100%',
  },
  neoCardShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    backgroundColor: '#1A1D1E',
    borderRadius: 20,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: '#1A1D1E',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  aiBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#DEF7EC'
  },
  aiText: { fontSize: 10, fontWeight: '900', color: '#059669' },
  refreshBtn: { padding: 4 },
  insightText: { fontSize: 14, color: '#065F46', lineHeight: 22, fontWeight: '500' },
  boldText: { fontWeight: '800', color: '#047857' },
  footer: { marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end' },
  actionBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#059669', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 12,
    gap: 6
  },
  actionText: { color: '#FFF', fontSize: 12, fontWeight: '800' }
});

export default NutritionInsight;
