// src/navigation/RootNavigator.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions
} from 'react-native';

import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import PantryScreen from '../screens/PantryScreen';
import ShoppingScreen from '../screens/ShoppingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ScanCameraScreen from '../screens/ScanCameraScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TrackingScreen from '../screens/TrackingScreen'; // ✅ ADD

// Layout
import CustomSidebar from '../components/navigation/CustomSidebar';
import WebTopbar from '../components/navigation/WebTopbar';
import CustomToast from '../components/common/CustomToast';

const { COLORS, BREAKPOINTS } = require('../constants/theme');
const { useAppStore } = require('../store/useAppStore');

const Tab = createBottomTabNavigator();

const RecipeScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Màn hình Gợi ý món ăn sẽ ở đây</Text>
  </View>
);

//////////////////////////////////////////////////////////
// FAB CAMERA
//////////////////////////////////////////////////////////
const FloatingCameraButton = ({ currentRoute }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // ✅ ADD Tracking
  if (['Scan', 'Profile', 'Tracking'].includes(currentRoute)) {
    return null;
  }

  return (
    <Pressable
      style={[styles.fabAbsolute, { bottom: insets.bottom + 32 }]}
      onPress={() => navigation.navigate('Scan', { mode: 'diary' })}
    >
      <View style={styles.fabButton}>
        <Ionicons name="camera" size={32} color="#FFFFFF" />
      </View>
    </Pressable>
  );
};

//////////////////////////////////////////////////////////
// MAIN LAYOUT
//////////////////////////////////////////////////////////
const MainLayout = ({ currentRoute }) => {
  const { width } = useWindowDimensions();
  const isWebLarge =
    Platform.OS === 'web' &&
    width > (BREAKPOINTS?.mobileMax || 768);

  const navigation = useNavigation();

  const TabContent = (
    <View style={{ flex: 1, position: 'relative' }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,

          // ✅ ADD Tracking vào điều kiện hide
          tabBarStyle:
            isWebLarge || ['Scan', 'Profile', 'Tracking'].includes(route.name)
              ? { display: 'none' }
              : {
                  position: 'absolute',
                  bottom: 24,
                  left: 20,
                  right: 20,
                  height: 65,
                  borderRadius: 30,
                  backgroundColor: 'transparent',
                  borderTopWidth: 0,
                  elevation: 0,
                  ...Platform.select({
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.1,
                      shadowRadius: 20
                    },
                    android: { elevation: 8 }
                  })
                },

          tabBarBackground: () =>
            !isWebLarge ? (
              <BlurView
                intensity={100}
                tint="light"
                style={[
                  StyleSheet.absoluteFill,
                  {
                    borderRadius: 30,
                    overflow: 'hidden',
                    backgroundColor: 'rgba(255,255,255,0.75)'
                  }
                ]}
              />
            ) : null,

          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: '#888',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            paddingBottom: 6
          },

          tabBarIcon: ({ focused, color }) => {
            let iconName;

            if (route.name === 'Dashboard')
              iconName = focused ? 'home' : 'home-outline';
            if (route.name === 'Pantry')
              iconName = focused ? 'fast-food' : 'fast-food-outline';
            if (route.name === 'Recipe')
              iconName = focused ? 'restaurant' : 'restaurant-outline';
            if (route.name === 'Shopping')
              iconName = focused ? 'cart' : 'cart-outline';

            return <Ionicons name={iconName} size={22} color={color} />;
          }
        })}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'Trang chủ' }}
        />

        <Tab.Screen
          name="Pantry"
          component={PantryScreen}
          options={{ title: 'Tủ lạnh' }}
        />

        <Tab.Screen
          name="Scan"
          component={ScanCameraScreen}
          options={{ tabBarButton: () => null }}
        />

        {/* PROFILE */}
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ tabBarButton: () => null }}
        />

        {/* ✅ ADD TRACKING */}
        <Tab.Screen
          name="Tracking"
          component={TrackingScreen}
          options={{ tabBarButton: () => null }}
        />

        <Tab.Screen
          name="Recipe"
          component={RecipeScreen}
          options={{ title: 'Gợi ý' }}
        />

        <Tab.Screen
          name="Shopping"
          component={ShoppingScreen}
          options={{ title: 'Đi chợ' }}
        />
      </Tab.Navigator>

      {!isWebLarge && (
        <FloatingCameraButton currentRoute={currentRoute} />
      )}
    </View>
  );

  if (isWebLarge) {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          backgroundColor: '#F8F9FA'
        }}
      >
        <CustomSidebar isWebLarge navigation={navigation} />
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <WebTopbar />
          {TabContent}
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {TabContent}
      <CustomSidebar isWebLarge={false} navigation={navigation} />
    </View>
  );
};

//////////////////////////////////////////////////////////
// ROOT
//////////////////////////////////////////////////////////
const RootNavigator = () => {
  const { token, hasProfile } = useAppStore();
  const [authScreen, setAuthScreen] = useState('login');
  const [currentRoute, setCurrentRoute] = useState('Dashboard');

  if (!token) {
    return authScreen === 'register' ? (
      <RegisterScreen onNavigateToLogin={() => setAuthScreen('login')} />
    ) : (
      <LoginScreen onNavigateToRegister={() =>
        setAuthScreen('register')
      } />
    );
  }

  if (token && !hasProfile) return <OnboardingScreen />;

  return (
    <NavigationContainer
      onStateChange={(state) => {
        let route = state.routes[state.index];
        while (route.state) {
          route = route.state.routes[route.state.index];
        }
        setCurrentRoute(route.name);
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
  fabAbsolute: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -33 }],
    zIndex: 999
  },
  fabButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8
      },
      android: { elevation: 6 }
    })
  }
});

export default RootNavigator;