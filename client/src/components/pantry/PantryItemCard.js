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
  
  const maxDays = 30;
  const progressPercent = Math.max(0, Math.min(100, (daysLeft / maxDays) * 100));
  const isExpired = urgency === 'expired';
  const isUrgent = urgency === 'urgent' || urgency === 'warning';

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
      <View style={styles.mainRow}>
        <View style={[styles.iconBox, { backgroundColor: `${urgencyColor}20` }]}>
          <Text style={styles.icon}>{item.icon || '📦'}</Text>
        </View>
        
        <View style={styles.infoSection}>
          <Text style={[styles.name, isExpired && styles.expiredText]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.quantity}>
            {item.quantity} {item.unit}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: `${urgencyColor}15` }]}>
          <View style={[styles.statusDot, { backgroundColor: urgencyColor }]} />
          <Text style={[styles.statusText, { color: urgencyColor }]}>
            {daysLeft <= 0 ? 'Hết hạn' : `Còn ${daysLeft} ngày`}
          </Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: urgencyColor }]} />
        </View>
      </View>

      {/* Tương tác ngữ cảnh: Chỉ hiện khi sắp hỏng hoặc hết hạn */}
      {isUrgent && !isExpired && (
        <Pressable 
          style={styles.suggestionBtn}
          onPress={() => onFindRecipe?.(item)}
        >
          <Ionicons name="bulb-outline" size={16} color="#FF9800" />
          <Text style={styles.suggestionText}>Tìm món với {item.name}</Text>
        </Pressable>
      )}

      {/* Action Row - Thu gọn lại */}
      <View style={styles.actionRow}>
        <Pressable style={styles.actionIconBtn} onPress={() => onUse?.(item.id)} disabled={isExpired}>
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
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'all 0.2s ease-in-out' },
      default: { elevation: 1 }
    })
  },
  containerHovered: {
    transform: [{ translateY: -2 }],
    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
  },
  expiredContainer: { 
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  mainRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { 
    width: 48, height: 48, borderRadius: 12, 
    justifyContent: 'center', alignItems: 'center', marginRight: 12 
  },
  icon: { fontSize: 24 },
  infoSection: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#1A1D1E', marginBottom: 4 },
  expiredText: { 
    textDecorationLine: 'line-through', 
    color: '#757575',
  },
  quantity: { fontSize: 14, color: '#888', fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  progressSection: { marginBottom: 12 },
  progressBarBg: { height: 4, backgroundColor: '#F0F0F0', borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 2 },
  suggestionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', padding: 8, borderRadius: 8, marginBottom: 12, gap: 6 },
  suggestionText: { color: '#FF9800', fontSize: 13, fontWeight: '700' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  actionIconBtn: { padding: 4 },
});

export default PantryItemCard;