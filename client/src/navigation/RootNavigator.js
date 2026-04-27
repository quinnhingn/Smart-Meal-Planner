// src/navigation/RootNavigator.js
import React from 'react';
import { View, Text, Pressable, Platform, useWindowDimensions, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Thêm bộ icon
import { BREAKPOINTS, COLORS } from '../constants/theme';

import DashboardScreen from '../screens/DashboardScreen';
import PantryScreen from '../screens/PantryScreen';
import ShoppingScreen from '../screens/ShoppingScreen';

const Tab = createBottomTabNavigator();

const screens = [
  { name: 'Dashboard', component: DashboardScreen, label: 'Trang chủ', icon: 'home' },
  { name: 'Pantry', component: PantryScreen, label: 'Tủ lạnh', icon: 'fast-food' },
  { name: 'Shopping', component: ShoppingScreen, label: 'Đi chợ', icon: 'cart' },
];

const WebTopNavbar = ({ state, descriptors, navigation }) => {
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
      </View>
    </View>
  );
};

const RootNavigator = () => {
  const { width } = useWindowDimensions();
  const isWebLarge = Platform.OS === 'web' && width > BREAKPOINTS.mobileMax;

  return (
    <NavigationContainer>
      <Tab.Navigator
        // ĐIỂM SỬA QUAN TRỌNG: Chỉ truyền hàm khi là Web lớn. 
        // Nếu là mobile, truyền undefined trực tiếp (không bọc trong arrow function) 
        // để nó kích hoạt thanh Tab mặc định của thư viện.
        tabBar={isWebLarge ? (props) => <WebTopNavbar {...props} /> : undefined}
        screenOptions={({ route }) => ({
          headerShown: !isWebLarge,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: 'gray',
          // Thêm icon cho Mobile
          tabBarIcon: ({ focused, color, size }) => {
            const screen = screens.find(s => s.name === route.name);
            const iconName = focused ? screen.icon : `${screen.icon}-outline`;
            return <Ionicons name={iconName} size={size} color={color} />;
          },
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