import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import ResponsiveContainer from '../components/ResponsiveContainer';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

const OnboardingScreen = () => {
  const { setupProfile, isLoading } = useAppStore();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: 'male', age: '25', height: '170', weight: '65', activity: 'light', goal: 'maintain',
  });

  const updateData = (key, value) => setFormData({ ...formData, [key]: value });

  const handleFinish = async () => {
    // Ép kiểu dữ liệu sang số trước khi gửi
    const payload = {
      ...formData,
      age: parseInt(formData.age), height: parseFloat(formData.height), weight: parseFloat(formData.weight)
    };
    await setupProfile(payload);
  };

  // ... (Giữ nguyên hàm renderStepContent như cũ)
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.row}>
              <CustomButton title="Nam" type={formData.gender === 'male' ? 'primary' : 'secondary'} onPress={() => updateData('gender', 'male')} style={styles.flex1} />
              <View style={{width: 10}}/>
              <CustomButton title="Nữ" type={formData.gender === 'female' ? 'primary' : 'secondary'} onPress={() => updateData('gender', 'female')} style={styles.flex1} />
            </View>
            <Text style={styles.label}>Tuổi</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={formData.age} onChangeText={(v) => updateData('age', v)} />
          </View>
        );
      case 2:
        return (
          <View>
            <Text style={styles.label}>Chiều cao (cm)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={formData.height} onChangeText={(v) => updateData('height', v)} />
            <Text style={styles.label}>Cân nặng (kg)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={formData.weight} onChangeText={(v) => updateData('weight', v)} />
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.label}>Mức độ vận động</Text>
            <CustomButton title="Ít vận động (Văn phòng)" type={formData.activity === 'sedentary' ? 'primary' : 'secondary'} onPress={() => updateData('activity', 'sedentary')} />
            <CustomButton title="Vận động nhẹ (1-3 ngày/tuần)" type={formData.activity === 'light' ? 'primary' : 'secondary'} onPress={() => updateData('activity', 'light')} />
            <CustomButton title="Năng động (Tập luyện đều)" type={formData.activity === 'active' ? 'primary' : 'secondary'} onPress={() => updateData('activity', 'active')} />
          </View>
        );
      case 4:
        return (
          <View>
            <Text style={styles.label}>Mục tiêu của bạn</Text>
            <CustomButton title="Giảm cân (Cắt giảm Calo)" type={formData.goal === 'lose_weight' ? 'primary' : 'secondary'} onPress={() => updateData('goal', 'lose_weight')} />
            <CustomButton title="Duy trì vóc dáng" type={formData.goal === 'maintain' ? 'primary' : 'secondary'} onPress={() => updateData('goal', 'maintain')} />
            <CustomButton title="Tăng cơ (Thêm Calo)" type={formData.goal === 'gain_muscle' ? 'primary' : 'secondary'} onPress={() => updateData('goal', 'gain_muscle')} />
          </View>
        );
      default: return null;
    }
  };

  return (
    <ResponsiveContainer style={styles.center}>
      <GlassCard style={styles.card}>
        <Text style={styles.title}>Cá nhân hóa hồ sơ</Text>
        <Text style={styles.subtitle}>Bước {step} / 4</Text>
        
        <View style={styles.progressBarBg}>
           <View style={[styles.progressBarFill, { width: `${(step / 4) * 100}%` }]} />
        </View>

        <View style={styles.contentContainer}>
          {renderStepContent()}
        </View>

        <View style={styles.navRow}>
          {step > 1 && <CustomButton title="Quay lại" type="secondary" onPress={() => setStep(step - 1)} style={styles.flex1} />}
          <View style={{width: 10}}/>
          {step < 4 ? (
            <CustomButton title="Tiếp tục" onPress={() => setStep(step + 1)} style={styles.flex1} />
          ) : (
            isLoading ? <ActivityIndicator size="large" color={COLORS.primary} style={styles.flex1} /> 
            : <CustomButton title="Hoàn tất" type="ai" onPress={handleFinish} style={styles.flex1} />
          )}
        </View>
      </GlassCard>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  center: { justifyContent: 'center', padding: 16 },
  card: { padding: 24, width: '100%', maxWidth: 450 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginBottom: 16 },
  progressBarBg: { height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, marginBottom: 24 },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  contentContainer: { minHeight: 220, justifyContent: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: COLORS.white, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', fontSize: 16 },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  navRow: { flexDirection: 'row', marginTop: 24 }
});

export default OnboardingScreen;