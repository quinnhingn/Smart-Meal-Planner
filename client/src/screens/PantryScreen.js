import React from 'react';
import { Text, StyleSheet } from 'react-native';
import ResponsiveContainer from '../components/ResponsiveContainer';
import GlassCard from '../components/GlassCard';

const PantryScreen = () => {
  return (
    <ResponsiveContainer style={styles.center}>
      <GlassCard style={styles.card}>
        <Text style={styles.title}>Tủ Lạnh Của Bạn</Text>
        <Text style={styles.text}>Nơi quản lý thực phẩm bằng AI (Giai đoạn 4).</Text>
      </GlassCard>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  center: { justifyContent: 'center', padding: 16 },
  card: { padding: 24, width: '100%', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  text: { fontSize: 16, color: '#666', textAlign: 'center' }
});

export default PantryScreen;