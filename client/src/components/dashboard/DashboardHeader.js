// src/components/dashboard/DashboardHeader.js
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';

const DashboardHeader = ({ userName = "Quỳnh Nhi", remainingKcal = 550 }) => {
  const setDrawerOpen = useAppStore((state) => state.setDrawerOpen);
  
  const { width } = useWindowDimensions();
  // Điểm ngắt (Breakpoint) khớp với cấu hình trong RootNavigator
  const isWebLarge = Platform.OS === 'web' && width > 768; 

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
});

export default DashboardHeader;