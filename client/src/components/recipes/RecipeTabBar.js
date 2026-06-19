// src/components/recipes/RecipeTabBar.js
import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { COLORS } from '../../constants/theme';

const TABS = [
  { id: 'community', label: 'Cộng đồng' },
  { id: 'my', label: 'Do bạn tạo' },
  { id: 'saved', label: 'Đã lưu' },
];

const RecipeTabBar = ({ activeTab, onChange }) => {
  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.container, isWeb && styles.containerWeb]}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => onChange(tab.id)}
              // Cấu hình cursor: pointer cho Web
              style={({ hovered }) => [
                styles.tab,
                isActive && styles.tabActive,
                hovered && isWeb && styles.tabHover,
                { cursor: 'pointer' }
              ]}
            >
              <Text style={[
                styles.label, 
                isActive && styles.labelActive,
                isWeb && { fontSize: 15 }
              ]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)', // Nền xám nhẹ dạng track
    borderRadius: 16,
    padding: 4,
  },
  containerWeb: {
    width: 'auto', // Trên Web chỉ dài theo nội dung
    minWidth: 400,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderRadius: 12,
    transitionDuration: '200ms', // Chỉ áp dụng cho Web
  },
  tabActive: {
    backgroundColor: '#FFF',
    // Hiệu ứng bóng đổ để làm nổi bật tab đang chọn
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabHover: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  labelActive: {
    color: COLORS.primary, // Chuyển sang xanh Primary để nổi bật thương hiệu
  },
});

export default RecipeTabBar;