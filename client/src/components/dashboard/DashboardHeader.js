// src/components/dashboard/DashboardHeader.js
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';

const DashboardHeader = ({ userName = "Quỳnh Nhi", remainingKcal = 550, streakDays = 0 }) => {
  const setDrawerOpen = useAppStore((state) => state.setDrawerOpen);
  
  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Chào buổi sáng';
    if (hour >= 12 && hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  }, []);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View style={styles.titleWrapper}>
          <Text style={styles.greeting}>{greetingText},</Text>
          <Text style={styles.userName}>{userName} 👋</Text>
        </View>
        
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={18} color="#FF9800" />
          <Text style={styles.streakText}>{streakDays}</Text>
        </View>
      </View>

      <Text style={styles.motivationText}>
        Bạn còn <Text style={styles.highlightKcal}>{remainingKcal} kcal</Text> cho mục tiêu hôm nay.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    maxWidth: 1000,
    marginBottom: 28,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  titleWrapper: {
    justifyContent: 'center',
  },
  greeting: { 
    fontSize: 18, 
    color: '#666', 
    fontWeight: '600' 
  },
  userName: { 
    fontSize: 32, 
    fontWeight: '900', 
    color: '#1A1D1E', 
    marginTop: 2 
  },
  motivationText: { 
    fontSize: 15, 
    color: '#555', 
  },
  highlightKcal: { 
    fontWeight: '700', 
    color: '#4CAF50' 
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  streakText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E65100',
  }
});

export default DashboardHeader;