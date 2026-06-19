// src/components/dashboard/DashboardEnergyCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../GlassCard';
import CalorieRing from '../CalorieRing';
import MacroBar from '../MacroBar';

const DashboardEnergyCard = ({ tracking, macros, isMacroImbalanced }) => {
  const lowerBound = tracking.target_kcal * 0.85;
  const upperBound = tracking.target_kcal * 1.15;

  const isOver = tracking.consumed_kcal > upperBound;
  const isGoalMet = tracking.consumed_kcal >= lowerBound && tracking.consumed_kcal <= upperBound;
  const isProgressing = tracking.consumed_kcal > 0 && tracking.consumed_kcal < lowerBound;

  return (
    <GlassCard style={styles.cardWrapper} intensity={85}>
      <View style={styles.cardContent}>
        <View style={styles.badgeContainer}>
          <View style={[
            styles.badge,
            isGoalMet && !isMacroImbalanced ? styles.badgeSuccess :
              isGoalMet && isMacroImbalanced ? styles.badgeWarning :
                isOver ? styles.badgeDanger :
                  (isProgressing ? styles.badgeWarning : styles.badgeDefault)
          ]}>
            <Ionicons
              name={isGoalMet && !isMacroImbalanced ? "checkmark-circle" : (isGoalMet && isMacroImbalanced) ? "warning" : isOver ? "alert-circle" : (isProgressing ? "time" : "ellipse-outline")}
              size={14}
              color={isGoalMet && !isMacroImbalanced ? "#2E7D32" : (isGoalMet && isMacroImbalanced) ? "#E65100" : isOver ? "#C62828" : (isProgressing ? "#E65100" : "#888")}
            />
            <Text style={[
              styles.badgeText,
              isGoalMet && !isMacroImbalanced ? styles.textSuccess :
                isGoalMet && isMacroImbalanced ? styles.textWarning :
                  isOver ? styles.textDanger :
                    (isProgressing ? styles.textWarning : styles.textDefault)
            ]}>
              {isGoalMet && !isMacroImbalanced ? "Ngưỡng tối ưu" : 
               isGoalMet && isMacroImbalanced ? "Lệch Chất" : 
               isOver ? "Vượt ngưỡng" : 
               (isProgressing ? "Thiếu hụt Calo" : "Chưa có dữ liệu")}
            </Text>
          </View>
        </View>

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
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 16
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6
  },
  badgeSuccess: { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9', borderWidth: 1 },
  badgeWarning: { backgroundColor: '#FFF3E0', borderColor: '#FFE0B2', borderWidth: 1 },
  badgeDanger: { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2', borderWidth: 1 },
  badgeDefault: { backgroundColor: '#F5F5F5', borderColor: '#E0E0E0', borderWidth: 1 },
  badgeText: { fontSize: 14, fontWeight: '800' },
  textSuccess: { color: '#2E7D32' },
  textWarning: { color: '#E65100' },
  textDanger: { color: '#C62828' },
  textDefault: { color: '#888' },
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