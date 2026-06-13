// src/screens/OnboardingScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Platform,
  useWindowDimensions, KeyboardAvoidingView, ScrollView, Pressable, TextInput, Animated, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ResponsiveContainer from '../components/ResponsiveContainer';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

const ACTIVITY_LEVELS = [
  { id: 'sedentary', title: 'Ít vận động', desc: 'Dân văn phòng, ngồi nhiều, ít tập luyện', factor: 1.2 },
  { id: 'light', title: 'Vận động nhẹ', desc: 'Tập nhẹ nhàng 1-3 buổi/tuần', factor: 1.375 },
  { id: 'moderate', title: 'Vận động vừa', desc: 'Tập luyện đều đặn 3-5 buổi/tuần', factor: 1.55 },
  { id: 'active', title: 'Vận động nhiều', desc: 'Tập nặng 6-7 buổi/tuần', factor: 1.725 },
  { id: 'very_active', title: 'Vận động viên', desc: 'Lao động tay chân nặng hoặc VĐV chuyên nghiệp', factor: 1.9 }
];

const GOALS = [
  { id: 'lose_weight', title: 'Giảm mỡ', desc: 'Thâm hụt calo, giữ cơ', icon: 'trending-down-outline', color: '#E53935' },
  { id: 'maintain', title: 'Duy trì', desc: 'Giữ cân nặng hiện tại', icon: 'remove-circle-outline', color: '#FBC02D' },
  { id: 'gain_muscle', title: 'Tăng cơ', desc: 'Thặng dư calo, đẩy tạ', icon: 'trending-up-outline', color: '#4CAF50' }
];

