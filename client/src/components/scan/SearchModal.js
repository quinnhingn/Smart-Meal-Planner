// src/components/scan/SearchModal.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import InteractiveBottomSheet from '../common/InteractiveBottomSheet';
import CustomButton from '../CustomButton';
import GramInput from './GramInput';
import { useAppStore } from '../../store/useAppStore';
import { COLORS } from '../../constants/theme';

const MOCK_DB = [
  { id: 'db1', name: 'Phở bò', base_calo: 350, base_protein: 15, base_carbs: 45, base_fat: 10 },
  { id: 'db2', name: 'Cơm tấm sườn', base_calo: 400, base_protein: 20, base_carbs: 50, base_fat: 15 },
  { id: 'db3', name: 'Salad gà', base_calo: 120, base_protein: 18, base_carbs: 5, base_fat: 3 },
  { id: 'db4', name: 'Sữa chua không đường', base_calo: 60, base_protein: 4, base_carbs: 6, base_fat: 1 },
  { id: 'db5', name: 'Bánh mì thịt', base_calo: 280, base_protein: 12, base_carbs: 35, base_fat: 8 },
];

const SearchModal = () => {
  const { searchModalVisible, setSearchModalVisible, searchModalOnSelect, addDiaryItem } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [gram, setGram] = useState(100);
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    setSearchModalVisible(false);
    setQuery('');
    setSelectedItem(null);
    setGram(100);
  };

  const filtered = MOCK_DB.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));

  const handleConfirm = async () => {
    if (!selectedItem) return;

    const finalItem = {
      ...selectedItem,
      gram_input: gram,
      confidence: 1.0,
      image_url: 'https://via.placeholder.com/150/FFF/000?text=Manual',
    };

    if (searchModalOnSelect) {
      searchModalOnSelect(finalItem);
    } else {
      // Direct Log from FAB
      const mockLog = {
        id: Math.random().toString(),
        meal_name: finalItem.name,
        meal_type: 'snack',
        servings: 1,
        calories: Math.round((finalItem.base_calo * gram) / 100),
        protein: Math.round((finalItem.base_protein * gram) / 100),
        carbs: Math.round((finalItem.base_carbs * gram) / 100),
        fat: Math.round((finalItem.base_fat * gram) / 100),
        created_at: new Date().toISOString()
      };
      await addDiaryItem(mockLog);
    }
    handleClose();
  };

  return (
    <InteractiveBottomSheet 
      isVisible={searchModalVisible} 
      onClose={handleClose}
      snapPoints={[0.85, 0.95]}
    >
      <View style={styles.container}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={styles.input}
            placeholder="Tìm kiếm món ăn..."
            value={query}
            onChangeText={setQuery}
            autoFocus={true}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </Pressable>
          )}
        </View>

        {!selectedItem ? (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Pressable style={styles.listItem} onPress={() => setSelectedItem(item)}>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>{item.base_calo} kcal / 100g</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CCC" />
              </Pressable>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <View style={styles.selectedContainer}>
            <View style={styles.selectedHeader}>
              <Pressable onPress={() => setSelectedItem(null)} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#333" />
              </Pressable>
              <Text style={styles.selectedTitle}>{selectedItem.name}</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.macroCard}>
              <Text style={styles.macroTitle}>Ước tính dinh dưỡng ({gram}g):</Text>
              <Text style={styles.macroLine}>🔥 {Math.round((selectedItem.base_calo * gram) / 100)} kcal</Text>
              <Text style={styles.macroLine}>🥩 Pro: {Math.round((selectedItem.base_protein * gram) / 100)}g | 🍚 Carb: {Math.round((selectedItem.base_carbs * gram) / 100)}g | 🥑 Fat: {Math.round((selectedItem.base_fat * gram) / 100)}g</Text>
            </View>

            <View style={styles.gramRow}>
              <Text style={styles.gramLabel}>Khối lượng:</Text>
              <GramInput 
                value={gram}
                onChange={(v) => setGram(Number(v))}
                onMinus={() => setGram(Math.max(0, gram - 10))}
                onPlus={() => setGram(gram + 10)}
              />
            </View>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
               <CustomButton title="XÁC NHẬN" onPress={handleConfirm} />
            </View>
          </View>
        )}
      </View>
    </InteractiveBottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#111',
    fontWeight: '600'
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0'
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4
  },
  itemMeta: {
    fontSize: 13,
    color: '#888'
  },
  selectedContainer: {
    flex: 1,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    padding: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  selectedTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111',
  },
  macroCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 24,
  },
  macroTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#555',
    marginBottom: 12,
  },
  macroLine: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  gramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gramLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 16,
  }
});

export default SearchModal;
