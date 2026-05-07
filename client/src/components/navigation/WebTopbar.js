// src/components/navigation/WebTopbar.js
import React from 'react';
import { View, StyleSheet, Pressable, Text, Image} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native'; 
import { useAppStore } from '../../store/useAppStore'; 

const WebTopbar = () => {
  const navigation = useNavigation(); // <-- KHỞI TẠO NAVIGATION
  const { userProfile } = useAppStore(); // <-- KHỞI TẠO userProfile

  return (
    <View style={styles.topbarContainer}>
      <View style={styles.leftSection}>
        {/* Có thể thêm Title màn hình vào đây sau */}
      </View>

      <View style={styles.rightSection}>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={24} color="#555" />
          <View style={styles.badge} />
        </Pressable>

        {/* THÊM ONPRESS CHUYỂN HƯỚNG */}
        <Pressable style={styles.avatarBtn} onPress={() => navigation.navigate('Profile')}>
          {userProfile?.avatarUri ? (
            <Image source={{ uri: userProfile.avatarUri }} style={{width: 40, height: 40, borderRadius: 20}} />
          ) : (
            <Text style={styles.avatarText}>N</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topbarContainer: {
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.85)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  leftSection: { flexDirection: 'row', alignItems: 'center' },
  
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  iconBtn: { position: 'relative', cursor: 'pointer' },
  badge: { position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.danger, borderWidth: 2, borderColor: '#FFF' },
  avatarBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(76, 175, 80, 0.2)', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' },
  avatarText: { fontSize: 16, fontWeight: '800', color: COLORS.primary }
});

export default WebTopbar;