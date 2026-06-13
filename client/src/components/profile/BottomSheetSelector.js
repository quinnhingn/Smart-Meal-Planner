// src/components/profile/BottomSheetSelector.js
import React from 'react';
import { 
  View, Text, StyleSheet, Modal, Pressable, 
  ScrollView, Platform, TouchableWithoutFeedback 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const BottomSheetSelector = ({ visible, onClose, title, data, selectedValue, onSelect }) => {
  if (!visible) return null;

  // Hàm thông minh phân biệt Emoji và Ionicons
  const renderIcon = (iconStr, isSelected) => {
    if (!iconStr) return null;
    
    const iconColor = isSelected ? COLORS.primary : '#555';
    
    // Nếu chuỗi dài hơn 2 ký tự và chứa chữ cái tiếng Anh -> Đích thị là tên Ionicons (VD: "body-outline")
    if (iconStr.length > 2 && /[a-zA-Z]/.test(iconStr)) {
      return <Ionicons name={iconStr} size={28} color={iconColor} style={styles.iconSpaced} />;
    }
    
    // Ngược lại, nó là Emoji (VD: "👨") -> Trả về dạng Text
    return <Text style={[styles.emojiIcon, { opacity: isSelected ? 1 : 0.6 }]}>{iconStr}</Text>;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              
              {/* Thanh kéo nhỏ phía trên */}
              <View style={styles.dragHandle} />
              
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <Pressable onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color="#555" />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {data.map((item) => {
                  const isSelected = selectedValue === item.id;
                  
                  return (
                    <Pressable
                      key={item.id}
                      style={[styles.optionItem, isSelected && styles.optionItemActive]}
                      onPress={() => {
                        onSelect(item.id);
                        onClose();
                      }}
                    >
                      <View style={styles.optionLeft}>
                        {/* RENDER ICON ĐÃ FIX LỖI */}
                        {renderIcon(item.icon, isSelected)}
                        
                        <View style={styles.textGroup}>
                          <Text style={[styles.optionTitle, isSelected && styles.optionTitleActive]}>
                            {item.title || item.label}
                          </Text>
                          {item.desc && (
                            <Text style={styles.optionDesc}>{item.desc}</Text>
                          )}
                        </View>
                      </View>

                      {isSelected && (
                        <View style={styles.checkIcon}>
                          <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'flex-end'
  },
  sheetContainer: { 
    width: '100%', 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Hỗ trợ safe area iPhone
    elevation: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20
  },

  dragHandle: { 
    width: 40, height: 4, 
    backgroundColor: '#E0E0E0', 
    borderRadius: 2, 
    alignSelf: 'center', 
    marginTop: 12, marginBottom: 8 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderColor: '#F0F0F0' 
  },
  title: { fontSize: 18, fontWeight: '800', color: '#1A1D1E' },
  closeBtn: { padding: 4, backgroundColor: '#F5F5F5', borderRadius: 20 },
  
  scrollContent: { padding: 20, gap: 12 },
  
  optionItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    backgroundColor: '#F8F9FA', 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#E0E0E0' 
  },
  optionItemActive: { 
    backgroundColor: 'rgba(76, 175, 80, 0.05)', 
    borderColor: COLORS.primary 
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  
  iconSpaced: { marginRight: 16, width: 32, textAlign: 'center' },
  emojiIcon: { fontSize: 26, marginRight: 16, width: 32, textAlign: 'center' },
  
  textGroup: { flex: 1, justifyContent: 'center' },
  optionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 2 },
  optionTitleActive: { color: COLORS.primary, fontWeight: '800' },
  optionDesc: { fontSize: 13, color: '#888', lineHeight: 18 },
  
  checkIcon: { marginLeft: 12 }
});

export default BottomSheetSelector;