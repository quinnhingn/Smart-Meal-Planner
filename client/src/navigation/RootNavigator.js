// src/navigation/RootNavigator.js
// NutriLens V2 — Mobile-only navigation shell
// Bottom Tab: Dashboard | Diary | Scan (FAB) | Fitness | Recipes

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Animated,
  Easing,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ScanCameraScreen from '../screens/ScanCameraScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TrackingScreen from '../screens/TrackingScreen';
import DiaryScreen from '../screens/DiaryScreen';
import RecipesScreen from '../screens/RecipesScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import AISuggestedRecipeDetailScreen from '../screens/AISuggestedRecipeDetailScreen';
import FitnessHubScreen from '../screens/FitnessHubScreen';
import ExploreFitnessScreen from '../screens/ExploreFitnessScreen';

// Layout
import MobileTopbar from '../components/navigation/MobileTopbar';
import CustomToast from '../components/common/CustomToast';
import FABActionSheet from '../components/navigation/FABActionSheet';
import SearchModal from '../components/scan/SearchModal';

// Theme & Store
import { COLORS, FONTS, SHADOWS, RADIUS } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// (Placeholder removed since Phase 2 is now active)

//////////////////////////////////////////////////////////
// CUSTOM TAB BAR — 5 TABS (Mobile-Only)
//////////////////////////////////////////////////////////
const TAB_CONFIG = [
  { name: 'Dashboard', label: 'Trang chủ', icon: 'home', iconOutline: 'home-outline' },
  { name: 'Diary',     label: 'Nhật ký',   icon: 'book', iconOutline: 'book-outline' },
  { name: 'Scan',      label: null,         icon: 'camera', isCenter: true },
  { name: 'Fitness',   label: 'Thể dục',   icon: 'barbell', iconOutline: 'barbell-outline' },
  { name: 'Recipes',   label: 'Công thức', icon: 'restaurant', iconOutline: 'restaurant-outline' },
];

const CustomTabBar = ({ state, navigation }) => {
  const { tabBarVisible, setTabBarVisible, setFabSheetVisible } = useAppStore();
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

  // Hide tab bar when Scan camera is active
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
                onPress={() => setFabSheetVisible(true)}
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
                size={24}
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
// MAIN TABS — 5 screens
//////////////////////////////////////////////////////////
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false }}
    tabBar={(props) => <CustomTabBar {...props} />}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Diary"     component={DiaryScreen} />
    <Tab.Screen name="Scan"      component={ScanCameraScreen} />
    <Tab.Screen name="Fitness"   component={FitnessHubScreen} />
    <Tab.Screen name="Recipes"   component={RecipesScreen} />
  </Tab.Navigator>
);

//////////////////////////////////////////////////////////
// ROOT STACK — contains Profile, Tracking, RecipeDetail
//////////////////////////////////////////////////////////
const RootStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs"     component={MainTabs} />
    <Stack.Screen name="Profile"      component={ProfileScreen} />
    <Stack.Screen name="Tracking"     component={TrackingScreen} />
    <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    <Stack.Screen name="AISuggestedRecipeDetail" component={AISuggestedRecipeDetailScreen} />
    <Stack.Screen name="ExploreFitness" component={ExploreFitnessScreen} />
  </Stack.Navigator>
);

//////////////////////////////////////////////////////////
// MAIN LAYOUT — Mobile-only, single column
//////////////////////////////////////////////////////////
const MainLayout = ({ currentRoute }) => {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.pastelBg }}>
      <MobileTopbar currentRoute={currentRoute} />
      <RootStack />
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
      onStateChange={(navState) => {
        const getActiveRoute = (s) => {
          const route = s.routes[s.index];
          if (route.state) return getActiveRoute(route.state);
          return route.name;
        };
        setCurrentRoute(getActiveRoute(navState));
      }}
    >
      <MainLayout currentRoute={currentRoute} />
      <FABActionSheet />
      <SearchModal />
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
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: '#888',
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontFamily: FONTS.extrabold,
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
    ...SHADOWS.green,
  },
});

export default RootNavigator;