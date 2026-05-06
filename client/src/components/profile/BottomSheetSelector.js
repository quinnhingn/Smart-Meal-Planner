// src/components/profile/BottomSheetSelector.js
import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const BottomSheetSelector = ({ visible, onClose, title, data, selectedValue, onSelect }) => {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sheetContent} onStartShouldSetResponder={() => true}>
          <View style={styles.dragHandle} />
          <Text style={styles.sheetTitle}>{title}</Text>
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {data.map((item) => {
              const isSelected = item.id === selectedValue;
              return (
                <Pressable 
                  key={item.id} 
                  style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                  onPress={() => { onSelect(item.id); onClose(); }}
                >
                  <View style={styles.itemInfo}>
                    {item.icon && <Text style={styles.itemIcon}>{item.icon}</Text>}
                    <View>
                      <Text style={[styles.itemTitle, isSelected && styles.itemTitleSelected]}>{item.title || item.label}</Text>
                      {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
                    </View>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', ...Platform.select({ web: { position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, zIndex: 999 } }) },
  sheetContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  dragHandle: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#1A1D1E', marginBottom: 16, textAlign: 'center' },
  list: { paddingBottom: 20 },
  itemCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#F8F9FA', borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#EEE' },
  itemCardSelected: { backgroundColor: 'rgba(76, 175, 80, 0.05)', borderColor: COLORS.primary },
  itemInfo: { flexDirection: 'row', alignItems: 'center' },
  itemIcon: { fontSize: 24, marginRight: 12 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  itemTitleSelected: { color: COLORS.primary },
  itemDesc: { fontSize: 13, color: '#888', marginTop: 4, maxWidth: 250 }
});

export default BottomSheetSelector;