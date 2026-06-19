import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const WorkoutHistoryList = ({ date, historyItems = [] }) => {
  // Filter items by the selected date
  const selectedDateStr = date.toDateString();
  const filteredItems = historyItems.filter(item => {
    if (!item.completed_at) return false;
    return new Date(item.completed_at).toDateString() === selectedDateStr;
  });

  const totalCalories = filteredItems.reduce((acc, item) => acc + (item.calories || 0), 0);
  const totalMinutes = filteredItems.reduce((acc, item) => acc + (item.duration_minutes || 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <Ionicons name="time-outline" size={24} color="#2ECC71" />
          <Text style={styles.summaryValue}>{totalMinutes}</Text>
          <Text style={styles.summaryLabel}>Phút tập</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="fire" size={24} color="#FF6B6B" />
          <Text style={styles.summaryValue}>{totalCalories}</Text>
          <Text style={styles.summaryLabel}>Kcal đốt</Text>
        </View>
      </View>

      <Text style={styles.listTitle}>Danh sách bài tập ({filteredItems.length})</Text>

      {filteredItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="barbell-outline" size={48} color="#A0AEC0" />
          <Text style={styles.emptyText}>Hôm nay bạn chưa có bài tập nào hoàn thành.</Text>
        </View>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {filteredItems.map(item => {
            const timeStr = item.completed_at 
              ? new Date(item.completed_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
              : '--:--';

            return (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.planTitle} numberOfLines={1}>{item.plan_title}</Text>
                  <Text style={styles.timeText}>{timeStr}</Text>
                </View>
                
                <Text style={styles.dayText}>Ngày tập {item.day_number}</Text>

                <View style={styles.statsRow}>
                  <View style={styles.statChip}>
                    <Ionicons name="time-outline" size={14} color="#4A5568" />
                    <Text style={styles.statText}>{item.duration_minutes} phút</Text>
                  </View>
                  <View style={styles.statChip}>
                    <MaterialCommunityIcons name="fire" size={14} color="#FF6B6B" />
                    <Text style={[styles.statText, { color: '#FF6B6B', fontWeight: '600' }]}>
                      {item.calories} kcal
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    marginTop: 12,
    color: '#718096',
    fontSize: 15,
  },
  list: {
    flex: 1,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    flex: 1,
    marginRight: 10,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  dayText: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: '#4A5568',
    fontWeight: '500',
  }
});

export default WorkoutHistoryList;
