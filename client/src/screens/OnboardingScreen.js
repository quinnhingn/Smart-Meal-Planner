// src/screens/OnboardingScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Platform,
  useWindowDimensions, KeyboardAvoidingView, ScrollView, Pressable, TextInput, Animated, FlatList, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ResponsiveContainer from '../components/ResponsiveContainer';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

const ACTIVITY_LEVELS = [
  { id: 'sedentary', title: 'Ít vận động', desc: 'Dân văn phòng, ngồi nhiều, ít tập luyện', factor: 1.2 },
  { id: 'light', title: 'Vận động nhẹ', desc: 'Tập nhẹ nhàng 1-3 buổi/tuần', factor: 1.375 },
  { id: 'moderate', title: 'Vận động vừa', desc: 'Tập luyện đều đặn 3-5 buổi/tuần', factor: 1.55 },
  { id: 'active', title: 'Vận động nhiều', desc: 'Tập nặng 6-7 buổi/tuần', factor: 1.725 }
];

const GOALS = [
  { id: 'lose_weight', title: 'Giảm mỡ', desc: 'Thâm hụt calo, giữ cơ', icon: 'trending-down-outline', color: '#E53935' },
  { id: 'maintain', title: 'Duy trì', desc: 'Giữ cân nặng hiện tại', icon: 'remove-circle-outline', color: '#FBC02D' },
  { id: 'gain_muscle', title: 'Tăng cơ', desc: 'Thặng dư calo, đẩy tạ', icon: 'trending-up-outline', color: '#4CAF50' }
];

const PREDEF_ALLERGIES = ['Hải sản', 'Đậu phộng', 'Sữa', 'Gluten', 'Trứng'];
const PREDEF_DISLIKES = ['Rau mùi', 'Mướp đắng', 'Hành tây', 'Tỏi', 'Sầu riêng'];
const PREDEF_DIETS = ['Bình thường', 'Chay', 'Thuần chay', 'Keto'];

