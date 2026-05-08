import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DailyHeader = ({ date, onOpenCalendar }) => {
  const formatted = date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
  });

  const isToday = new Date().toDateString() === date.toDateString();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>🐱</Text>
      </View>
      
      <View style={styles.center}>
        <Text style={styles.dateText}>{formatted}</Text>
        {isToday && <Text style={styles.badge}>HÔM NAY</Text>}
      </View>

      <Pressable style={styles.calendarBtn} onPress={onOpenCalendar}>
        <Ionicons name="calendar-outline" size={26} color="#1A1D1E" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarText: { fontSize: 24 },
  center: { alignItems: 'center', flex: 1 },
  dateText: { fontSize: 20, fontWeight: '800', color: '#1A1D1E', letterSpacing: -0.5 },
  badge: { fontSize: 10, fontWeight: '900', color: '#4CAF50', marginTop: 2, letterSpacing: 1 },
  calendarBtn: { padding: 8, borderRadius: 12 },
});

export default DailyHeader;