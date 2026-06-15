// src/screens/TrackingScreen.js
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Platform, 
  useWindowDimensions, Pressable, Animated, Easing, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';

import ResponsiveContainer from '../components/ResponsiveContainer';
import { COLORS, SHADOWS } from '../constants/theme';
import { MOCK_180D_TRACKING, MOCK_PROFILE_STATS, MOCK_AI_INSIGHTS } from '../utils/mockTrackingData';
import AiInsightCard from '../components/tracking/AiInsightCard';

const TIME_FILTERS = [
  { id: '1w', label: '1 Tuần', limit: 7 },
  { id: '1m', label: '1 Tháng', limit: 30 },
  { id: '3m', label: '3 Tháng', limit: 90 },
  { id: '6m', label: '6 Tháng', limit: 180 },
];

// ============ NEO-BRUTALIST CARD WRAPPER ============
const NeoCard = ({ children, style, containerStyle }) => (
  <View style={[styles.neoCardWrapper, containerStyle]}>
    <View style={styles.neoCardShadow} />
    <View style={[styles.neoCard, style]}>
      {children}
    </View>
  </View>
);

// ============ COMPONENT PHỤ ============

const StatBadge = ({ icon, label, value, color, delay = 0 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic)
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.statBadgeWrapper, { opacity: anim, transform: [{ translateY: anim.interpolate({
      inputRange: [0, 1], outputRange: [20, 0]
    })}] }]}>
      <View style={styles.statBadgeShadow} />
      <View style={styles.statBadge}>
        <View style={[styles.statIconWrap, { backgroundColor: color }]}>
          <Ionicons name={icon} size={20} color="#1A1D1E" />
        </View>
        <View style={styles.statTextWrap}>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={[styles.statValue, { color: '#1A1D1E' }]}>{value}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const TrendIndicator = ({ current, previous, isWeight }) => {
  if (previous == null) return <View style={{ width: 20 }} />;
  
  const diff = current - previous;
  const isPositive = diff > 0;
  const isNeutral = diff === 0;
  
  let color = '#1A1D1E';
  let bgColor = '#F0F0F0';
  let icon = 'remove';
  
  if (!isNeutral) {
    if (isWeight) {
      color = !isPositive ? '#1A1D1E' : '#1A1D1E';
      bgColor = !isPositive ? COLORS.macroThreshold.under : COLORS.macroThreshold.over;
      icon = !isPositive ? 'arrow-down' : 'arrow-up';
    } else {
      color = '#1A1D1E';
      bgColor = isPositive ? COLORS.macroThreshold.over : COLORS.macroThreshold.under;
      icon = isPositive ? 'arrow-up' : 'arrow-down';
    }
  }

  return (
    <View style={[styles.trendWrap, { backgroundColor: bgColor, borderWidth: 1, borderColor: '#1A1D1E' }]}>
      <Ionicons name={icon} size={12} color={color} />
      <Text style={[styles.trendText, { color }]}>
        {isNeutral ? '-' : `${Math.abs(diff).toFixed(isWeight ? 1 : 0)}${isWeight ? 'kg' : ''}`}
      </Text>
    </View>
  );
};

// ============ MAIN SCREEN ============

const TrackingScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  
  // STATE
  const [activeMetric, setActiveMetric] = useState('weight');
  const [timeRange, setTimeRange] = useState('1m'); 
  const [chartWidth, setChartWidth] = useState(width - 48);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ANIMATIONS
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const toggleAnim = useRef(new Animated.Value(0)).current;
  const aiScaleAnim = useRef(new Animated.Value(0)).current;
  const aiRotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.cubic) })
    ]).start();
  }, []);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true })
      ]),
      { iterations: 3 }
    );
    pulse.start();
    return () => pulse.stop();
  }, [activeMetric, timeRange]);

  useEffect(() => {
    if (showAiAnalysis) {
      Animated.spring(aiScaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }).start();
      Animated.timing(aiRotateAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    } else {
      Animated.timing(aiScaleAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      Animated.timing(aiRotateAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    }
  }, [showAiAnalysis]);

  const isWeight = activeMetric === 'weight';
  const TOGGLE_CONTAINER_WIDTH = Math.min(width - 32, 340);
  const TOGGLE_PADDING = 6;
  const TOGGLE_BTN_WIDTH = (TOGGLE_CONTAINER_WIDTH - TOGGLE_PADDING * 2) / 2;

  useEffect(() => {
    Animated.spring(toggleAnim, {
      toValue: isWeight ? 0 : 1,
      friction: 9,
      tension: 60,
      useNativeDriver: true
    }).start();
  }, [isWeight]);

  const handleMetricChange = useCallback((metric) => {
    if (metric === activeMetric) return;
    setIsLoading(true);
    setShowAiAnalysis(false);
    setTimeout(() => {
      setActiveMetric(metric);
      setIsLoading(false);
    }, 250);
  }, [activeMetric]);

  const handleFilterChange = useCallback((filterId) => {
    if (filterId === timeRange) return;
    setIsLoading(true);
    setTimeout(() => {
      setTimeRange(filterId);
      setIsLoading(false);
    }, 200);
  }, [timeRange]);

  const filteredData = useMemo(() => {
    const limit = TIME_FILTERS.find(f => f.id === timeRange)?.limit || 30;
    if (isWeight) {
      return MOCK_180D_TRACKING.slice(-limit).filter(item => item.isCheckInDay);
    } else {
      // For calories, we might want to show every day if it's 1w, or sample if it's longer
      let data = MOCK_180D_TRACKING.slice(-limit);
      if (limit > 30) {
        // Sample data for 3m, 6m to avoid chart overcrowding
        const step = Math.ceil(limit / 30);
        data = data.filter((_, idx) => idx % step === 0);
      }
      return data;
    }
  }, [activeMetric, timeRange]);

  const stats = useMemo(() => {
    const data = filteredData;
    if (data.length === 0) return null;
    
    if (isWeight) {
      const current = data[data.length - 1].weight;
      const target = MOCK_PROFILE_STATS.targetWeight;
      const start = data[0].weight;
      const totalChange = current - start;
      return { 
        primary: current, primaryLabel: "Hiện tại", primaryUnit: "kg",
        secondary: totalChange, secondaryLabel: "Thay đổi", secondaryUnit: "kg",
        target: target, targetLabel: "Mục tiêu", targetUnit: "kg",
        count: data.length
      };
    } else {
      const current = data[data.length - 1].calo;
      const target = MOCK_PROFILE_STATS.targetCalories;
      const sum = data.reduce((acc, curr) => acc + curr.calo, 0);
      const avg = Math.round(sum / data.length);
      const max = Math.max(...data.map(d => d.calo));
      return {
        primary: avg, primaryLabel: "Trung bình/ngày", primaryUnit: "kcal",
        secondary: max, secondaryLabel: "Cao nhất", secondaryUnit: "kcal",
        target: target, targetLabel: "Mục tiêu", targetUnit: "kcal",
        count: data.length
      };
    }
  }, [filteredData, isWeight]);

  const chartLabels = useMemo(() => {
    const total = filteredData.length;
    if (total === 0) return [];
    const approxLabelWidth = isWeight ? 50 : 35;
    const maxLabels = Math.floor(chartWidth / approxLabelWidth);
    const step = Math.max(1, Math.ceil(total / maxLabels));
    
    return filteredData.map((item, index) => {
      const isLast = index === total - 1;
      const isFirst = index === 0;
      if (!isFirst && !isLast && index % step !== 0) return "";
      const d = new Date(item.date);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });
  }, [filteredData, chartWidth, isWeight]);

  const chartData = useMemo(() => filteredData.map(item => isWeight ? item.weight : item.calo), [filteredData, isWeight]);
  const targetValue = isWeight ? MOCK_PROFILE_STATS.targetWeight : MOCK_PROFILE_STATS.targetCalories;

  const pointWidth = isWeight ? 55 : 35;
  const calculatedChartWidth = Math.max(chartWidth, filteredData.length * pointWidth);

  const chartConfig = useMemo(() => ({
    backgroundColor: '#FFF',
    backgroundGradientFrom: '#FFF',
    backgroundGradientTo: '#FFF',
    decimalPlaces: isWeight ? 1 : 0,
    color: (opacity = 1) => isWeight ? `rgba(26, 29, 30, ${opacity})` : `rgba(26, 29, 30, ${opacity})`,
    labelColor: () => `#1A1D1E`,
    propsForDots: { 
      r: '4', 
      strokeWidth: '2', 
      stroke: '#FFF',
      fill: '#1A1D1E'
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: '#F0F0F0',
      strokeDasharray: '4',
    },
    propsForLabels: {
      fontSize: 11,
      fontWeight: '800',
    },
    fillShadowGradient: isWeight ? COLORS.primary : COLORS.secondary,
    fillShadowGradientOpacity: 0.2,
    barPercentage: 0.6,
  }), [isWeight]);

  const toggleTranslateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TOGGLE_BTN_WIDTH]
  });

  return (
    <ResponsiveContainer useImageBg={false}>
      
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Theo dõi chỉ số</Text>
          <Text style={styles.headerSubtitle}>
            {isWeight ? 'Tiến độ cân nặng & mục tiêu' : 'Năng lượng nạp vào hàng ngày'}
          </Text>
        </View>

        <View style={styles.filterContainer}>
          {TIME_FILTERS.map(f => (
            <Pressable 
              key={f.id} 
              style={[styles.filterBtn, timeRange === f.id && styles.filterBtnActive]} 
              onPress={() => handleFilterChange(f.id)}
            >
              <Text style={[styles.filterText, timeRange === f.id && styles.filterTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* ===== STATS ===== */}
        {stats && (
          <View style={styles.statsOuter}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsRow}
            >
              <StatBadge 
                icon={isWeight ? "scale" : "analytics"} 
                label={stats.primaryLabel} 
                value={`${stats.primary}${stats.primaryUnit}`}
                color={COLORS.primary}
                delay={100}
              />
              <StatBadge 
                icon={isWeight ? "swap-vertical" : "flame"} 
                label={stats.secondaryLabel} 
                value={`${isWeight && stats.secondary > 0 ? '+' : ''}${isWeight ? stats.secondary.toFixed(1) : stats.secondary}${stats.secondaryUnit}`}
                color={isWeight && stats.secondary > 0 ? '#FF5252' : COLORS.secondary}
                delay={200}
              />
              <StatBadge 
                icon="flag" 
                label={stats.targetLabel} 
                value={`${stats.target}${stats.targetUnit}`}
                color="#4ECDC4"
                delay={300}
              />
            </ScrollView>
          </View>
        )}

        {/* ===== METRIC TOGGLE ===== */}
        <View style={styles.metricToggleWrapper}>
          <View style={[styles.toggleContainer, { width: TOGGLE_CONTAINER_WIDTH }]}>
            <Animated.View style={[
              styles.toggleIndicator, 
              { width: TOGGLE_BTN_WIDTH, transform: [{ translateX: toggleTranslateX }] }
            ]} />
            <Pressable 
              style={[styles.toggleBtn, { width: TOGGLE_BTN_WIDTH }]} 
              onPress={() => handleMetricChange('weight')}
            >
              <Ionicons name="scale" size={16} color={isWeight ? '#1A1D1E' : '#888'} style={{ marginRight: 6 }} />
              <Text style={[styles.toggleText, isWeight && styles.toggleTextActive]}>Cân nặng</Text>
            </Pressable>
            <Pressable 
              style={[styles.toggleBtn, { width: TOGGLE_BTN_WIDTH }]} 
              onPress={() => handleMetricChange('calories')}
            >
              <Ionicons name="restaurant" size={16} color={!isWeight ? '#1A1D1E' : '#888'} style={{ marginRight: 6 }} />
              <Text style={[styles.toggleText, !isWeight && styles.toggleTextActive]}>Calo</Text>
            </Pressable>
          </View>
        </View>

        {/* ===== MAIN GRID ===== */}
        <View style={styles.grid}>
          
          {/* CHART CARD */}
          <NeoCard 
            containerStyle={{ marginBottom: 8 }}
            style={{ paddingHorizontal: 0, paddingBottom: 24, paddingTop: 20 }}
          >
            <View style={[styles.cardHeader, { paddingHorizontal: 20 }]}>
              <View>
                <Text style={styles.cardTitle}>
                  {isWeight ? "Biểu đồ cân nặng" : "Biểu đồ calo"}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {stats ? `${stats.count} điểm dữ liệu (${TIME_FILTERS.find(f => f.id === timeRange)?.label})` : 'Không có dữ liệu'}
                </Text>
              </View>
              
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Pressable 
                  style={[styles.aiButton, showAiAnalysis && styles.aiButtonActive]} 
                  onPress={() => setShowAiAnalysis(!showAiAnalysis)}
                >
                  <Animated.View style={{ transform: [{ rotate: aiRotateAnim.interpolate({
                    inputRange: [0, 1], outputRange: ['0deg', '180deg']
                  })}] }}>
                    <Ionicons name="sparkles" size={16} color={showAiAnalysis ? "#1A1D1E" : "#FFF"} />
                  </Animated.View>
                  <Text style={[styles.aiButtonText, showAiAnalysis && { color: '#1A1D1E' }]}>AI</Text>
                </Pressable>
              </Animated.View>
            </View>

            <View onLayout={(e) => setChartWidth(e.nativeEvent.layout.width - 16)} style={{ paddingHorizontal: 8 }}>
              {isLoading ? (
                <View style={styles.chartLoading}>
                  <ActivityIndicator size="large" color="#1A1D1E" />
                  <Text style={styles.chartLoadingText}>Đang cập nhật dữ liệu...</Text>
                </View>
              ) : (
                <>
                  {filteredData.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      scrollEnabled={calculatedChartWidth > chartWidth}
                      contentContainerStyle={styles.chartScrollContent}
                    >
                      {isWeight ? (
                        <LineChart
                          data={{
                            labels: chartLabels,
                            datasets: [
                              { data: chartData, color: () => '#1A1D1E', strokeWidth: 3 },
                              { data: chartLabels.map(() => targetValue), color: () => 'rgba(26, 29, 30, 0.2)', strokeWidth: 2, withDots: false, strokeDashArray: [5, 5] }
                            ]
                          }}
                          width={calculatedChartWidth}
                          height={260}
                          chartConfig={chartConfig}
                          bezier
                          yAxisInterval={1}
                          style={{ borderRadius: 16 }}
                          formatYLabel={(y) => `${parseFloat(y).toFixed(1)}`}
                          withVerticalLines={false}
                        />
                      ) : (
                        <BarChart
                          data={{
                            labels: chartLabels,
                            datasets: [{ data: chartData }]
                          }}
                          width={calculatedChartWidth}
                          height={260}
                          chartConfig={chartConfig}
                          yAxisLabel=""
                          yAxisSuffix=""
                          style={{ borderRadius: 16 }}
                          fromZero
                          showValuesOnTopOfBars
                          withHorizontalLabels={false}
                          withVerticalLines={false}
                        />
                      )}
                    </ScrollView>
                  ) : (
                    <View style={styles.emptyChart}>
                      <Ionicons name="bar-chart-outline" size={48} color="#CCC" />
                      <Text style={styles.emptyText}>Chưa có dữ liệu cho khoảng thời gian này</Text>
                    </View>
                  )}

                  <Animated.View style={{ 
                    transform: [{ scaleY: aiScaleAnim }], 
                    opacity: aiScaleAnim,
                    height: showAiAnalysis ? 'auto' : 0,
                    overflow: 'hidden',
                    paddingHorizontal: 12,
                    marginTop: showAiAnalysis ? 16 : 0
                  }}>
                    <AiInsightCard 
                      metric={activeMetric} 
                      data={isWeight ? MOCK_AI_INSIGHTS.weight : MOCK_AI_INSIGHTS.calories} 
                    />
                  </Animated.View>
                </>
              )}
            </View>
          </NeoCard>

          {/* HISTORY CARD */}
          <NeoCard>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Lịch sử gần đây</Text>
                <Text style={styles.cardSubtitle}>{TIME_FILTERS.find(f => f.id === timeRange)?.label} gần nhất</Text>
              </View>
            </View>
            
            <View style={styles.historyList}>
              {filteredData.slice(-7).reverse().map((item, index, arr) => {
                const prevItem = arr[index + 1];
                const currentVal = isWeight ? item.weight : item.calo;
                const prevVal = prevItem ? (isWeight ? prevItem.weight : prevItem.calo) : null;
                
                return (
                  <View key={item.id} style={styles.historyRow}>
                    <View style={styles.historyLeft}>
                      <View style={[
                        styles.historyIconWrap, 
                        { backgroundColor: isWeight ? COLORS.primary : COLORS.secondary }
                      ]}>
                        <Ionicons 
                          name={isWeight ? "scale" : "restaurant"} 
                          size={18} 
                          color="#1A1D1E" 
                        />
                      </View>
                      <View>
                        <Text style={styles.historyDateText}>
                          {new Date(item.date).toLocaleDateString('vi-VN', { 
                            day: '2-digit', month: '2-digit', year: '2-digit'
                          })}
                        </Text>
                        <Text style={styles.historyDayText}>
                          {new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'long' })}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.historyRight}>
                      <TrendIndicator 
                        current={currentVal} 
                        previous={prevVal} 
                        isWeight={isWeight} 
                      />
                      <Text style={styles.historyValue}>
                        {isWeight ? `${item.weight} kg` : `${item.calo} kcal`}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </NeoCard>
        </View>
      </Animated.ScrollView>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  // ===== NEO BRUTALISM =====
  neoCardWrapper: {
    position: 'relative',
    width: '100%',
  },
  neoCardShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    backgroundColor: '#1A1D1E',
    borderRadius: 24,
  },
  neoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1A1D1E',
    borderRadius: 24,
    padding: 20,
  },

  // ===== HEADER =====
  header: { 
    flexDirection: 'column', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: 'transparent',
    gap: 16 
  },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#1A1D1E', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: '#666', marginTop: 4, fontWeight: '600' },
  
  filterContainer: { 
    flexDirection: 'row', 
    gap: 8,
    width: '100%',
  },
  filterBtn: { 
    flex: 1,
    paddingVertical: 10, 
    alignItems: 'center',
    borderRadius: 12, 
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1A1D1E',
    ...SHADOWS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  filterBtnActive: { 
    backgroundColor: COLORS.primary, 
  },
  filterText: { fontSize: 13, fontWeight: '800', color: '#1A1D1E' },
  filterTextActive: { color: '#1A1D1E' },

  // ===== STATS =====
  statsOuter: {
    marginBottom: 20,
  },
  statsRow: { 
    flexDirection: 'row', 
    gap: 16, 
    paddingRight: 16, 
  },
  statBadgeWrapper: {
    position: 'relative',
    minWidth: 150,
  },
  statBadgeShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: '#1A1D1E',
    borderRadius: 16,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1A1D1E',
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1A1D1E',
  },
  statTextWrap: {
    justifyContent: 'center',
  },
  statLabel: { fontSize: 12, color: '#666', fontWeight: '800', marginBottom: 2 },
  statValue: { fontSize: 18, fontWeight: '900' },

  // ===== TOGGLE =====
  metricToggleWrapper: { width: '100%', alignItems: 'center', marginBottom: 24 },
  toggleContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', 
    padding: 6, 
    borderRadius: 16, 
    position: 'relative',
    borderWidth: 2,
    borderColor: '#1A1D1E',
  },
  toggleIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1A1D1E',
  },
  toggleBtn: { 
    paddingVertical: 10, 
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  toggleText: { fontSize: 14, fontWeight: '800', color: '#666' },
  toggleTextActive: { color: '#1A1D1E' },

  // ===== CONTENT =====
  scrollContent: { 
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120 
  },
  grid: { 
    width: '100%', 
    flexDirection: 'column', 
    gap: 20, 
    alignSelf: 'center' 
  },
  
  // ===== CARD HEADER =====
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '900', color: '#1A1D1E' },
  cardSubtitle: { fontSize: 13, color: '#666', marginTop: 4, fontWeight: '600' },
  
  // ===== AI =====
  aiButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    backgroundColor: '#1A1D1E', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 12,
  },
  aiButtonActive: { backgroundColor: COLORS.primary, borderWidth: 1.5, borderColor: '#1A1D1E' },
  aiButtonText: { color: '#FFF', fontSize: 13, fontWeight: '900' },

  // ===== CHART =====
  chartScrollContent: {
    paddingRight: 8,
  },
  chartLoading: {
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12
  },
  chartLoadingText: {
    fontSize: 14,
    color: '#1A1D1E',
    fontWeight: '800'
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '700'
  },

  // ===== HISTORY =====
  historyList: { 
    marginTop: 8, 
  },
  historyRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 16, 
    borderBottomWidth: 1.5, 
    borderColor: '#F0F0F0',
    borderStyle: 'dashed',
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  historyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1A1D1E',
  },
  historyDateText: { fontSize: 16, color: '#1A1D1E', fontWeight: '900' },
  historyDayText: { fontSize: 13, color: '#666', fontWeight: '700', marginTop: 2, textTransform: 'capitalize' },
  historyRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  historyValue: { fontSize: 17, fontWeight: '900', color: '#1A1D1E' },
  
  trendWrap: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  trendText: { fontSize: 13, fontWeight: '900' }
});

export default TrackingScreen;