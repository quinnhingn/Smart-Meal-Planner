// src/components/MacroBar.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getMacroColor, COLORS } from '../constants/theme';

const MacroBar = ({ label, current, target, color, unit = 'g' }) => {
  const percentage = Math.round((current / target) * 100) || 0;
  const safePercentage = Math.min(percentage, 100);
  
  // Use V2 threshold color if not explicitly overridden by an external color prop
  const barColor = color && !Object.values(COLORS.macroThreshold).includes(color) 
    ? color 
    : getMacroColor(percentage);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          <View style={[styles.badge, { backgroundColor: barColor + '15' }]}>
            <Text style={[styles.badgeText, { color: barColor }]}>{percentage}%</Text>
          </View>
        </View>

        <Text style={styles.values}>
          <Text style={{ color: '#333', fontWeight: '700' }}>{current}</Text>
          <Text> / </Text>
          <Text>{target}{unit}</Text>
        </Text>

      </View>

      <View style={styles.barBg}>
        <View 
          style={[
            styles.barFill, 
            { width: `${safePercentage}%`, backgroundColor: barColor }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 14, fontWeight: '700', color: '#555' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  values: { fontSize: 13, color: '#888' },
  barBg: { height: 8, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 }
});

export default MacroBar;