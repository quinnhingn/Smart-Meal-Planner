import React from 'react';
import { Text, StyleSheet } from 'react-native';
import ResponsiveContainer from '../components/ResponsiveContainer';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';

const DashboardScreen = () => {
  return (
    <ResponsiveContainer style={styles.center}>
      <GlassCard style={styles.card}>
        <Text style={styles.title}>Tổng quan SmartMeal</Text>
        <Text style={styles.text}>Tính năng Dashboard sẽ được xây dựng sau.</Text>
        <CustomButton title="Nút test UI" onPress={() => alert('Nút chạy tốt!')} />
      </GlassCard>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  center: { justifyContent: 'center', padding: 16 },
  card: { padding: 24, width: '100%', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  text: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 }
});

export default DashboardScreen;