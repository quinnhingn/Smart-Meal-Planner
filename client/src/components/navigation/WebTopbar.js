// src/components/navigation/WebTopbar.js
import React from 'react';
import { View, StyleSheet, Pressable, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native'; 
import { useAppStore } from '../../store/useAppStore'; 

// Tái sử dụng bảng dịch tên từ MobileTopbar (Hoặc bạn có thể tạo 1 file utils chung)
const ROUTE_TITLES = {
  Dashboard: 'Trang chủ',
  Pantry: 'Tủ lạnh',
  Recipe: 'Gợi ý món ăn',
  Recipes: 'Công thức',
  Diary: 'Nhật ký dinh dưỡng',
  Profile: 'Hồ sơ cá nhân',
  Tracking: 'Thống kê & Theo dõi',
  Scan: 'Quét AI',
  ShoppingList: 'Danh sách đi chợ',
};

const WebTopbar = ({ currentRoute }) => {
  const navigation = useNavigation();
  const { userProfile, shoppingList } = useAppStore(); 

  const title = ROUTE_TITLES[currentRoute] || 'Tổng quan';

  return (
    <View style={styles.topbarContainer}>
      <View style={styles.leftSection}>
        {/* HIỂN THỊ TÊN MÀN HÌNH Ở ĐÂY */}
        <Text style={styles.screenTitle}>{title}</Text>
      </View>

      <View style={styles.rightSection}>
        {shoppingList?.length > 0 && (
          <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('ShoppingList')}>
            <Ionicons name="cart-outline" size={24} color={COLORS.primary} />
            <View style={styles.cartBadge}>
              <Text style={styles.badgeText}>{shoppingList.length}</Text>
            </View>
          </Pressable>
        )}

        <Pressable style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={24} color="#555" />
          <View style={styles.notifBadge} />
        </Pressable>

        <Pressable style={styles.avatarBtn} onPress={() => navigation.navigate('Profile')}>
          {userProfile?.avatarUri ? (
            <Image source={{ uri: userProfile.avatarUri }} style={{width: 40, height: 40, borderRadius: 20}} />
          ) : (
            <Text style={styles.avatarText}>
               {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topbarContainer: {
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.85)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  leftSection: { flexDirection: 'row', alignItems: 'center' },
  screenTitle: { fontSize: 22, fontWeight: '800', color: '#1A1D1E' }, // Style cho Title
  
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  iconBtn: { position: 'relative', cursor: 'pointer' },
  notifBadge: { position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.danger, borderWidth: 2, borderColor: '#FFF' },
  cartBadge: { 
    position: 'absolute', 
    top: -5, 
    right: -5, 
    backgroundColor: '#FF5252', 
    borderRadius: 9, 
    minWidth: 18, 
    height: 18, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  avatarBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(76, 175, 80, 0.2)', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' },
  avatarText: { fontSize: 16, fontWeight: '800', color: COLORS.primary }
});

export default WebTopbar;