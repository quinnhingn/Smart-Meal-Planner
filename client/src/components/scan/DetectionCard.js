// src/components/scan/DetectionCard.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GramInput from './GramInput';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';

const DetectionCard = ({ item, onUpdate, onDelete }) => {
  // `item.candidates` contains top 3 mock items
  const candidates = item.candidates || [];
  
  // Default to first candidate if available
  const [selectedCandidateId, setSelectedCandidateId] = useState(
    candidates.length > 0 ? candidates[0].id : null
  );
  
  const [gram, setGram] = useState(item.gram_input);
  const { setSearchModalVisible } = useAppStore();

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId) || item;

  // Tính toán Macro dựa trên số gram của candidate đang chọn
  const baseCalo = Number(selectedCandidate.base_calo) || 0;
  const basePro = Number(selectedCandidate.base_protein) || 0;
  const baseCarb = Number(selectedCandidate.base_carbs) || 0;
  const baseFat = Number(selectedCandidate.base_fat) || 0;
  const safeGram = Number(gram) || 0;

  const currentCalo = Math.round((baseCalo * safeGram) / 100);
  const currentProtein = Math.round((basePro * safeGram) / 100);
  const currentCarbs = Math.round((baseCarb * safeGram) / 100);
  const currentFat = Math.round((baseFat * safeGram) / 100);

  const handleUpdateItemData = (newGram, newCandidate) => {
    onUpdate({
      ...item,
      name: newCandidate.name,
      base_calo: newCandidate.base_calo,
      base_protein: newCandidate.base_protein,
      base_carbs: newCandidate.base_carbs,
      base_fat: newCandidate.base_fat,
      gram_input: newGram
    });
  };

  const handleGramChange = (val) => {
    // Allow empty string so user can clear the input
    if (val === '') {
      setGram('');
      handleUpdateItemData(0, selectedCandidate);
      return;
    }
    const newGram = Number(val);
    if (!isNaN(newGram)) {
      setGram(newGram);
      handleUpdateItemData(newGram, selectedCandidate);
    }
  };

  const handleMinus = () => {
    const safeGram = Number(gram) || 0;
    const newGram = Math.max(0, safeGram - 10);
    setGram(newGram);
    handleUpdateItemData(newGram, selectedCandidate);
  };

  const handlePlus = () => {
    const safeGram = Number(gram) || 0;
    const newGram = safeGram + 10;
    setGram(newGram);
    handleUpdateItemData(newGram, selectedCandidate);
  };

  const selectCandidate = (cand) => {
    setSelectedCandidateId(cand.id);
    const safeGram = Number(gram) || 0;
    handleUpdateItemData(safeGram, cand);
  };

  const openSearchFallback = () => {
    setSearchModalVisible(true, (manualItem) => {
      // Khi chọn xong từ modal, manualItem là đối tượng đã có gram_input, name, base_*
      setGram(manualItem.gram_input);
      
      // Ta cần gán thủ công item này như là một "candidate" đặc biệt
      const newCandidate = {
        id: `manual-${Date.now()}`,
        name: manualItem.name,
        confidence: 1.0,
        base_calo: manualItem.base_calo,
        base_protein: manualItem.base_protein,
        base_carbs: manualItem.base_carbs,
        base_fat: manualItem.base_fat
      };

      setSelectedCandidateId(newCandidate.id);
      
      // Update item to store the new candidate permanently in this card
      onUpdate({
        ...item,
        image_url: manualItem.image_url || item.image_url,
        candidates: [newCandidate], // Thay thế candidates hiện tại bằng món thủ công
        name: newCandidate.name,
        base_calo: newCandidate.base_calo,
        base_protein: newCandidate.base_protein,
        base_carbs: newCandidate.base_carbs,
        base_fat: newCandidate.base_fat,
        gram_input: manualItem.gram_input
      });
    });
  };

  const isLowConfidence = selectedCandidate.confidence < 0.8;

  return (
    <View style={styles.card}>
      {isLowConfidence && (
        <View style={styles.warningBadge}>
          <Ionicons name="warning-outline" size={12} color="#FFF" />
          <Text style={styles.warningText}>Độ chính xác thấp</Text>
        </View>
      )}

      {/* Image & Main Info */}
      <View style={styles.headerRow}>
        <Image source={{ uri: item.image_url }} style={styles.thumb} />
        <View style={styles.infoCol}>
          <Text style={styles.name} numberOfLines={1}>{selectedCandidate.name}</Text>
          <Text style={styles.confidence}>
            Độ tin cậy: <Text style={{ color: isLowConfidence ? '#F57C00' : '#4CAF50' }}>{Math.round(selectedCandidate.confidence * 100)}%</Text>
          </Text>
        </View>
        <Pressable onPress={onDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color="#F44336" />
        </Pressable>
      </View>

      {/* Candidates Radio List */}
      {candidates.length > 1 && (
        <View style={styles.candidatesBox}>
          <Text style={styles.candidatesTitle}>Gợi ý món ăn tương tự:</Text>
          {candidates.map((cand) => {
            const isSelected = cand.id === selectedCandidateId;
            return (
              <Pressable 
                key={cand.id} 
                style={[styles.radioItem, isSelected && styles.radioItemActive]}
                onPress={() => selectCandidate(cand)}
              >
                <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.radioText, isSelected && styles.radioTextActive]}>
                  {cand.name} <Text style={styles.radioConf}>({Math.round(cand.confidence * 100)}%)</Text>
                </Text>
              </Pressable>
            )
          })}
        </View>
      )}

      {/* Fallback Search Button */}
      <Pressable style={styles.searchFallbackBtn} onPress={openSearchFallback}>
        <Ionicons name="search" size={16} color={COLORS.primary} />
        <Text style={styles.searchFallbackText}>Tìm món khác</Text>
      </Pressable>

      {/* Macros */}
      <View style={styles.macroRow}>
        <View style={styles.macroPill}>
          <Text style={styles.macroLabel}>Calo</Text>
          <Text style={[styles.macroValue, { color: '#E53935' }]}>{currentCalo}</Text>
        </View>
        <View style={styles.macroPill}>
          <Text style={styles.macroLabel}>Pro</Text>
          <Text style={[styles.macroValue, { color: '#4CAF50' }]}>{currentProtein}g</Text>
        </View>
        <View style={styles.macroPill}>
          <Text style={styles.macroLabel}>Carb</Text>
          <Text style={[styles.macroValue, { color: '#2196F3' }]}>{currentCarbs}g</Text>
        </View>
        <View style={styles.macroPill}>
          <Text style={styles.macroLabel}>Fat</Text>
          <Text style={[styles.macroValue, { color: '#FFB300' }]}>{currentFat}g</Text>
        </View>
      </View>

      {/* Gram Input */}
      <View style={styles.footerRow}>
        <Text style={styles.gramLabel}>Khối lượng ước tính:</Text>
        <GramInput 
          value={gram}
          onChange={handleGramChange}
          onMinus={handleMinus}
          onPlus={handlePlus}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...SHADOWS.light,
    position: 'relative'
  },
  warningBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#F57C00',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 10
  },
  warningText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  infoCol: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: '#FFEbee',
    borderRadius: 12,
  },
  confidence: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  candidatesBox: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  candidatesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioItemActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginLeft: -8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCC',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioOuterActive: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  radioText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  radioTextActive: {
    color: '#111',
    fontWeight: '800'
  },
  radioConf: {
    fontSize: 12,
    fontWeight: '400',
    color: '#999'
  },
  searchFallbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    borderRadius: 12,
    marginBottom: 16,
    gap: 6
  },
  searchFallbackText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  macroPill: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    marginBottom: 2,
    textTransform: 'uppercase'
  },
  macroValue: {
    fontSize: 15,
    fontWeight: '900',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gramLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555'
  }
});

export default DetectionCard;
