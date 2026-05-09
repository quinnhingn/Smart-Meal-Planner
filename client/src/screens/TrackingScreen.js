// src/screens/TrackingScreen.js
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Platform, 
  useWindowDimensions, Pressable, Animated, Easing, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

import ResponsiveContainer from '../components/ResponsiveContainer';
import { COLORS } from '../constants/theme';
import { MOCK_180D_TRACKING, MOCK_PROFILE_STATS, MOCK_AI_INSIGHTS } from '../utils/mockTrackingData';
import AiInsightCard from '../components/tracking/AiInsightCard';

const BREAKPOINT_MOBILE_MAX = 768;

const WEIGHT_FILTERS = [
  { id: '1m', label: '1 Tháng', limit: 30 },
  { id: '3m', label: '3 Tháng', limit: 90 },
  { id: '6m', label: '6 Tháng', limit: 180 },
];

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
    <Animated.View style={[styles.statBadge, { opacity: anim, transform: [{ translateY: anim.interpolate({
      inputRange: [0, 1], outputRange: [20, 0]
    })}] }]}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.statTextWrap}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
    </Animated.View>
  );
};

const TrendIndicator = ({ current, previous, isWeight }) => {
  if (previous == null) return <View style={{ width: 20 }} />;
  
  const diff = current - previous;
  const isPositive = diff > 0;
  const isNeutral = diff === 0;
  
  let color = '#888';
  let icon = 'remove';
  
  if (!isNeutral) {
    if (isWeight) {
      color = !isPositive ? COLORS.primary : '#FF6B6B';
      icon = !isPositive ? 'arrow-down' : 'arrow-up';
    } else {
      color = isPositive ? COLORS.primary : '#FF6B6B';
      icon = isPositive ? 'arrow-up' : 'arrow-down';
    }
  }

  return (
    <View style={styles.trendWrap}>
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
  const isWebLarge = Platform.OS === 'web' && width > BREAKPOINT_MOBILE_MAX;
  
  // STATE
  const [activeMetric, setActiveMetric] = useState('weight');
  const [weightTimeRange, setWeightTimeRange] = useState('1m'); 
  const [chartWidth, setChartWidth] = useState(width - 48);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toggleContainerWidth, setToggleContainerWidth] = useState(280);

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
  }, [activeMetric, weightTimeRange]);

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
  const TOGGLE_BTN_WIDTH = (toggleContainerWidth - 8) / 2;

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
    if (filterId === weightTimeRange) return;
    setIsLoading(true);
    setTimeout(() => {
      setWeightTimeRange(filterId);
      setIsLoading(false);
    }, 200);
  }, [weightTimeRange]);

  const filteredData = useMemo(() => {
    if (!isWeight) return MOCK_180D_TRACKING.slice(-7);
    const limit = WEIGHT_FILTERS.find(f => f.id === weightTimeRange)?.limit || 30;
    return MOCK_180D_TRACKING.slice(-limit).filter(item => item.isCheckInDay);
  }, [activeMetric, weightTimeRange]);

  const stats = useMemo(() => {
    const data = filteredData;
    if (data.length === 0) return null;
    const current = isWeight ? data[data.length - 1].weight : data[data.length - 1].calo;
    const previous = data.length > 1 
      ? (isWeight ? data[data.length - 2].weight : data[data.length - 2].calo) 
      : null;
    const target = isWeight ? MOCK_PROFILE_STATS.targetWeight : MOCK_PROFILE_STATS.targetCalories;
    const start = isWeight ? data[0].weight : data[0].calo;
    const totalChange = current - start;
    return { current, previous, target, start, totalChange, count: data.length };
  }, [filteredData, isWeight]);

  const chartLabels = useMemo(() => {
    const total = filteredData.length;
    if (total === 0) return [];
    const approxLabelWidth = isWebLarge ? 70 : 50;
    const maxLabels = Math.floor(chartWidth / approxLabelWidth);
    const step = Math.max(1, Math.ceil(total / maxLabels));
    
    return filteredData.map((item, index) => {
      const isLast = index === total - 1;
      const isFirst = index === 0;
      if (!isFirst && !isLast && index % step !== 0) return "";
      const d = new Date(item.date);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });
  }, [filteredData, chartWidth, isWebLarge]);

  const chartData = useMemo(() => filteredData.map(item => isWeight ? item.weight : item.calo), [filteredData, isWeight]);
  const targetValue = isWeight ? MOCK_PROFILE_STATS.targetWeight : MOCK_PROFILE_STATS.targetCalories;

  // Đảm bảo chart đủ rộng để scroll ngang trên mobile nếu cần
  const pointWidth = isWebLarge ? 70 : 55;
  const calculatedChartWidth = Math.max(chartWidth, filteredData.length * pointWidth);

  const chartConfig = useMemo(() => ({
    backgroundColor: '#FFF',
    backgroundGradientFrom: '#FFF',
    backgroundGradientTo: '#FFF',
    decimalPlaces: isWeight ? 1 : 0,
    color: (opacity = 1) => isWeight 
      ? `rgba(76, 175, 80, ${opacity})` 
      : `rgba(255, 152, 0, ${opacity})`,
    labelColor: () => `#9E9E9E`,
    propsForDots: { 
      r: '4', 
      strokeWidth: '2', 
      stroke: '#FFF',
      fill: isWeight ? COLORS.primary : '#FF9800'
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: '#F5F5F5',
      strokeDasharray: '0',
    },
    propsForLabels: {
      fontSize: 11,
      fontWeight: '600',
    },
    fillShadowGradient: isWeight ? COLORS.primary : '#FF9800',
    fillShadowGradientOpacity: 0.06,
  }), [isWeight]);

  const toggleTranslateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TOGGLE_BTN_WIDTH]
  });

  return (
    <ResponsiveContainer useImageBg={false}>
      
      {/* ===== HEADER: BỎ NÚT BACK ===== */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View>
            <Text style={styles.headerTitle}>Theo dõi chỉ số</Text>
            <Text style={styles.headerSubtitle}>
              {isWeight ? 'Tiến độ cân nặng & mục tiêu' : 'Năng lượng nạp vào hàng ngày'}
            </Text>
          </View>
        </View>

        <View style={styles.filterContainer}>
          {isWeight ? (
            WEIGHT_FILTERS.map(f => (
              <Pressable 
                key={f.id} 
                style={[styles.filterBtn, weightTimeRange === f.id && styles.filterBtnActive]} 
                onPress={() => handleFilterChange(f.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: weightTimeRange === f.id }}
              >
                <Text style={[styles.filterText, weightTimeRange === f.id && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            ))
          ) : (
            <View style={[styles.filterBtn, styles.filterBtnActive, { backgroundColor: 'transparent', elevation: 0 }]}>
              <Text style={[styles.filterText, { color: '#FF9800', fontWeight: '800' }]}>
                7 Ngày gần nhất
              </Text>
            </View>
          )}
        </View>
      </View>

      <Animated.ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          !isWebLarge && styles.scrollContentMobile
        ]} 
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* ===== STATS: MOBILE CUỘN NGANG ===== */}
        {stats && (
          <View style={styles.statsOuter}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.statsRow, 
                isWebLarge && styles.statsRowWeb
              ]}
            >
              <StatBadge 
                icon={isWeight ? "scale" : "flame"} 
                label="Hiện tại" 
                value={`${stats.current}${isWeight ? 'kg' : ' kcal'}`}
                color={isWeight ? COLORS.primary : '#FF9800'}
                delay={100}
              />
              <StatBadge 
                icon="swap-vertical" 
                label="Thay đổi" 
                value={`${stats.totalChange > 0 ? '+' : ''}${stats.totalChange.toFixed(isWeight ? 1 : 0)}${isWeight ? 'kg' : ''}`}
                color={stats.totalChange <= 0 ? COLORS.primary : '#FF6B6B'}
                delay={200}
              />
              <StatBadge 
                icon="flag" 
                label="Mục tiêu" 
                value={`${stats.target}${isWeight ? 'kg' : ' kcal'}`}
                color="#2196F3"
                delay={300}
              />
            </ScrollView>
          </View>
        )}

        {/* ===== METRIC TOGGLE ===== */}
        <View style={styles.metricToggleWrapper}>
          <View 
            style={styles.toggleContainer}
            onLayout={(e) => setToggleContainerWidth(e.nativeEvent.layout.width)}
          >
            <Animated.View style={[
              styles.toggleIndicator, 
              { width: TOGGLE_BTN_WIDTH, transform: [{ translateX: toggleTranslateX }] }
            ]} />
            <Pressable 
              style={[styles.toggleBtn, { width: TOGGLE_BTN_WIDTH }]} 
              onPress={() => handleMetricChange('weight')}
              accessibilityRole="tab"
              accessibilityState={{ selected: isWeight }}
            >
              <Ionicons 
                name="scale" 
                size={16} 
                color={isWeight ? '#FFF' : '#666'} 
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.toggleText, isWeight && styles.toggleTextActive]}>Cân nặng</Text>
            </Pressable>
            <Pressable 
              style={[styles.toggleBtn, { width: TOGGLE_BTN_WIDTH }]} 
              onPress={() => handleMetricChange('calories')}
              accessibilityRole="tab"
              accessibilityState={{ selected: !isWeight }}
            >
              <Ionicons 
                name="restaurant" 
                size={16} 
                color={!isWeight ? '#FFF' : '#666'} 
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.toggleText, !isWeight && styles.toggleTextActive]}>Calo</Text>
            </Pressable>
          </View>
        </View>

        {/* ===== MAIN GRID ===== */}
        <View style={[styles.grid, isWebLarge && styles.gridWeb]}>
          
          {/* CHART CARD */}
          <View 
            style={[styles.card, isWebLarge && styles.cardWeb, { flex: isWebLarge ? 1.5 : undefined }]} 
            onLayout={(e) => setChartWidth(e.nativeEvent.layout.width - (isWebLarge ? 56 : 40))}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>
                  {isWeight ? "Biểu đồ cân nặng" : "Biểu đồ calo"}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {stats ? `${stats.count} điểm dữ liệu` : 'Không có dữ liệu'}
                </Text>
              </View>
              
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Pressable 
                  style={[styles.aiButton, showAiAnalysis && styles.aiButtonActive]} 
                  onPress={() => setShowAiAnalysis(!showAiAnalysis)}
                  accessibilityRole="button"
                  accessibilityLabel="Phân tích AI"
                >
                  <Animated.View style={{ transform: [{ rotate: aiRotateAnim.interpolate({
                    inputRange: [0, 1], outputRange: ['0deg', '180deg']
                  })}] }}>
                    <Ionicons name="sparkles" size={16} color="#FFF" />
                  </Animated.View>
                  <Text style={styles.aiButtonText}>AI</Text>
                </Pressable>
              </Animated.View>
            </View>

            {isLoading ? (
              <View style={styles.chartLoading}>
                <ActivityIndicator size="large" color={isWeight ? COLORS.primary : '#FF9800'} />
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
                    <LineChart
                      data={{
                        labels: chartLabels,
                        datasets: [
                          { 
                            data: chartData, 
                            color: () => isWeight ? COLORS.primary : '#FF9800', 
                            strokeWidth: 3 
                          },
                          { 
                            data: chartLabels.map(() => targetValue), 
                            color: () => 'rgba(244, 67, 54, 0.25)', 
                            strokeWidth: 2, 
                            withDots: false 
                          }
                        ],
                        legend: ["Thực tế", "Mục tiêu"]
                      }}
                      width={calculatedChartWidth}
                      height={260}
                      chartConfig={chartConfig}
                      bezier
                      fromZero={!isWeight}
                      yAxisInterval={1}
                      style={{ borderRadius: 16 }}
                      segments={5}
                      formatYLabel={(y) => isWeight ? `${parseFloat(y).toFixed(1)}` : `${Math.round(y)}`}
                    />
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
                  overflow: 'hidden'
                }}>
                  <AiInsightCard 
                    metric={activeMetric} 
                    data={isWeight ? MOCK_AI_INSIGHTS.weight : MOCK_AI_INSIGHTS.calories} 
                  />
                </Animated.View>
              </>
            )}
          </View>

          {/* HISTORY CARD */}
          <View style={[styles.card, isWebLarge && styles.cardWeb, { flex: isWebLarge ? 1 : undefined }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Lịch sử gần đây</Text>
                <Text style={styles.cardSubtitle}>7 lần đo gần nhất</Text>
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
                        { backgroundColor: isWeight ? COLORS.primary + '12' : '#FF980012' }
                      ]}>
                        <Ionicons 
                          name={isWeight ? "scale" : "restaurant"} 
                          size={16} 
                          color={isWeight ? COLORS.primary : '#FF9800'} 
                        />
                      </View>
                      <View>
                        <Text style={styles.historyDateText}>
                          {new Date(item.date).toLocaleDateString('vi-VN', { 
                            day: '2-digit', 
                            month: '2-digit',
                            year: '2-digit'
                          })}
                        </Text>
                        <Text style={styles.historyDayText}>
                          {new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short' })}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.historyRight}>
                      <TrendIndicator 
                        current={currentVal} 
                        previous={prevVal} 
                        isWeight={isWeight} 
                      />
                      <Text style={[
                        styles.historyValue, 
                        { color: isWeight ? '#1A1D1E' : '#FF9800' }
                      ]}>
                        {isWeight ? `${item.weight} kg` : `${item.calo} kcal`}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  // ===== HEADER =====
  header: { 
    flexDirection: Platform.OS === 'web' ? 'row' : 'column', 
    justifyContent: 'space-between', 
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
    paddingTop: Platform.OS === 'web' ? 20 : 16,
    paddingBottom: 12,
    backgroundColor: 'transparent',
    gap: 16 
  },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#1A1D1E', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: '#888', marginTop: 2, fontWeight: '500' },
  
  filterContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF',
    padding: 4, 
    borderRadius: 24,
    minHeight: 44,
    alignItems: 'center',
    ...Platform.select({ web: { boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }, default: { elevation: 2 } })
  },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  filterBtnActive: { backgroundColor: '#F0F2F5' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#888' },
  filterTextActive: { color: COLORS.primary, fontWeight: '800' },

  // ===== STATS =====
  statsOuter: {
    marginBottom: 20,
    marginLeft: Platform.OS === 'web' ? 0 : -4, // Mobile: sát viền hơn
  },
  statsRow: { 
    flexDirection: 'row', 
    gap: 12, 
    paddingRight: 16, // Cho scroll ngang mượt
  },
  statsRowWeb: {
    paddingRight: 0,
    width: '100%',
    maxWidth: 640,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    minWidth: 140, // Đảm bảo không bị ép quá nhỏ
    ...Platform.select({ web: { boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }, default: { elevation: 2 } })
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statTextWrap: {
    justifyContent: 'center',
  },
  statLabel: { fontSize: 12, color: '#888', fontWeight: '600', marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: '900' },

  // ===== TOGGLE =====
  metricToggleWrapper: { width: '100%', alignItems: 'center', marginBottom: 24 },
  toggleContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    padding: 4, 
    borderRadius: 24, 
    position: 'relative',
    ...Platform.select({ web: { boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }, default: { elevation: 2 } }) 
  },
  toggleIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    ...Platform.select({ web: { boxShadow: '0 4px 12px rgba(76,175,80,0.3)' }, default: { elevation: 4 } })
  },
  toggleBtn: { 
    paddingVertical: 12, 
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  toggleText: { fontSize: 14, fontWeight: '700', color: '#555' },
  toggleTextActive: { color: '#FFF' },

  // ===== CONTENT =====
  scrollContent: { 
    padding: 24, 
    paddingBottom: 100 
  },
  scrollContentMobile: {
    padding: 12, // Mobile: sát viền hơn
    paddingBottom: 100,
  },
  grid: { 
    width: '100%', 
    maxWidth: 1400, // Web: mở rộng tối đa
    flexDirection: 'column', 
    gap: 16, 
    alignSelf: 'center' 
  },
  gridWeb: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: 32 // Web: gap rộng hơn
  },
  
  // ===== CARD =====
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 28, // Bo góc lớn hơn giống ảnh
    padding: 20, // Mobile: mở rộng nội dung
    borderWidth: 1, 
    borderColor: '#F0F0F0',
    ...Platform.select({ web: { boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }, default: { elevation: 2 } })
  },
  cardWeb: {
    padding: 32, // Web: mở rộng padding
    borderRadius: 32,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#1A1D1E' },
  cardSubtitle: { fontSize: 12, color: '#AAA', marginTop: 2, fontWeight: '500' },
  
  // ===== AI =====
  aiButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    backgroundColor: '#8E24AA', 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderRadius: 14,
    ...Platform.select({ web: { boxShadow: '0 4px 12px rgba(142,36,170,0.3)' }, default: { elevation: 3 } })
  },
  aiButtonActive: { backgroundColor: '#6A1B9A' },
  aiButtonText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

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
    color: '#888',
    fontWeight: '600'
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12
  },
  emptyText: {
    fontSize: 14,
    color: '#AAA',
    fontWeight: '600'
  },

  // ===== HISTORY =====
  historyList: { 
    marginTop: 12, 
  },
  historyRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 14, 
    paddingHorizontal: 4,
    borderBottomWidth: 1, 
    borderColor: '#F5F5F5',
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  historyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  historyDateText: { fontSize: 15, color: '#1A1D1E', fontWeight: '800' },
  historyDayText: { fontSize: 12, color: '#AAA', fontWeight: '500', marginTop: 1 },
  historyRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  historyValue: { fontSize: 16, fontWeight: '900' },
  
  trendWrap: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 2,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  trendText: { fontSize: 12, fontWeight: '800' }
});

export default TrackingScreen;