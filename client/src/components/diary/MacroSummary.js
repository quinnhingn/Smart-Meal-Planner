import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MacroSummary = ({ stats, targetCalo }) => {
  const isGoalMet = stats.calo >= targetCalo;
  const isProgressing = stats.calo > 0 && stats.calo < targetCalo;
  const percent = Math.min(100, Math.round((stats.calo / targetCalo) * 100));

  return (
    <View style={styles.neoCardWrapper}>
      <View style={styles.neoCardShadow} />
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
            isGoalMet ? styles.badgeSuccess : (isProgressing ? styles.badgeWarning : styles.badgeDefault)
          ]}>
            <Ionicons
              name={isGoalMet ? "checkmark-circle" : (isProgressing ? "time" : "ellipse-outline")}
              size={14}
              color={isGoalMet ? "#2E7D32" : (isProgressing ? "#E65100" : "#888")}
            />
            <Text style={[
              styles.badgeText,
              isGoalMet ? styles.textSuccess : (isProgressing ? styles.textWarning : styles.textDefault)
            ]}>
              {isGoalMet ? "Đạt mục tiêu" : (isProgressing ? "Chưa đủ" : "Chưa có dữ liệu")}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[
            styles.progressFill,
            { width: `${percent}%` },
            !isGoalMet && styles.progressFillOver
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
  neoCardShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    backgroundColor: '#1A1D1E',
    borderRadius: 24,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: '#1A1D1E',
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
  badgeSuccess: { backgroundColor: '#E8F5E9' },
  badgeWarning: { backgroundColor: '#FFF3E0' },
  badgeDefault: { backgroundColor: '#F5F5F5' },
  badgeText: { fontSize: 12, fontWeight: '800' },
  textSuccess: { color: '#2E7D32' },
  textWarning: { color: '#E65100' },
  textDefault: { color: '#888' },
  progressTrack: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 6,
    overflow: 'hidden'
  },
  progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 4 },
  progressFillOver: { backgroundColor: '#FF6B6B' },
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