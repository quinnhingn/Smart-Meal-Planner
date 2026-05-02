// src/screens/DashboardScreen.js
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
import CustomButton from '../components/CustomButton';
import { COLORS, BREAKPOINTS } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

const DashboardScreen = () => {
  const { logout } = useAppStore();
  const { width: windowWidth } = useWindowDimensions();

  // Tính toán chiều rộng card động theo chuẩn SmartMeal
  const isWebLarge = Platform.OS === 'web' && windowWidth > (BREAKPOINTS?.mobileMax || 768);
  const actualCardWidth = isWebLarge ? 480 : windowWidth - 32;

  return (
    // ResponsiveContainer mặc định dùng nền xám/trắng nhạt cho Dashboard
    <ResponsiveContainer useImageBg={false}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <GlassCard style={{ width: actualCardWidth }} intensity={85}>
          {/* ÁP DỤNG INTERNAL PADDING: Toàn bộ nội dung bọc trong cardContent */}
          <View style={styles.cardContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Tổng quan SmartMeal</Text>
              <View style={styles.divider} />
            </View>

            <Text style={styles.subtitle}>
              Chào mừng Nhi trở lại! Hệ thống đang sẵn sàng theo dõi mục tiêu dinh dưỡng của bạn.
            </Text>
            
            <View style={styles.placeholderBox}>
               <Text style={styles.placeholderText}>
                 Tính năng Dashboard (Biểu đồ Calo, Macros) sẽ được xây dựng trong giai đoạn tiếp theo.
               </Text>
            </View>
            
            <CustomButton 
              title="Đăng xuất (Kiểm tra UI)" 
              type="primary" 
              onPress={logout} 
              style={styles.logoutBtn}
            />
          </View>
        </GlassCard>
      </ScrollView>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,              // Đảm bảo nội dung luôn căn giữa màn hình[cite: 1]
    justifyContent: 'center', 
    alignItems: 'center',     
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  cardContent: {
    padding: 32,              // Internal Padding đồng bộ
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
    marginBottom: 32,
  },
  placeholderText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  logoutBtn: {
    minWidth: 200,
    borderRadius: 12,
    // Tối ưu shadow cho Web[cite: 1]
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(76, 175, 80, 0.3)' }
    })
  }
});

export default DashboardScreen;