// src/components/pantry/PantryItemCard.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { getDaysUntilExpiry, getUrgencyLevel, getUrgencyColor, getUrgencyLabel } from '../../utils/mockPantryData';

const PantryItemCard = ({ item, onEdit, onDelete, onUse, onFindRecipe }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const daysLeft = getDaysUntilExpiry(item);
  const urgency = getUrgencyLevel(daysLeft);
  const urgencyColor = getUrgencyColor(urgency);
  const urgencyLabel = getUrgencyLabel(urgency);
  

  const isExpired = urgency === 'expired';
  const isUrgent = urgency === 'urgent' || urgency === 'warning';

  const formatAddedDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const storageLabels = {
    'freezer': { label: 'Ngăn đông', icon: 'snow', color: '#03A9F4' },
    'fridge': { label: 'Ngăn mát', icon: 'thermometer', color: '#4CAF50' },
    'veggie_drawer': { label: 'Ngăn rau', icon: 'leaf', color: '#8BC34A' }
  };
  const storageInfo = storageLabels[item.storage] || { label: 'Kệ đồ', icon: 'cube', color: '#9E9E9E' };

  return (
    <Pressable 
      style={[
        styles.container, 
        isExpired && styles.expiredContainer,
        isHovered && Platform.OS === 'web' && styles.containerHovered
      ]}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
    >
      {/* TẦNG 1: THÔNG TIN CHÍNH */}
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: `${urgencyColor}20` }]}>
          <Text style={styles.icon}>{item.icon || '📦'}</Text>
        </View>
        
        <View style={styles.infoSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[styles.name, isExpired && styles.expiredText]}>
              {item.name}
            </Text>
            {/* BADGE NGĂN CHỨA */}
            <View style={[styles.storageBadge, { backgroundColor: `${storageInfo.color}15` }]}>
              <Ionicons name={storageInfo.icon} size={12} color={storageInfo.color} />
              <Text style={[styles.storageText, { color: storageInfo.color }]}>{storageInfo.label}</Text>
            </View>
          </View>
          <Text style={styles.quantity}>
            {item.quantity} {item.unit} • Nhập: {formatAddedDate(item.addedAt)}
          </Text>
        </View>
      </View>

      {/* TẦNG 2: CHỈ HIỂN THỊ BADGE TRẠNG THÁI */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 }}>
         <View style={[styles.statusBadge, { backgroundColor: `${urgencyColor}15` }]}>
           <View style={[styles.statusDot, { backgroundColor: urgencyColor }]} />
           <Text style={[styles.statusText, { color: urgencyColor }]}>
             {urgencyLabel} {daysLeft > 0 ? `(${daysLeft} ngày)` : ''}
           </Text>
         </View>
      </View>

      {/* TẦNG 3: NÚT GỢI Ý & ACTION KHÁC */}
      {isUrgent && !isExpired && (
        <Pressable 
          style={styles.suggestionBtn}
          onPress={() => onFindRecipe?.(item)}
        >
          <Ionicons name="bulb-outline" size={16} color="#FF9800" />
          <Text style={styles.suggestionText}>Tìm món với {item.name}</Text>
        </Pressable>
      )}

      <View style={styles.actionRow}>
        <Pressable style={styles.actionIconBtn} onPress={() => onUse?.(item)} disabled={isExpired}>
          <Ionicons name="checkmark-circle" size={24} color={isExpired ? '#CCC' : COLORS.primary} />
        </Pressable>
        <Pressable style={styles.actionIconBtn} onPress={() => onEdit?.(item)}>
          <Ionicons name="create" size={22} color="#888" />
        </Pressable>
        <Pressable style={styles.actionIconBtn} onPress={() => onDelete?.(item.id)}>
          <Ionicons name="trash" size={22} color={COLORS.danger || '#F44336'} />
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0', ...Platform.select({ web: { cursor: 'pointer', transition: 'all 0.2s ease-in-out' }, default: { elevation: 1 } }) },
  containerHovered: { transform: [{ translateY: -2 }], ...Platform.select({ web: { boxShadow: '0 8px 20px rgba(0,0,0,0.08)' } }) },
  expiredContainer: { backgroundColor: '#F5F5F5', borderColor: '#E0E0E0' },
  
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  icon: { fontSize: 24 },
  infoSection: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: '#1A1D1E', marginBottom: 4, lineHeight: 22 },
  expiredText: { textDecorationLine: 'line-through', color: '#757575' },
  quantity: { fontSize: 13, color: '#888', fontWeight: '500' },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  
  storageBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 4 },
  storageText: { fontSize: 11, fontWeight: '700' },
  
  suggestionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', padding: 10, borderRadius: 8, marginBottom: 12, gap: 6 },
  suggestionText: { color: '#FF9800', fontSize: 13, fontWeight: '700' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  actionIconBtn: { padding: 4 },
});

export default PantryItemCard;