// src/components/navigation/CustomSidebar.js
import React, { useEffect, useRef, useState } from 'react';
import { 
  View, Text, StyleSheet, Pressable, Platform, Image,
  Animated, Dimensions, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';

const DRAWER_WIDTH = 280;

const MAIN_TABS = [
  { id: 'home', icon: 'home-outline', title: 'Trang chủ', route: 'Dashboard' },
  { id: 'pantry', icon: 'fast-food-outline', title: 'Tủ lạnh', route: 'Pantry' },
  { id: 'recipe', icon: 'restaurant-outline', title: 'Gợi ý món ăn', route: 'Recipe' },
  { id: 'diary', icon: 'book-outline', title: 'Nhật ký ăn uống', route: 'Diary' },
];

const SECONDARY_TABS = [
  { id: 'profile', icon: 'person-outline', title: 'Hồ sơ cá nhân', route: 'Profile' },
  { id: 'saved', icon: 'bookmark-outline', title: 'Công thức đã lưu', route: 'SavedRecipes' },
  { id: 'stats', icon: 'trending-up-outline', title: 'Thống kê & Theo dõi', route: 'Tracking' }, 
  { id: 'settings', icon: 'settings-outline', title: 'Cài đặt', route: 'Settings' },
  { id: 'help', icon: 'help-circle-outline', title: 'Trợ giúp & Phản hồi', route: 'Help' },
];

const CustomSidebar = ({ isWebLarge, navigation }) => {
  const { isDrawerOpen, setDrawerOpen, logout, userProfile } = useAppStore();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current; 
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  
  const [activeRoute, setActiveRoute] = useState('Dashboard');

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

    // Các route nằm trong Tab Navigator (MainTabs)
  const TAB_ROUTES = ['Dashboard', 'Diary', 'Pantry', 'Recommend'];

  const handleNavigate = (route) => {
    setActiveRoute(route);
    setDrawerOpen(false);
    
    if (!navigation) return;

    // Nếu route là tab screen → navigate qua MainTabs
    if (TAB_ROUTES.includes(route)) {
      navigation.navigate('MainTabs', { screen: route });
    } else {
      // Stack screen (Profile, Tracking...) → navigate trực tiếp
      navigation.navigate(route);
    }
  };

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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {!isWebLarge && (
          <View>
            <View style={styles.mobileLogoWrapper}>
              <Ionicons name="leaf" size={28} color={COLORS.primary} style={styles.logoIcon} />
              <Text style={styles.mobileLogoText}>SmartMeal</Text>
            </View>
            {/* THAY VIEW THÀNH PRESSABLE VÀ GẮN SỰ KIỆN */}
            <Pressable style={styles.profileHeader} onPress={() => handleNavigate('Profile')}>
              <View style={styles.avatar}>
                {/* MERGE LOGIC: Ưu tiên ảnh, fallback lấy chữ cái đầu tên */}
                {userProfile?.avatarUri ? (
                  <Image source={{ uri: userProfile.avatarUri }} style={{width: 50, height: 50, borderRadius: 25}} />
                ) : (
                  <Text style={styles.avatarText}>
                    {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                  </Text>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userProfile?.name || 'Người dùng'}</Text>
                <Text style={styles.userBadge}>
                  🔥 Mục tiêu: {
                    userProfile?.goal === 'lose_weight' ? 'Giảm cân' :
                    userProfile?.goal === 'maintain' ? 'Giữ dáng' :
                    userProfile?.goal === 'gain_muscle' ? 'Tăng cơ' : 'Sức khỏe'
                  }
                </Text>
              </View>
            </Pressable>
            <View style={styles.divider} />
          </View>
        )}

        {/* ================= NÚT UPLOAD AI (CHỈ HIỆN TRÊN WEB) ================= */}
        {isWebLarge && (
          <Pressable 
            style={styles.uploadBtn} 
            onPress={() => {
              if (navigation) navigation.navigate('Scan', { mode: 'diary' });
            }}
          >
            <Ionicons name="camera" size={22} color="#FFF" />
            <Text style={styles.uploadBtnText}>Quét ảnh AI</Text>
          </Pressable>
        )}

        {isWebLarge && (
          <View style={styles.menuSection}>
            <Text style={styles.sectionLabel}>TÍNH NĂNG CHÍNH</Text>
            {MAIN_TABS.map(renderMenuItem)}
          </View>
        )}

        <View style={styles.menuSection}>
          {isWebLarge ? (
            <Text style={styles.sectionLabel}>CÁ NHÂN</Text>
          ) : null}
          
          {!isWebLarge ? renderMenuItem(MAIN_TABS[0]) : null}
          
          {SECONDARY_TABS.map(renderMenuItem)}
        </View>
      </ScrollView>

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

  // SỬA LỖI POINTER EVENTS TẠI ĐÂY
  return (
    <View style={[styles.mobileOverlayWrapper, { pointerEvents: isDrawerOpen ? 'auto' : 'none' }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => setDrawerOpen(false)}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </Pressable>

      <Animated.View style={[styles.mobileDrawer, { transform: [{ translateX: slideAnim }] }]}>
        <SidebarContent />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  webSidebarContainer: { width: DRAWER_WIDTH, height: '100%', backgroundColor: '#FFFFFF', borderRightWidth: 1, borderColor: 'rgba(0,0,0,0.05)', paddingTop: 32, zIndex: 10 },
  logoWrapper: { paddingHorizontal: 24, marginBottom: 32, flexDirection: 'row', alignItems: 'center' },
  logoIcon: { marginBottom: 4, transform: [{ rotate: '-15deg' }] },
  webLogo: { fontSize: 28, fontWeight: '900', color: COLORS.primary, marginLeft: 8 },
  
  mobileOverlayWrapper: { ...StyleSheet.absoluteFillObject, zIndex: 9999 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  
  // SỬA LỖI SHADOW TẠI ĐÂY
  mobileDrawer: { 
    position: 'absolute', top: 0, bottom: 0, left: 0, width: DRAWER_WIDTH, backgroundColor: '#FFFFFF', 
    paddingTop: Platform.OS === 'android' ? 40 : 50, 
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 5, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 15 },
      web: { boxShadow: '5px 0px 15px rgba(0,0,0,0.1)' }
    })
  },

  mobileLogoWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, marginBottom: 24, marginTop: 8 },
  mobileLogoText: { fontSize: 24, fontWeight: '900', color: COLORS.primary, marginLeft: 8 },
  
  sidebarInner: { flex: 1, paddingHorizontal: 16, paddingBottom: 24 },
  scrollContent: { paddingBottom: 20 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 8 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(76, 175, 80, 0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '800', color: '#1A1D1E' },
  userBadge: { fontSize: 12, color: '#FF9800', fontWeight: '600', marginTop: 4 },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 16, marginHorizontal: 8 },
  
  menuSection: { marginBottom: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#999', marginLeft: 12, marginBottom: 8, marginTop: 8, letterSpacing: 1 },
  
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, marginBottom: 24, marginHorizontal: 4, gap: 8 },
  uploadBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },

  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 4 },
  menuItemHovered: { backgroundColor: 'rgba(0,0,0,0.02)' },
  menuItemActive: { backgroundColor: 'rgba(76, 175, 80, 0.1)' },
  menuIcon: { marginRight: 16 },
  menuTitle: { fontSize: 16, fontWeight: '600', color: '#555' },
  menuTitleActive: { color: COLORS.primary, fontWeight: '800' },
  
  logoutBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginTop: 8 },
});

export default CustomSidebar;