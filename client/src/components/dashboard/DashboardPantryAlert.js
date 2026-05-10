// src/components/dashboard/DashboardPantryAlert.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Hàm cắt mảng thành các nhóm nhỏ
const chunkArray = (arr, size) => {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );
};

const DashboardPantryAlert = ({ alerts }) => {
  // Mỗi slide chứa 2 item để tiết kiệm diện tích chiều dọc
  const chunks = chunkArray(alerts, 2);

  const renderSlide = ({ item: slideItems }) => {
    return (
      <View style={styles.slide}>
        {slideItems.map((item) => {
          const isOutOfStock = item.status === 'out_of_stock';
          const iconColor = isOutOfStock ? '#F44336' : '#FFC107'; 

          return (
            <View key={item.id} style={styles.alertItem}>
              <Ionicons name={isOutOfStock ? 'close-circle' : 'warning'} size={24} color={iconColor} style={styles.alertIcon} />
              <View style={styles.alertTextGroup}>
                <Text style={styles.alertName} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.alertMsg, { color: iconColor }]}>{item.msg}</Text>
              </View>
              
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
        })}
      </View>
    );
  };

  return (
    <View style={{ padding: 0 }}>
      {alerts.length === 0 ? (
        <Text style={styles.emptyText}>Tủ lạnh đang an toàn, không có đồ sắp hỏng!</Text>
      ) : (
        <FlatList
          data={chunks}
          keyExtractor={(_, index) => `slide-${index}`}
          renderItem={renderSlide}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={280 + 16} // slide width + gap
          decelerationRate="fast"
          contentContainerStyle={styles.horizontalPadding}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalPadding: {
    paddingVertical: 4,
    gap: 16, // Khoảng cách giữa các slide
  },
  slide: {
    width: 280, // Chiều rộng cố định của 1 slide để dễ vuốt
    gap: 12,
  },
  alertItem: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8F9FA',
    padding: 12, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#E9ECEF',
  },
  alertIcon: { marginRight: 12 },
  alertTextGroup: { flex: 1 },
  alertName: { fontSize: 14, fontWeight: '700', color: '#333' },
  alertMsg: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  cartBtn: {
    padding: 8,
    borderRadius: 8,
    ...(Platform.OS === 'web' && { cursor: 'pointer' })
  },
  cartBtnHover: {
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    padding: 12,
  }
});

export default DashboardPantryAlert;