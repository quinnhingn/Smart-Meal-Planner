import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { compareWithPantry } from '../../utils/recipeHelpers';

const SUBSTITUTION_MAP = {
  'hành tây': 'hành tím',
  'hành tím': 'hành tây',
  'chanh': 'tắc hoặc giấm',
  'tắc': 'chanh',
  'tỏi': 'hành tím băm',
  'ớt': 'tiêu đen',
  'tiêu': 'ớt bột',
  'gừng': 'riềng tươi',
  'đường': 'mật ong hoặc đường thốt nốt',
  'thịt bò': 'thịt heo thăn',
  'thịt heo': 'thịt gà',
  'thịt gà': 'thịt heo',
  'nước cốt dừa': 'sữa tươi không đường',
  'sữa tươi': 'nước cốt dừa',
  'rau thơm': 'ngò rí',
  'bánh mì': 'bún tươi hoặc cơm',
  'nước dừa': 'nước lọc thêm chút đường',
};

const IngredientTable = ({ ingredients, pantryItems }) => {
  const [tipModal, setTipModal] = useState({ visible: false, name: '', substitute: '' });

  const { available, missing } = useMemo(
    () => compareWithPantry(ingredients, pantryItems || []),
    [ingredients, pantryItems]
  );

  const getMockSubstitute = (ingredientName) => {
    const name = String(ingredientName).toLowerCase();
    for (const [key, sub] of Object.entries(SUBSTITUTION_MAP)) {
      if (name.includes(key)) return sub;
    }
    return null;
  };

  const allItems = [
    ...available.map(i => ({ ...i, status: 'available' })),
    ...missing.map(i => ({ ...i, status: 'missing', substitute: getMockSubstitute(i.name) })),
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📋 Nguyên liệu</Text>

      {/* Table Header */}
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>Nguyên liệu</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1.2 }]}>Khối lượng</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 0.8 }]}>Cal</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 0.7 }]}>P</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 0.7 }]}>C</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 0.7 }]}>F</Text>
      </View>

      {/* Rows */}
      {allItems.map((item, idx) => (
        <View
          key={idx}
          style={[
            styles.row,
            item.status === 'available' && styles.availableRow,
            item.status === 'missing' && styles.missingRow,
          ]}
        >
          <View style={[styles.cell, { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
            <Ionicons
              name={item.status === 'available' ? 'checkmark-circle' : 'ellipse-outline'}
              size={16}
              color={item.status === 'available' ? COLORS.success : '#CCC'}
            />
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[styles.cellText, item.status === 'available' && styles.availableText]}>
                {item.name}
              </Text>
              
              {item.status === 'missing' && item.substitute && (
                <TouchableOpacity 
                  onPress={() => setTipModal({ visible: true, name: item.name, substitute: item.substitute })}
                  style={styles.tipIcon}
                >
                  <Ionicons name="bulb" size={12} color="#E67E22" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text style={[styles.cell, styles.cellText, { flex: 1.2 }]}>{item.amount}</Text>
          <Text style={[styles.cell, styles.cellText, { flex: 0.8 }]}>{item.calories}</Text>
          <Text style={[styles.cell, styles.cellText, { flex: 0.7 }]}>{item.protein}g</Text>
          <Text style={[styles.cell, styles.cellText, { flex: 0.7 }]}>{item.carbs}g</Text>
          <Text style={[styles.cell, styles.cellText, { flex: 0.7 }]}>{item.fat}g</Text>
        </View>
      ))}

      {/* Custom Substitution Modal */}
      <Modal
        visible={tipModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTipModal({ ...tipModal, visible: false })}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setTipModal({ ...tipModal, visible: false })}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.bulbCircle}>
                <Ionicons name="bulb" size={24} color="#E67E22" />
              </View>
              <Text style={styles.modalTitle}>Mẹo thay thế</Text>
            </View>
            
            <Text style={styles.modalText}>
              Bạn có thể dùng <Text style={styles.highlightText}>{tipModal.substitute}</Text> để thay thế cho <Text style={{fontWeight: '700'}}>{tipModal.name}</Text> nếu không tìm thấy nguyên liệu này nhé!
            </Text>

            <TouchableOpacity 
              style={styles.closeBtn}
              onPress={() => setTipModal({ ...tipModal, visible: false })}
            >
              <Text style={styles.closeBtnText}>Đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    backgroundColor: '#FFF', borderRadius: 24, padding: 16, marginHorizontal: 16, marginTop: 16,
    ...Platform.select({ web: { boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }, default: { elevation: 2 } }),
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1A1D1E', marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerRow: { paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: '#E0E0E0' },
  cell: { paddingHorizontal: 4 },
  headerCell: { fontSize: 11, fontWeight: '800', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 },
  cellText: { fontSize: 13, fontWeight: '600', color: '#444' },
  availableRow: { backgroundColor: '#F8FFF8' },
  missingRow: { backgroundColor: '#FFFAFA' },
  availableText: { color: '#888', textDecorationLine: 'line-through' },
  tipIcon: { backgroundColor: '#FFF5EB', padding: 2, borderRadius: 4, borderWidth: 1, borderColor: '#FFE0C2' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', borderRadius: 30, padding: 24, width: '85%', maxWidth: 360, alignItems: 'center' },
  modalHeader: { alignItems: 'center', marginBottom: 16 },
  bulbCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF5EB', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1A1D1E' },
  modalText: { fontSize: 15, lineHeight: 22, color: '#444', textAlign: 'center', marginBottom: 24 },
  highlightText: { color: '#E67E22', fontWeight: '800' },
  closeBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 16 },
  closeBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});

export default IngredientTable;
