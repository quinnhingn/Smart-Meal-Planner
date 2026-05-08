import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

const VI_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const WeekSelector = ({ selectedDate, onSelectDate }) => {
  const weekDays = useMemo(() => {
    const curr = new Date(selectedDate);
    const day = curr.getDay(); // 0 = CN
    const diff = curr.getDate() - day + (day === 0 ? -6 : 0); // Lấy thứ 2 đầu tuần
    const monday = new Date(curr.setDate(diff));
    
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  const today = new Date().toDateString();

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={styles.scroll}
    >
      {weekDays.map((date) => {
        const isSelected = date.toDateString() === selectedDate.toDateString();
        const isToday = date.toDateString() === today;
        const dayIndex = date.getDay();
        
        return (
          <Pressable
            key={date.toISOString()}
            style={[styles.dayBox, isSelected && styles.dayBoxActive]}
            onPress={() => onSelectDate(date)}
          >
            <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>
              {VI_DAYS[dayIndex]}
            </Text>
            <View style={[styles.numberCircle, isSelected && styles.numberCircleActive, isToday && !isSelected && styles.numberCircleToday]}>
              <Text style={[
                styles.numberText, 
                isSelected && styles.numberTextActive,
                isToday && !isSelected && styles.numberTextToday
              ]}>
                {date.getDate()}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 12, gap: 6 },
  dayBox: { 
    alignItems: 'center', 
    paddingVertical: 8, 
    paddingHorizontal: 10, 
    borderRadius: 20,
    minWidth: 52,
  },
  dayBoxActive: { backgroundColor: '#FFF' },
  dayLabel: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 6 },
  dayLabelActive: { color: '#1A1D1E' },
  numberCircle: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  numberCircleActive: { 
    backgroundColor: '#1A1D1E',
    transform: [{ scale: 1.1 }],
  },
  numberCircleToday: { borderWidth: 2, borderColor: '#4CAF50', borderStyle: 'dashed' },
  numberText: { fontSize: 16, fontWeight: '800', color: '#555' },
  numberTextActive: { color: '#FFF' },
  numberTextToday: { color: '#4CAF50' },
});

export default WeekSelector;