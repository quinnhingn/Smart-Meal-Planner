// src/screens/OnboardingScreen.js
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  Platform,
  useWindowDimensions,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import ResponsiveContainer from '../components/ResponsiveContainer';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import { COLORS, BREAKPOINTS } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

const ONBOARDING_STEPS = [
  { id: '1', title: 'Thông tin cơ bản', subtitle: 'Giúp chúng tôi hiểu rõ hơn về bạn' },
  { id: '2', title: 'Chỉ số cơ thể', subtitle: 'Dùng để tính toán chính xác lượng Calo' },
  { id: '3', title: 'Mức độ vận động', subtitle: 'Hoạt động hàng ngày của bạn thế nào?' },
  { id: '4', title: 'Mục tiêu', subtitle: 'Bạn muốn đạt được điều gì?' },
];

const OnboardingScreen = () => {
  const { setupProfile, isLoading } = useAppStore();
  const flatListRef = useRef(null);
  
  const { width: windowWidth } = useWindowDimensions();
  const isWebLarge = Platform.OS === 'web' && windowWidth > BREAKPOINTS?.mobileMax;
  
  // Responsive Layout: Tính toán chiều rộng động cho Card
  const cardMaxWidth = 460;
  // Chiều rộng thực tế = Min của (Full màn hình - lề 32px) hoặc 460px
  const actualCardWidth = isWebLarge ? cardMaxWidth : Math.min(windowWidth - 32, cardMaxWidth);
  
  // CỐT LÕI FIX LỖI: slideWidth BẰNG CHÍNH XÁC actualCardWidth
  const slideWidth = actualCardWidth; 

  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState({
    gender: 'male', 
    age: '25', 
    height: '170', 
    weight: '65', 
    activity: 'light', 
    goal: 'maintain',
  });

  const updateData = (key, value) => setFormData({ ...formData, [key]: value });

  const handleNext = () => {
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      handleFinish();
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
    // Chuẩn hóa payload theo chuẩn Database Schema của SmartMeal
    const payload = {
      gender: formData.gender,
      age: parseInt(formData.age, 10), 
      height_cm: parseFloat(formData.height), 
      weight_kg: parseFloat(formData.weight), 
      activity_level: formData.activity, // Backend sẽ map giá trị này ra hệ số 1.2 - 1.725
      goal: formData.goal // lose_weight, maintain, gain_muscle
    };
    await setupProfile(payload);
  };

  const renderStepContent = ({ item }) => {
    return (
      // FIX OVERFLOW: Thêm Padding trực tiếp vào thẻ chứa nội dung Slide
      <View style={[styles.slideItem, { width: slideWidth }]}>
        {item.id === '1' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Giới tính của bạn</Text>
            <View style={styles.row}>
              <CustomButton title="Nam" type={formData.gender === 'male' ? 'primary' : 'glass'} onPress={() => updateData('gender', 'male')} style={styles.flex1} />
              <CustomButton title="Nữ" type={formData.gender === 'female' ? 'primary' : 'glass'} onPress={() => updateData('gender', 'female')} style={styles.flex1} />
            </View>

            <Text style={[styles.label, { marginTop: 24 }]}>Độ tuổi</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              value={formData.age} 
              onChangeText={(v) => updateData('age', v)} 
              returnKeyType="done"
            />
          </View>
        )}

        {item.id === '2' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Chiều cao (cm)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={formData.height} onChangeText={(v) => updateData('height', v)} returnKeyType="next" />
            <Text style={[styles.label, { marginTop: 24 }]}>Cân nặng (kg)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={formData.weight} onChangeText={(v) => updateData('weight', v)} returnKeyType="done" />
          </View>
        )}

        {item.id === '3' && (
          <View style={styles.verticalGroup}>
            <CustomButton title="Ít vận động (Ngồi văn phòng)" type={formData.activity === 'sedentary' ? 'primary' : 'glass'} onPress={() => updateData('activity', 'sedentary')} style={styles.fullWidth} />
            <CustomButton title="Vận động nhẹ (1-3 ngày/tuần)" type={formData.activity === 'light' ? 'primary' : 'glass'} onPress={() => updateData('activity', 'light')} style={styles.fullWidth} />
            <CustomButton title="Năng động (Tập luyện đều đặn)" type={formData.activity === 'active' ? 'primary' : 'glass'} onPress={() => updateData('activity', 'active')} style={styles.fullWidth} />
          </View>
        )}

        {item.id === '4' && (
          <View style={styles.verticalGroup}>
            <CustomButton title="Giảm cân (Cắt giảm Calo)" type={formData.goal === 'lose_weight' ? 'primary' : 'glass'} onPress={() => updateData('goal', 'lose_weight')} style={styles.fullWidth} />
            <CustomButton title="Duy trì vóc dáng" type={formData.goal === 'maintain' ? 'primary' : 'glass'} onPress={() => updateData('goal', 'maintain')} style={styles.fullWidth} />
            <CustomButton title="Tăng cơ (Thêm Calo)" type={formData.goal === 'gain_muscle' ? 'primary' : 'glass'} onPress={() => updateData('goal', 'gain_muscle')} style={styles.fullWidth} />
          </View>
        )}
      </View>
    );
  };

  return (
    <ResponsiveContainer useImageBg={true}>
      <View style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoid} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Truyền width cố định để GlassCard không bị co giãn bất ngờ */}
            <GlassCard style={[styles.card, { width: actualCardWidth }]} intensity={80}>
              
              {/* Header: Cần bọc Padding thủ công do GlassCard đã bỏ Padding */}
              <View style={styles.sectionPadding}>
                <View style={styles.header}>
                  <Text style={styles.title} numberOfLines={2}>{ONBOARDING_STEPS[currentIndex].title}</Text>
                  <Text style={styles.subtitle}>{ONBOARDING_STEPS[currentIndex].subtitle}</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${((currentIndex + 1) / 4) * 100}%` }]} />
                </View>
              </View>

              {/* Slider: Kéo full width (0 padding) để hiệu ứng slide mượt */}
              <View style={styles.sliderContainer}>
                <FlatList
                  ref={flatListRef}
                  data={ONBOARDING_STEPS}
                  keyExtractor={(item) => item.id}
                  horizontal
                  pagingEnabled
                  scrollEnabled={false} // Disable vuốt tay, bắt buộc ấn nút
                  showsHorizontalScrollIndicator={false}
                  renderItem={renderStepContent}
                  getItemLayout={(_, index) => ({ 
                    length: slideWidth, 
                    offset: slideWidth * index, 
                    index 
                  })}
                />
              </View>

              {/* Footer Buttons: Tương tự Header, bọc Padding */}
              <View style={styles.sectionPadding}>
                <View style={styles.navRow}>
                  <CustomButton 
                    title="Quay lại" 
                    type="glass" 
                    disabled={currentIndex === 0 || isLoading} 
                    onPress={handlePrev} 
                    style={styles.flex1} 
                  />
                  <View style={{ width: 12 }} />
                  <CustomButton 
                    title={currentIndex < 3 ? "Tiếp tục" : "Hoàn tất"} 
                    type={currentIndex < 3 ? "primary" : "ai"}
                    isLoading={isLoading} 
                    onPress={handleNext} 
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
  
  card: { minHeight: 560, alignSelf: 'center' },
  
  // Padding dùng chung cho Header và Footer
  sectionPadding: { paddingHorizontal: 24, paddingTop: 24 },
  
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS?.primary || '#4CAF50', textAlign: 'center', lineHeight: 30 },
  subtitle: { fontSize: 15, color: '#555', textAlign: 'center', marginTop: 6, lineHeight: 20 },
  
  progressBarBg: { height: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS?.primary || '#4CAF50', borderRadius: 4 },
  
  sliderContainer: { minHeight: 280, width: '100%', marginTop: 24 },
  slideItem: { paddingHorizontal: 24 }, // Ép Slide con lùi vào, không tràn ra viền
  
  formGroup: { width: '100%' },
  label: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 10, marginLeft: 4 },
  input: { 
    height: 52, 
    width: '100%', // Fixed lỗi tràn input
    backgroundColor: 'rgba(255,255,255,0.9)', 
    paddingHorizontal: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.5)', 
    fontSize: 16 
  },
  
  row: { flexDirection: 'row', gap: 12, width: '100%' },
  verticalGroup: { gap: 16, width: '100%' },
  fullWidth: { width: '100%', minHeight: 54, paddingVertical: 12 }, // Button đa nền tảng
  flex1: { flex: 1 },
  
  navRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 24 }
});

export default OnboardingScreen;