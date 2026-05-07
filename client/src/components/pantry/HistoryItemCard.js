// src/components/pantry/HistoryItemCard.js
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HistoryItemCard = ({ item }) => {
  // Phân tích trạng thái xử lý
  const isConsumed = item.action === 'consumed';
  const statusColor = isConsumed ? '#4CAF50' : '#F44336';
  const statusBg = isConsumed ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)';
  const statusIcon = isConsumed ? 'restaurant' : 'trash';
  const statusText = isConsumed ? 'Đã dùng' : 'Đã vứt bỏ';

  // Format ngày xử lý (DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        <View style={[styles.iconBox, { backgroundColor: statusBg }]}>
          <Text style={styles.icon}>{item.icon || '📦'}</Text>
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.quantity}>
            {item.quantity} {item.unit} • Xử lý: {formatDate(item.usedAt)}
          </Text>
        </View>

        {/* Badge Trạng thái */}
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <Ionicons name={statusIcon} size={14} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...Platform.select({
      web: { transition: 'all 0.2s ease' },
      default: { elevation: 1 }
    })
  },
  mainRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  icon: { fontSize: 24 },
  infoSection: { flex: 1, paddingRight: 8 },
  name: { fontSize: 16, fontWeight: '700', color: '#1A1D1E', marginBottom: 4 },
  quantity: { fontSize: 13, color: '#888', fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
});

export default HistoryItemCard;