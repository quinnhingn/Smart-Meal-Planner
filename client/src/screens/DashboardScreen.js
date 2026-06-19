// src/screens/DashboardScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  useWindowDimensions,
  Text,
  Pressable,
  Animated,
  Easing,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { recipeApi } from '../services/api';

import ResponsiveContainer from '../components/ResponsiveContainer';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardEnergyCard from '../components/dashboard/DashboardEnergyCard';
import RecommendationsSheet from '../components/dashboard/RecommendationsSheet';
import { COLORS } from '../constants/theme';

import {
  DASHBOARD_MOCK_TRACKING,
  DASHBOARD_MOCK_WEIGHT_HISTORY,
} from '../utils/mockDashboardData';

const BREAKPOINT_MOBILE_MAX = 768;
const ACCENT = '#AAEF65';
const ACCENT_DARK = '#0F1410';

// ─── Animated Wrapper ──────────────────────────────────────────────────────
const FadeInView = ({ children, delay = 0, style }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// ─── Section Header ────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle, actionLabel, onAction }) => (
  <View style={styles.sectionHeader}>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
    {actionLabel && (
      <Pressable onPress={onAction} style={({ pressed }) => pressed && { opacity: 0.7 }}>
        <Text style={styles.sectionAction}>{actionLabel}</Text>
      </Pressable>
    )}
  </View>
);



