import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Modal, TextInput, 
  Pressable, ActivityIndicator, Platform 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';

const CheckInPopup = ({ visible, onClose }) => {
  const { userProfile, checkInWeight } = useAppStore();
  const [weight, setWeight] = useState(userProfile?.weight?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async () => {
    if (!weight || isNaN(parseFloat(weight))) return;
    
    setIsSubmitting(true);
    // Gọi logic từ store: Cập nhật DB -> Tính lại Macros -> Lưu lịch sử
    const success = await checkInWeight(parseFloat(weight));
    setIsSubmitting(false);
    
    if (success) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Lớp nền Blur dành cho Glassmorphism */}
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
        
        <View style={styles.modalCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="scale-outline" size={32} color={COLORS.primary} />
          </View>

          <Text style={styles.title}>Đã đến lúc Check-in!</Text>
          <Text style={styles.subtitle}>
            Cập nhật cân nặng hàng tuần giúp SmartMeal tinh chỉnh lộ trình dinh dưỡng chính xác hơn cho Nhi.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder="0.0"
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={(text) => setWeight(text.replace(/[^0-9.]/g, ''))} 
                autoFocus
            />
            <Text style={styles.unitText}>kg</Text>
          </View>

          <View style={styles.buttonRow}>
            <Pressable 
                style={({ pressed }) => [
                styles.btn, 
                styles.btnSecondary,
                pressed && { opacity: 0.8 }
                ]} 
                onPress={onClose}
            >
                <Text style={styles.btnTextSecondary}>Để sau</Text>
            </Pressable>

            <Pressable 
                style={({ pressed }) => [
                styles.btn, 
                styles.btnPrimary, 
                weight === '' && styles.btnDisabled,
                pressed && weight !== '' && { opacity: 0.9 }
                ]} 
                onPress={handleUpdate}
                disabled={isSubmitting || weight === ''}
            >
                {isSubmitting ? (
                <ActivityIndicator color="#FFF" size="small" />
                ) : (
                <Text style={styles.btnTextPrimary}>Cập nhật</Text>
                )}
            </Pressable>
            </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 28, 
    padding: 24, 
    width: '100%', 
    maxWidth: 400, // Khống chế chiều rộng trên Web
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10
  },
  iconCircle: { 
    width: 64, height: 64, borderRadius: 32, 
    backgroundColor: 'rgba(76, 175, 80, 0.1)', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 16 
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1A1D1E', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#F5F7F9', borderRadius: 16, 
    paddingHorizontal: 20, marginBottom: 24 
  },
  input: { 
    flex: 1, paddingVertical: 16, fontSize: 28, 
    fontWeight: '700', color: COLORS.primary, textAlign: 'center' 
  },
  unitText: { fontSize: 18, fontWeight: '600', color: '#999', marginLeft: 8 },
  buttonRow: { flexDirection: 'row', gap: 12, width: '100%' },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  btnPrimary: { backgroundColor: COLORS.primary },
  btnSecondary: { backgroundColor: '#F0F2F5' },
  btnDisabled: { backgroundColor: '#CCC' },
  btnTextPrimary: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  btnTextSecondary: { color: '#666', fontWeight: '700', fontSize: 16 }
});

export default CheckInPopup;