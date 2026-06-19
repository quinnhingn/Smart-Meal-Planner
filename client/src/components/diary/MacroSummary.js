import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MacroSummary = ({ stats, targetCalo }) => {
  const lowerBound = targetCalo * 0.85; // Dung sai 15%
  const upperBound = targetCalo * 1.15;

  const isEmpty = stats.calo === 0;
  const isOver = stats.calo > upperBound;
  const isGoalMet = stats.calo >= lowerBound && stats.calo <= upperBound;
  const isProgressing = stats.calo > 0 && stats.calo < lowerBound;

  const percent = Math.min(100, Math.round((stats.calo / targetCalo) * 100));

  return (
    <View style={styles.neoCardWrapper}>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.label}>Tổng năng lượng</Text>
            <View style={styles.caloRow}>
              <Text style={styles.bigCalo}>{stats.calo.toFixed(1)}</Text>
              <Text style={styles.unit}> kcal</Text>
            </View>
          </View>
          <View style={[
            styles.badge,
            isGoalMet ? styles.badgeSuccess :
              isOver ? styles.badgeDanger :
                (isProgressing ? styles.badgeWarning : styles.badgeDefault)
          ]}>
            <Ionicons
              name={isGoalMet ? "checkmark-circle" : isOver ? "alert-circle" : (isProgressing ? "time" : "ellipse-outline")}
              size={14}
              color={isGoalMet ? "#2E7D32" : isOver ? "#C62828" : (isProgressing ? "#E65100" : "#888")}
            />
            <Text style={[
              styles.badgeText,
              isGoalMet ? styles.textSuccess :
                isOver ? styles.textDanger :
                  (isProgressing ? styles.textWarning : styles.textDefault)
            ]}>
              {isGoalMet ? "Ngưỡng tối ưu" : isOver ? "Vượt ngưỡng" : (isProgressing ? "Thiếu hụt Calo" : "Chưa có dữ liệu")}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[
            styles.progressFill,
            { width: `${percent}%` },
            isGoalMet ? styles.progressFillGoal :
              isOver ? styles.progressFillOver : null
          ]} />
        </View>
        <Text style={styles.targetText}>Mục tiêu: {targetCalo.toLocaleString()} kcal</Text>

        {/* Macro pills */}
        <View style={styles.pillsRow}>
          <MacroPill icon="nutrition" label="Protein" value={stats.protein} color="#E53935" />
          <MacroPill icon="cube" label="Carbs" value={stats.carbs} color="#29B6F6" />
          <MacroPill icon="water" label="Fat" value={stats.fat} color="#FBC02D" />
        </View>
      </View>
    </View>
  );
};

const MacroPill = ({ icon, label, value, color }) => (
  <View style={styles.pill}>
    <View style={[styles.pillIcon, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={16} color={color} />
    </View>
    <View>
      <Text style={styles.pillValue}>{value.toFixed(1)}g</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  neoCardWrapper: {
    position: 'relative',
    width: '100%',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '700', color: '#888', marginBottom: 4 },
  caloRow: { flexDirection: 'row', alignItems: 'baseline' },
  bigCalo: { fontSize: 36, fontWeight: '900', color: '#1A1D1E', letterSpacing: -1 },
  unit: { fontSize: 16, fontWeight: '700', color: '#888' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4
  },
  badgeSuccess: { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' },
  badgeWarning: { backgroundColor: '#FFF3E0', borderColor: '#FFE0B2' },
  badgeDanger: { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' },
  badgeDefault: { backgroundColor: '#F5F5F5', borderColor: '#E0E0E0' },
  badgeText: { fontSize: 13, fontWeight: '800' },
  textSuccess: { color: '#2E7D32' },
  textWarning: { color: '#E65100' },
  textDanger: { color: '#C62828' },
  textDefault: { color: '#888' },
  progressTrack: { height: 10, backgroundColor: '#F0F0F0', borderRadius: 8, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 8 },
  progressFillGoal: { backgroundColor: '#4CAF50' },
  progressFillOver: { backgroundColor: '#F44336' },
  targetText: { fontSize: 12, color: '#AAA', fontWeight: '600', marginBottom: 16 },
  pillsRow: { flexDirection: 'row', gap: 10 },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 16
  },
  pillIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  pillValue: { fontSize: 15, fontWeight: '900', color: '#1A1D1E' },
  pillLabel: { fontSize: 11, color: '#888', fontWeight: '600', marginTop: 2 },
});

export default MacroSummary;