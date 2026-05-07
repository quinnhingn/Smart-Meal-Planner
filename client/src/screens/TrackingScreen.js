// src/screens/TrackingScreen.js
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Platform, 
  useWindowDimensions, Pressable, Animated 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

import { COLORS } from '../constants/theme';
import { MOCK_180D_TRACKING, MOCK_PROFILE_STATS, MOCK_AI_INSIGHTS } from '../utils/mockTrackingData';
import AiInsightCard from '../components/tracking/AiInsightCard';

const BREAKPOINT_MOBILE_MAX = 768;
const WEIGHT_FILTERS = [
  { id: '1m', label: '1 Tháng', limit: 30 },
  { id: '3m', label: '3 Tháng', limit: 90 },
  { id: '6m', label: '6 Tháng', limit: 180 },
];

const TrackingScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isWebLarge = Platform.OS === 'web' && width > BREAKPOINT_MOBILE_MAX;
  
  // STATE
  const [activeMetric, setActiveMetric] = useState('weight');
  const [weightTimeRange, setWeightTimeRange] = useState('1m'); 
  const [chartWidth, setChartWidth] = useState(width - 32);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);

  // ANIMATIONS
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const isWeight = activeMetric === 'weight';

  // LOGIC LỌC DỮ LIỆU
  const filteredData = useMemo(() => {
    if (!isWeight) return MOCK_180D_TRACKING.slice(-7);
    const limit = WEIGHT_FILTERS.find(f => f.id === weightTimeRange)?.limit || 30;
    return MOCK_180D_TRACKING.slice(-limit).filter(item => item.isCheckInDay);
  }, [activeMetric, weightTimeRange]);

  // XỬ LÝ NHÃN BIỂU ĐỒ
  const chartLabels = filteredData.map((item, index) => {
    const total = filteredData.length;
    if (isWeight) {
      const step = total > 12 ? 4 : total > 5 ? 2 : 1;
      if (index % step !== 0 && index !== total - 1) return ""; 
    }
    const d = new Date(item.date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });

  const chartData = filteredData.map(item => isWeight ? item.weight : item.calo);
  const targetValue = isWeight ? MOCK_PROFILE_STATS.targetWeight : MOCK_PROFILE_STATS.targetCalories;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER TÙY CHỈNH */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable 
            onPress={() => navigation?.goBack()} 
            style={({ hovered }) => [styles.backBtn, Platform.OS === 'web' && hovered && { opacity: 0.7 }]}
          >
            <Ionicons name="arrow-back" size={24} color="#1A1D1E" />
          </Pressable>
          <Text style={styles.headerTitle}>Báo cáo Cơ thể</Text>
        </View>

        {/* CẬP NHẬT: LUÔN HIỂN THỊ FILTER CONTAINER NHƯNG NỘI DUNG THAY ĐỔI THEO TAB */}
        <View style={styles.filterContainer}>
          {isWeight ? (
            WEIGHT_FILTERS.map(f => (
              <Pressable 
                key={f.id} 
                style={[styles.filterBtn, weightTimeRange === f.id && styles.filterBtnActive]} 
                onPress={() => setWeightTimeRange(f.id)}
              >
                <Text style={[styles.filterText, weightTimeRange === f.id && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            ))
          ) : (
            <View style={[styles.filterBtn, styles.filterBtnActive, { elevation: 0, backgroundColor: 'transparent' }]}>
              <Text style={[styles.filterText, { color: COLORS.primary, fontWeight: '800' }]}>
                7 Ngày gần nhất
              </Text>
            </View>
          )}
        </View>
      </View>

      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* METRIC TOGGLE */}
        <View style={styles.metricToggleWrapper}>
          <View style={styles.toggleContainer}>
            <Pressable 
              style={[styles.toggleBtn, isWeight && styles.toggleBtnActive]} 
              onPress={() => {setActiveMetric('weight'); setShowAiAnalysis(false);}}
            >
              <Text style={[styles.toggleText, isWeight && styles.toggleTextActive]}>Cân nặng</Text>
            </Pressable>
            <Pressable 
              style={[styles.toggleBtn, !isWeight && styles.toggleBtnActive]} 
              onPress={() => {setActiveMetric('calories'); setShowAiAnalysis(false);}}
            >
              <Text style={[styles.toggleText, !isWeight && styles.toggleTextActive]}>Calo nạp vào</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.grid, isWebLarge && styles.gridWeb]}>
          {/* CARD BIỂU ĐỒ */}
          <View 
            style={[styles.card, isWebLarge && { flex: 1.5 }]} 
            onLayout={(e) => setChartWidth(e.nativeEvent.layout.width - 48)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{isWeight ? "Tiến độ Cân nặng" : "Calo tiêu thụ"}</Text>
              
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Pressable 
                  style={styles.aiButton} 
                  onPress={() => setShowAiAnalysis(!showAiAnalysis)}
                >
                  <Ionicons name="sparkles" size={16} color="#FFF" />
                  <Text style={styles.aiButtonText}>AI Phân tích</Text>
                </Pressable>
              </Animated.View>
            </View>

            <LineChart
              data={{
                labels: chartLabels,
                datasets: [
                  { data: chartData, color: () => COLORS.primary, strokeWidth: 3 },
                  { 
                    data: chartLabels.map(() => targetValue), 
                    color: () => 'rgba(244, 67, 54, 0.4)', 
                    strokeWidth: 2, 
                    withDots: false 
                  }
                ],
                legend: ["Thực tế", "Mục tiêu"]
              }}
              width={chartWidth > 0 ? chartWidth : width - 64}
              height={220}
              chartConfig={{
                backgroundColor: '#FFF',
                backgroundGradientFrom: '#FFF',
                backgroundGradientTo: '#FFF',
                decimalPlaces: isWeight ? 1 : 0,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                labelColor: () => `#888`,
                propsForDots: { r: '5', strokeWidth: '2', stroke: '#FFF' },
              }}
              bezier
              style={{ marginVertical: 16, borderRadius: 16, marginLeft: -12 }}
            />

            {showAiAnalysis && (
              <AiInsightCard 
                metric={activeMetric} 
                data={isWeight ? MOCK_AI_INSIGHTS.weight : MOCK_AI_INSIGHTS.calories} 
              />
            )}
          </View>

          {/* CARD LỊCH SỬ */}
          <View style={[styles.card, isWebLarge && { flex: 1 }]}>
            <Text style={styles.cardTitle}>Lịch sử gần đây</Text>
            <View style={{ marginTop: 16 }}>
              {filteredData.slice(-7).reverse().map((item) => (
                <View key={item.id} style={styles.historyRow}>
                  <View style={styles.historyDate}>
                    <Ionicons name={isWeight ? "scale" : "restaurant"} size={16} color={COLORS.primary} />
                    <Text style={styles.historyDateText}>
                      {new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                    </Text>
                  </View>
                  <Text style={styles.historyWeight}>
                    {isWeight ? `${item.weight}kg` : `${item.calo}kcal`}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F6' },
  header: { 
    flexDirection: Platform.OS === 'web' ? 'row' : 'column', 
    justifyContent: 'space-between', 
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    padding: 20, 
    backgroundColor: '#FFF', 
    gap: 16 
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1A1D1E' },
  
  filterContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#F0F2F5', 
    padding: 4, 
    borderRadius: 24,
    minHeight: 44,
    alignItems: 'center'
  },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  filterBtnActive: { backgroundColor: '#FFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  filterText: { fontSize: 13, fontWeight: '600', color: '#888' },
  filterTextActive: { color: COLORS.primary, fontWeight: '800' },

  metricToggleWrapper: { width: '100%', alignItems: 'center', marginBottom: 24 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#E8F5E9', padding: 4, borderRadius: 24 },
  toggleBtn: { paddingVertical: 10, paddingHorizontal: 32, borderRadius: 20 },
  toggleBtnActive: { backgroundColor: COLORS.primary, elevation: 4 },
  toggleText: { fontSize: 14, fontWeight: '700', color: '#555' },
  toggleTextActive: { color: '#FFF' },

  scrollContent: { padding: 16, paddingBottom: 40 },
  grid: { width: '100%', maxWidth: 1200, flexDirection: 'column', gap: 16, alignSelf: 'center' },
  gridWeb: { flexDirection: 'row', alignItems: 'flex-start', gap: 24 },
  
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#EEE' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#1A1D1E' },
  
  aiButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#8E24AA', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  aiButtonText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#F0F0F0' },
  historyDate: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  historyDateText: { fontSize: 15, color: '#333', fontWeight: '700' },
  historyWeight: { fontSize: 16, color: '#1A1D1E', fontWeight: '900' }
});

export default TrackingScreen;