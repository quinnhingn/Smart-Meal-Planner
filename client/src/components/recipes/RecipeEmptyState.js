// src/components/recipes/RecipeEmptyState.js
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const EMPTY_CONFIG = {
  community: {
    icon: 'search-outline',
    title: 'Không tìm thấy công thức',
    subtitle: (q) => q ? `Không có kết quả cho "${q}"` : 'Hãy thử điều chỉnh bộ lọc',
    cta: null,
  },
  my: {
    icon: 'restaurant-outline',
    title: 'Bạn chưa tạo công thức nào',
    subtitle: () => 'Hãy tạo công thức đầu tiên của bạn ngay!',
    cta: { label: '+ Tạo công thức đầu tiên', action: 'create' },
  },
  saved: {
    icon: 'bookmark-outline',
    title: 'Bạn chưa lưu công thức nào',
    subtitle: () => 'Khám phá cộng đồng để tìm món ngon nhé!',
    cta: { label: 'Khám phá cộng đồng', action: 'explore' },
  },
  drafts: {
    icon: 'document-text-outline',
    title: 'Không có bản nháp nào',
    subtitle: () => 'Các bản nháp đang viết dở sẽ xuất hiện ở đây',
    cta: null,
  },
};

const RecipeEmptyState = ({ tab, searchQuery, onCta }) => {
  const config = EMPTY_CONFIG[tab] || EMPTY_CONFIG.community;

  return (
    <View style={styles.container}>
      <Ionicons name={config.icon} size={56} color="#CCC" />
      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.subtitle}>{config.subtitle(searchQuery)}</Text>
      {config.cta && (
        <Pressable onPress={() => onCta?.(config.cta.action)} style={styles.ctaBtn}>
          <Text style={styles.ctaText}>{config.cta.label}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 32 },
  title: { fontSize: 17, fontWeight: '800', color: '#888', marginTop: 16 },
  subtitle: { fontSize: 14, fontWeight: '600', color: '#AAA', marginTop: 6, textAlign: 'center' },
  ctaBtn: {
    marginTop: 20, paddingHorizontal: 24, paddingVertical: 14,
    backgroundColor: COLORS.primary, borderRadius: 16,
  },
  ctaText: { fontSize: 14, fontWeight: '800', color: '#FFF' },
});

export default RecipeEmptyState;