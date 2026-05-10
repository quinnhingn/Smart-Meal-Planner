// src/components/recipe-form/FormIngredients.js
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { calculateRowMacros } from '../../utils/macroCalculator';

// Nhập trực tiếp dữ liệu material.json từ thư mục utils
import materialData from '../../utils/material.json'; 

const FormIngredients = ({ ingredients, onChange }) => {
  const [activeSuggestIdx, setActiveSuggestIdx] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');

  const update = (idx, field, value) => {
    const next = [...ingredients];
    next[idx] = { ...next[idx], [field]: value };

    // Nếu thay đổi 'amount' và đã có baseMacros, tự động tính lại
    if (field === 'amount' && next[idx].baseMacros) {
      const calculated = calculateRowMacros(next[idx].baseMacros, value);
      next[idx] = { ...next[idx], ...calculated };
    }
    
    onChange(next);
    
    // Nếu đang gõ tên, hiện gợi ý
    if (field === 'name') {
      setActiveSuggestIdx(idx);
      setSearchQuery(value.toLowerCase());
    }
  };

  const selectSuggestion = (idx, material) => {
    const next = [...ingredients];
    
    // FIX BUG CHÍNH: Lấy đúng Key tiếng Việt từ material.json
    const baseMacros = {
      calories: material['Calo (kcal)'] || 0,
      protein: material['Đạm (g)'] || 0,
      carbs: material['Carb (g)'] || 0,
      fat: material['Béo (g)'] || 0,
    };

    next[idx] = { 
      ...next[idx], 
      name: material['Tên nguyên liệu'] || '', 
      baseMacros 
    };

    // Nếu đã nhập amount trước đó, tự tính luôn
    if (next[idx].amount) {
      const calculated = calculateRowMacros(baseMacros, next[idx].amount);
      next[idx] = { ...next[idx], ...calculated };
    }

    onChange(next);
    setActiveSuggestIdx(-1);
  };

  const add = () => {
    onChange([...ingredients, { name: '', amount: '', calories: 0, protein: 0, carbs: 0, fat: 0, baseMacros: null }]);
  };

  const remove = (idx) => {
    const next = ingredients.filter((_, i) => i !== idx);
    onChange(next);
    setActiveSuggestIdx(-1);
  };

  // FIX BUG: Lọc theo đúng trường "Tên nguyên liệu"
  const suggestions = materialData.filter(item => 
    (item['Tên nguyên liệu'] || '').toLowerCase().includes(searchQuery)
  ).slice(0, 5); // Lấy top 5

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📋 Nguyên liệu *</Text>
      
      {ingredients.map((ing, idx) => (
        <View key={idx} style={styles.row}>
          <View style={styles.rowHeader}>
            <Text style={styles.rowNum}>#{idx + 1}</Text>
            <Pressable onPress={() => remove(idx)} style={styles.removeBtn}>
              <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
            </Pressable>
          </View>
          
          <View style={styles.inputs}>
            <View style={[styles.inputWrap, styles.inputFlex2]}>
              <TextInput
                value={ing.name}
                onChangeText={(t) => update(idx, 'name', t)}
                onFocus={() => {
                  setActiveSuggestIdx(idx);
                  setSearchQuery(ing.name.toLowerCase());
                }}
                placeholder="Tên nguyên liệu *"
                placeholderTextColor="#BBB"
                style={styles.input}
              />
              
              {/* Dropdown Gợi ý */}
              {activeSuggestIdx === idx && searchQuery.length > 0 && suggestions.length > 0 && (
                <View style={styles.suggestionBox}>
                  {suggestions.map((item, sIdx) => (
                    <Pressable 
                      key={sIdx} 
                      style={styles.suggestionItem}
                      onPress={() => selectSuggestion(idx, item)}
                    >
                      {/* FIX BUG: Đọc tên và calo chuẩn xác để hiển thị Dropdown */}
                      <Text style={styles.suggestionText}>{item['Tên nguyên liệu']}</Text>
                      <Text style={styles.suggestionKcal}>
                        {item['Calo (kcal)']} kcal/100g
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <TextInput
              value={ing.amount}
              onChangeText={(t) => update(idx, 'amount', t)}
              placeholder="VD: 200g"
              placeholderTextColor="#BBB"
              style={[styles.input, styles.inputFlex1]}
            />
          </View>
          
          <View style={styles.macroInputs}>
            <MacroInput value={ing.calories} label="Cal" />
            <MacroInput value={ing.protein} label="P" />
            <MacroInput value={ing.carbs} label="C" />
            <MacroInput value={ing.fat} label="F" />
          </View>
        </View>
      ))}
      
      <Pressable onPress={add} style={styles.addBtn}>
        <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
        <Text style={styles.addText}>Thêm nguyên liệu</Text>
      </Pressable>
    </View>
  );
};

// Ô nhập macro hiện tại thành Read-only (chỉ hiển thị, không cho sửa bằng tay)
const MacroInput = ({ value, label }) => (
  <View style={styles.macroWrap}>
    <Text style={styles.macroLabel}>{label}</Text>
    <View style={[styles.macroInput, { backgroundColor: '#F0F0F0' }]}>
      <Text style={styles.macroReadonlyText}>{value || 0}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#1A1D1E', marginBottom: 12 },
  row: {
    backgroundColor: '#F8F9FA', borderRadius: 16, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)', zIndex: 10,
  },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  rowNum: { fontSize: 12, fontWeight: '800', color: '#AAA' },
  removeBtn: { padding: 4 },
  inputs: { flexDirection: 'row', gap: 8, marginBottom: 8, zIndex: 20 },
  inputWrap: { position: 'relative' },
  input: {
    backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, fontWeight: '600', color: '#1A1D1E', borderWidth: 1, borderColor: '#E8E8E8',
  },
  inputFlex2: { flex: 2 },
  inputFlex1: { flex: 1 },
  suggestionBox: {
    position: 'absolute', top: 45, left: 0, right: 0, backgroundColor: '#FFF',
    borderRadius: 8, borderWidth: 1, borderColor: '#EEE', zIndex: 999,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 4 },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
    })
  },
  suggestionItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', flexDirection: 'row', justifyContent: 'space-between' },
  suggestionText: { fontSize: 13, fontWeight: '600', color: '#333' },
  suggestionKcal: { fontSize: 11, color: '#888' },
  macroInputs: { flexDirection: 'row', gap: 8, zIndex: 1 },
  macroWrap: { flex: 1 },
  macroLabel: { fontSize: 10, fontWeight: '800', color: '#AAA', marginBottom: 4, textAlign: 'center' },
  macroInput: {
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 8,
    borderWidth: 1, borderColor: '#E8E8E8', alignItems: 'center'
  },
  macroReadonlyText: { fontSize: 13, fontWeight: '700', color: '#666' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: 12, borderWidth: 1.5,
    borderColor: COLORS.primary + '40', borderStyle: 'dashed',
  },
  addText: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
});

export default FormIngredients;