const OnboardingScreen = () => {
  const { width: windowWidth } = useWindowDimensions();
  const flatListRef = useRef(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [formData, setFormData] = useState({
    gender: 'male',
    age: '25',
    height_cm: '170',
    weight_kg: '65',
    activity_level: 'moderate',
    goal: 'lose_weight'
  });

  const updateData = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentIndex + 1) / 3,
      duration: 300,
      useNativeDriver: false
    }).start();
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < 2) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  const handleFinish = () => {
    // TÍNH TOÁN THEO CÔNG THỨC V2
    const { gender, age, height_cm, weight_kg, activity_level, goal } = formData;
    const w = parseFloat(weight_kg);
    const h = parseFloat(height_cm);
    const a = parseInt(age, 10);
    
    // 1. BMR
    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    bmr += gender === 'male' ? 5 : -161;

    // 2. TDEE
    const factor = ACTIVITY_LEVELS.find(l => l.id === activity_level)?.factor || 1.2;
    const tdee = bmr * factor;

    // 3. Target Calories
    let targetCal = tdee;
    if (goal === 'lose_weight') targetCal -= 500;
    if (goal === 'gain_muscle') targetCal += 300;
    
    // Clamp
    const minCal = gender === 'male' ? 1500 : 1200;
    if (targetCal < minCal) targetCal = minCal;

    // 4. Macros
    let pPercent, cPercent, fPercent;
    if (goal === 'lose_weight') { pPercent = 0.35; cPercent = 0.35; fPercent = 0.30; }
    else if (goal === 'gain_muscle') { pPercent = 0.30; cPercent = 0.45; fPercent = 0.25; }
    else { pPercent = 0.25; cPercent = 0.50; fPercent = 0.25; }

    const target_protein_g = Math.round((targetCal * pPercent) / 4);
    const target_carbs_g = Math.round((targetCal * cPercent) / 4);
    const target_fat_g = Math.round((targetCal * fPercent) / 9);

    const finalProfile = {
      ...formData,
      target_calories: Math.round(targetCal),
      target_protein_g,
      target_carbs_g,
      target_fat_g
    };

    // MOCK SAVE TO STORE
    console.log('✅ [Mock] Tính toán Onboarding:', finalProfile);
    const { useAppStore } = require('../store/useAppStore');
    useAppStore.setState(prev => ({
      userProfile: { ...prev.userProfile, ...finalProfile },
      hasProfile: true
    }));
  };

  const renderBioForm = () => (
    <View style={styles.slideItem}>
      <Text style={styles.title}>Chỉ số cơ thể</Text>
      <Text style={styles.subtitle}>NutriLens cần biết một chút về bạn để tính toán chính xác nhất.</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Giới tính</Text>
        <View style={styles.row}>
          <Pressable 
            style={[styles.genderBtn, formData.gender === 'male' && styles.genderBtnActive]}
            onPress={() => updateData('gender', 'male')}
          >
            <Ionicons name="male" size={20} color={formData.gender === 'male' ? '#FFF' : '#555'} />
            <Text style={[styles.genderText, formData.gender === 'male' && styles.genderTextActive]}>Nam</Text>
          </Pressable>
          <Pressable 
            style={[styles.genderBtn, formData.gender === 'female' && styles.genderBtnActive]}
            onPress={() => updateData('gender', 'female')}
          >
            <Ionicons name="female" size={20} color={formData.gender === 'female' ? '#FFF' : '#555'} />
            <Text style={[styles.genderText, formData.gender === 'female' && styles.genderTextActive]}>Nữ</Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Tuổi</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="number-pad" 
              value={formData.age} 
              onChangeText={v => updateData('age', v)} 
              maxLength={3}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Chiều cao (cm)</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              value={formData.height_cm} 
              onChangeText={v => updateData('height_cm', v)} 
              maxLength={5}
            />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>Cân nặng (kg)</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              value={formData.weight_kg} 
              onChangeText={v => updateData('weight_kg', v)} 
              maxLength={5}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderActivityForm = () => (
    <View style={styles.slideItem}>
      <Text style={styles.title}>Mức độ vận động</Text>
      <Text style={styles.subtitle}>Bạn thường xuyên hoạt động thể chất như thế nào?</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10, gap: 12 }}>
        {ACTIVITY_LEVELS.map(item => (
          <Pressable 
            key={item.id}
            style={[styles.tapCard, formData.activity_level === item.id && styles.tapCardActive]}
            onPress={() => updateData('activity_level', item.id)}
          >
            <View style={styles.tapCardContent}>
              <Text style={[styles.tapCardTitle, formData.activity_level === item.id && styles.tapCardTitleActive]}>{item.title}</Text>
              <Text style={styles.tapCardDesc}>{item.desc}</Text>
            </View>
            {formData.activity_level === item.id && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const renderGoalForm = () => (
    <View style={styles.slideItem}>
      <Text style={styles.title}>Mục tiêu của bạn</Text>
      <Text style={styles.subtitle}>NutriLens sẽ tạo lộ trình dựa trên mục tiêu này.</Text>
      <View style={{ marginTop: 20, gap: 16 }}>
        {GOALS.map(item => (
          <Pressable 
            key={item.id}
            style={[styles.tapCard, formData.goal === item.id && { borderColor: item.color, backgroundColor: item.color + '10' }]}
            onPress={() => updateData('goal', item.id)}
          >
            <View style={[styles.iconWrapper, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.tapCardContent}>
              <Text style={[styles.tapCardTitle, formData.goal === item.id && { color: item.color }]}>{item.title}</Text>
              <Text style={styles.tapCardDesc}>{item.desc}</Text>
            </View>
            {formData.goal === item.id && <Ionicons name="checkmark-circle" size={24} color={item.color} />}
          </Pressable>
        ))}
      </View>
    </View>
  );

  const slides = [renderBioForm, renderActivityForm, renderGoalForm];

  return (
    <ResponsiveContainer useImageBg={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.safeArea}>
        
        {/* Progress Bar */}
        <View style={styles.progressHeader}>
          <Pressable onPress={handleBack} style={{ opacity: currentIndex > 0 ? 1 : 0 }} disabled={currentIndex === 0}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </Pressable>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, {
              width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
            }]} />
          </View>
          <Text style={styles.progressText}>{currentIndex + 1}/3</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <GlassCard style={styles.card}>
            <FlatList
              ref={flatListRef}
              data={slides}
              keyExtractor={(_, index) => index.toString()}
              horizontal
              pagingEnabled
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={{ width: windowWidth > 520 ? 520 : windowWidth - 32 }}>
                  {item()}
                </View>
              )}
            />
            
            <View style={styles.footerRow}>
              <CustomButton
                title={currentIndex === 2 ? "HOÀN TẤT" : "TIẾP TỤC"}
                onPress={handleNext}
                style={styles.flex1}
              />
            </View>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, width: '100%', paddingTop: Platform.OS === 'android' ? 40 : 0 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16 },
  
  progressHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  progressBarBg: { flex: 1, height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, marginHorizontal: 16, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  progressText: { fontSize: 14, fontWeight: '700', color: '#555' },

  card: { alignSelf: 'center', padding: 0, overflow: 'hidden' },
  slideItem: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, flex: 1 },
  
  title: { fontSize: 26, fontWeight: '900', color: '#111', marginTop: 8, lineHeight: 34 },
  subtitle: { fontSize: 15, color: '#666', marginTop: 8, lineHeight: 22 },
  
  formGroup: { marginTop: 24, gap: 16 },
  row: { flexDirection: 'row', gap: 12, width: '100%' },
  flex1: { flex: 1 },
  label: { fontSize: 13, fontWeight: '700', color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { height: 56, backgroundColor: '#F8F9FA', paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', fontSize: 18, fontWeight: '700', color: '#111' },
  
  genderBtn: { flex: 1, flexDirection: 'row', height: 56, borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', gap: 8 },
  genderBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  genderText: { fontSize: 16, fontWeight: '700', color: '#555' },
  genderTextActive: { color: '#FFF' },

  tapCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderRadius: 16, borderWidth: 2, borderColor: '#F0F0F0' },
  tapCardActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(76, 175, 80, 0.05)' },
  iconWrapper: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  tapCardContent: { flex: 1 },
  tapCardTitle: { fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 4 },
  tapCardTitleActive: { color: COLORS.primary },
  tapCardDesc: { fontSize: 13, color: '#777', lineHeight: 18 },

  footerRow: { padding: 24, paddingTop: 0 }
});

export default OnboardingScreen;