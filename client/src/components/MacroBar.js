// src/components/MacroBar.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MacroBar = ({ label, current, target, color, unit = 'g' }) => {
  const percentage = Math.min((current / target) * 100, 100) || 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>

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
            { width: `${percentage}%`, backgroundColor: color }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 14, fontWeight: '700', color: '#555' },
  values: { fontSize: 13, color: '#888' },
  barBg: { height: 8, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 }
});

export default MacroBar;