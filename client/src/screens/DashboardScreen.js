// src/screens/DashboardScreen.js
import React from 'react';
import { View, StyleSheet, ScrollView, Platform, useWindowDimensions } from 'react-native';

// Components Core
import ResponsiveContainer from '../components/ResponsiveContainer';
import MiniMealLog from '../components/MiniMealLog';

// Components Domain (Đã refactor)
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardEnergyCard from '../components/dashboard/DashboardEnergyCard';
import DashboardPantryAlert from '../components/dashboard/DashboardPantryAlert';
import DashboardStreakBanner from '../components/dashboard/DashboardStreakBanner'; 
import DashboardWeeklyChart from '../components/dashboard/DashboardWeeklyChart';

// Mock Data (Sau này thay bằng const { tracking, macros, alerts } = useAppStore())
import { 
  DASHBOARD_MOCK_TRACKING, DASHBOARD_MOCK_MACROS, 
  DASHBOARD_MOCK_MEAL_LOGS, DASHBOARD_MOCK_PANTRY_ALERTS,
  DASHBOARD_MOCK_STREAK, DASHBOARD_MOCK_WEEKLY_STATS 
} from '../utils/mockDashboardData';

const BREAKPOINT_MOBILE_MAX = 768;

const DashboardScreen = () => {
  const { width } = useWindowDimensions();
  const isWebLarge = Platform.OS === 'web' && width > BREAKPOINT_MOBILE_MAX;

  const remainingKcal = Math.max(0, DASHBOARD_MOCK_TRACKING.target_kcal - DASHBOARD_MOCK_TRACKING.consumed_kcal);
  const userName = "Quỳnh Nhi"; 

  return (
    <ResponsiveContainer useImageBg={false}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <DashboardHeader userName={userName} remainingKcal={remainingKcal} />

        {/* --- STREAK BANNER (Nằm ngoài Grid, Full width) --- */}
        <View style={styles.fullWidthContainer}>
          <DashboardStreakBanner 
            streakDays={DASHBOARD_MOCK_STREAK.days} 
            hasLoggedToday={DASHBOARD_MOCK_STREAK.hasLoggedToday} 
          />
        </View>

        {/* --- GRID MÀN HÌNH CHÍNH --- */}
        <View style={[styles.dashboardGrid, isWebLarge && styles.dashboardGridWeb]}>
          
          {/* CỘT TRÁI */}
          <View style={[styles.column, isWebLarge && { flex: 1.5 }]}>
            <DashboardEnergyCard tracking={DASHBOARD_MOCK_TRACKING} macros={DASHBOARD_MOCK_MACROS} />
            <MiniMealLog logs={DASHBOARD_MOCK_MEAL_LOGS} />
          </View>

          {/* CỘT PHẢI */}
          <View style={[styles.column, isWebLarge && { flex: 1 }]}>
            <DashboardWeeklyChart data={DASHBOARD_MOCK_WEEKLY_STATS} />
            <DashboardPantryAlert alerts={DASHBOARD_MOCK_PANTRY_ALERTS} />
          </View>

        </View>
      </ScrollView>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, paddingVertical: 32, paddingHorizontal: 16, alignItems: 'center', paddingBottom: 100 },
  fullWidthContainer: { width: '100%', maxWidth: 1000 },
  dashboardGrid: { width: '100%', maxWidth: 1000, flexDirection: 'column', gap: 16 },
  dashboardGridWeb: { flexDirection: 'row', alignItems: 'flex-start', gap: 24 },
  column: { width: '100%', gap: 16 },
});

export default DashboardScreen;