import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, Pressable, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const SuggestedRecipesModal = ({ visible, onClose, recipes = [], loading, navigation }) => {
  const handlePressRecipe = (recipe) => {
    onClose();
    navigation.navigate('AISuggestedRecipeDetail', { recipe });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Món ngon từ tủ lạnh 🍳</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#333" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {loading ? (
              <View style={styles.loadingBox}>
                <Text style={styles.loadingText}>Đang tìm món ngon phù hợp...</Text>
              </View>
            ) : recipes.length > 0 ? (
              recipes.map((item, index) => (
                <Pressable key={index} style={styles.recipeCard} onPress={() => handlePressRecipe(item)}>
                  <Image source={{ uri: item.image }} style={styles.recipeImage} />
                  <View style={styles.recipeInfo}>
                    <Text style={styles.recipeName}>{item.name}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="timer-outline" size={14} color="#666" />
                        <Text style={styles.metaText}>{item.time}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="stats-chart-outline" size={14} color="#666" />
                        <Text style={styles.metaText}>{item.difficulty}</Text>
                      </View>
                    </View>
                    <Text style={styles.nutritionNote} numberOfLines={2}>
                      💡 {item.nutrition_advice}
                    </Text>
                  </View>
                </Pressable>
              ))
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Chưa tìm thấy món nào phù hợp với nguyên liệu hiện tại. Bạn thử thêm đồ vào tủ lạnh nhé!</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Tuyệt vời</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  container: { 
    width: '90%', 
    maxWidth: 500, 
    height: '80%', 
    backgroundColor: '#FFF', 
    borderRadius: 30, 
    overflow: 'hidden' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0' 
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1A1D1E' },
  closeBtn: { padding: 4 },
  scrollContent: { padding: 20 },
  recipeCard: { 
    backgroundColor: '#F8F9FA', 
    borderRadius: 20, 
    marginBottom: 20, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEE'
  },
  recipeImage: { width: '100%', height: 180, backgroundColor: '#EEE' },
  recipeInfo: { padding: 16 },
  recipeName: { fontSize: 18, fontWeight: '700', color: '#1A1D1E', marginBottom: 8 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: '#666' },
  nutritionNote: { fontSize: 13, color: '#059669', fontStyle: 'italic', lineHeight: 18 },
  loadingBox: { padding: 40, alignItems: 'center' },
  loadingText: { fontSize: 15, color: '#666' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#888', lineHeight: 22 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  doneBtn: { 
    backgroundColor: '#059669', 
    paddingVertical: 14, 
    borderRadius: 16, 
    alignItems: 'center' 
  },
  doneBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});

export default SuggestedRecipesModal;
