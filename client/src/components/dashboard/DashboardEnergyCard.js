// src/components/dashboard/DashboardEnergyCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from '../GlassCard';
import CalorieRing from '../CalorieRing';
import MacroBar from '../MacroBar';

const DashboardEnergyCard = ({ tracking, macros }) => {
  return (
    <GlassCard style={styles.cardWrapper} intensity={85}>
      <View style={styles.cardContent}>
        <Text style={styles.sectionTitle}>Chỉ số Năng lượng</Text>
        
        {/* Khối vòng tròn Calo (Net Consumed) */}
        <View style={styles.ringWrapper}>
          <CalorieRing 
            target={tracking.target_kcal} 
            consumed={tracking.consumed_kcal} 
            burned={tracking.burned_kcal}
            size={220} 
          />
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownText}>🥗 Đã nạp: {tracking.consumed_kcal} kcal</Text>
            <Text style={[styles.breakdownText, { color: '#E53935' }]}>🔥 Tiêu hao: {tracking.burned_kcal} kcal</Text>
          </View>
        </View>

        {/* Khối thanh tiến độ Macros */}
        <View style={styles.macrosWrapper}>
          <MacroBar 
            label="Protein" 
            current={macros.protein.current} 
            target={macros.protein.target} 
          />
          <MacroBar 
            label="Carbs" 
            current={macros.carbs.current} 
            target={macros.carbs.target} 
          />
          <MacroBar 
            label="Fat" 
            current={macros.fat.current} 
            target={macros.fat.target} 
          />
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
  },
  cardContent: {
    padding: 24,
    width: '100%',
    backgroundColor: 'transparent', 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#1A1D1E', 
    marginBottom: 16 
  },
  ringWrapper: { 
    alignItems: 'center', 
    paddingVertical: 12, 
    marginBottom: 16 
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  breakdownText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666'
  },
  macrosWrapper: { 
    width: '100%' 
  },
});

export default DashboardEnergyCard;