const OnboardingScreen = () => {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Toast State
  const [toast, setToast] = useState({ visible: false, message: '' });
  const toastAnim = useRef(new Animated.Value(-100)).current;

  const [formData, setFormData] = useState({
    gender: 'male',
    age: '25',
    height_cm: '170',
    weight_kg: '65',
    activity_level: 'moderate',
    goal: 'lose_weight',
    target_weight_kg: '',
    speed: 'normal',
    allergies: [],
    dislikes: [],
    diet: 'Bình thường'
  });

  // UI States for "+ Khác"
  const [otherAllergyText, setOtherAllergyText] = useState('');
  const [showOtherAllergy, setShowOtherAllergy] = useState(false);
  const [otherDislikeText, setOtherDislikeText] = useState('');
  const [showOtherDislike, setShowOtherDislike] = useState(false);
  const [otherDietText, setOtherDietText] = useState('');
  const [showOtherDiet, setShowOtherDiet] = useState(false);

  const [calculatedResult, setCalculatedResult] = useState(null);

  const updateData = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const toggleArrayItem = (key, item) => {
    setFormData(prev => {
      const arr = prev[key];
      if (arr.includes(item)) return { ...prev, [key]: arr.filter(i => i !== item) };
      return { ...prev, [key]: [...arr, item] };
    });
  };

  const showToast = (message) => {
    setToast({ visible: true, message });
    Animated.spring(toastAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToast(prev => ({ ...prev, visible: false })));
    }, 3000);
  };

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentIndex + 1) / 5,
      duration: 300,
      useNativeDriver: false
    }).start();
  }, [currentIndex]);

  const handleNext = () => {
    // Validation
    if (currentIndex === 0) {
      if (!formData.age || !formData.height_cm || !formData.weight_kg) {
        showToast('Vui lòng điền đầy đủ thông tin cơ bản!');
        return;
      }
    }

    if (currentIndex === 2) {
      if (formData.goal === 'lose_weight' || formData.goal === 'gain_muscle') {
        if (!formData.target_weight_kg) {
          showToast('Vui lòng nhập cân nặng mục tiêu!');
          return;
        }

        const currentW = parseFloat(formData.weight_kg);
        const targetW = parseFloat(formData.target_weight_kg);

        if (formData.goal === 'lose_weight' && targetW >= currentW) {
          showToast('Để giảm mỡ, cân nặng mục tiêu phải nhỏ hơn cân nặng hiện tại.');
          return;
        }

        if (formData.goal === 'gain_muscle' && targetW <= currentW) {
          showToast('Để tăng cơ, cân nặng mục tiêu phải lớn hơn cân nặng hiện tại.');
          return;
        }
      }
    }

    if (currentIndex === 3) {
      calculateResults();
    }

    if (currentIndex < 4) {
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

  const calculateResults = () => {
    const { gender, age, height_cm, weight_kg, activity_level, goal, target_weight_kg, speed } = formData;
    const w = parseFloat(weight_kg) || 0;
    const h = parseFloat(height_cm) || 0;
    const a = parseInt(age, 10) || 0;
    const targetW = parseFloat(target_weight_kg) || w;

    // 1. BMR
    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    bmr += gender === 'male' ? 5 : -161;

    // 2. TDEE
    const factor = ACTIVITY_LEVELS.find(l => l.id === activity_level)?.factor || 1.2;
    const tdee = bmr * factor;

    // 3. Target Calories & Duration
    let targetCal = tdee;
    let expectedWeeks = 0;

    if (goal === 'lose_weight' || goal === 'gain_muscle') {
      const weightDiff = Math.abs(w - targetW);
      let percentagePerWeek = 0;

      if (goal === 'lose_weight') {
        targetCal -= 500;
        percentagePerWeek = speed === 'normal' ? 0.005 : 0.002;
      } else {
        targetCal += 300;
        percentagePerWeek = speed === 'normal' ? 0.005 : 0.002;
      }

      const kgPerWeek = w * percentagePerWeek;
      if (kgPerWeek > 0 && weightDiff > 0) {
        expectedWeeks = Math.ceil(weightDiff / kgPerWeek);
      }
    }

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

    setCalculatedResult({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      target_calories: Math.round(targetCal),
      target_protein_g,
      target_carbs_g,
      target_fat_g,
      expectedWeeks
    });
  };

  const handleFinish = async () => {
    const finalProfile = {
      ...formData,
      ...calculatedResult
    };

    console.log('✅ [Gửi API] Dữ liệu Onboarding:', finalProfile);
    const { useAppStore } = require('../store/useAppStore');
    const store = useAppStore.getState();
    await store.submitOnboardingProfile(finalProfile);
  };

  const renderBioForm = () => (
    <View style={styles.slideItem}>
      <Text style={styles.title}>Chỉ số cơ thể</Text>
      <Text style={styles.subtitle}>NutriLens cần biết một chút về bạn để tính toán chính xác nhất.</Text>

      <View style={styles.formGroup}>
        <View style={styles.inputGroup}>
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
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Tuổi</Text>
            <TextInput style={styles.input} keyboardType="number-pad" value={formData.age} onChangeText={v => updateData('age', v)} maxLength={3} />
          </View>
        </View>

        <View style={[styles.row, styles.inputGroup]}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Chiều cao (cm)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={formData.height_cm} onChangeText={v => updateData('height_cm', v)} maxLength={5} />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>Cân nặng (kg)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={formData.weight_kg} onChangeText={v => updateData('weight_kg', v)} maxLength={5} />
          </View>
        </View>
      </View>
    </View>
  );

  const renderActivityForm = () => (
    <View style={styles.slideItem}>
      <Text style={styles.title}>Mức độ vận động</Text>
      <Text style={styles.subtitle}>Bạn thường xuyên hoạt động thể chất như thế nào?</Text>
      <View style={{ paddingVertical: 10, gap: 12 }}>
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
      </View>
    </View>
  );

  const renderGoalForm = () => (
    <View style={styles.slideItem}>
      <View style={{ paddingBottom: 20 }}>
        <Text style={styles.title}>Mục tiêu của bạn</Text>
        <Text style={styles.subtitle}>NutriLens sẽ tạo lộ trình dựa trên mục tiêu này.</Text>

        <View style={{ marginTop: 20, gap: 16 }}>
          {GOALS.map(item => (
            <Pressable
              key={item.id}
              style={[styles.tapCard, formData.goal === item.id && { ...styles.tapCardActive, borderColor: item.color, backgroundColor: item.color + '05' }]}
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

        {(formData.goal === 'lose_weight' || formData.goal === 'gain_muscle') && (
          <View style={styles.subGoalContainer}>
            <Text style={styles.label}>Cân nặng mục tiêu (kg)</Text>
            <TextInput
              style={[styles.input, { marginBottom: 24 }]}
              keyboardType="numeric"
              placeholder="Nhập số kg mong muốn"
              value={formData.target_weight_kg}
              onChangeText={v => updateData('target_weight_kg', v)}
              maxLength={5}
            />

            <Text style={styles.label}>Tốc độ mong muốn</Text>
            <View style={styles.speedRow}>
              <Pressable
                style={[styles.speedBtn, formData.speed === 'normal' && styles.speedBtnActive]}
                onPress={() => updateData('speed', 'normal')}
              >
                <Text style={[styles.speedTitle, formData.speed === 'normal' && styles.speedTextActive]}>Vừa</Text>
                <Text style={[styles.speedDesc, formData.speed === 'normal' && styles.speedTextActive]}>
                  0,5% trọng lượng cơ thể/tuần
                </Text>
              </Pressable>

              <Pressable
                style={[styles.speedBtn, formData.speed === 'slow' && styles.speedBtnActive]}
                onPress={() => updateData('speed', 'slow')}
              >
                <Text style={[styles.speedTitle, formData.speed === 'slow' && styles.speedTextActive]}>Chậm</Text>
                <Text style={[styles.speedDesc, formData.speed === 'slow' && styles.speedTextActive]}>
                  0,2% trọng lượng cơ thể/tuần
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderDietaryForm = () => (
    <View style={styles.slideItem}>
      <View style={{ paddingBottom: 20 }}>
        <Text style={styles.title}>Sở thích ăn uống</Text>
        <Text style={styles.subtitle}>Món bạn thích và thực phẩm cần tránh.</Text>

        {/* DỊ ỨNG */}
        <View style={styles.dietarySection}>
          <Text style={styles.dietaryLabel}>DỊ ỨNG (CHỌN NHIỀU)</Text>
          <View style={styles.pillContainer}>
            {PREDEF_ALLERGIES.map(item => {
              const active = formData.allergies.includes(item);
              return (
                <Pressable key={item} style={[styles.pillBtn, active && styles.pillBtnActive]} onPress={() => toggleArrayItem('allergies', item)}>
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{item}</Text>
                  {active && <Ionicons name="checkmark" size={16} color={COLORS.primary} style={{ marginLeft: 4 }} />}
                </Pressable>
              );
            })}

            {formData.allergies.filter(a => !PREDEF_ALLERGIES.includes(a)).map(item => (
              <Pressable key={item} style={[styles.pillBtn, styles.pillBtnActive]} onPress={() => toggleArrayItem('allergies', item)}>
                <Text style={[styles.pillText, styles.pillTextActive]}>{item}</Text>
                <Ionicons name="close" size={16} color={COLORS.primary} style={{ marginLeft: 4 }} />
              </Pressable>
            ))}

            {showOtherAllergy ? (
              <View style={styles.customInputRow}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Nhập dị ứng..."
                  value={otherAllergyText}
                  onChangeText={setOtherAllergyText}
                  autoFocus
                />
                <Pressable style={styles.customInputBtn} onPress={() => {
                  if (otherAllergyText.trim()) toggleArrayItem('allergies', otherAllergyText.trim());
                  setOtherAllergyText('');
                  setShowOtherAllergy(false);
                }}>
                  <Ionicons name="checkmark" size={20} color="#FFF" />
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.pillBtn} onPress={() => setShowOtherAllergy(true)}>
                <Text style={styles.pillText}>+ Khác</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* GHÉT ĂN GÌ */}
        <View style={styles.dietarySection}>
          <Text style={styles.dietaryLabel}>BẠN GHÉT ĂN GÌ? (DISLIKES)</Text>
          <View style={styles.pillContainer}>
            {PREDEF_DISLIKES.map(item => {
              const active = formData.dislikes.includes(item);
              return (
                <Pressable key={item} style={[styles.pillBtn, active && styles.pillBtnActive]} onPress={() => toggleArrayItem('dislikes', item)}>
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{item}</Text>
                  {active && <Ionicons name="checkmark" size={16} color={COLORS.primary} style={{ marginLeft: 4 }} />}
                </Pressable>
              );
            })}

            {formData.dislikes.filter(a => !PREDEF_DISLIKES.includes(a)).map(item => (
              <Pressable key={item} style={[styles.pillBtn, styles.pillBtnActive]} onPress={() => toggleArrayItem('dislikes', item)}>
                <Text style={[styles.pillText, styles.pillTextActive]}>{item}</Text>
                <Ionicons name="close" size={16} color={COLORS.primary} style={{ marginLeft: 4 }} />
              </Pressable>
            ))}

            {showOtherDislike ? (
              <View style={styles.customInputRow}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Nhập món ghét..."
                  value={otherDislikeText}
                  onChangeText={setOtherDislikeText}
                  autoFocus
                />
                <Pressable style={styles.customInputBtn} onPress={() => {
                  if (otherDislikeText.trim()) toggleArrayItem('dislikes', otherDislikeText.trim());
                  setOtherDislikeText('');
                  setShowOtherDislike(false);
                }}>
                  <Ionicons name="checkmark" size={20} color="#FFF" />
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.pillBtn} onPress={() => setShowOtherDislike(true)}>
                <Text style={styles.pillText}>+ Khác</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* CHẾ ĐỘ ĂN (CHỌN 1) */}
        <View style={styles.dietarySection}>
          <Text style={styles.dietaryLabel}>CHẾ ĐỘ ĂN (CHỌN 1)</Text>
          <View style={styles.pillContainer}>
            {PREDEF_DIETS.map(item => {
              const active = formData.diet === item;
              return (
                <Pressable key={item} style={[styles.pillBtn, active && styles.pillBtnActive]} onPress={() => updateData('diet', item)}>
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{item}</Text>
                  {active && <Ionicons name="checkmark" size={16} color={COLORS.primary} style={{ marginLeft: 4 }} />}
                </Pressable>
              );
            })}

            {!PREDEF_DIETS.includes(formData.diet) && formData.diet !== '' && (
              <Pressable style={[styles.pillBtn, styles.pillBtnActive]} onPress={() => updateData('diet', 'Bình thường')}>
                <Text style={[styles.pillText, styles.pillTextActive]}>{formData.diet}</Text>
                <Ionicons name="checkmark" size={16} color={COLORS.primary} style={{ marginLeft: 4 }} />
              </Pressable>
            )}

            {showOtherDiet ? (
              <View style={styles.customInputRow}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Nhập chế độ ăn..."
                  value={otherDietText}
                  onChangeText={setOtherDietText}
                  autoFocus
                />
                <Pressable style={styles.customInputBtn} onPress={() => {
                  if (otherDietText.trim()) updateData('diet', otherDietText.trim());
                  setOtherDietText('');
                  setShowOtherDiet(false);
                }}>
                  <Ionicons name="checkmark" size={20} color="#FFF" />
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.pillBtn} onPress={() => setShowOtherDiet(true)}>
                <Text style={styles.pillText}>+ Khác</Text>
              </Pressable>
            )}
          </View>
        </View>

      </View>
    </View>
  );

  const renderResultForm = () => {
    const totalMacros = calculatedResult ? (calculatedResult.target_protein_g + calculatedResult.target_carbs_g + calculatedResult.target_fat_g) : 1;

    return (
      <View style={styles.slideItem}>
        <Text style={styles.title}>Kế hoạch của bạn</Text>
        <Text style={styles.subtitle}>Lộ trình tối ưu để đạt mục tiêu.</Text>

        {calculatedResult && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeaderCentred}>
              <Ionicons name="leaf" size={40} color={COLORS.primary} />
              <Text style={styles.resultStatusText}>SẴN SÀNG HÀNH ĐỘNG</Text>
              <View style={styles.caloRow}>
                <Text style={styles.resultCaloLarge}>{calculatedResult.target_calories}</Text>
                <Text style={styles.resultCaloUnit}>kcal/ngày</Text>
              </View>
            </View>

            {calculatedResult.expectedWeeks > 0 && (
              <View style={styles.roadmapPill}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.roadmapPillText}>
                  Lộ trình dự kiến đạt mục tiêu: <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{calculatedResult.expectedWeeks} tuần</Text>
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <View style={styles.summaryPill}>
                <Ionicons name={GOALS.find(g => g.id === formData.goal)?.icon || "flag-outline"} size={14} color="#666" />
                <Text style={styles.summaryPillText}>{GOALS.find(g => g.id === formData.goal)?.title}</Text>
              </View>

              <View style={styles.summaryPill}>
                <Ionicons name="scale-outline" size={14} color="#666" />
                {formData.goal === 'maintain' ? (
                  <Text style={styles.summaryPillText}>{formData.weight_kg}kg</Text>
                ) : (
                  <Text style={styles.summaryPillText}>
                    {formData.weight_kg}kg <Ionicons name={formData.goal === 'lose_weight' ? "arrow-down" : "arrow-up"} size={12} color={formData.goal === 'lose_weight' ? "#E53935" : "#4CAF50"} /> {formData.target_weight_kg}kg
                  </Text>
                )}
              </View>

              {formData.goal !== 'maintain' && (
                <View style={styles.summaryPill}>
                  <Ionicons name="speedometer-outline" size={14} color="#666" />
                  <Text style={styles.summaryPillText}>{formData.speed === 'normal' ? 'Vừa' : 'Chậm'}</Text>
                </View>
              )}
            </View>

            <View style={styles.macroCard}>
              <View style={styles.macroRowItem}>
                <View style={styles.macroTextRow}>
                  <Text style={styles.macroNameText}>Protein</Text>
                  <Text style={styles.macroValueText}>{calculatedResult.target_protein_g}g</Text>
                </View>
                <View style={styles.macroProgressBarBg}>
                  <View style={[styles.macroProgressBarFill, { width: `${(calculatedResult.target_protein_g / totalMacros) * 100}%`, backgroundColor: '#E53935' }]} />
                </View>
              </View>

              <View style={styles.macroRowItem}>
                <View style={styles.macroTextRow}>
                  <Text style={styles.macroNameText}>Carbs</Text>
                  <Text style={styles.macroValueText}>{calculatedResult.target_carbs_g}g</Text>
                </View>
                <View style={styles.macroProgressBarBg}>
                  <View style={[styles.macroProgressBarFill, { width: `${(calculatedResult.target_carbs_g / totalMacros) * 100}%`, backgroundColor: '#42A5F5' }]} />
                </View>
              </View>

              <View style={[styles.macroRowItem, { marginBottom: 0 }]}>
                <View style={styles.macroTextRow}>
                  <Text style={styles.macroNameText}>Fat</Text>
                  <Text style={styles.macroValueText}>{calculatedResult.target_fat_g}g</Text>
                </View>
                <View style={styles.macroProgressBarBg}>
                  <View style={[styles.macroProgressBarFill, { width: `${(calculatedResult.target_fat_g / totalMacros) * 100}%`, backgroundColor: '#FFCA28' }]} />
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const slides = [renderBioForm, renderActivityForm, renderGoalForm, renderDietaryForm, renderResultForm];

  return (
    <ResponsiveContainer useImageBg={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.safeArea}>

        {/* Toast Notification */}
        {toast.visible && (
          <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastAnim }] }]}>
            <Ionicons name="warning" size={20} color="#FFF" />
            <Text style={styles.toastText}>{toast.message}</Text>
          </Animated.View>
        )}

        {/* Progress Bar (Centered accurately) */}
        <View style={styles.progressHeader}>
          <View style={styles.backBtnWrapper}>
            <Pressable onPress={handleBack} disabled={currentIndex === 0} style={{ padding: 4 }}>
              <Ionicons name="chevron-back" size={28} color={currentIndex > 0 ? '#333' : 'transparent'} />
            </Pressable>
          </View>

          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, {
              width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
            }]} />
          </View>

          <View style={styles.progressTextWrapper}>
            <Text style={styles.progressText}>{currentIndex + 1}/5</Text>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]} keyboardShouldPersistTaps="handled">
            <FlatList
              ref={flatListRef}
              data={slides}
              keyExtractor={(_, index) => index.toString()}
              horizontal
              pagingEnabled
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <View style={{ width: windowWidth, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'flex-start' }}>
                  <GlassCard style={[styles.card, { maxWidth: 520 }]}>
                    {item()}
                  </GlassCard>
                </View>
              )}
            />
          </ScrollView>

          {/* Sticky Footer */}
          <View style={[styles.stickyFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <CustomButton
              title={currentIndex === 4 ? "BẮT ĐẦU NGAY" : "TIẾP TỤC"}
              onPress={handleNext}
              style={{ width: '100%' }}
            />
          </View>
        </View>

      </KeyboardAvoidingView>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, width: '100%', paddingTop: Platform.OS === 'android' ? 40 : 0 },
  toastContainer: { position: 'absolute', top: Platform.OS === 'android' ? 50 : 60, left: 20, right: 20, backgroundColor: '#E53935', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', zIndex: 1000, ...SHADOWS.premium, gap: 12 },
  toastText: { color: '#FFF', fontSize: 14, fontWeight: '700', flex: 1 },
  scrollContent: { flexGrow: 1, paddingVertical: 16 },

  progressHeader: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  backBtnWrapper: { width: 40 },
  progressBarBg: { flex: 1, height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, marginHorizontal: 12, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  progressTextWrapper: { width: 40, alignItems: 'flex-end' },
  progressText: { fontSize: 14, fontWeight: '700', color: '#555' },

  cardContainer: { width: '100%', paddingHorizontal: 16, alignItems: 'center' },
  card: { padding: 0, overflow: 'hidden', width: '100%' },
  slideItem: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8 },

  title: { fontSize: 26, fontWeight: '900', color: '#1A1D1E', marginTop: 8, lineHeight: 34 },
  subtitle: { fontSize: 15, color: '#666', marginTop: 8, lineHeight: 22 },

  formGroup: { marginTop: 24 },
  inputGroup: { marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12, width: '100%' },
  flex1: { flex: 1 },
  label: { fontSize: 13, fontWeight: '800', color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { height: 56, backgroundColor: '#FFF', paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', fontSize: 18, fontWeight: '800', color: '#1A1D1E' },

  genderBtn: { flex: 1, flexDirection: 'row', height: 56, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', gap: 8 },
  genderBtnActive: { backgroundColor: COLORS.primary, borderWidth: 2, borderColor: COLORS.primary },
  genderText: { fontSize: 16, fontWeight: '800', color: '#555' },
  genderTextActive: { color: '#FFF' },

  tapCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  tapCardActive: { borderWidth: 2, borderColor: COLORS.primary, backgroundColor: 'rgba(76, 175, 80, 0.05)' },
  iconWrapper: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  tapCardContent: { flex: 1 },
  tapCardTitle: { fontSize: 16, fontWeight: '800', color: '#1A1D1E', marginBottom: 4 },
  tapCardTitleActive: { color: COLORS.primary },
  tapCardDesc: { fontSize: 13, color: '#666', lineHeight: 18 },

  subGoalContainer: { marginTop: 24, padding: 16, backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  speedRow: { flexDirection: 'column', gap: 10 },
  speedBtn: { padding: 14, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  speedBtnActive: { borderWidth: 2, borderColor: COLORS.primary, backgroundColor: 'rgba(76, 175, 80, 0.05)' },
  speedTitle: { fontSize: 15, fontWeight: '800', color: '#1A1D1E' },
  speedDesc: { fontSize: 13, color: '#666', marginTop: 2 },
  speedTextActive: { color: COLORS.primary },

  dietarySection: { marginTop: 24 },
  dietaryLabel: { fontSize: 13, fontWeight: '800', color: '#888', marginBottom: 12 },
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pillBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  pillBtnActive: { borderWidth: 2, backgroundColor: '#E8F5E9', borderColor: COLORS.primary },
  pillText: { fontSize: 14, fontWeight: '700', color: '#555' },
  pillTextActive: { color: COLORS.primary },

  customInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  customInput: { height: 40, backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 16, borderWidth: 1, borderColor: COLORS.primary, minWidth: 120, fontSize: 14, fontWeight: '700' },
  customInputBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },

  resultContainer: { alignItems: 'center', marginTop: 24, paddingBottom: 20 },
  resultHeaderCentred: { alignItems: 'center', marginBottom: 16 },
  resultStatusText: { fontSize: 13, fontWeight: '800', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8 },
  caloRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 8 },
  resultCaloLarge: { fontSize: 48, fontWeight: '900', color: '#1A1D1E', letterSpacing: -1.5 },
  resultCaloUnit: { fontSize: 18, fontWeight: '700', color: '#1A1D1E', marginLeft: 4 },

  roadmapPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.04)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginBottom: 16, gap: 6 },
  roadmapPillText: { fontSize: 13, color: '#555', fontWeight: '500' },

  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' },
  summaryPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 4 },
  summaryPillText: { fontSize: 12, fontWeight: '600', color: '#555' },

  macroCard: { width: '100%', backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', ...SHADOWS.premium },
  macroRowItem: { marginBottom: 16 },
  macroTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  macroNameText: { fontSize: 14, fontWeight: '600', color: '#1A1D1E' },
  macroValueText: { fontSize: 14, fontWeight: '700', color: '#1A1D1E' },
  macroProgressBarBg: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  macroProgressBarFill: { height: '100%', borderRadius: 4 },

  stickyFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16, backgroundColor: '#F8F9FA', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
});

export default OnboardingScreen;