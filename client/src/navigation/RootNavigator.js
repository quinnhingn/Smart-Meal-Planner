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
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DashboardScreen from '../screens/DashboardScreen';
import PantryScreen from '../screens/PantryScreen';
import ShoppingScreen from '../screens/ShoppingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

const RecipeScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Màn hình Gợi ý món ăn sẽ ở đây</Text>
  </View>
);

const { COLORS, BREAKPOINTS } = require('../constants/theme');
const { useAppStore } = require('../store/useAppStore');

const Tab = createBottomTabNavigator();


// ==========================================
// 🔥 FAB CAMERA (FIX CHUẨN)
// ==========================================
const FloatingCameraButton = () => {
  const insets = useSafeAreaInsets();

  const handleCamera = () => {
    alert('Kích hoạt Camera AI');
  };

  return (
    <Pressable
      style={[
        styles.fabAbsolute,
        { bottom: insets.bottom + 32 }
      ]}
      onPress={handleCamera}
    >
      <View style={styles.fabButton}>
        <Ionicons name="camera" size={32} color="#FFFFFF" />
      </View>
    </Pressable>
  );
};


// ==========================================
// WEB NAVBAR
// ==========================================
const WebTopNavbar = ({ state, descriptors, navigation, logout }) => {
  const handleWebUpload = () => {
    alert('Upload ảnh từ máy tính');
  };

  return (
    <BlurView intensity={85} tint="light" style={styles.webNavbar}>
      <Text style={styles.logoText}>SmartMeal</Text>
      
      <View style={styles.navItems}>
        {state.routes.map((route, index) => {
          if (route.name === 'Scan') return null;

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
      </View>

      <View style={styles.webRightActions}>
        <Pressable onPress={handleWebUpload} style={styles.webUploadBtn}>
          <Ionicons name="camera-outline" size={18} color="#FFF" />
          <Text style={styles.webUploadText}>Tải ảnh AI</Text>
        </Pressable>

        <Pressable onPress={logout} style={{ marginLeft: 24, cursor: 'pointer' }}>
          <Text style={{ color: COLORS.danger, fontWeight: 'bold' }}>Thoát</Text>
        </Pressable>
      </View>
    </BlurView>
  );
};


// ==========================================
// ROOT NAVIGATOR
// ==========================================
const RootNavigator = () => {
  const { width } = useWindowDimensions();
  const isWebLarge =
    Platform.OS === 'web' &&
    width > (BREAKPOINTS?.mobileMax || 768);

  const { token, hasProfile, logout } = useAppStore();
  const [authScreen, setAuthScreen] = useState('login');

  if (!token) {
    return authScreen === 'register'
      ? <RegisterScreen onNavigateToLogin={() => setAuthScreen('login')} />
      : <LoginScreen onNavigateToRegister={() => setAuthScreen('register')} />;
  }

  if (token && !hasProfile) {
    return <OnboardingScreen />;
  }

  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        
        <Tab.Navigator
          tabBar={isWebLarge ? (props) => <WebTopNavbar {...props} logout={logout} /> : undefined}
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: true,

            tabBarStyle: isWebLarge ? {} : {
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
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600', paddingBottom: 6 },

            tabBarIcon: ({ focused, color }) => {
              let iconName;

              if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
              if (route.name === 'Pantry') iconName = focused ? 'fast-food' : 'fast-food-outline';
              if (route.name === 'Recipe') iconName = focused ? 'restaurant' : 'restaurant-outline';
              if (route.name === 'Shopping') iconName = focused ? 'cart' : 'cart-outline';

              return <Ionicons name={iconName} size={22} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Trang chủ' }} />
          <Tab.Screen name="Pantry" component={PantryScreen} options={{ title: 'Tủ lạnh' }} />

          <Tab.Screen
            name="Scan"
            component={View}
            options={{
              tabBarButton: () => null
            }}
          />

          <Tab.Screen name="Recipe" component={RecipeScreen} options={{ title: 'Gợi ý' }} />
          <Tab.Screen name="Shopping" component={ShoppingScreen} options={{ title: 'Đi chợ' }} />
        </Tab.Navigator>

        {!isWebLarge && <FloatingCameraButton />}

      </View>
    </NavigationContainer>
  );
};


// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  webNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 18,
    backgroundColor: 'rgba(255,255,255,0.85)',
    ...Platform.select({
      web: { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }
    })
  },

  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary
  },

  navItems: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center'
  },

  navItem: {
    position: 'relative',
    paddingVertical: 8,
    marginHorizontal: 16
  },

  navText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600'
  },

  navTextActive: {
    color: COLORS.primary,
    fontWeight: '800'
  },

  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    left: '20%',
    right: '20%',
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2
  },

  webRightActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  webUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20
  },

  webUploadText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6
  },

  // 🔥 FAB CENTER CHUẨN
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
      android: { elevation: 6 },
      web: {
        boxShadow: '0px 4px 12px rgba(76, 175, 80, 0.4)',
        cursor: 'pointer'
      }
    })
  }
});

export default RootNavigator;