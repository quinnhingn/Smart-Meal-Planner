// src/navigation/RootNavigator.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions,
  Animated,
  Easing,
} from 'react-native';

import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import PantryScreen from '../screens/PantryScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ScanCameraScreen from '../screens/ScanCameraScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TrackingScreen from '../screens/TrackingScreen';
import DiaryScreen from '../screens/DiaryScreen';
import RecipesScreen from '../screens/RecipesScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';

// Layout
import CustomSidebar from '../components/navigation/CustomSidebar';
import WebTopbar from '../components/navigation/WebTopbar';
import MobileTopbar from '../components/navigation/MobileTopbar';
import CustomToast from '../components/common/CustomToast';

const { COLORS, BREAKPOINTS } = require('../constants/theme');
const { useAppStore } = require('../store/useAppStore');

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

//////////////////////////////////////////////////////////
// CUSTOM TAB BAR (MOBILE) — 5 TABS
//////////////////////////////////////////////////////////
const TAB_CONFIG = [
  { name: 'Dashboard', label: 'Trang chủ', icon: 'home', iconOutline: 'home-outline' },
  { name: 'Diary',    label: 'Nhật ký',  icon: 'book',  iconOutline: 'book-outline' },
  { name: 'Scan',     label: null,       icon: 'camera', isCenter: true },
  { name: 'Pantry',   label: 'Tủ lạnh',  icon: 'fast-food', iconOutline: 'fast-food-outline' },
  { name: 'Recipes',  label: 'Công thức', icon: 'restaurant', iconOutline: 'restaurant-outline' },
];

const CustomTabBar = ({ state, navigation }) => {
  const { tabBarVisible, setTabBarVisible } = useAppStore();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTabBarVisible(true);
  }, [state.index]);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: tabBarVisible ? 0 : 120,
      duration: 250,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
  }, [tabBarVisible]);

  // ===== FIX: ẨN TAB BAR TRÊN WEB =====
  if (Platform.OS === 'web') return null;

  const currentRoute = state.routes[state.index]?.name;
  if (currentRoute === 'Scan') return null;

  return (
    <Animated.View
      style={[
        styles.tabBarContainer,
        { paddingBottom: insets.bottom, transform: [{ translateY }] },
      ]}
    >
      <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.tabBarInner}>
        {TAB_CONFIG.map((tab) => {
          const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
          const isFocused = state.index === routeIndex;

          if (tab.isCenter) {
            return (
              <Pressable
                key={tab.name}
                style={styles.centerTab}
                onPress={() => navigation.navigate('Scan', { mode: 'diary' })}
              >
                <View style={styles.scanButton}>
                  <Ionicons name={tab.icon} size={26} color="#FFF" />
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={tab.name}
              style={styles.tabItem}
              onPress={() => {
                if (!isFocused) navigation.navigate(tab.name);
              }}
            >
              <Ionicons
                name={isFocused ? tab.icon : tab.iconOutline}
                size={22}
                color={isFocused ? COLORS.primary : '#888'}
              />
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
};

//////////////////////////////////////////////////////////
// MAIN TABS — 5 screen
//////////////////////////////////////////////////////////
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false }}
    tabBar={(props) => <CustomTabBar {...props} />}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Diary"     component={DiaryScreen} />
    <Tab.Screen name="Scan"      component={ScanCameraScreen} />
    <Tab.Screen name="Pantry"    component={PantryScreen} />
    <Tab.Screen name="Recipes"   component={RecipesScreen} />
  </Tab.Navigator>
);

//////////////////////////////////////////////////////////
// ROOT STACK — chứa thêm Profile, Tracking, RecipeDetail
//////////////////////////////////////////////////////////
const RootStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs"     component={MainTabs} />
    <Stack.Screen name="Profile"      component={ProfileScreen} />
    <Stack.Screen name="Tracking"     component={TrackingScreen} />
    <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
    {/* Thêm các screen sidebar khác vào đây nếu cần */}
  </Stack.Navigator>
);

//////////////////////////////////////////////////////////
// MAIN LAYOUT
//////////////////////////////////////////////////////////
const MainLayout = ({ currentRoute }) => {
  const { width } = useWindowDimensions();
  const isWebLarge =
    Platform.OS === 'web' &&
    width > (BREAKPOINTS?.mobileMax || 768);

  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {isWebLarge ? (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <CustomSidebar isWebLarge navigation={navigation} />
          <View style={{ flex: 1, flexDirection: 'column' }}>
            <WebTopbar currentRoute={currentRoute} />
            <RootStack />
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <MobileTopbar currentRoute={currentRoute} />
          <RootStack />
          <CustomSidebar isWebLarge={false} navigation={navigation} />
        </View>
      )}
    </View>
  );
};

//////////////////////////////////////////////////////////
// ROOT NAVIGATOR
//////////////////////////////////////////////////////////
const RootNavigator = () => {
  const { token, hasProfile } = useAppStore();
  const [authScreen, setAuthScreen] = useState('login');
  const [currentRoute, setCurrentRoute] = useState('Dashboard');

  if (!token) {
    return authScreen === 'register' ? (
      <RegisterScreen onNavigateToLogin={() => setAuthScreen('login')} />
    ) : (
      <LoginScreen onNavigateToRegister={() => setAuthScreen('register')} />
    );
  }

  if (token && !hasProfile) return <OnboardingScreen />;

  return (
    <NavigationContainer
      onStateChange={(state) => {
        const getActiveRoute = (s) => {
          const route = s.routes[s.index];
          if (route.state) return getActiveRoute(route.state);
          return route.name;
        };
        setCurrentRoute(getActiveRoute(state));
      }}
    >
      <MainLayout currentRoute={currentRoute} />
      <CustomToast />
    </NavigationContainer>
  );
};

//////////////////////////////////////////////////////////
// STYLES
//////////////////////////////////////////////////////////
const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  tabBarInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: '100%',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  centerTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
});

export default RootNavigator;