// src/screens/DashboardScreen.js
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Platform, 
  useWindowDimensions, FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ResponsiveContainer from '../components/ResponsiveContainer';
import GlassCard from '../components/GlassCard';
import CalorieRing from '../components/CalorieRing';
import MacroBar from '../components/MacroBar';
import { COLORS, BREAKPOINTS } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

// Mock Data (Giai đoạn sau sẽ lấy từ Zustand Store/Neon DB)
const MOCK_TRACKING = { target_kcal: 1800, consumed_kcal: 1250 };
const MOCK_MACROS = {
  protein: { current: 80, target: 120, color: '#E53935' }, // Đỏ
  carbs: { current: 140, target: 200, color: '#29B6F6' },  // Xanh dương
  fat: { current: 35, target: 50, color: '#FBC02D' },      // Vàng
};
const MOCK_PANTRY_ALERTS = [
  { id: '1', name: 'Thịt bò nguội', status: 'out_of_stock', msg: 'Đã hết hàng' },
  { id: '2', name: 'Sữa tươi', status: 'expiring', msg: 'Hết hạn trong 1 ngày' },
  { id: '3', name: 'Rau xà lách', status: 'expiring', msg: 'Hết hạn trong 2 ngày' },
];

const DashboardScreen = () => {
  const { width: windowWidth } = useWindowDimensions();
  // Kích hoạt Layout 2 cột trên màn hình Web lớn
  const isWebLarge = Platform.OS === 'web' && windowWidth > (BREAKPOINTS?.mobileMax || 768);

  // Render từng item cảnh báo tủ lạnh
  const renderAlertItem = ({ item }) => {
    const isOutOfStock = item.status === 'out_of_stock';
    const iconColor = isOutOfStock ? COLORS.danger : COLORS.warning;
    const iconName = isOutOfStock ? 'close-circle' : 'warning';

    return (
      <View style={styles.alertItem}>
        <Ionicons name={iconName} size={24} color={iconColor} style={styles.alertIcon} />
        <View style={styles.alertTextGroup}>
          <Text style={styles.alertName}>{item.name}</Text>
          <Text style={[styles.alertMsg, { color: iconColor }]}>{item.msg}</Text>
        </View>
        {/* Nút hành động nhanh (Mua thêm) */}
        <Ionicons name="cart-outline" size={22} color="#888" style={Platform.OS === 'web' && { cursor: 'pointer' }} />
      </View>
    );
  };

  return (
    // Bật useImageBg để nổi bật các lớp GlassCard
    <ResponsiveContainer useImageBg={false}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Tổng quan hôm nay</Text>

        {/* Khung chứa Responsive: Flex-row trên Web, Flex-column trên Mobile */}
        <View style={[styles.dashboardGrid, isWebLarge && styles.dashboardGridWeb]}>
          
          {/* CỘT TRÁI: THEO DÕI DINH DƯỠNG (Kính rõ nét - Cấp 1) */}
          <GlassCard style={[styles.glassSection, isWebLarge && { flex: 1.2 }]} intensity={85}>
            <View style={styles.cardContent}>
              <Text style={styles.sectionTitle}>Chỉ số Năng lượng</Text>
              
              <View style={styles.ringWrapper}>
                <CalorieRing 
                  target={MOCK_TRACKING.target_kcal} 
                  consumed={MOCK_TRACKING.consumed_kcal} 
                  size={220} 
                />
              </View>

              <View style={styles.macrosWrapper}>
                <MacroBar label="Protein" current={MOCK_MACROS.protein.current} target={MOCK_MACROS.protein.target} color={MOCK_MACROS.protein.color} />
                <MacroBar label="Carbs" current={MOCK_MACROS.carbs.current} target={MOCK_MACROS.carbs.target} color={MOCK_MACROS.carbs.color} />
                <MacroBar label="Fat" current={MOCK_MACROS.fat.current} target={MOCK_MACROS.fat.target} color={MOCK_MACROS.fat.color} />
              </View>
            </View>
          </GlassCard>

          {/* CỘT PHẢI: CẢNH BÁO TỦ LẠNH (Kính mờ hơn - Cấp 2) */}
          <GlassCard style={[styles.glassSection, isWebLarge && { flex: 1 }]} intensity={60}>
            <View style={styles.cardContent}>
              <View style={styles.alertHeaderRow}>
                <Text style={styles.sectionTitle}>Cảnh báo Tủ lạnh</Text>
                <Ionicons name="notifications-outline" size={24} color="#333" />
              </View>
              
              <Text style={styles.alertSubtitle}>Những thực phẩm cần lưu ý ngay!</Text>

              {/* Sử dụng FlatList với Internal Padding để không bị cắt xén UI */}
              <FlatList
                data={MOCK_PANTRY_ALERTS}
                keyExtractor={(item) => item.id}
                renderItem={renderAlertItem}
                scrollEnabled={false} // Tắt cuộn độc lập vì đã nằm trong ScrollView tổng
                contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
              />
            </View>
          </GlassCard>

        </View>
      </ScrollView>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#333',
    marginBottom: 24,
    alignSelf: 'flex-start',
    width: '100%',
    maxWidth: 1000,
  },
  dashboardGrid: {
    width: '100%',
    maxWidth: 1000, // Giới hạn chiều rộng tổng trên màn Web siêu lớn
    flexDirection: 'column', // Mặc định là dọc (Mobile)
    gap: 24,
  },
  dashboardGridWeb: {
    flexDirection: 'row', // Chuyển sang ngang trên Web Desktop
    alignItems: 'flex-start', // Không kéo dãn thẻ theo chiều dọc
  },
  glassSection: {
    width: '100%',
  },
  cardContent: {
    padding: 24, // Áp dụng chuẩn Internal Padding
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1D1E',
    marginBottom: 16,
  },
  ringWrapper: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  macrosWrapper: {
    width: '100%',
  },
  alertHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    marginTop: -10,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  alertIcon: {
    marginRight: 12,
  },
  alertTextGroup: {
    flex: 1,
  },
  alertName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  alertMsg: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  }
});

export default DashboardScreen;