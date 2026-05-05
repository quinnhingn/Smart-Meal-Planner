// src/components/scan/DiaryResult.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Image, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const MEAL_TYPES = ['Sáng', 'Trưa', 'Tối', 'Bữa phụ'];

const DiaryResult = ({ imageUri, data, onSave }) => {
  // 1. STATE QUẢN LÝ MÓN ĂN & ĐỘ CHÍNH XÁC
  const [selectedItem, setSelectedItem] = useState(data.topResult);
  
  // Khởi tạo fallbacks, nếu mock data thiếu % thì tự động gán giả lập (VD: 85%, 72%)
  const [fallbacks, setFallbacks] = useState(() => {
    return (data.fallback || []).map((f, index) => ({
      ...f,
      confidence: f.confidence || (85 - index * 13) 
    }));
  });
  
  const [mealName, setMealName] = useState(data.topResult.name);
  const [isEditingName, setIsEditingName] = useState(false);

  // 2. STATE ĐỊNH LƯỢNG & BỮA ĂN
  const [portionMode, setPortionMode] = useState('portion'); 
  const [portionCount, setPortionCount] = useState(1);
  const [grams, setGrams] = useState('100');
  const [mealType, setMealType] = useState('Trưa'); // Mặc định chọn Trưa (Có thể viết logic lấy theo giờ thực tế sau)

  // HOÁN ĐỔI MÓN ĂN & % CHÍNH XÁC
  const handleSwapItem = (itemToSwap) => {
    const newFallbacks = fallbacks.filter(f => f.id !== itemToSwap.id);
    newFallbacks.push(selectedItem); // Đẩy món hiện tại xuống danh sách dưới
    
    // Sắp xếp lại Fallback theo % giảm dần cho đẹp mắt
    newFallbacks.sort((a, b) => b.confidence - a.confidence);
    
    setFallbacks(newFallbacks);
    setSelectedItem(itemToSwap);
    setMealName(itemToSwap.name);
  };

  const multiplier = portionMode === 'portion' ? portionCount : (parseInt(grams) || 0) / 100;

  const currentMacros = {
    calo: Math.round((selectedItem.calo || 0) * multiplier),
    protein: Math.round((selectedItem.protein || selectedItem.calo * 0.06) * multiplier),
    carbs: Math.round((selectedItem.carbs || selectedItem.calo * 0.12) * multiplier),
    fat: Math.round((selectedItem.fat || selectedItem.calo * 0.03) * multiplier),
  };

  const handleSaveToDiary = () => {
    onSave({
      id: selectedItem.id,
      name: mealName,
      ...currentMacros,
      mode: portionMode,
      value: portionMode === 'portion' ? portionCount : parseInt(grams),
      mealType: mealType // Gửi thêm dữ liệu bữa ăn để Backend/Zustand lưu
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        <View style={styles.imageBadge}>
          <Ionicons name="camera" size={14} color="#FFF" />
          <Text style={styles.badgeText}>Ảnh vừa chụp</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.headerRow}>
          <Text style={styles.aiLabel}>AI GỢI Ý</Text>
          {selectedItem.confidence != null ? (
            <View style={styles.confidenceBadge}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success || '#4CAF50'} />
              <Text style={styles.confidenceText}>{selectedItem.confidence}%</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.nameRow}>
          {isEditingName ? (
            <TextInput 
              style={styles.nameInput} 
              value={mealName} 
              onChangeText={setMealName}
              onBlur={() => setIsEditingName(false)}
              autoFocus
            />
          ) : (
            <>
              <Text style={styles.mealName} numberOfLines={2}>{mealName}</Text>
              <Pressable onPress={() => setIsEditingName(true)} style={styles.editIconBtn}>
                <Ionicons name="pencil" size={18} color="#888" />
              </Pressable>
            </>
          )}
        </View>

        <View style={styles.macrosRow}>
          <MacroBox label="CALO" value={currentMacros.calo} />
          <MacroBox label="PROTEIN" value={`${currentMacros.protein}g`} />
          <MacroBox label="CARBS" value={`${currentMacros.carbs}g`} />
          <MacroBox label="FAT" value={`${currentMacros.fat}g`} />
        </View>

        <Text style={styles.sectionTitle}>Định lượng tiêu thụ</Text>
        <View style={styles.portionRow}>
          <PortionBtn 
            label="1 phần" 
            active={portionMode === 'portion' && portionCount === 1} 
            onPress={() => { setPortionMode('portion'); setPortionCount(1); }} 
          />
          <PortionBtn 
            label="2 phần" 
            active={portionMode === 'portion' && portionCount === 2} 
            onPress={() => { setPortionMode('portion'); setPortionCount(2); }} 
          />
          
          <Pressable 
            style={[styles.customPortionBtn, portionMode === 'grams' && styles.portionBtnActive]} 
            onPress={() => setPortionMode('grams')}
          >
            <Ionicons name="scale-outline" size={16} color={portionMode === 'grams' ? COLORS.primary : '#888'} />
            {portionMode === 'grams' ? (
              <View style={styles.gramsInputWrapper}>
                <TextInput
                  style={styles.gramsInput}
                  value={grams}
                  onChangeText={setGrams}
                  keyboardType="numeric"
                  autoFocus
                />
                <Text style={styles.gramsLabel}>g</Text>
              </View>
            ) : (
              <Text style={styles.customPortionText}>Nhập Grams</Text>
            )}
          </Pressable>
        </View>
      </View>

      {/* CHỌN BỮA ĂN (UI MỚI) */}
      <View style={styles.mealSection}>
        <Text style={styles.sectionTitle}>Chọn bữa ăn</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mealRow}>
          {MEAL_TYPES.map((meal) => (
            <Pressable 
              key={meal} 
              style={[styles.mealChip, mealType === meal && styles.mealChipActive]}
              onPress={() => setMealType(meal)}
            >
              <Text style={[styles.mealChipText, mealType === meal && styles.mealChipTextActive]}>
                {meal}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* DANH SÁCH GỢI Ý KHÁC CÓ % CHÍNH XÁC */}
      {fallbacks.length > 0 ? (
        <View style={styles.fallbackSection}>
          <Text style={styles.fallbackTitle}>Không phải món này? Thử chọn:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fallbackList}>
            {fallbacks.map(item => (
              <Pressable key={item.id} style={styles.fallbackCard} onPress={() => handleSwapItem(item)}>
                <View style={styles.fallbackHeader}>
                  <Text style={styles.fallbackName} numberOfLines={1}>{item.name}</Text>
                  {item.confidence != null ? (
                     <Text style={styles.fallbackConfidence}>{item.confidence}%</Text>
                  ) : null}
                </View>
                <Text style={styles.fallbackCalo}>{item.calo} Kcal</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <Pressable style={styles.saveBtn} onPress={handleSaveToDiary}>
        <Ionicons name="add-circle-outline" size={24} color="#FFF" />
        <Text style={styles.saveBtnText}>Thêm vào nhật ký</Text>
      </Pressable>
      
      <View style={{ height: 40 }} /> 
      
    </View>
  );
};

const MacroBox = ({ label, value }) => (
  <View style={styles.macroBox}>
    <Text style={styles.macroLabel}>{label}</Text>
    <Text style={styles.macroValue}>{value}</Text>
  </View>
);

const PortionBtn = ({ label, active, onPress }) => (
  <Pressable style={[styles.portionBtn, active && styles.portionBtnActive]} onPress={onPress}>
    <Text style={[styles.portionBtnText, active && styles.portionBtnTextActive]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  
  imageContainer: { height: 180, borderRadius: 24, overflow: 'hidden', marginBottom: 16, backgroundColor: '#E8F5E9' },
  image: { width: '100%', height: '100%' },
  imageBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, alignItems: 'center', gap: 6 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  
  infoCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F0F0F0', ...Platform.select({ web: { boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }, default: { elevation: 2 } }) },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  aiLabel: { color: COLORS.primary, fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  confidenceBadge: { flexDirection: 'row', backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignItems: 'center', gap: 4 },
  confidenceText: { color: COLORS.success || '#4CAF50', fontWeight: '700', fontSize: 12 },
  
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  mealName: { fontSize: 22, fontWeight: '800', color: '#1A1D1E', flex: 1 },
  nameInput: { fontSize: 22, fontWeight: '800', color: COLORS.primary, borderBottomWidth: 1, borderColor: COLORS.primary, paddingVertical: 0, flex: 1 },
  editIconBtn: { padding: 4, marginLeft: 4 },

  macrosRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 8 },
  macroBox: { backgroundColor: '#F8F9FA', paddingVertical: 12, borderRadius: 16, alignItems: 'center', flex: 1 },
  macroLabel: { fontSize: 10, color: '#888', fontWeight: '700', marginBottom: 4 },
  macroValue: { fontSize: 16, fontWeight: '800', color: '#1A1D1E' },
  
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 12 },
  portionRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  portionBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0' },
  portionBtnActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(76, 175, 80, 0.1)' },
  portionBtnText: { color: '#555', fontWeight: '600' },
  portionBtnTextActive: { color: COLORS.primary, fontWeight: '700' },
  
  customPortionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0', gap: 6 },
  customPortionText: { color: '#555', fontWeight: '600' },
  gramsInputWrapper: { flexDirection: 'row', alignItems: 'center' },
  gramsInput: { fontSize: 14, fontWeight: '700', color: COLORS.primary, minWidth: 35, textAlign: 'center', padding: 0 },
  gramsLabel: { fontSize: 14, fontWeight: '600', color: COLORS.primary },

  // Chọn Bữa ăn
  mealSection: { marginTop: 24 },
  mealRow: { flexDirection: 'row', gap: 12 },
  mealChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E0E0E0' },
  mealChipActive: { backgroundColor: 'rgba(76, 175, 80, 0.1)', borderColor: COLORS.primary },
  mealChipText: { color: '#555', fontWeight: '600', fontSize: 14 },
  mealChipTextActive: { color: COLORS.primary, fontWeight: '700' },

  // Gợi ý khác
  fallbackSection: { marginTop: 24, marginBottom: 24 },
  fallbackTitle: { fontSize: 14, fontWeight: '700', color: '#555', marginBottom: 12 },
  fallbackList: { gap: 12 },
  fallbackCard: { backgroundColor: '#F8F9FA', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: '#EEE', width: 160 },
  fallbackHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 },
  fallbackName: { fontSize: 14, fontWeight: '700', color: '#333', flex: 1 },
  fallbackConfidence: { fontSize: 12, fontWeight: '700', color: COLORS.success || '#4CAF50' },
  fallbackCalo: { fontSize: 13, color: '#888', fontWeight: '600' },

  saveBtn: { backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 24, gap: 8, marginTop: 8 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});

export default DiaryResult;