// src/screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { useAppStore } from '../store/useAppStore';

import ResponsiveContainer from '../components/ResponsiveContainer';
import MiniMealLog from '../components/MiniMealLog';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardEnergyCard from '../components/dashboard/DashboardEnergyCard';
import DashboardPantryAlert from '../components/dashboard/DashboardPantryAlert';
import DashboardStreakBanner from '../components/dashboard/DashboardStreakBanner'; 
import CheckInPopup from '../components/dashboard/CheckInPopup'; 

import { 
  DASHBOARD_MOCK_TRACKING, 
  DASHBOARD_MOCK_MACROS, 
  DASHBOARD_MOCK_STREAK, 
  DASHBOARD_MOCK_WEIGHT_HISTORY,
  DASHBOARD_MOCK_MEAL_LOGS, 
  DASHBOARD_MOCK_PANTRY_ALERTS 
} from '../utils/mockDashboardData';

const BREAKPOINT_MOBILE_MAX = 768;

const DashboardScreen = () => {
  const { width } = useWindowDimensions();
  const isWebLarge = Platform.OS === 'web' && width > BREAKPOINT_MOBILE_MAX;
  
  const { userProfile, weightHistory } = useAppStore();
  const [showCheckInPopup, setShowCheckInPopup] = useState(false);

  useEffect(() => {
    if (DASHBOARD_MOCK_WEIGHT_HISTORY && DASHBOARD_MOCK_WEIGHT_HISTORY.length > 0) {
      const lastCheckIn = new Date(DASHBOARD_MOCK_WEIGHT_HISTORY[0].date);
      const today = new Date();
      
      const diffTime = Math.abs(today - lastCheckIn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays >= 7) {
        setShowCheckInPopup(true);
      }
    }
  }, []);

  const remainingKcal = Math.max(0, DASHBOARD_MOCK_TRACKING.target_kcal - DASHBOARD_MOCK_TRACKING.consumed_kcal);
  const userName = userProfile?.name || "Quỳnh Nhi"; 

  return (
    <ResponsiveContainer useImageBg={false}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <DashboardHeader userName={userName} remainingKcal={remainingKcal} />

        <View style={styles.fullWidthContainer}>
          <DashboardStreakBanner 
            streakDays={DASHBOARD_MOCK_STREAK.days} 
            hasLoggedToday={DASHBOARD_MOCK_STREAK.hasLoggedToday} 
          />
        </View>

        <View style={[styles.dashboardGrid, isWebLarge && styles.dashboardGridWeb]}>
          <View style={[styles.column, isWebLarge && { flex: 1.5 }]}>
            <DashboardEnergyCard tracking={DASHBOARD_MOCK_TRACKING} macros={DASHBOARD_MOCK_MACROS} />
            <MiniMealLog logs={DASHBOARD_MOCK_MEAL_LOGS} />
          </View>

          <View style={[styles.column, isWebLarge && { flex: 1 }]}>
            <DashboardPantryAlert alerts={DASHBOARD_MOCK_PANTRY_ALERTS} />
          </View>
        </View>

      </ScrollView>

      <CheckInPopup 
        visible={showCheckInPopup} 
        onClose={() => setShowCheckInPopup(false)} 
      />
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: { 
    flexGrow: 1, 
    paddingVertical: 32, 
    paddingHorizontal: 16, 
    alignItems: 'center',
    paddingBottom: 100 
  },
  fullWidthContainer: { 
    width: '100%', 
    maxWidth: 1000 
  },
  dashboardGrid: { 
    width: '100%', 
    maxWidth: 1000, 
    flexDirection: 'column', 
    gap: 16 
  },
  dashboardGridWeb: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: 24 
  },
  column: { 
    width: '100%', 
    gap: 16 
  },
});

export default DashboardScreen;