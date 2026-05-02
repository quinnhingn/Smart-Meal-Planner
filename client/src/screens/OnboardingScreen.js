// src/screens/OnboardingScreen.js
import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, FlatList, Platform, 
  useWindowDimensions, KeyboardAvoidingView, ScrollView, Pressable 
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

// Components
import ResponsiveContainer from '../components/ResponsiveContainer';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import ProgressBar from '../components/onboarding/ProgressBar';
import SelectableCard from '../components/onboarding/SelectableCard';
import SelectionChip from '../components/onboarding/SelectionChip';

// Utils & Data
import { COLORS, BREAKPOINTS } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { calculateTDEEAndMacros } from '../utils/calculator';
import { ONBOARDING_STEPS, GOALS, ACTIVITY_LEVELS, ALLERGIES, DIETS } from '../utils/onboardingData';

const OnboardingScreen = () => {
  const { setupProfile, isLoading } = useAppStore();
  const flatListRef = useRef(null);
  const { width: windowWidth } = useWindowDimensions();
  
  // Responsive Layout
  const isWebLarge = Platform.OS === 'web' && windowWidth > (BREAKPOINTS?.mobileMax || 768);
  const cardMaxWidth = 520; 
  const actualCardWidth = isWebLarge ? cardMaxWidth : Math.min(windowWidth - 32, cardMaxWidth);
  const slideWidth = actualCardWidth; 

  const [currentIndex, setCurrentIndex] = useState(0);
  const [calculationResult, setCalculationResult] = useState(null);
  
  // State quản lý Input tùy chỉnh
  const [showCustomAllergy, setShowCustomAllergy] = useState(false);
  const [customAllergyText, setCustomAllergyText] = useState('');
  const [showCustomDiet, setShowCustomDiet] = useState(false);
  const [customDietText, setCustomDietText] = useState('');

  const [formData, setFormData] = useState({
    gender: 'male', 
    age: '', 
    height: 170, // Đổi sang Number cho Slider
    weight: 65,  // Đổi sang Number cho Slider
    activity: 'sedentary', 
    goal: 'lose_weight',
    allergies: [], 
    diet: 'none'   
  });

  // Helpers
  const updateData = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));
  
  const toggleAllergy = (allergyId) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergyId) 
        ? prev.allergies.filter(id => id !== allergyId) 
        : [...prev.allergies, allergyId]
    }));
  };

  const handleAddCustomAllergy = () => {
    if (customAllergyText.trim()) {
      toggleAllergy(customAllergyText.trim());
      setCustomAllergyText('');
      setShowCustomAllergy(false);
    }
  };

  const handleAddCustomDiet = () => {
    if (customDietText.trim()) {
      updateData('diet', customDietText.trim());
      setCustomDietText('');
      setShowCustomDiet(false);
    }
  };

  // Logic Navigation
  const handleNext = () => {
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      if (currentIndex === 3) {
        const results = calculateTDEEAndMacros(formData);
        setCalculationResult(results);
      }
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
      setCurrentIndex(prevIndex);
    }
  };

  const handleFinish = async () => {
    const payload = {
      ...formData,
      ...calculationResult 
    };
    await setupProfile(payload);
  };

  const renderStepContent = ({ item, index }) => {
    return (
      <View style={[styles.slideItem, { width: slideWidth }]}>
        
        {/* BƯỚC 1: THÔNG TIN CƠ BẢN */}
        {index === 0 && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tuổi của bạn</Text>
            <TextInput style={styles.input} keyboardType="numeric" placeholder="Ví dụ: 25" value={formData.age} onChangeText={(v) => updateData('age', v)} />

            <Text style={[styles.label, { marginTop: 24 }]}>Giới tính</Text>
            <View style={styles.row}>
              <Pressable 
                style={[styles.genderBtn, formData.gender === 'male' && styles.genderBtnActive, Platform.OS === 'web' && { cursor: 'pointer' }]}
                onPress={() => updateData('gender', 'male')}
              >
                <Ionicons name="male" size={20} color={formData.gender === 'male' ? '#FFF' : '#555'} />
                <Text style={[styles.genderText, formData.gender === 'male' && styles.genderTextActive]}>Nam</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.genderBtn, formData.gender === 'female' && styles.genderBtnActive, Platform.OS === 'web' && { cursor: 'pointer' }]}
                onPress={() => updateData('gender', 'female')}
              >
                <Ionicons name="female" size={20} color={formData.gender === 'female' ? '#FFF' : '#555'} />
                <Text style={[styles.genderText, formData.gender === 'female' && styles.genderTextActive]}>Nữ</Text>
              </Pressable>
            </View>

            {/* Slider Chiều cao */}
            <View style={styles.sliderHeader}>
              <Text style={styles.label}>Chiều cao</Text>
              <Text style={styles.sliderValue}>{formData.height} cm</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={100}
              maximumValue={220}
              step={1}
              value={formData.height}
              onValueChange={(val) => updateData('height', val)}
              minimumTrackTintColor={COLORS.primary || '#4CAF50'}
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor={COLORS.primary || '#4CAF50'}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderMinMax}>100 cm</Text>
              <Text style={styles.sliderMinMax}>220 cm</Text>
            </View>

            {/* Slider Cân nặng */}
            <View style={[styles.sliderHeader, { marginTop: 16 }]}>
              <Text style={styles.label}>Cân nặng</Text>
              <Text style={styles.sliderValue}>{formData.weight} kg</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={30}
              maximumValue={150}
              step={0.5}
              value={formData.weight}
              onValueChange={(val) => updateData('weight', val)}
              minimumTrackTintColor={COLORS.primary || '#4CAF50'}
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor={COLORS.primary || '#4CAF50'}
            />
          </View>
        )}

        {/* BƯỚC 2: MỤC TIÊU */}
        {index === 1 && (
          <View style={[styles.formGroup, isWebLarge && styles.gridRow]}>
            {GOALS.map(goal => (
              <View key={goal.id} style={isWebLarge && styles.gridItemHalf}>
                <SelectableCard title={goal.title} description={goal.description} icon={goal.icon} isSelected={formData.goal === goal.id} onPress={() => updateData('goal', goal.id)} />
              </View>
            ))}
          </View>
        )}

        {/* BƯỚC 3: VẬN ĐỘNG */}
        {index === 2 && (
          <View style={[styles.formGroup, isWebLarge && styles.gridRow]}>
            {ACTIVITY_LEVELS.map(level => (
              <View key={level.id} style={isWebLarge && styles.gridItemHalf}>
                <SelectableCard title={level.title} description={level.description} isSelected={formData.activity === level.id} onPress={() => updateData('activity', level.id)} />
              </View>
            ))}
          </View>
        )}

        {/* BƯỚC 4: KIÊNG KỴ & CHẾ ĐỘ ĂN (CÓ NHẬP TAY) */}
        {index === 3 && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Dị ứng (Có thể chọn nhiều)</Text>
            <View style={styles.chipContainer}>
              {ALLERGIES.map(item => (
                <SelectionChip key={item.id} label={item.label} isSelected={formData.allergies.includes(item.id)} onPress={() => toggleAllergy(item.id)} />
              ))}
              {/* Hiển thị các mục người dùng đã nhập tay */}
              {formData.allergies.filter(id => !ALLERGIES.find(a => a.id === id)).map(customId => (
                <SelectionChip key={customId} label={customId} isSelected={true} onPress={() => toggleAllergy(customId)} />
              ))}
              <SelectionChip label="+ Khác" isSelected={showCustomAllergy} onPress={() => setShowCustomAllergy(!showCustomAllergy)} />
            </View>
            
            {showCustomAllergy && (
              <View style={styles.customInputRow}>
                <TextInput style={[styles.input, styles.flex1, {height: 44}]} placeholder="Nhập dị ứng khác..." value={customAllergyText} onChangeText={setCustomAllergyText} onSubmitEditing={handleAddCustomAllergy} />
                <CustomButton title="Thêm" type="primary" onPress={handleAddCustomAllergy} style={{width: 80, marginLeft: 8}} />
              </View>
            )}

            <Text style={[styles.label, { marginTop: 24 }]}>Chế độ ăn (Chọn 1)</Text>
            <View style={styles.chipContainer}>
              {DIETS.map(item => (
                <SelectionChip key={item.id} label={item.label} isSelected={formData.diet === item.id} onPress={() => updateData('diet', item.id)} />
              ))}
              {/* Hiển thị chế độ ăn nhập tay nếu có */}
              {!DIETS.find(d => d.id === formData.diet) && formData.diet !== 'none' && (
                <SelectionChip label={formData.diet} isSelected={true} onPress={() => {}} />
              )}
              <SelectionChip label="+ Khác" isSelected={showCustomDiet} onPress={() => setShowCustomDiet(!showCustomDiet)} />
            </View>

            {showCustomDiet && (
              <View style={styles.customInputRow}>
                <TextInput style={[styles.input, styles.flex1, {height: 44}]} placeholder="Nhập chế độ ăn khác..." value={customDietText} onChangeText={setCustomDietText} onSubmitEditing={handleAddCustomDiet} />
                <CustomButton title="Lưu" type="primary" onPress={handleAddCustomDiet} style={{width: 80, marginLeft: 8}} />
              </View>
            )}
          </View>
        )}

        {/* BƯỚC 5: KẾT QUẢ */}
        {index === 4 && calculationResult && (
          <View style={styles.resultContainer}>
            <Ionicons name="leaf" size={40} color={COLORS.primary || '#4CAF50'} style={{marginBottom: 12}} />
            <Text style={styles.resultSubtitle}>SẴN SÀNG HÀNH ĐỘNG</Text>
            <Text style={styles.resultTitle}>{calculationResult.tdee} <Text style={{fontSize: 18}}>kcal/ngày</Text></Text>
            
            <View style={styles.macroBox}>
               <View style={styles.macroRow}><Text style={styles.macroLabel}>Protein</Text><Text style={styles.macroValue}>{calculationResult.protein_g}g</Text></View>
               <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: '30%', backgroundColor: '#E53935' }]} /></View>
               
               <View style={[styles.macroRow, {marginTop: 16}]}><Text style={styles.macroLabel}>Carbs</Text><Text style={styles.macroValue}>{calculationResult.carbs_g}g</Text></View>
               <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: '45%', backgroundColor: '#29B6F6' }]} /></View>

               <View style={[styles.macroRow, {marginTop: 16}]}><Text style={styles.macroLabel}>Fat</Text><Text style={styles.macroValue}>{calculationResult.fat_g}g</Text></View>
               <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: '25%', backgroundColor: '#FBC02D' }]} /></View>
            </View>
          </View>
        )}

      </View>
    );
  };

  return (
    <ResponsiveContainer useImageBg={true}>
      <View style={styles.safeArea}>
        <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            
            <GlassCard style={[styles.card, { width: actualCardWidth, padding: 0 }]} intensity={90}>
              <View style={styles.sectionPadding}>
                <ProgressBar currentStep={currentIndex + 1} totalSteps={ONBOARDING_STEPS.length} />
                <Text style={styles.title}>{ONBOARDING_STEPS[currentIndex].title}</Text>
                <Text style={styles.subtitle}>{ONBOARDING_STEPS[currentIndex].subtitle}</Text>
              </View>

              <View style={styles.sliderContainer}>
                <FlatList
                  ref={flatListRef}
                  data={ONBOARDING_STEPS}
                  keyExtractor={(item) => item.id}
                  horizontal
                  pagingEnabled
                  scrollEnabled={false} 
                  showsHorizontalScrollIndicator={false}
                  renderItem={renderStepContent}
                  getItemLayout={(_, index) => ({ length: slideWidth, offset: slideWidth * index, index })}
                />
              </View>

              <View style={styles.sectionPadding}>
                <View style={styles.navRow}>
                  {currentIndex > 0 && (
                    <>
                      <CustomButton title="Quay lại" type="glass" disabled={isLoading} onPress={handlePrev} style={styles.flex1} />
                      <View style={{ width: 12 }} />
                    </>
                  )}
                  <CustomButton 
                    title={currentIndex < 4 ? "Tiếp theo" : "Bắt đầu hành trình"} 
                    type="primary"
                    isLoading={isLoading} 
                    onPress={currentIndex < 4 ? handleNext : handleFinish} 
                    style={styles.flex1} 
                  />
                </View>
              </View>
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, width: '100%', paddingTop: Platform.OS === 'android' ? 40 : 0 },
  keyboardAvoid: { flex: 1, width: '100%' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 },
  card: { minHeight: 650, alignSelf: 'center', overflow: 'hidden' },
  
  sectionPadding: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  slideItem: { paddingHorizontal: 24, width: '100%' }, 
  
  title: { fontSize: 24, fontWeight: '800', color: '#111', marginTop: 8, lineHeight: 32 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 8, lineHeight: 20 },
  
  sliderContainer: { flex: 1, width: '100%', marginTop: 12 },
  
  formGroup: { width: '100%' },
  row: { flexDirection: 'row', gap: 12, width: '100%' },
  flex1: { flex: 1 },
  label: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { height: 50, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', fontSize: 16 },
  
  // Custom Gender Buttons
  genderBtn: { flex: 1, flexDirection: 'row', height: 52, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', gap: 8 },
  genderBtnActive: { backgroundColor: COLORS?.primary || '#4CAF50', borderColor: COLORS?.primary || '#4CAF50' },
  genderText: { fontSize: 16, fontWeight: '600', color: '#555' },
  genderTextActive: { color: '#FFF' },

  // Slider Styles
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 },
  sliderValue: { fontSize: 18, fontWeight: '700', color: COLORS?.primary || '#4CAF50' },
  slider: { width: '100%', height: 40 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  sliderMinMax: { fontSize: 11, color: '#999' },

  gridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  gridItemHalf: { width: '48%' },
  
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  customInputRow: { flexDirection: 'row', marginTop: 8, marginBottom: 12 },
  
  navRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 16 },

  // Result Styles
  resultContainer: { alignItems: 'center', paddingVertical: 10 },
  resultSubtitle: { fontSize: 12, fontWeight: '700', color: COLORS?.primary || '#4CAF50', letterSpacing: 1 },
  resultTitle: { fontSize: 44, fontWeight: '900', color: '#111', marginVertical: 8 },
  macroBox: { width: '100%', backgroundColor: 'rgba(255,255,255,0.8)', padding: 20, borderRadius: 16, marginTop: 16, borderWidth: 1, borderColor: '#EEE' },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  macroLabel: { fontSize: 14, fontWeight: '700', color: '#333' },
  macroValue: { fontSize: 14, fontWeight: '800', color: '#111' },
  progressBarBg: { height: 8, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 }
});

export default OnboardingScreen;