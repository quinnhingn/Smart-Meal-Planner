// src/navigation/RootNavigator.js
import React, { useState } from 'react'; // BỔ SUNG: import useState
import { View, Text, Pressable, Platform, useWindowDimensions, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BREAKPOINTS, COLORS } from '../constants/theme';

// BỔ SUNG: Import Zustand store
import { useAppStore } from '../store/useAppStore'; 

// BỔ SUNG: Import ĐẦY ĐỦ các màn hình
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PantryScreen from '../screens/PantryScreen';
import ShoppingScreen from '../screens/ShoppingScreen';

const Tab = createBottomTabNavigator();

const screens = [
  { name: 'Dashboard', component: DashboardScreen, label: 'Trang chủ', icon: 'home' },
  { name: 'Pantry', component: PantryScreen, label: 'Tủ lạnh', icon: 'fast-food' },
  { name: 'Shopping', component: ShoppingScreen, label: 'Đi chợ', icon: 'cart' },
];

// Thêm prop logout vào WebTopNavbar
const WebTopNavbar = ({ state, descriptors, navigation, logout }) => {
  return (
    <View style={styles.webNavbar}>
      <Text style={styles.logoText}>SmartMeal</Text>
      <View style={styles.navItems}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];
          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={[styles.navItem, { cursor: 'pointer' }]}
            >
              <Text style={[styles.navText, isFocused && styles.navTextActive]}>
                {options.title || route.name}
              </Text>
              {isFocused && <View style={styles.activeIndicator} />}
            </Pressable>
          );
        })}
        {/* Nút Đăng xuất cho Web */}
        <Pressable onPress={logout} style={{ marginLeft: 20, cursor: 'pointer' }}>
          <Text style={{ color: COLORS.danger, fontWeight: 'bold' }}>Thoát</Text>
        </Pressable>
      </View>
    </View>
  );
};

const RootNavigator = () => {
  const { width } = useWindowDimensions();
  const isWebLarge = Platform.OS === 'web' && width > BREAKPOINTS.mobileMax;

  // Lấy data từ Zustand
  const { token, hasProfile, logout } = useAppStore();
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'register'

  // AUTH GUARD: 1. Chưa có Token -> Luồng Đăng nhập / Đăng ký
  if (!token) {
    if (authScreen === 'register') {
      return <RegisterScreen onNavigateToLogin={() => setAuthScreen('login')} />;
    }
    return <LoginScreen onNavigateToRegister={() => setAuthScreen('register')} />;
  }

  // AUTH GUARD: 2. Có Token nhưng chưa setup profile -> Luồng Khảo sát
  if (token && !hasProfile) {
    return <OnboardingScreen />;
  }

  // AUTH GUARD: 3. Vào app chính
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={isWebLarge ? (props) => <WebTopNavbar {...props} logout={logout} /> : undefined}
        screenOptions={({ route }) => ({
          headerShown: !isWebLarge,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: 'gray',
          tabBarIcon: ({ focused, color, size }) => {
            const screen = screens.find(s => s.name === route.name);
            const iconName = focused ? screen.icon : `${screen.icon}-outline`;
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          // Thêm nút Đăng xuất trên Mobile Header để dễ test
          headerRight: () => (
            <Pressable onPress={logout} style={{ marginRight: 15 }}>
              <Ionicons name="log-out-outline" size={24} color={COLORS.danger} />
            </Pressable>
          ),
        })}
      >
        {screens.map(s => (
          <Tab.Screen 
            key={s.name} 
            name={s.name} 
            component={s.component} 
            options={{ title: s.label }} 
          />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  webNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 2,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  navItems: {
    flexDirection: 'row',
    gap: 30,
    alignItems: 'center', // Căn giữa các item trên navbar
  },
  navItem: {
    position: 'relative',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 16,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  navTextActive: {
    color: COLORS.primary,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -5,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  }
});

export default RootNavigator;