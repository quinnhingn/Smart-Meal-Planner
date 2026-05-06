// src/components/dashboard/DashboardWeeklyChart.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from '../GlassCard';

const CHART_HEIGHT = 120; // Cố định chiều cao vùng vẽ biểu đồ

const DashboardWeeklyChart = ({ data }) => {
  return (
    <GlassCard style={styles.cardWrapper} intensity={60}>
      <View style={styles.cardContent}>
        <Text style={styles.sectionTitle}>Phân tích 7 ngày qua</Text>
        
        <View style={styles.chartContainer}>
          {data.map((item) => {
            // Logic tính toán phần trăm chiều cao cột
            const fillPercentage = item.target > 0 ? Math.min((item.kcal / item.target) * 100, 100) : 0;
            const isOver = item.kcal > item.target;
            const barColor = isOver ? '#F44336' : '#4CAF50'; // Đỏ nếu vượt, Xanh nếu đạt/chưa đạt

            return (
              <View key={item.id} style={styles.barColumn}>
                {/* Vùng vẽ cột */}
                <View style={styles.barBackground}>
                  <View 
                    style={[
                      styles.barFill, 
                      { height: `${fillPercentage}%`, backgroundColor: barColor }
                    ]} 
                  />
                </View>
                {/* Tên thứ trong tuần */}
                <Text style={styles.dayText}>{item.day}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  cardWrapper: { width: '100%' },
  cardContent: {
    padding: 24,
    width: '100%',
    backgroundColor: 'transparent',
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1D1E', marginBottom: 20 },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: CHART_HEIGHT + 30, // Chừa không gian cho Text bên dưới
  },
  barColumn: {
    alignItems: 'center',
    flex: 1, // Chia đều không gian cho 7 cột
  },
  barBackground: {
    height: CHART_HEIGHT,
    width: 12, // Độ rộng cột
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
    justifyContent: 'flex-end', // Đẩy fill xuống đáy
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  dayText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  }
});

export default DashboardWeeklyChart;