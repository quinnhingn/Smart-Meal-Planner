// src/components/navigation/FABActionSheet.js
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import InteractiveBottomSheet from '../common/InteractiveBottomSheet';
import { COLORS } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';

const FABActionSheet = () => {
  const navigation = useNavigation();
  const { fabSheetVisible, setFabSheetVisible, setSearchModalVisible } = useAppStore();

  const handleCamera = () => {
    setFabSheetVisible(false);
    navigation.navigate('Scan');
  };

  const handleSearch = () => {
    setFabSheetVisible(false);
    setSearchModalVisible(true);
  };

  return (
    <InteractiveBottomSheet 
      isVisible={fabSheetVisible} 
      onClose={() => setFabSheetVisible(false)}
      snapPoints={[0.4]} // Chiếm 40% màn hình
    >
      <View style={styles.container}>
        <Text style={styles.title}>Thêm món ăn</Text>
        <Text style={styles.subtitle}>Chọn phương thức nhập nhật ký ăn uống của bạn.</Text>

        <View style={styles.actionRow}>
          <Pressable style={styles.actionCard} onPress={handleCamera}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
              <Ionicons name="camera" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.actionTitle}>Camera Scan</Text>
            <Text style={styles.actionDesc}>AI tự động nhận diện mâm cơm</Text>
          </Pressable>

          <Pressable style={styles.actionCard} onPress={handleSearch}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
              <Ionicons name="search" size={32} color="#2196F3" />
            </View>
            <Text style={styles.actionTitle}>Tìm thủ công</Text>
            <Text style={styles.actionDesc}>Tìm kiếm từ thư viện món ăn</Text>
          </Pressable>
        </View>
      </View>
    </InteractiveBottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    textAlign: 'center'
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    lineHeight: 16,
  }
});

export default FABActionSheet;
