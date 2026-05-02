// src/components/onboarding/SelectionChip.js
import React from 'react';
import { Text, StyleSheet, Pressable, Platform } from 'react-native';
import { COLORS } from '../../constants/theme';

const SelectionChip = ({ label, isSelected, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        isSelected && styles.chipSelected,
        Platform.OS === 'web' && { cursor: 'pointer' },
        pressed && { opacity: 0.8 }
      ]}
    >
      <Text style={[styles.label, isSelected && styles.labelSelected]}>
        {label} {isSelected && '✓'}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    marginBottom: 12,
  },
  chipSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: COLORS?.primary || '#4CAF50',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  labelSelected: {
    color: COLORS?.primary || '#4CAF50',
  },
});

export default SelectionChip;