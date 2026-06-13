// src/components/Dashboard/DashboardStreakBanner.js
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../GlassCard';

// =====================================================================
// DATA SOURCE (MÔ PHỎNG DATABASE Backend)
// =====================================================================
const MOCK_LOGGED_DATES = [
  '2026-04-20', '2026-04-22', 
  '2026-04-28', '2026-04-29', '2026-04-30', '2026-05-01', '2026-05-02', '2026-05-03' 
];

// Helpers
const formatDateToYMD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

const getFirstDayOfMonth = (year, month) => {
  let day = new Date(year, month, 1).getDay(); 
  return day === 0 ? 6 : day - 1; 
};

const DashboardStreakBanner = ({ streakDays = 0, hasLoggedToday = false }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [viewingMonth, setViewingMonth] = useState(new Date()); 

  // Ưu tiên dùng streakDays từ Props truyền vào
  const currentStreak = streakDays;

  const calendarGrid = useMemo(() => {
    const year = viewingMonth.getFullYear();
    const month = viewingMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOffset = getFirstDayOfMonth(year, month);

    const grid = [];
    for (let i = 0; i < firstDayOffset; i++) {
      grid.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      grid.push(i);
    }
    return grid;
  }, [viewingMonth]);

  const viewYear = viewingMonth.getFullYear();
  const viewMonthStr = String(viewingMonth.getMonth() + 1).padStart(2, '0');

  const handlePrevMonth = () => setViewingMonth(new Date(viewingMonth.getFullYear(), viewingMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setViewingMonth(new Date(viewingMonth.getFullYear(), viewingMonth.getMonth() + 1, 1));

  return (
    <>
      <Pressable onPress={() => setModalVisible(true)} style={styles.bannerContainer}>
        {({ pressed }) => (
          <GlassCard style={[
            styles.bannerWrapper, 
            pressed && { opacity: 0.8 }
          ]} intensity={70}>
            <View style={styles.bannerContent}>
              <View style={styles.streakInfo}>
                <View style={styles.iconBox}>
                  <Ionicons name="flame" size={28} color="#FF9800" />
                </View>
                <View>
                  <Text style={styles.streakTitle}>{currentStreak} ngày liên tiếp!</Text>
                  <Text style={styles.streakSub}>Nhấn để xem chi tiết lịch sử 🎯</Text>
                </View>
              </View>
            </View>
          </GlassCard>
        )}
      </Pressable>

      <Modal 
        visible={modalVisible} 
        transparent={true} 
        animationType="fade"
        onRequestClose={() => setModalVisible(false)} 
      >
        {/* THAY THẾ SafeAreaView bằng View thường để tránh lỗi Layout trên Mobile */}
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentWrapper}>
            
            {/* ĐIỂM CỐT LÕI: Dùng View bình thường thay cho GlassCard */}
            <View style={styles.modalCard}>
              
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chi tiết lịch sử</Text>
                <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color="#333" />
                </Pressable>
              </View>

              <View style={styles.monthNav}>
                <Pressable onPress={handlePrevMonth} style={styles.navBtn}>
                  <Ionicons name="chevron-back" size={20} color="#555" />
                </Pressable>
                <Text style={styles.monthText}>
                  Tháng {viewingMonth.getMonth() + 1} / {viewingMonth.getFullYear()}
                </Text>
                <Pressable onPress={handleNextMonth} style={styles.navBtn}>
                  <Ionicons name="chevron-forward" size={20} color="#555" />
                </Pressable>
              </View>

              <View style={styles.calendarContainer}>
                <View style={styles.weekDaysHeader}>
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                    <Text key={d} style={styles.weekDayText}>{d}</Text>
                  ))}
                </View>

                <View style={styles.daysGrid}>
                  {calendarGrid.map((day, index) => {
                    if (!day) return <View key={`empty-${index}`} style={styles.dayCellEmpty} />;

                    const dateStr = `${viewYear}-${viewMonthStr}-${String(day).padStart(2, '0')}`;
                    const isLogged = MOCK_LOGGED_DATES.includes(dateStr);
                    const isToday = dateStr === formatDateToYMD(new Date());

                    return (
                      <View key={day} style={styles.dayCellWrapper}>
                        <View style={[
                          styles.dayCell, 
                          isLogged && styles.dayCellLogged,
                          isToday && !isLogged && styles.dayCellToday
                        ]}>
                          <Text style={[
                            styles.dayText, 
                            isLogged && styles.dayTextLogged,
                            isToday && !isLogged && styles.dayTextToday
                          ]}>
                            {day}
                          </Text>
                          {isLogged && (
                            <Ionicons name="checkmark-circle" size={14} color="#FFF" style={styles.tickIcon} />
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

            </View>
            {/* KẾT THÚC MODAL CARD */}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Banner Styles
  bannerContainer: { width: '100%', marginBottom: 16 },
  bannerWrapper: { width: '100%', borderColor: 'rgba(255, 152, 0, 0.3)' },
  bannerContent: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakInfo: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255, 152, 0, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  streakTitle: { fontSize: 18, fontWeight: '800', color: '#1A1D1E' },
  streakSub: { fontSize: 13, color: '#666', marginTop: 4 },

  // Modal Overlay & Layout
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContentWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  
  // UI CARD BÌNH THƯỜNG (KHÔNG DÙNG GLASS TRONG MODAL)
  modalCard: { 
    width: '100%', 
    maxWidth: 420, 
    padding: 24, 
    backgroundColor: '#FFFFFF', // Nền solid trắng
    borderRadius: 24,
    ...Platform.select({
      android: { elevation: 10 },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12 }
    })
  },
  
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111' },
  closeBtn: { padding: 4 },
  
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: '#F5F5F5', borderRadius: 12, padding: 8 },
  navBtn: { padding: 8, backgroundColor: '#FFF', borderRadius: 8 },
  monthText: { fontSize: 16, fontWeight: '700', color: '#333' },

  calendarContainer: { width: '100%' },
  weekDaysHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  weekDayText: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#888' },
  
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  
  dayCellWrapper: { width: '14.28%', height: 48, padding: 4 }, 
  dayCellEmpty: { width: '14.28%', height: 48 },
  
  dayCell: { flex: 1, borderRadius: 12, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  dayCellLogged: { backgroundColor: '#FF9800' },
  dayCellToday: { borderWidth: 1.5, borderColor: '#FF9800' },
  
  dayText: { fontSize: 15, fontWeight: '600', color: '#333' },
  dayTextLogged: { color: '#FFF' },
  dayTextToday: { color: '#FF9800' },
  
  tickIcon: { position: 'absolute', bottom: -2, right: -2 }
});

export default DashboardStreakBanner;