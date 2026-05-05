// src/components/navigation/CustomSidebar.js
import React, { useEffect, useRef, useState } from 'react';
import { 
  View, Text, StyleSheet, Pressable, Platform, 
  Animated, Dimensions, TouchableWithoutFeedback, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';

const DRAWER_WIDTH = 280;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// 1. NHÓM TÍNH NĂNG CHÍNH (Chỉ bung ra trên Web)
const MAIN_TABS = [
  { id: 'home', icon: 'home-outline', title: 'Trang chủ', route: 'Dashboard' },
  { id: 'pantry', icon: 'fast-food-outline', title: 'Tủ lạnh', route: 'Pantry' },
  { id: 'recipe', icon: 'restaurant-outline', title: 'Gợi ý món ăn', route: 'Recipe' },
  { id: 'shopping', icon: 'cart-outline', title: 'Đi chợ', route: 'Shopping' },
];

// 2. NHÓM CÁ NHÂN (Web & Mobile đều hiện)
const SECONDARY_TABS = [
  { id: 'saved', icon: 'bookmark-outline', title: 'Công thức đã lưu', route: 'SavedRecipes' },
  { id: 'stats', icon: 'body-outline', title: 'Báo cáo cơ thể', route: 'BodyStats' },
  { id: 'settings', icon: 'settings-outline', title: 'Cài đặt', route: 'Settings' },
  { id: 'help', icon: 'help-circle-outline', title: 'Trợ giúp & Phản hồi', route: 'Help' },
];

const CustomSidebar = ({ isWebLarge, navigation }) => {
  const { isDrawerOpen, setDrawerOpen, logout } = useAppStore();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current; 
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  
  const [activeRoute, setActiveRoute] = useState('Dashboard'); // Trạng thái đang chọn

  // Xử lý Animation màng kéo Mobile
  useEffect(() => {
    if (isWebLarge) return; 

    if (isDrawerOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 250, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true })
      ]).start();
    }
  }, [isDrawerOpen, isWebLarge]);

  const handleNavigate = (route) => {
    setActiveRoute(route);
    setDrawerOpen(false); 
    // Kích hoạt chuyển trang thực tế
    if(navigation) navigation.navigate(route); 
  };

  // Hàm render dùng chung cho các item
  const renderMenuItem = (item) => {
    const isActive = activeRoute === item.route;
    return (
      <Pressable 
        key={item.id} 
        style={({ hovered }) => [
          styles.menuItem,
          isActive && styles.menuItemActive,
          Platform.OS === 'web' && hovered && !isActive && styles.menuItemHovered
        ]}
        onPress={() => handleNavigate(item.route)}
      >
        <Ionicons 
          name={isActive ? item.icon.replace('-outline', '') : item.icon} 
          size={22} 
          color={isActive ? COLORS.primary : '#555'} 
          style={styles.menuIcon} 
        />
        <Text style={[styles.menuTitle, isActive && styles.menuTitleActive]}>
          {item.title}
        </Text>
      </Pressable>
    );
  };

  const SidebarContent = () => (
    <View style={styles.sidebarInner}>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* ================= MOBILE HEADER ================= */}
        {!isWebLarge && (
          <>
            <View style={styles.mobileLogoWrapper}>
              <Ionicons name="leaf" size={28} color={COLORS.primary} style={styles.logoIcon} />
              <Text style={styles.mobileLogoText}>SmartMeal</Text>
            </View>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>N</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>Quỳnh Nhi</Text>
                <Text style={styles.userBadge}>🔥 Mục tiêu: Giảm cân</Text>
              </View>
            </View>
            <View style={styles.divider} />
          </>
        )}

        {/* ================= NÚT UPLOAD AI (CHỈ HIỆN TRÊN WEB) ================= */}
        {isWebLarge && (
          <Pressable style={styles.uploadBtn} onPress={() => alert('Kích hoạt Camera/Upload AI')}>
            <Ionicons name="camera" size={22} color="#FFF" />
            <Text style={styles.uploadBtnText}>Quét ảnh AI</Text>
          </Pressable>
        )}

        {/* ================= NHÓM MENU CHÍNH (CHỈ HIỆN TRÊN WEB) ================= */}
        {isWebLarge && (
          <View style={styles.menuSection}>
            <Text style={styles.sectionLabel}>TÍNH NĂNG CHÍNH</Text>
            {MAIN_TABS.map(renderMenuItem)}
          </View>
        )}

        {/* ================= NHÓM CÁ NHÂN ================= */}
        <View style={styles.menuSection}>
          {isWebLarge && <Text style={styles.sectionLabel}>CÁ NHÂN</Text>}
          {!isWebLarge && renderMenuItem(MAIN_TABS[0])} {/* Mobile vẫn cần nút Trang chủ */}
          {SECONDARY_TABS.map(renderMenuItem)}
        </View>
      </ScrollView>

      {/* FOOTER ĐĂNG XUẤT */}
      <Pressable 
        style={({ hovered }) => [
          styles.logoutBtn,
          Platform.OS === 'web' && hovered && { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
        ]} 
        onPress={logout}
      >
        <Ionicons name="log-out-outline" size={22} color={COLORS.danger} style={styles.menuIcon} />
        <Text style={[styles.menuTitle, { color: COLORS.danger, fontWeight: '700' }]}>Đăng xuất</Text>
      </Pressable>
    </View>
  );

  // RETURN CHO WEB (Cố định)
  if (isWebLarge) {
    return (
      <View style={styles.webSidebarContainer}>
        <View style={styles.logoWrapper}>
          <Ionicons name="leaf" size={36} color={COLORS.primary} style={styles.logoIcon} />
          <Text style={styles.webLogo}>SmartMeal</Text>
        </View>
        <SidebarContent />
      </View>
    );
  }

  // RETURN CHO MOBILE (Màng kéo Overlay)
  return (
    <View style={styles.mobileOverlayWrapper} pointerEvents={isDrawerOpen ? 'auto' : 'none'}>
      <TouchableWithoutFeedback onPress={() => setDrawerOpen(false)}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.mobileDrawer, { transform: [{ translateX: slideAnim }] }]}>
        <SidebarContent />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Web Styles
  webSidebarContainer: { width: DRAWER_WIDTH, height: '100%', backgroundColor: '#FFFFFF', borderRightWidth: 1, borderColor: 'rgba(0,0,0,0.05)', paddingTop: 32, zIndex: 10 },
  logoWrapper: { paddingHorizontal: 24, marginBottom: 32, flexDirection: 'row', alignItems: 'center' },
  logoIcon: { marginBottom: 4, transform: [{ rotate: '-15deg' }] },
  webLogo: { fontSize: 28, fontWeight: '900', color: COLORS.primary, marginLeft: 8 },
  
  // Mobile Styles
  mobileOverlayWrapper: { ...StyleSheet.absoluteFillObject, zIndex: 9999 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  mobileDrawer: { position: 'absolute', top: 0, bottom: 0, left: 0, width: DRAWER_WIDTH, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? 40 : 50, shadowColor: '#000', shadowOffset: { width: 5, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 15 },
  mobileLogoWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, marginBottom: 24, marginTop: 8 },
  mobileLogoText: { fontSize: 24, fontWeight: '900', color: COLORS.primary, marginLeft: 8 },
  
  // Shared Styles
  sidebarInner: { flex: 1, paddingHorizontal: 16, paddingBottom: 24 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 8 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(76, 175, 80, 0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '800', color: '#1A1D1E' },
  userBadge: { fontSize: 12, color: '#FF9800', fontWeight: '600', marginTop: 4 },
  
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 16, marginHorizontal: 8 },
  
  // Menu Section Styles
  menuSection: { marginBottom: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#999', marginLeft: 12, marginBottom: 8, marginTop: 8, letterSpacing: 1 },
  
  // Nút Upload Web
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, marginBottom: 24, marginHorizontal: 4, gap: 8 },
  uploadBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },

  // Menu Item Styles
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 4 },
  menuItemHovered: { backgroundColor: 'rgba(0,0,0,0.02)' },
  menuItemActive: { backgroundColor: 'rgba(76, 175, 80, 0.1)' },
  menuIcon: { marginRight: 16 },
  menuTitle: { fontSize: 16, fontWeight: '600', color: '#555' },
  menuTitleActive: { color: COLORS.primary, fontWeight: '800' },
  
  logoutBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginTop: 8 },
});

export default CustomSidebar;