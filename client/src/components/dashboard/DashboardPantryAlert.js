// src/components/dashboard/DashboardPantryAlert.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../GlassCard'; 

const DashboardPantryAlert = ({ alerts }) => {
  const renderItem = ({ item }) => {
    const isOutOfStock = item.status === 'out_of_stock';
    // Dùng mã màu Semantic
    const iconColor = isOutOfStock ? '#F44336' : '#FFC107'; 

    return (
      <View style={styles.alertItem}>
        <Ionicons name={isOutOfStock ? 'close-circle' : 'warning'} size={24} color={iconColor} style={styles.alertIcon} />
        <View style={styles.alertTextGroup}>
          <Text style={styles.alertName}>{item.name}</Text>
          <Text style={[styles.alertMsg, { color: iconColor }]}>{item.msg}</Text>
        </View>
        
        {/* Tương tác Web: Dùng Pressable thay cho TouchableOpacity */}
        <Pressable 
          style={({ hovered }) => [
            styles.cartBtn,
            Platform.OS === 'web' && hovered && styles.cartBtnHover
          ]}
          onPress={() => console.log('Add to cart', item.id)}
        >
          <Ionicons name="cart-outline" size={22} color="#888" />
        </Pressable>
      </View>
    );
  };

  return (
    // THỦ THUẬT: Ép padding của GlassCard về 0 bằng style inline hoặc class riêng
    <GlassCard style={{ padding: 0 }} intensity={60}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false} // Tắt cuộn trên mobile nếu list ngắn
        // INTERNAL PADDING ÁP DỤNG TẠI ĐÂY
        contentContainerStyle={styles.internalPadding}
        ListHeaderComponent={
          <View style={styles.headerWrapper}>
            <View style={styles.alertHeaderRow}>
              <Text style={styles.sectionTitle}>Cảnh báo Tủ lạnh</Text>
              <Ionicons name="notifications-outline" size={22} color="#333" />
            </View>
            <Text style={styles.alertSubtitle}>Những thực phẩm cần lưu ý ngay!</Text>
          </View>
        }
      />
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  internalPadding: {
    padding: 24, // Padding dồn vào trong nội dung cuộn
    gap: 12,
  },
  headerWrapper: {
    marginBottom: 16,
  },
  alertHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1D1E' },
  alertSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  alertItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  alertIcon: { marginRight: 12 },
  alertTextGroup: { flex: 1 },
  alertName: { fontSize: 15, fontWeight: '700', color: '#333' },
  alertMsg: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  cartBtn: {
    padding: 8,
    borderRadius: 8,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }) // Đổi trỏ chuột trên Web
  },
  cartBtnHover: {
    backgroundColor: 'rgba(0,0,0,0.05)'
  }
});

export default DashboardPantryAlert;