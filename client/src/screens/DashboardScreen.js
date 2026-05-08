// src/screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { recipeApi } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

import ResponsiveContainer from '../components/ResponsiveContainer';
import MiniMealLog from '../components/MiniMealLog';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardEnergyCard from '../components/dashboard/DashboardEnergyCard';
import DashboardPantryAlert from '../components/dashboard/DashboardPantryAlert';
import DashboardStreakBanner from '../components/dashboard/DashboardStreakBanner'; 
import CheckInPopup from '../components/dashboard/CheckInPopup'; 

import { 
  DASHBOARD_MOCK_TRACKING, 
  DASHBOARD_MOCK_STREAK, 
  DASHBOARD_MOCK_WEIGHT_HISTORY,
  DASHBOARD_MOCK_MEAL_LOGS, 
  DASHBOARD_MOCK_PANTRY_ALERTS 
} from '../utils/mockDashboardData';

const BREAKPOINT_MOBILE_MAX = 768;

const DashboardScreen = () => {
  const { width } = useWindowDimensions();
  const isWebLarge = Platform.OS === 'web' && width > BREAKPOINT_MOBILE_MAX;
  
  // Hợp nhất khai báo Store (Không bị trùng lặp nữa)
  const { userProfile, weightHistory } = useAppStore();
  const [showCheckInPopup, setShowCheckInPopup] = useState(false);

  const [dailySummary, setDailySummary] = useState({
    totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    meals: []
  });

  const fetchSummary = async () => {
    try {
      const res = await recipeApi.getDailySummary();
      // Sửa ở đây: res.data là phản hồi từ fetchApi, data bên trong mới là dữ liệu thật từ Backend
      if (res.success && res.data.data) {
        setDailySummary(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy summary:", error);
    }
  };

  // Tự động load lại mỗi khi quay lại màn hình Dashboard
  useFocusEffect(
    React.useCallback(() => {
      fetchSummary();
    }, [])
  );

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

  // ==========================================
  // MERGE LOGIC TỪ NHÁNH MAIN: Lấy dữ liệu thật
  // ==========================================
  const userName = userProfile?.name || "Bạn";
  const targetKcal = userProfile?.targetCalories || userProfile?.tdee || 2000;
  
  // Tổng hợp dữ liệu tracking thật
  const realTracking = {
    ...DASHBOARD_MOCK_TRACKING,
    target_kcal: Math.round(targetKcal),
    consumed_kcal: Math.round(dailySummary.totals.calories),
    burned_kcal: 0
  };

  const realMacros = {
    protein: { 
      target: Math.round(userProfile?.protein_g || 150), 
      current: Math.round(dailySummary.totals.protein),
      color: '#E53935'
    },
    carbs: { 
      target: Math.round(userProfile?.carbs_g || 250), 
      current: Math.round(dailySummary.totals.carbs),
      color: '#29B6F6'
    },
    fat: { 
      target: Math.round(userProfile?.fat_g || 60), 
      current: Math.round(dailySummary.totals.fat),
      color: '#FBC02D'
    }
  };

  const remainingKcal = Math.max(0, realTracking.target_kcal - realTracking.consumed_kcal);

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
            {/* Truyền dữ liệu thật xuống Card */}
            <DashboardEnergyCard tracking={realTracking} macros={realMacros} />
            <MiniMealLog logs={dailySummary.meals.length > 0 ? dailySummary.meals : DASHBOARD_MOCK_MEAL_LOGS} />
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