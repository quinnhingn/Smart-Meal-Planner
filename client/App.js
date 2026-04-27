import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); 

  useEffect(() => {
    // Tạm thời Fake API check token
    const checkLoginStatus = async () => {
      setTimeout(() => {
        // Đổi thành 'admin' để test UI Admin, hoặc 'user' để test UI User
        setUserRole('admin'); 
        setIsLoading(false);
      }, 1000);
    };

    checkLoginStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Điều hướng dựa trên Role
  if (userRole === 'admin') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <Text style={{ color: '#4CAF50', fontSize: 20 }}>Dành cho AdminNavigator</Text>
      </View>
    );
  }

  if (userRole === 'user') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <Text style={{ color: '#2196F3', fontSize: 20 }}>Dành cho UserNavigator</Text>
      </View>
    );
  }

  // Màn hình Login nếu chưa có token
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
      <Text style={{ color: '#FF9800', fontSize: 20 }}>Màn hình Auth / Login</Text>
    </View>
  );
}