// ─── Main Screen ───────────────────────────────────────────────────────────
const DashboardScreen = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();

  const {
    userProfile, fetchFavoriteIds, currentStreak, setCurrentStreak, burnedCalories,
    mockRecommendations, fetchMockRecommendations
  } = useAppStore();
  const [showRecommendations, setShowRecommendations] = useState(false);

  const [dailySummary, setDailySummary] = useState({
    totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    meals: [],
    streak: 0
  });

  // STATE CHO MODAL NHẬP TAY
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({ name: '', kcal: '', type: 'snack' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await recipeApi.getDailySummary();
      if (res.success && res.data.data) {
        setDailySummary(res.data.data);
        // Cập nhật streak vào store để ProfileScreen cũng thấy
        if (res.data.data.streak !== undefined) {
          setCurrentStreak(res.data.data.streak);
        }
        // Cập nhật calo tiêu thụ từ DB
        if (res.data.data.totals && res.data.data.totals.burned_calories !== undefined) {
          useAppStore.setState({ burnedCalories: res.data.data.totals.burned_calories });
        }
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
      if (fetchFavoriteIds) fetchFavoriteIds();
      fetchMockRecommendations(); // Lấy mock recommendations
    }, [])
  );

  const userName = userProfile?.name || 'Bạn';
  const targetKcal = userProfile?.target_calories || userProfile?.tdee || 2000;

  const realTracking = {
    ...DASHBOARD_MOCK_TRACKING,
    target_kcal: Math.round(targetKcal),
    consumed_kcal: Math.round(dailySummary.totals.calories),
    burned_kcal: Math.round(dailySummary.totals?.burned_calories || burnedCalories || 0)
  };

  const realMacros = {
    protein: {
      target: Math.round(userProfile?.target_protein_g || 150),
      current: Math.round(dailySummary.totals.protein),
      color: '#E53935'
    },
    carbs: {
      target: Math.round(userProfile?.target_carbs_g || 250),
      current: Math.round(dailySummary.totals.carbs),
      color: '#29B6F6'
    },
    fat: {
      target: Math.round(userProfile?.target_fat_g || 60),
      current: Math.round(dailySummary.totals.fat),
      color: '#FBC02D'
    }
  };

  const remainingKcal = Math.max(
    0,
    realTracking.target_kcal - realTracking.consumed_kcal + realTracking.burned_kcal
  );

  // Tủ lạnh đã bỏ ở V2 nên list alert này để rỗng
  const realAlerts = [];

  return (
    <ResponsiveContainer useImageBg={false}>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <View style={styles.headerWrapper}>
          <DashboardHeader
            userName={userName}
            remainingKcal={remainingKcal}
            streakDays={currentStreak || 0}
          />
        </View>




        {/* ── MAIN GRID ── */}
        <View style={styles.dashboardGrid}>

          <View style={styles.column}>
            <FadeInView delay={160}>
              <View style={styles.card}>
                <SectionHeader
                  title="Năng lượng hôm nay"
                  subtitle="Cập nhật theo thời gian thực"
                />
                <DashboardEnergyCard tracking={realTracking} macros={realMacros} />
              </View>
            </FadeInView>



            {/* Nút Gợi ý món ăn (Neo-brutalism style) */}
            <FadeInView delay={260}>
              <View style={styles.neoBtnWrapper}>
                <View style={styles.neoBtnShadow} />
                <Pressable 
                  style={styles.neoBtn}
                  onPress={() => setShowRecommendations(true)}
                >
                  <Ionicons name="restaurant" size={20} color="#1A1D1E" />
                  <Text style={styles.neoBtnText}>Gợi ý món ăn</Text>
                  <View style={styles.neoBtnBadge}>
                    <Text style={styles.neoBtnBadgeText}>{mockRecommendations?.length || 0}</Text>
                  </View>
                </Pressable>
              </View>
            </FadeInView>

            <FadeInView delay={280}>
              <View style={styles.miniTipsCard}>
                <Ionicons name="bulb-outline" size={18} color="#F59E0B" />
                <Text style={styles.miniTipsText}>
                  <Text style={{ fontWeight: '700' }}>Mẹo: </Text>
                  Uống 1 ly nước ấm trước bữa sáng giúp tiêu hoá tốt hơn.
                </Text>
              </View>
            </FadeInView>
          </View>
        </View>
      </ScrollView>

      <RecommendationsSheet 
        visible={showRecommendations} 
        onClose={() => setShowRecommendations(false)} 
        data={mockRecommendations} 
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
                  onChangeText={(val) => setManualForm({ ...manualForm, name: val })}
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
                  onChangeText={(val) => setManualForm({ ...manualForm, kcal: val })}
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

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  headerWrapper: {
    width: '100%',
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: 'transparent',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
    alignItems: 'center',
    gap: 20,
  },

  streakWrapper: { width: '100%', maxWidth: 1200 },
  fullWidthWrapper: { width: '100%', maxWidth: 1200 },

  statsOuter: {
    width: '100%',
    maxWidth: 1200,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 12 },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 16px rgba(0,0,0,0.05)' },
    }),
  },
  statsRowMobile: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 24,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4
  },
  statPillMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTextWrap: {
    justifyContent: 'center',
  },
  statTextWrapMobile: {
    alignItems: 'center',
  },
  statValue: { fontSize: 15, fontWeight: '900', color: '#1A1D1E', lineHeight: 18 },
  statUnit: { fontSize: 11, fontWeight: '600', color: '#999' },
  statLabel: { fontSize: 11, color: '#999', fontWeight: '600', marginTop: 2 },
  statsDivider: { width: 1, height: 32, backgroundColor: '#F0F0F0' },
  statsDividerMobile: {
    width: 1,
    height: 40,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 2,
  },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#1A1D1E', letterSpacing: -0.3 },
  sectionSubtitle: { fontSize: 12, color: '#AAA', fontWeight: '500', marginTop: 2 },
  sectionAction: { fontSize: 13, fontWeight: '800', color: '#3D9B2A' },

  dashboardGrid: { width: '100%', maxWidth: 1200, flexDirection: 'column', gap: 20 },
  dashboardGridWeb: { flexDirection: 'row', alignItems: 'flex-start', gap: 28 },
  column: { width: '100%', gap: 20 },

  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 12 },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 16px rgba(0,0,0,0.05)' },
    }),
  },

  miniTipsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 1 },
      web: { boxShadow: '0 2px 10px rgba(0,0,0,0.03)' },
    }),
  },
  miniTipsText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 18 },

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
  
  // Neo-brutalism Button
  neoBtnWrapper: { position: 'relative', width: '100%', paddingHorizontal: 4 },
  neoBtnShadow: {
    position: 'absolute',
    top: 4, left: 8, right: 0, bottom: -4,
    backgroundColor: '#1A1D1E',
    borderRadius: 16,
  },
  neoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#AAEF65',
    borderWidth: 2,
    borderColor: '#1A1D1E',
    borderRadius: 16,
    paddingVertical: 18,
  },
  neoBtnText: { fontSize: 18, fontWeight: '900', color: '#1A1D1E' },
  neoBtnBadge: { 
    backgroundColor: '#1A1D1E', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 12 
  },
  neoBtnBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
});

export default DashboardScreen;