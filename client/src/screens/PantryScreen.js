// src/screens/PantryScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Platform, 
  useWindowDimensions 
} from 'react-native';
import ResponsiveContainer from '../components/ResponsiveContainer';
import GlassCard from '../components/GlassCard';
import { COLORS, BREAKPOINTS } from '../constants/theme';

const PantryScreen = () => {
  const { width: windowWidth } = useWindowDimensions();

  const isWebLarge = Platform.OS === 'web' && windowWidth > (BREAKPOINTS?.mobileMax || 768);
  const actualCardWidth = isWebLarge ? 480 : windowWidth - 32;

  return (
    <ResponsiveContainer useImageBg={false}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GlassCard style={{ width: actualCardWidth }} intensity={85}>
          <View style={styles.cardContent}>
            
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.title}>Tủ Lạnh Của Bạn</Text>
              <View style={styles.divider} />
            </View>

            <Text style={styles.subtitle}>
              Quản lý thực phẩm thông minh với AI. Theo dõi hạn sử dụng và gợi ý món ăn.
            </Text>

            {/* PLACEHOLDER */}
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderText}>
                Tính năng Pantry AI (Scan thực phẩm, nhận diện, tracking hạn dùng) sẽ được triển khai ở Giai đoạn 4.
              </Text>
            </View>

          </View>
        </GlassCard>
      </ScrollView>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  cardContent: {
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1A1D1E',
    textAlign: 'center',
    ...Platform.select({
      web: { textShadow: '0px 1px 4px rgba(0,0,0,0.05)' }
    })
  },
  divider: {
    height: 4,
    width: 60,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: '500',
  },
  placeholderBox: {
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PantryScreen;