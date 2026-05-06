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
import { useAppStore } from '../store/useAppStore'; // Tạm comment nếu chưa có
import { calculateTDEEAndMacros } from '../utils/calculator';
import { ONBOARDING_STEPS, GOALS, ACTIVITY_LEVELS, ALLERGIES, DIETS, DISLIKES, BODY_TYPES, PACE_OPTIONS } from '../utils/onboardingData';

const OnboardingScreen = () => {
  const { setupProfile, isLoading } = useAppStore(); // Tạm comment
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
  const [showCustomDislike, setShowCustomDislike] = useState(false);
  const [customDislikeText, setCustomDislikeText] = useState('');
  const [isEditingValue, setIsEditingValue] = useState(null); // 'height', 'weight', 'targetWeight'

  const [formData, setFormData] = useState({
    gender: 'male',
    age: '',
    height: 170,
    weight: 65,
    targetWeight: 60,
    bodyType: 'mesomorph',
    pace: 'normal',
    activity: 'sedentary',
    goal: 'lose_weight',
    allergies: [],
    dislikes: [],
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

  const toggleDislike = (dislikeId) => {
    setFormData(prev => ({
      ...prev,
      dislikes: prev.dislikes.includes(dislikeId)
        ? prev.dislikes.filter(id => id !== dislikeId)
        : [...prev.dislikes, dislikeId]
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

  const handleAddCustomDislike = () => {
    if (customDislikeText.trim()) {
      toggleDislike(customDislikeText.trim());
      setCustomDislikeText('');
      setShowCustomDislike(false);
    }
  };

  // Stepper helper
  const adjustValue = (key, delta, step = 1) => {
    setFormData(prev => ({
      ...prev,
      [key]: Math.max(0, (parseFloat(prev[key]) || 0) + delta * step)
    }));
  };

  const NumericStepper = ({ label, value, unit, onAdjust, onChange, icon, color = COLORS?.primary || '#4CAF50' }) => (
    <View style={styles.stepperContainer}>
      <View style={styles.stepperBox}>
        <View style={styles.stepperHeaderInside}>
          <Ionicons name={icon} size={16} color={color} style={{ marginRight: 6 }} />
          <Text style={styles.stepperLabelInside}>{label}</Text>
        </View>
        <View style={styles.stepperActionRow}>
          <Pressable style={styles.stepperBtn} onPress={() => onAdjust(-1)}>
            <Ionicons name="remove" size={20} color="#666" />
          </Pressable>

          <View style={styles.stepperInputWrapper}>
            <TextInput
              style={[styles.stepperInput, { color }]}
              keyboardType="numeric"
              value={value.toString()}
              onChangeText={onChange}
            />
            <Text style={styles.stepperUnit}>{unit}</Text>
          </View>

          <Pressable style={styles.stepperBtn} onPress={() => onAdjust(1)}>
            <Ionicons name="add" size={20} color="#666" />
          </Pressable>
        </View>
      </View>
    </View>
  );

  const handleNext = () => {
    // Thêm Validate ở Bước 1 (index === 0)
    if (currentIndex === 0) {
      if (!formData.age || isNaN(formData.age) || Number(formData.age) <= 0) {
        alert("Vui lòng nhập số tuổi hợp lệ!");
        return; // Chặn không cho qua bước tiếp theo
      }
    }

    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      if (currentIndex === 4) { // Trước khi qua bước kết quả (bước 6)
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
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ví dụ: 25"
              value={formData.age.toString()}
              onChangeText={(v) => updateData('age', v)}
            />

            <Text style={[styles.label, { marginTop: 20 }]}>Giới tính</Text>
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

            <View style={{ marginTop: 20 }}>
              <NumericStepper
                label="Chiều cao"
                icon="resize"
                value={formData.height}
                unit="cm"
                onAdjust={(d) => adjustValue('height', d)}
                onChange={(v) => updateData('height', v)}
              />

              <View style={{ height: 16 }} />

              <NumericStepper
                label="Cân nặng hiện tại"
                icon="fitness"
                value={formData.weight}
                unit="kg"
                onAdjust={(d) => adjustValue('weight', d, 0.5)}
                onChange={(v) => updateData('weight', v)}
              />
            </View>
          </View>
        )}

        {/* BƯỚC 2: MỤC TIÊU */}
        {index === 1 && (
          <View style={styles.formGroup}>
            <View style={[isWebLarge && styles.gridRow]}>
              {GOALS.map(goal => (
                <View key={goal.id} style={isWebLarge && styles.gridItemHalf}>
                  <SelectableCard title={goal.title} description={goal.description} icon={goal.icon} isSelected={formData.goal === goal.id} onPress={() => updateData('goal', goal.id)} />
                </View>
              ))}
            </View>

            {/* Chỉ hiển thị Cân nặng mục tiêu nếu không phải 'Giữ dáng' */}
            {formData.goal !== 'maintain' && (
              <View style={{ marginTop: 12 }}>
                <NumericStepper
                  label="Cân nặng mục tiêu"
                  icon="flag"
                  value={formData.targetWeight}
                  unit="kg"
                  color="#E91E63"
                  onAdjust={(d) => adjustValue('targetWeight', d, 0.5)}
                  onChange={(v) => updateData('targetWeight', v)}
                />
              </View>
            )}
          </View>
        )}

        {/* BƯỚC 3: THỂ TRẠNG & TỐC ĐỘ (MỚI) */}
        {index === 2 && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tạng người của bạn</Text>
            <View style={styles.bodyTypeRow}>
              {BODY_TYPES.map(type => (
                <Pressable 
                  key={type.id} 
                  style={[styles.bodyTypeCard, formData.bodyType === type.id && styles.bodyTypeCardActive]}
                  onPress={() => updateData('bodyType', type.id)}
                >
                  <Ionicons name={type.icon} size={28} color={formData.bodyType === type.id ? COLORS.primary || '#4CAF50' : '#888'} />
                  <Text style={[styles.bodyTypeText, formData.bodyType === type.id && styles.bodyTypeTextActive]}>{type.title}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.bodyTypeDesc}>
              {BODY_TYPES.find(t => t.id === formData.bodyType)?.description}
            </Text>

            <Text style={[styles.label, { marginTop: 24 }]}>Tốc độ đạt mục tiêu</Text>
            <View style={styles.paceRow}>
              {PACE_OPTIONS.map(opt => (
                <Pressable 
                  key={opt.id} 
                  style={[styles.paceChip, formData.pace === opt.id && styles.paceChipActive]}
                  onPress={() => updateData('pace', opt.id)}
                >
                  <Text style={[styles.paceChipText, formData.pace === opt.id && styles.paceChipTextActive]}>
                    {opt.title}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.bodyTypeDesc}>
              {PACE_OPTIONS.find(p => p.id === formData.pace)?.description}
            </Text>
          </View>
        )}

        {/* BƯỚC 4: VẬN ĐỘNG */}
        {index === 3 && (
          <View style={[styles.formGroup, isWebLarge && styles.gridRow]}>
            {ACTIVITY_LEVELS.map(level => (
              <View key={level.id} style={isWebLarge && styles.gridItemHalf}>
                <SelectableCard title={level.title} description={level.description} isSelected={formData.activity === level.id} onPress={() => updateData('activity', level.id)} />
              </View>
            ))}
          </View>
        )}

        {/* BƯỚC 5: KIÊNG KỴ & CHẾ ĐỘ ĂN */}
        {index === 4 && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Dị ứng (Chọn nhiều)</Text>
              <View style={styles.chipContainer}>
                {ALLERGIES.map(item => (
                  <SelectionChip key={item.id} label={item.label} isSelected={formData.allergies.includes(item.id)} onPress={() => toggleAllergy(item.id)} />
                ))}
                {formData.allergies.filter(id => !ALLERGIES.find(a => a.id === id)).map(customId => (
                  <SelectionChip key={customId} label={customId} isSelected={true} onPress={() => toggleAllergy(customId)} />
                ))}
                <SelectionChip label="+ Khác" isSelected={showCustomAllergy} onPress={() => setShowCustomAllergy(!showCustomAllergy)} />
              </View>
              
              {showCustomAllergy && (
                <View style={styles.customInputRow}>
                  <TextInput style={[styles.input, styles.flex1, { height: 44 }]} placeholder="Dị ứng khác..." value={customAllergyText} onChangeText={setCustomAllergyText} onSubmitEditing={handleAddCustomAllergy} />
                  <CustomButton title="Thêm" type="primary" onPress={handleAddCustomAllergy} style={{ width: 70, marginLeft: 8 }} />
                </View>
              )}

              <Text style={[styles.label, { marginTop: 20 }]}>Bạn ghét ăn gì? (Dislikes)</Text>
              <View style={styles.chipContainer}>
                {DISLIKES.map(item => (
                  <SelectionChip key={item.id} label={item.label} isSelected={formData.dislikes.includes(item.id)} onPress={() => toggleDislike(item.id)} />
                ))}
                {formData.dislikes.filter(id => !DISLIKES.find(d => d.id === id)).map(customId => (
                  <SelectionChip key={customId} label={customId} isSelected={true} onPress={() => toggleDislike(customId)} />
                ))}
                <SelectionChip label="+ Khác" isSelected={showCustomDislike} onPress={() => setShowCustomDislike(!showCustomDislike)} />
              </View>
              
              {showCustomDislike && (
                <View style={styles.customInputRow}>
                  <TextInput style={[styles.input, styles.flex1, { height: 44 }]} placeholder="Nhập món ghét..." value={customDislikeText} onChangeText={setCustomDislikeText} onSubmitEditing={handleAddCustomDislike} />
                  <CustomButton title="Thêm" type="primary" onPress={handleAddCustomDislike} style={{ width: 70, marginLeft: 8 }} />
                </View>
              )}

              <Text style={[styles.label, { marginTop: 20 }]}>Chế độ ăn (Chọn 1)</Text>
              <View style={styles.chipContainer}>
                {DIETS.map(item => (
                  <SelectionChip key={item.id} label={item.label} isSelected={formData.diet === item.id} onPress={() => updateData('diet', item.id)} />
                ))}
                {!DIETS.find(d => d.id === formData.diet) && formData.diet !== 'none' && (
                  <SelectionChip label={formData.diet} isSelected={true} onPress={() => { }} />
                )}
                <SelectionChip label="+ Khác" isSelected={showCustomDiet} onPress={() => setShowCustomDiet(!showCustomDiet)} />
              </View>

              {showCustomDiet && (
                <View style={styles.customInputRow}>
                  <TextInput style={[styles.input, styles.flex1, { height: 44 }]} placeholder="Chế độ khác..." value={customDietText} onChangeText={setCustomDietText} onSubmitEditing={handleAddCustomDiet} />
                  <CustomButton title="Lưu" type="primary" onPress={handleAddCustomDiet} style={{ width: 70, marginLeft: 8 }} />
                </View>
              )}
            </View>
          </ScrollView>
        )}

        {/* BƯỚC 6: KẾT QUẢ */}
        {index === 5 && calculationResult && (
          <View style={styles.resultContainer}>
            <Ionicons name="leaf" size={40} color={COLORS.primary || '#4CAF50'} style={{ marginBottom: 12 }} />
            <Text style={styles.resultSubtitle}>SẴN SÀNG HÀNH ĐỘNG</Text>
            <Text style={styles.resultTitle}>{calculationResult.tdee} <Text style={{ fontSize: 18 }}>kcal/ngày</Text></Text>

            {calculationResult.estimatedWeeks > 0 && (
              <View style={styles.estimateContainer}>
                <Ionicons name="time-outline" size={16} color="#666" style={{ marginRight: 6 }} />
                <Text style={styles.estimateText}>
                  Lộ trình dự kiến đạt mục tiêu: <Text style={styles.estimateValue}>{calculationResult.estimatedWeeks} tuần</Text>
                </Text>
              </View>
            )}
            
            <View style={styles.macroBox}>
              <View style={styles.macroRow}><Text style={styles.macroLabel}>Protein</Text><Text style={styles.macroValue}>{calculationResult.protein_g}g</Text></View>
              <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: '30%', backgroundColor: '#E53935' }]} /></View>

              <View style={[styles.macroRow, { marginTop: 16 }]}><Text style={styles.macroLabel}>Carbs</Text><Text style={styles.macroValue}>{calculationResult.carbs_g}g</Text></View>
              <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: '45%', backgroundColor: '#29B6F6' }]} /></View>

              <View style={[styles.macroRow, { marginTop: 16 }]}><Text style={styles.macroLabel}>Fat</Text><Text style={styles.macroValue}>{calculationResult.fat_g}g</Text></View>
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

            {/* ĐIỂM CẬP NHẬT: Hạ intensity xuống 80 để khớp với LoginScreen, không chèn inline padding: 0 */}
            <GlassCard style={[styles.card, { width: actualCardWidth }]} intensity={80}>
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
                    title={currentIndex < 5 ? "Tiếp theo" : "Bắt đầu"}
                    type="primary"
                    isLoading={isLoading}
                    onPress={currentIndex < 5 ? handleNext : handleFinish}
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

  // ĐIỂM CẬP NHẬT: Xóa overflow: 'hidden' để không chèn ép shadow của GlassCard
  card: { minHeight: 650, alignSelf: 'center' },

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

  inlineInput: { fontSize: 18, fontWeight: '700', color: COLORS?.primary || '#4CAF50', borderBottomWidth: 1, borderBottomColor: COLORS?.primary || '#4CAF50', padding: 0, minWidth: 60, textAlign: 'right' },

  // Stepper Styles
  stepperContainer: { width: '100%' },
  stepperBox: { backgroundColor: '#FFF', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#EEE', marginTop: 4 },
  stepperHeaderInside: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  stepperLabelInside: { fontSize: 13, fontWeight: '700', color: '#555' },
  stepperActionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepperBtn: { width: 40, height: 40, backgroundColor: '#F8F8F8', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepperInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  stepperInput: { fontSize: 24, fontWeight: '800', textAlign: 'center', minWidth: 60, padding: 0 },
  stepperUnit: { fontSize: 14, fontWeight: '600', color: '#BBB', marginLeft: 4, marginTop: 4 },

  bodyTypeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  bodyTypeCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EEE', marginHorizontal: 4 },
  bodyTypeCardActive: { borderColor: COLORS.primary || '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.05)' },
  bodyTypeText: { fontSize: 13, fontWeight: '700', color: '#666', marginTop: 8 },
  bodyTypeTextActive: { color: COLORS.primary || '#4CAF50' },
  bodyTypeDesc: { fontSize: 12, color: '#999', marginTop: 8, fontStyle: 'italic', textAlign: 'center', paddingHorizontal: 10 },

  paceRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  paceChip: { flex: 1, height: 40, backgroundColor: '#F5F5F5', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#EEE' },
  paceChipActive: { backgroundColor: COLORS.primary || '#4CAF50', borderColor: COLORS.primary || '#4CAF50' },
  paceChipText: { fontSize: 13, fontWeight: '600', color: '#666' },
  paceChipTextActive: { color: '#FFF' },

  // Result Styles
  resultContainer: { alignItems: 'center', paddingVertical: 10 },
  resultSubtitle: { fontSize: 12, fontWeight: '700', color: COLORS?.primary || '#4CAF50', letterSpacing: 1 },
  resultTitle: { fontSize: 44, fontWeight: '900', color: '#111', marginVertical: 8 },
  estimateContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.03)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  estimateText: { fontSize: 13, color: '#666', fontWeight: '500' },
  estimateValue: { color: COLORS?.primary || '#4CAF50', fontWeight: '800' },
  macroBox: { width: '100%', backgroundColor: 'rgba(255,255,255,0.8)', padding: 20, borderRadius: 16, marginTop: 16, borderWidth: 1, borderColor: '#EEE' },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  macroLabel: { fontSize: 14, fontWeight: '700', color: '#333' },
  macroValue: { fontSize: 14, fontWeight: '800', color: '#111' },
  progressBarBg: { height: 8, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 }
});

export default OnboardingScreen;