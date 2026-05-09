// src/components/navigation/MobileTopbar.js
import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';

// Map tên Route tiếng Anh sang Tiêu đề tiếng Việt
export const ROUTE_TITLES = {
  Dashboard: 'Trang chủ',
  Pantry: 'Tủ lạnh',
  Recipe: 'Gợi ý món ăn',
  Recipes: 'Công thức',
  Diary: 'Nhật ký dinh dưỡng',
  Profile: 'Hồ sơ cá nhân',
  Tracking: 'Thống kê & Theo dõi',
  Scan: 'Quét AI',
  SavedRecipes: 'Công thức đã lưu',
  Settings: 'Cài đặt',
  Help: 'Trợ giúp',
};

const MobileTopbar = ({ currentRoute }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { userProfile, setDrawerOpen } = useAppStore();

  const title = ROUTE_TITLES[currentRoute] || 'SmartMeal';

  return (
    <View style={[styles.topbar, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 30 : 0) }]}>
      {/* Nút Hamburger mở Menu */}
      <Pressable style={styles.iconBtn} onPress={() => setDrawerOpen(true)}>
        <Ionicons name="menu" size={28} color="#1A1D1E" />
      </Pressable>

      {/* Tên màn hình */}
      <Text style={styles.title} numberOfLines={1}>{title}</Text>

      {/* Avatar chuyển đến Profile */}
      <Pressable style={styles.avatarBtn} onPress={() => navigation.navigate('Profile')}>
        {userProfile?.avatarUri ? (
          <Image source={{ uri: userProfile.avatarUri }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>
            {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  topbar: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    zIndex: 10,
  },
  iconBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: '800', color: '#1A1D1E', flex: 1, textAlign: 'center', marginHorizontal: 12 },
  avatarBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(76, 175, 80, 0.2)', justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 18 },
  avatarText: { fontSize: 15, fontWeight: '800', color: COLORS.primary }
});

export default MobileTopbar;