import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const VI_MONTHS = [
  'Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'
];

const CalendarModal = ({ visible, selectedDate, onSelect, onClose }) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay(); // 0 = CN
    
    const days = [];
    // Padding đầu tháng
    for (let i = 0; i < startPadding; i++) days.push(null);
    // Các ngày trong tháng
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    
    return days;
  }, [viewDate]);

  const isSameDay = (d1, d2) => d1?.toDateString() === d2?.toDateString();
  const today = new Date();

  const changeMonth = (delta) => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + delta);
    setViewDate(d);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => changeMonth(-1)} style={styles.arrow}>
              <Ionicons name="chevron-back" size={24} color="#1A1D1E" />
            </Pressable>
            <Text style={styles.monthYear}>
              {VI_MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </Text>
            <Pressable onPress={() => changeMonth(1)} style={styles.arrow}>
              <Ionicons name="chevron-forward" size={24} color="#1A1D1E" />
            </Pressable>
          </View>

          {/* Weekday labels */}
          <View style={styles.weekRow}>
            {['CN','T2','T3','T4','T5','T6','T7'].map(d => (
              <Text key={d} style={styles.weekLabel}>{d}</Text>
            ))}
          </View>

          {/* Days grid */}
          <View style={styles.daysGrid}>
            {calendarDays.map((date, idx) => (
              <Pressable
                key={idx}
                style={styles.dayCell}
                onPress={() => date && onSelect(date)}
                disabled={!date}
              >
                {date && (
                  <View style={[
                    styles.dayInner,
                    isSameDay(date, selectedDate) && styles.dayInnerSelected,
                    isSameDay(date, today) && !isSameDay(date, selectedDate) && styles.dayInnerToday
                  ]}>
                    <Text style={[
                      styles.dayText,
                      isSameDay(date, selectedDate) && styles.dayTextSelected,
                      isSameDay(date, today) && !isSameDay(date, selectedDate) && styles.dayTextToday
                    ]}>
                      {date.getDate()}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Đóng</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  box: { 
    width: '100%', 
    maxWidth: 360, 
    backgroundColor: '#FFF', 
    borderRadius: 28, 
    padding: 20,
    ...Platform.select({ web: { boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }, default: { elevation: 10 } })
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  arrow: { padding: 4 },
  monthYear: { fontSize: 18, fontWeight: '900', color: '#1A1D1E' },
  weekRow: { flexDirection: 'row', marginBottom: 8 },
  weekLabel: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '800', color: '#AAA' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100/7}%`, aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  dayInner: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  dayInnerSelected: { backgroundColor: '#1A1D1E', transform: [{ scale: 1.1 }] },
  dayInnerToday: { borderWidth: 2, borderColor: '#4CAF50', borderStyle: 'dashed' },
  dayText: { fontSize: 15, fontWeight: '700', color: '#555' },
  dayTextSelected: { color: '#FFF', fontWeight: '900' },
  dayTextToday: { color: '#4CAF50' },
  closeBtn: { 
    marginTop: 16, 
    backgroundColor: '#F5F5F5', 
    paddingVertical: 12, 
    borderRadius: 14, 
    alignItems: 'center' 
  },
  closeText: { fontSize: 15, fontWeight: '800', color: '#666' },
});

export default CalendarModal;