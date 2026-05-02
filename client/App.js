// App.js
import 'react-native-gesture-handler'; // Bắt buộc đặt ở dòng 1
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    // flex: 1 bắt buộc để RootView bung kín 100% kích thước màn hình Web/Mobile
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        
        {/* Tối ưu thanh trạng thái cho Light Glassmorphism */}
        <StatusBar 
          style="dark" 
          translucent={true} 
          backgroundColor="transparent" 
        />
        
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}