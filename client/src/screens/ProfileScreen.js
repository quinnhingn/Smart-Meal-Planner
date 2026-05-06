// src/screens/ProfileScreen.js
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, Pressable, 
  ScrollView, ActivityIndicator, Image, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { useAppStore } from '../store/useAppStore';
import { COLORS } from '../constants/theme';
import { calculateTDEEAndMacros } from '../utils/calculator';
// THÊM: BODY_TYPES, PACE_OPTIONS, DISLIKES
import { GOALS, ACTIVITY_LEVELS, DIETS, ALLERGIES, BODY_TYPES, PACE_OPTIONS, DISLIKES } from '../utils/onboardingData';

// Components
import MacroProgressBars from '../components/profile/MacroProgressBars';
import BottomSheetSelector from '../components/profile/BottomSheetSelector';

const GENDER_OPTIONS = [
  { id: 'male', title: 'Nam', icon: '👨' },
  { id: 'female', title: 'Nữ', icon: '👩' },
];

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { userProfile, updateProfile, isLoading, currentStreak } = useAppStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null); 
  const [showCustomAllergy, setShowCustomAllergy] = useState(false);
  const [customAllergyText, setCustomAllergyText] = useState('');
  
  // THÊM STATE CHO DISLIKES
  const [showCustomDislike, setShowCustomDislike] = useState(false);
  const [customDislikeText, setCustomDislikeText] = useState('');
  
  // CẬP NHẬT: Thêm targetWeight, bodyType, pace, dislikes
  const [formData, setFormData] = useState({
    name: userProfile?.name || 'Nguyễn Nhã Quỳnh Nhi',
    email: userProfile?.email || 'nguyenquynhnhi@vku.udn.vn',
    avatarUri: userProfile?.avatarUri || null, 
    gender: userProfile?.gender || 'female',
    age: userProfile?.age?.toString() || '21',
    weight: userProfile?.weight?.toString() || '55',
    targetWeight: userProfile?.targetWeight?.toString() || '50',
    height: userProfile?.height?.toString() || '165',
    goal: userProfile?.goal || 'lose_weight',
    bodyType: userProfile?.bodyType || 'mesomorph',
    pace: userProfile?.pace || 'normal',
    activity: userProfile?.activity || 'light',
    diet: userProfile?.diet || 'none', 
    allergies: userProfile?.allergies || [], 
    dislikes: userProfile?.dislikes || [],
    targetCalories: userProfile?.tdee?.toString() || userProfile?.targetCalories?.toString() || '1800',
    protein: userProfile?.protein_g?.toString() || '135',
    carbs: userProfile?.carbs_g?.toString() || '180',
    fat: userProfile?.fat_g?.toString() || '60',
  });

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const toggleAllergy = (allergyLabel) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergyLabel) 
        ? prev.allergies.filter(item => item !== allergyLabel) 
        : [...prev.allergies, allergyLabel]
    }));
  };

  const handleAddCustomAllergy = () => {
    if (customAllergyText.trim()) {
      toggleAllergy(customAllergyText.trim());
      setCustomAllergyText('');
      setShowCustomAllergy(false);
    }
  };

  // THÊM: Logic quản lý món ghét
  const toggleDislike = (dislikeLabel) => {
    setFormData(prev => ({
      ...prev,
      dislikes: prev.dislikes.includes(dislikeLabel) 
        ? prev.dislikes.filter(item => item !== dislikeLabel) 
        : [...prev.dislikes, dislikeLabel]
    }));
  };

  const handleAddCustomDislike = () => {
    if (customDislikeText.trim()) {
      toggleDislike(customDislikeText.trim());
      setCustomDislikeText('');
      setShowCustomDislike(false);
    }
  };

  const handlePickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      handleChange('avatarUri', uri);
      await updateProfile({ ...userProfile, avatarUri: uri }); 
    }
  };

  const handleSave = async () => {
    // Truyền đầy đủ cho Form Calculator
    const currentPhysicalData = {
      gender: formData.gender,
      age: parseInt(formData.age) || 0,
      height: parseFloat(formData.height) || 0,
      weight: parseFloat(formData.weight) || 0,
      targetWeight: parseFloat(formData.targetWeight) || 0,
      bodyType: formData.bodyType,
      pace: formData.pace,
      activity: formData.activity,
      goal: formData.goal,
      diet: formData.diet,
      allergies: formData.allergies,
      dislikes: formData.dislikes
    };

    const newMacros = calculateTDEEAndMacros(currentPhysicalData);

    const payload = {
      name: formData.name,
      avatarUri: formData.avatarUri, 
      ...currentPhysicalData,
      targetCalories: newMacros.tdee,
      protein_g: newMacros.protein_g,
      carbs_g: newMacros.carbs_g,
      fat_g: newMacros.fat_g,
    };

    const success = await updateProfile(payload);
    if (success) {
      setFormData(prev => ({
        ...prev,
        targetCalories: newMacros.tdee.toString(),
        protein: newMacros.protein_g.toString(),
        carbs: newMacros.carbs_g.toString(),
        fat: newMacros.fat_g.toString(),
      }));
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userProfile?.name || 'Nguyễn Nhã Quỳnh Nhi',
      email: userProfile?.email || 'nguyenquynhnhi@vku.udn.vn',
      avatarUri: userProfile?.avatarUri || null, 
      gender: userProfile?.gender || 'female',
      age: userProfile?.age?.toString() || '21',
      weight: userProfile?.weight?.toString() || '55',
      targetWeight: userProfile?.targetWeight?.toString() || '50',
      height: userProfile?.height?.toString() || '165',
      goal: userProfile?.goal || 'lose_weight',
      bodyType: userProfile?.bodyType || 'mesomorph',
      pace: userProfile?.pace || 'normal',
      activity: userProfile?.activity || 'light',
      diet: userProfile?.diet || 'none', 
      allergies: userProfile?.allergies || [], 
      dislikes: userProfile?.dislikes || [],
      targetCalories: userProfile?.tdee?.toString() || userProfile?.targetCalories?.toString() || '1800',
      protein: userProfile?.protein_g?.toString() || '135',
      carbs: userProfile?.carbs_g?.toString() || '180',
      fat: userProfile?.fat_g?.toString() || '60',
    });
    setIsEditing(false);
    setShowCustomAllergy(false);
    setShowCustomDislike(false);
  };

  const formatText = (type, value) => {
    if (type === 'goal') return GOALS.find(g => g.id === value)?.title || value;
    if (type === 'activity') return ACTIVITY_LEVELS.find(a => a.id === value)?.title || value;
    if (type === 'diet') return DIETS.find(d => d.id === value)?.label || value; 
    if (type === 'gender') return GENDER_OPTIONS.find(g => g.id === value)?.title || value; 
    if (type === 'bodyType') return BODY_TYPES?.find(b => b.id === value)?.title || value;
    if (type === 'pace') return PACE_OPTIONS?.find(p => p.id === value)?.title || value;
    return value;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1A1D1E" />
          </Pressable>
          <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
        </View>
        {!isEditing && (
          <Pressable onPress={() => setIsEditing(true)} style={styles.editBtn}>
            <Ionicons name="pencil" size={18} color={COLORS.primary} />
            <Text style={styles.editBtnText}>Sửa</Text>
          </Pressable>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* AVATAR */}
        <View style={styles.avatarSection}>
          <Pressable onPress={handlePickAvatar} style={styles.avatarWrapper}>
            {formData.avatarUri ? (
              <Image source={{ uri: formData.avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarCircle}><Text style={styles.avatarText}>{formData.name.charAt(0).toUpperCase()}</Text></View>
            )}
            <View style={styles.cameraBadge}><Ionicons name="camera" size={14} color="#FFF" /></View>
          </Pressable>
          <Text style={styles.userName}>{formData.name}</Text>
          <Text style={styles.userEmail}>{formData.email}</Text>
        </View>

        {/* STREAK */}
        <View style={[styles.card, styles.streakCard]}>
          <View style={styles.streakInfo}>
            <Text style={styles.streakTitle}>Chuỗi kỷ luật</Text>
            <Text style={styles.streakDesc}>Ghi chép liên tục để giữ chuỗi!</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakNumber}>{currentStreak || 0}</Text>
            <Ionicons name="flame" size={24} color="#FF9800" />
          </View>
        </View>

        {/* THÔNG TIN CƠ THỂ */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Chỉ số cơ thể</Text>
          <InfoRow label="Họ và tên" value={formData.name} isEditing={isEditing} onChangeText={(txt) => handleChange('name', txt)} />
          <Pressable style={styles.selectorRow} onPress={() => isEditing && setActiveSheet('gender')}>
            <Text style={styles.infoLabel}>Giới tính</Text>
            <View style={styles.selectorValueGroup}>
              <Text style={[styles.infoValue, isEditing && styles.textLink]}>{formatText('gender', formData.gender)}</Text>
              {isEditing && <Ionicons name="chevron-down" size={16} color={COLORS.primary} style={{marginLeft: 4}} />}
            </View>
          </Pressable>
          <InfoRow label="Tuổi" value={formData.age} isEditing={isEditing} numeric onChangeText={(txt) => handleChange('age', txt.replace(/[^0-9]/g, ''))} />
          <InfoRow label="Chiều cao (cm)" value={formData.height} isEditing={isEditing} numeric onChangeText={(txt) => handleChange('height', txt.replace(/[^0-9.]/g, ''))} />
          <InfoRow label="Cân nặng (kg)" value={formData.weight} isEditing={isEditing} numeric onChangeText={(txt) => handleChange('weight', txt.replace(/[^0-9.]/g, ''))} />
          
          {/* Cân nặng mục tiêu chỉ hiện nếu mục tiêu không phải Giữ dáng */}
          {formData.goal !== 'maintain' && (
            <InfoRow label="Cân nặng mục tiêu" value={formData.targetWeight} isEditing={isEditing} numeric onChangeText={(txt) => handleChange('targetWeight', txt.replace(/[^0-9.]/g, ''))} />
          )}

          <Pressable style={styles.selectorRow} onPress={() => isEditing && setActiveSheet('bodyType')}>
            <Text style={styles.infoLabel}>Tạng người</Text>
            <View style={styles.selectorValueGroup}>
              <Text style={[styles.infoValue, isEditing && styles.textLink]}>{formatText('bodyType', formData.bodyType)}</Text>
              {isEditing && <Ionicons name="chevron-down" size={16} color={COLORS.primary} style={{marginLeft: 4}} />}
            </View>
          </Pressable>
        </View>

        {/* PHÂN TÍCH & DỊ ỨNG & DISLIKES */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Phân tích & Lộ trình</Text>
          <Pressable style={styles.selectorRow} onPress={() => isEditing && setActiveSheet('goal')}>
            <Text style={styles.infoLabel}>Mục tiêu</Text>
            <View style={styles.selectorValueGroup}>
              <Text style={[styles.infoValue, isEditing && styles.textLink]}>{formatText('goal', formData.goal)}</Text>
              {isEditing && <Ionicons name="chevron-down" size={16} color={COLORS.primary} style={{marginLeft: 4}} />}
            </View>
          </Pressable>
          <Pressable style={styles.selectorRow} onPress={() => isEditing && setActiveSheet('pace')}>
            <Text style={styles.infoLabel}>Tốc độ thực hiện</Text>
            <View style={styles.selectorValueGroup}>
              <Text style={[styles.infoValue, isEditing && styles.textLink]}>{formatText('pace', formData.pace)}</Text>
              {isEditing && <Ionicons name="chevron-down" size={16} color={COLORS.primary} style={{marginLeft: 4}} />}
            </View>
          </Pressable>
          <Pressable style={styles.selectorRow} onPress={() => isEditing && setActiveSheet('activity')}>
            <Text style={styles.infoLabel}>Mức vận động</Text>
            <View style={styles.selectorValueGroup}>
              <Text style={[styles.infoValue, isEditing && styles.textLink]}>{formatText('activity', formData.activity)}</Text>
              {isEditing && <Ionicons name="chevron-down" size={16} color={COLORS.primary} style={{marginLeft: 4}} />}
            </View>
          </Pressable>
          <Pressable style={styles.selectorRow} onPress={() => isEditing && setActiveSheet('diet')}>
            <Text style={styles.infoLabel}>Chế độ ăn</Text>
            <View style={styles.selectorValueGroup}>
              <Text style={[styles.infoValue, isEditing && styles.textLink]}>{formatText('diet', formData.diet)}</Text>
              {isEditing && <Ionicons name="chevron-down" size={16} color={COLORS.primary} style={{marginLeft: 4}} />}
            </View>
          </Pressable>

          {/* DỊ ỨNG */}
          <View style={styles.allergySection}>
            <Text style={styles.infoLabel}>Dị ứng thực phẩm</Text>
            <View style={styles.tagContainer}>
              {isEditing ? (
                <>
                  {ALLERGIES.map(item => (
                    <Pressable key={item.id} style={[styles.chip, formData.allergies.includes(item.label) && styles.chipActive]} onPress={() => toggleAllergy(item.label)}>
                      <Text style={[styles.chipText, formData.allergies.includes(item.label) && styles.chipTextActive]}>{item.label}</Text>
                    </Pressable>
                  ))}
                  {formData.allergies.filter(label => !ALLERGIES.find(a => a.label === label)).map(customLabel => (
                    <Pressable key={customLabel} style={[styles.chip, styles.chipActive]} onPress={() => toggleAllergy(customLabel)}>
                      <Text style={[styles.chipText, styles.chipTextActive]}>{customLabel}</Text>
                    </Pressable>
                  ))}
                  <Pressable style={styles.chipAdd} onPress={() => setShowCustomAllergy(!showCustomAllergy)}>
                    <Ionicons name="add" size={16} color={COLORS.primary} />
                    <Text style={[styles.chipText, {color: COLORS.primary}]}>Khác</Text>
                  </Pressable>
                </>
              ) : (
                formData.allergies.length > 0 
                  ? formData.allergies.map((item, idx) => (
                      <View key={idx} style={styles.tag}><Text style={styles.tagText}>{item}</Text></View>
                    ))
                  : <Text style={styles.infoValue}>Không có</Text>
              )}
            </View>

            {isEditing && showCustomAllergy && (
              <View style={styles.customInputRow}>
                <TextInput style={styles.customInput} placeholder="Nhập dị ứng khác..." value={customAllergyText} onChangeText={setCustomAllergyText} onSubmitEditing={handleAddCustomAllergy} />
                <Pressable style={styles.addBtnSmall} onPress={handleAddCustomAllergy}><Text style={styles.addBtnText}>Thêm</Text></Pressable>
              </View>
            )}
          </View>

          {/* NHỮNG MÓN GHÉT (DISLIKES) */}
          <View style={styles.allergySection}>
            <Text style={styles.infoLabel}>Những món không thích ăn</Text>
            <View style={styles.tagContainer}>
              {isEditing ? (
                <>
                  {DISLIKES.map(item => (
                    <Pressable key={item.id} style={[styles.chip, formData.dislikes.includes(item.label) && styles.chipActive]} onPress={() => toggleDislike(item.label)}>
                      <Text style={[styles.chipText, formData.dislikes.includes(item.label) && styles.chipTextActive]}>{item.label}</Text>
                    </Pressable>
                  ))}
                  {formData.dislikes.filter(label => !DISLIKES.find(d => d.label === label)).map(customLabel => (
                    <Pressable key={customLabel} style={[styles.chip, styles.chipActive]} onPress={() => toggleDislike(customLabel)}>
                      <Text style={[styles.chipText, styles.chipTextActive]}>{customLabel}</Text>
                    </Pressable>
                  ))}
                  <Pressable style={styles.chipAdd} onPress={() => setShowCustomDislike(!showCustomDislike)}>
                    <Ionicons name="add" size={16} color={COLORS.primary} />
                    <Text style={[styles.chipText, {color: COLORS.primary}]}>Khác</Text>
                  </Pressable>
                </>
              ) : (
                formData.dislikes.length > 0 
                  ? formData.dislikes.map((item, idx) => (
                      <View key={idx} style={styles.tag}><Text style={styles.tagText}>{item}</Text></View>
                    ))
                  : <Text style={styles.infoValue}>Không có</Text>
              )}
            </View>

            {isEditing && showCustomDislike && (
              <View style={styles.customInputRow}>
                <TextInput style={styles.customInput} placeholder="Nhập món ghét..." value={customDislikeText} onChangeText={setCustomDislikeText} onSubmitEditing={handleAddCustomDislike} />
                <Pressable style={styles.addBtnSmall} onPress={handleAddCustomDislike}><Text style={styles.addBtnText}>Thêm</Text></Pressable>
              </View>
            )}
          </View>
        </View>

        {/* DINH DƯỠNG */}
        <View style={styles.card}>
          <View style={styles.macroHeader}>
            <Text style={styles.cardTitle}>Mục tiêu dinh dưỡng</Text>
            <Text style={styles.tdeeValue}>{formData.targetCalories} <Text style={{fontSize: 14, color: '#888'}}>kcal</Text></Text>
          </View>
          <MacroProgressBars protein={parseInt(formData.protein)} carbs={parseInt(formData.carbs)} fat={parseInt(formData.fat)} />
        </View>

        {/* ACTIONS */}
        {isEditing && (
          <View style={styles.actionRow}>
            <Pressable style={styles.cancelBtn} onPress={handleCancel} disabled={isLoading}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={handleSave} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Lưu thay đổi</Text>}
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM SHEETS */}
      <BottomSheetSelector visible={activeSheet === 'goal'} onClose={() => setActiveSheet(null)} title="Chọn Mục Tiêu" data={GOALS} selectedValue={formData.goal} onSelect={(val) => handleChange('goal', val)} />
      <BottomSheetSelector visible={activeSheet === 'activity'} onClose={() => setActiveSheet(null)} title="Mức Vận Động" data={ACTIVITY_LEVELS} selectedValue={formData.activity} onSelect={(val) => handleChange('activity', val)} />
      <BottomSheetSelector visible={activeSheet === 'diet'} onClose={() => setActiveSheet(null)} title="Chế độ ăn" data={DIETS} selectedValue={formData.diet} onSelect={(val) => handleChange('diet', val)} />
      <BottomSheetSelector visible={activeSheet === 'gender'} onClose={() => setActiveSheet(null)} title="Giới tính" data={GENDER_OPTIONS} selectedValue={formData.gender} onSelect={(val) => handleChange('gender', val)} />
      <BottomSheetSelector visible={activeSheet === 'bodyType'} onClose={() => setActiveSheet(null)} title="Tạng người" data={BODY_TYPES || []} selectedValue={formData.bodyType} onSelect={(val) => handleChange('bodyType', val)} />
      <BottomSheetSelector visible={activeSheet === 'pace'} onClose={() => setActiveSheet(null)} title="Tốc độ đạt mục tiêu" data={PACE_OPTIONS || []} selectedValue={formData.pace} onSelect={(val) => handleChange('pace', val)} />

      {isLoading && (
        <View style={[StyleSheet.absoluteFillObject, styles.loadingOverlay]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value, isEditing, onChangeText, numeric }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    {isEditing ? (
      <TextInput style={styles.infoInput} value={value} onChangeText={onChangeText} keyboardType={numeric ? "numeric" : "default"} />
    ) : (
      <Text style={styles.infoValue}>{value || '--'}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A1D1E' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 16 },
  editBtnText: { color: COLORS.primary, fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#FFF' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  userName: { fontSize: 22, fontWeight: '700', color: '#1A1D1E' },
  userEmail: { fontSize: 14, fontWeight: '600', color: '#888', marginTop: 4 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EEE' },
  cardTitle: { fontSize: 14, fontWeight: '800', color: COLORS.primary, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  streakCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF3E0', borderColor: '#FFE0B2' },
  streakInfo: { flex: 1 },
  streakTitle: { fontSize: 16, fontWeight: '800', color: '#E65100', marginBottom: 4 },
  streakDesc: { fontSize: 13, color: '#F57C00' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFE0B2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
  streakNumber: { fontSize: 20, fontWeight: '900', color: '#E65100' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F0F0F0' },
  selectorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#F0F0F0' },
  selectorValueGroup: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: { fontSize: 14, color: '#888', fontWeight: '600', flex: 1 },
  infoValue: { fontSize: 15, color: '#333', fontWeight: '700', textAlign: 'right' },
  infoInput: { fontSize: 15, color: COLORS.primary, fontWeight: '700', minWidth: 100, textAlign: 'right', borderBottomWidth: 1, borderColor: COLORS.primary, padding: 0, flex: 2 },
  textLink: { color: COLORS.primary },
  allergySection: { paddingVertical: 12 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, justifyContent: 'flex-start' },
  tag: { backgroundColor: '#F0F0F0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagText: { fontSize: 13, fontWeight: '600', color: '#555' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: '#E0E0E0' },
  chipActive: { backgroundColor: 'rgba(76, 175, 80, 0.1)', borderColor: COLORS.primary },
  chipAdd: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: '#555' },
  chipTextActive: { color: COLORS.primary },
  customInputRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  customInput: { flex: 1, height: 44, backgroundColor: '#F8F9FA', borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E0E0E0' },
  addBtnSmall: { backgroundColor: COLORS.primary, paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center' },
  addBtnText: { color: '#FFF', fontWeight: '700' },
  macroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tdeeValue: { fontSize: 24, fontWeight: '900', color: '#1A1D1E', marginTop: -12 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: '#E0E0E0', alignItems: 'center' },
  cancelBtnText: { color: '#555', fontWeight: '700', fontSize: 16 },
  saveBtn: { flex: 2, paddingVertical: 14, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  loadingOverlay: { backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
});

export default ProfileScreen;