// src/screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, useWindowDimensions, Modal, Text, Pressable, TextInput } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { recipeApi } from '../services/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import ResponsiveContainer from '../components/ResponsiveContainer';
import MiniMealLog from '../components/MiniMealLog';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardEnergyCard from '../components/dashboard/DashboardEnergyCard';
import DashboardPantryAlert from '../components/dashboard/DashboardPantryAlert';
import DashboardStreakBanner from '../components/dashboard/DashboardStreakBanner'; 
import CheckInPopup from '../components/dashboard/CheckInPopup'; 
import { COLORS } from '../constants/theme';

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
  const navigation = useNavigation();
  const isWebLarge = Platform.OS === 'web' && width > BREAKPOINT_MOBILE_MAX;
  
  const { userProfile, getExpiringItems, fetchPantryItems } = useAppStore();
  const [showCheckInPopup, setShowCheckInPopup] = useState(false);

  const [dailySummary, setDailySummary] = useState({
    totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    meals: []
  });

  // STATE CHO MODAL NHẬP TAY
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({ name: '', kcal: '', type: 'snack' });
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSaveManualMeal = async () => {
    if (!manualForm.name || !manualForm.kcal) {
      alert("Vui lòng nhập đầy đủ tên và calo");
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await recipeApi.logMeal({
        meal_name: manualForm.name,
        meal_type: manualForm.type,
        calories: parseFloat(manualForm.kcal),
        protein: 0, carbs: 0, fat: 0
      });
      
      if (res.success) {
        setShowManualModal(false);
        setManualForm({ name: '', kcal: '', type: 'snack' });
        fetchSummary();
      }
    } catch (error) {
      console.error("Lỗi lưu món ăn:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Tự động load lại mỗi khi quay lại màn hình Dashboard
  useFocusEffect(
    React.useCallback(() => {
      fetchSummary();
      fetchPantryItems(); // Load tủ lạnh để lấy cảnh báo
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

  // Lấy dữ liệu cảnh báo tủ lạnh thật
  const expiringItems = getExpiringItems();
  const realAlerts = expiringItems.map(item => ({
    id: item.id,
    name: item.name,
    status: item.urgency === 'expired' ? 'out_of_stock' : 'warning',
    msg: item.urgency === 'expired' ? 'Đã hết hàng' : `Hết hạn trong ${item.daysLeft} ngày`
  }));

  return (
    <ResponsiveContainer useImageBg={false}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <DashboardHeader userName={userName} remainingKcal={remainingKcal} />

        <View style={styles.fullWidthContainer}>
          <DashboardStreakBanner 
            streakDays={dailySummary.streak || 0} 
            hasLoggedToday={dailySummary.hasLoggedToday || false} 
          />
        </View>

        <View style={[styles.dashboardGrid, isWebLarge && styles.dashboardGridWeb]}>
          <View style={[styles.column, isWebLarge && { flex: 1.5 }]}>
            <DashboardEnergyCard tracking={realTracking} macros={realMacros} />
            <MiniMealLog 
              logs={dailySummary.meals} 
              onAddMain={() => navigation.navigate('Scan')}
              onAddSnack={() => setShowManualModal(true)} // MỞ MODAL NHẬP TAY
            />
          </View>

          <View style={[styles.column, isWebLarge && { flex: 1 }]}>
            <DashboardPantryAlert alerts={realAlerts.length > 0 ? realAlerts : DASHBOARD_MOCK_PANTRY_ALERTS} />
          </View>
        </View>

      </ScrollView>

      <CheckInPopup 
        visible={showCheckInPopup} 
        onClose={() => setShowCheckInPopup(false)} 
      />

      {/* MODAL NHẬP BỮA ĂN THỦ CÔNG */}
      <Modal visible={showManualModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.addModalBox}>
            <Text style={styles.modalTitle}>🥣 Thêm bữa phụ</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên món ăn</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.textInput} 
                  placeholder="VD: Sữa chua, Trái cây..." 
                  value={manualForm.name}
                  onChangeText={(val) => setManualForm({...manualForm, name: val})}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Lượng Calo (kcal)</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.textInput} 
                  placeholder="VD: 150" 
                  keyboardType="numeric"
                  value={manualForm.kcal}
                  onChangeText={(val) => setManualForm({...manualForm, kcal: val})}
                />
              </View>
            </View>

            <View style={styles.modalActionRow}>
              <Pressable style={styles.modalBtnCancel} onPress={() => setShowManualModal(false)}>
                <Text style={styles.modalBtnCancelText}>Hủy</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalBtnSubmit, isSaving && { opacity: 0.7 }]} 
                onPress={handleSaveManualMeal}
                disabled={isSaving}
              >
                <Text style={styles.modalBtnSubmitText}>{isSaving ? 'Đang lưu...' : 'Thêm ngay'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  
  // ================= MODAL STYLES =================
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  addModalBox: { 
    width: '100%', 
    maxWidth: 400, 
    backgroundColor: '#FFF', 
    borderRadius: 24, 
    padding: 24,
    elevation: 5
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1A1D1E', marginBottom: 20, textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#444', marginBottom: 8 },
  inputWrapper: { 
    backgroundColor: '#F3F4F6', 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    height: 50, 
    justifyContent: 'center' 
  },
  textInput: { fontSize: 15, color: '#1A1D1E', fontWeight: '600' },
  modalActionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtnCancel: { flex: 1, height: 50, backgroundColor: '#F3F4F6', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modalBtnCancelText: { color: '#666', fontWeight: '700' },
  modalBtnSubmit: { flex: 1, height: 50, backgroundColor: COLORS.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modalBtnSubmitText: { color: '#FFF', fontWeight: '700' },
});

export default DashboardScreen;