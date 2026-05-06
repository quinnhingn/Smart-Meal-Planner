// src/components/profile/MacroProgressBars.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

const MacroProgressBars = ({ protein, carbs, fat }) => {
  const total = (protein + carbs + fat) || 1; // Tránh chia cho 0
  const pPercent = `${(protein / total) * 100}%`;
  const cPercent = `${(carbs / total) * 100}%`;
  const fPercent = `${(fat / total) * 100}%`;

  const renderBar = (label, value, percent, color) => (
    <View style={styles.macroRow}>
      <View style={styles.labelGroup}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>{value}g</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: percent, backgroundColor: color }]} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderBar('Protein', protein, pPercent, COLORS?.macros?.protein || '#E53935')}
      {renderBar('Carbs', carbs, cPercent, COLORS?.macros?.carbs || '#29B6F6')}
      {renderBar('Fat', fat, fPercent, COLORS?.macros?.fat || '#FBC02D')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', marginTop: 8 },
  macroRow: { marginBottom: 12 },
  labelGroup: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  macroLabel: { fontSize: 14, fontWeight: '700', color: '#555' },
  macroValue: { fontSize: 14, fontWeight: '800', color: '#111' },
  progressBarBg: { height: 10, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 }
});

export default MacroProgressBars;