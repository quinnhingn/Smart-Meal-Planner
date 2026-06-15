// src/components/navigation/SidebarMenu.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Dimensions, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { COLORS } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

const SidebarMenu = () => {
  const { isDrawerOpen, setDrawerOpen, logout, userProfile } = useAppStore();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isDrawerOpen) {
      setIsRendered(true);
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 250, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => {
        setIsRendered(false);
      });
    }
  }, [isDrawerOpen]);

  const handleNavigate = (screen) => {
    setDrawerOpen(false);
    setTimeout(() => {
      navigation.navigate(screen);
    }, 250);
  };

  const handleLogout = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      logout();
    }, 250);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Chỉ bắt đầu nhận diện gesture khi vuốt ngang đủ mạnh sang trái
        return gestureState.dx < -15 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          slideAnim.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50 || gestureState.vx < -0.5) {
          setDrawerOpen(false); 
        } else {
          // Bật lại nếu kéo không đủ mạnh
          Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        }
      }
    })
  ).current;

  if (!isRendered) return null; 

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setDrawerOpen(false)} />
      </Animated.View>

      <Animated.View 
        {...panResponder.panHandlers}
        style={[
          styles.drawer, 
          { transform: [{ translateX: slideAnim }], paddingTop: Math.max(insets.top, 20) }
        ]}
      >
        {/* Header Profile */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userProfile?.name?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>{userProfile?.name || 'Người dùng'}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>{userProfile?.email || 'user@example.com'}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]} onPress={() => handleNavigate('Profile')}>
            <Ionicons name="person-outline" size={24} color="#1A1D1E" />
            <Text style={styles.menuText}>Hồ sơ cá nhân</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]} onPress={() => handleNavigate('Tracking')}>
            <Ionicons name="bar-chart-outline" size={24} color="#1A1D1E" />
            <Text style={styles.menuText}>Báo cáo</Text>
          </Pressable>
        </View>

        {/* Đăng xuất - Cố định ở đáy */}
        <Pressable style={({ pressed }) => [styles.logoutBtn, pressed && styles.menuItemPressed]} onPress={handleLogout}>
          <View style={styles.logoutIconWrap}>
            <Ionicons name="log-out" size={16} color="#FFF" />
          </View>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>

      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999, // Topmost level
    elevation: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 24,
    marginBottom: 24,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8F5E9',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1D1E',
  },
  userEmail: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  menuContainer: {
    flex: 1,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  menuItemPressed: {
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1D1E',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  logoutIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF5252',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF5252',
  }
});

export default SidebarMenu;
