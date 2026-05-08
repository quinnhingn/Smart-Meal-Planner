// src/screens/ScanCameraScreen.js
import { useAppStore } from '../store/useAppStore';
import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, Pressable, Platform, 
  Image, ActivityIndicator, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

import { useCamera } from '../hooks/useCamera';
import { analyzeImageReal } from '../services/aiService';
import { recipeApi } from '../services/api';
import DiaryResult from '../components/scan/DiaryResult';
import PantryResult from '../components/scan/PantryResult';
import { COLORS } from '../constants/theme';

// ==========================================
// COMPONENT ĐỔI CHẾ ĐỘ (Dùng chung)
// ==========================================
const ModeSwitcher = ({ mode, setMode, onModeChange }) => (
  <View style={styles.switcherContainer}>
    <Pressable 
      style={[styles.switchBtn, mode === 'diary' && styles.switchBtnActive]} 
      onPress={() => { setMode('diary'); onModeChange?.(); }}
    >
      <Text style={[styles.switchText, mode === 'diary' && styles.switchTextActive]}>🥘 Nhật ký</Text>
    </Pressable>
    <Pressable 
      style={[styles.switchBtn, mode === 'pantry' && styles.switchBtnActive]} 
      onPress={() => { setMode('pantry'); onModeChange?.(); }}
    >
      <Text style={[styles.switchText, mode === 'pantry' && styles.switchTextActive]}>🛒 Tủ lạnh</Text>
    </Pressable>
  </View>
);

// ==========================================
// MÀN HÌNH CHÍNH
// ==========================================
const ScanCameraScreen = ({ navigation, route }) => {
  const { 
    hasCameraPermission, requestCameraPermission, 
    imageUri, setImageUri, pickImageFromGallery, clearImage 
  } = useCamera();

  const cameraRef = useRef(null);

  // KẾT NỐI VỚI ZUSTAND STORE
  const addDiaryItem = useAppStore(state => state.addDiaryItem);
  const addPantryItems = useAppStore(state => state.addPantryItems);
  const isSaving = useAppStore(state => state.isSaving);
  
  // STATE CHÍNH
  const [scanMode, setScanMode] = useState(route?.params?.mode || 'diary');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResults, setAiResults] = useState(null);

  // XÓA DỮ LIỆU KHI ĐỔI MODE
  const handleModeChange = () => {
    clearImage();
    setAiResults(null);
  };

  // XỬ LÝ CHỤP / TẢI ẢNH
  const handleTakePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      setImageUri(photo.uri);
      processImage(photo.uri, scanMode);
    }
  };

  const handlePickImage = async () => {
    const uri = await pickImageFromGallery();
    if (uri) processImage(uri, scanMode);
  };

  const processImage = async (uri, currentMode) => {
    setIsAnalyzing(true);
    try {
      const results = await analyzeImageReal(uri, currentMode);
      setAiResults(results);
    } catch (error) {
      alert('Lỗi: ' + (error.message || 'Không thể kết nối với AI Server. Vui lòng kiểm tra IP hoặc Máy tính đang chạy AI.'));
      setAiResults(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    clearImage();
    setAiResults(null);
  };

  // THỰC THI LƯU DỮ LIỆU
  const handleSave = async (data) => {
    // 1. Chờ Zustand xử lý xong (giả lập delay API)
    if (scanMode === 'diary') {
      console.log('💾 [Flow] Đang lưu nhật ký vào Backend...', data);
      
      // GỌI API BACKEND THẬT
      const apiResult = await recipeApi.logMeal({
        recipe_id: data.recipe_id || null, // Dùng recipe_id thật từ Backend
        meal_name: data.name,
        meal_type: data.mealType === 'Sáng' ? 'breakfast' : 
                   data.mealType === 'Trưa' ? 'lunch' : 
                   data.mealType === 'Tối' ? 'dinner' : 'snack',
        servings: data.value || 1.0,
        calories: data.calo,
        protein: data.protein,
        fat: data.fat,
        carbs: data.carbs
      });

      if (apiResult.success) {
        console.log('✅ [Flow] Lưu Nhật ký thành công! ID:', apiResult.data.log_id);
        await addDiaryItem(data); // Vẫn lưu vào Zustand để UI cập nhật nhanh
      } else {
        alert('Lỗi lưu nhật ký: ' + apiResult.error);
        return; // Không thoát màn hình nếu lỗi
      }
    } else {
      await addPantryItems(data);
    }
    
    // 2. GIẢI QUYẾT LỖI KẸT STATE: Dọn sạch data trước khi thoát
    clearImage();
    setAiResults(null);
    
    // 3. Chuyển hướng
    navigation.goBack();
  };

  // ==========================================
  // RENDER: WEB (SPLIT-SCREEN LAYOUT)
  // ==========================================
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        {/* CỘT TRÁI: INPUT (40%) */}
        <View style={styles.webLeftCol}>
          <ModeSwitcher mode={scanMode} setMode={setScanMode} onModeChange={handleModeChange} />
          
          <View style={styles.webUploadCard}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.webPreviewImg} resizeMode="cover" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={64} color={COLORS.primary} />
                <Text style={styles.webUploadTitle}>Kéo thả hoặc tải ảnh lên</Text>
                <Text style={styles.webUploadSub}>Đang chọn chế độ: {scanMode === 'diary' ? 'Quét Bữa ăn' : 'Quét Nguyên liệu'}</Text>
              </>
            )}
            
            <Pressable style={styles.webBtn} onPress={handlePickImage}>
              <Text style={styles.webBtnText}>{imageUri ? 'Chọn ảnh khác' : 'Chọn ảnh từ máy tính'}</Text>
            </Pressable>
          </View>
        </View>

        {/* CỘT PHẢI: OUTPUT (60%) */}
        <View style={styles.webRightCol}>
          {isAnalyzing ? (
            <View style={styles.centerAll}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={{ marginTop: 16, fontWeight: '600' }}>AI đang phân tích dữ liệu...</Text>
            </View>
          ) : !aiResults ? (
            <View style={styles.centerAll}>
              <Ionicons name="scan-outline" size={80} color="#E0E0E0" />
              <Text style={{ color: '#888', marginTop: 16 }}>Vui lòng tải ảnh lên để xem kết quả</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {scanMode === 'diary' 
                ? <DiaryResult imageUri={imageUri} data={aiResults} onSave={handleSave} />
                : <PantryResult data={aiResults} onSave={handleSave} />
              }
            </ScrollView>
          )}
        </View>

        {isSaving && (
            <View style={[StyleSheet.absoluteFillObject, styles.savingOverlay]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.savingText}>Đang đồng bộ dữ liệu...</Text>
            </View>
        )}
      </View>
    );
  }

  // ==========================================
  // RENDER: MOBILE PERMISSION
  // ==========================================
  if (!hasCameraPermission) {
    return (
      <View style={styles.centerAll}>
        <Ionicons name="camera-outline" size={64} color="#888" />
        <Text style={{ marginVertical: 20, textAlign: 'center' }}>Cần cấp quyền Camera.</Text>
        <Pressable style={styles.webBtn} onPress={requestCameraPermission}>
          <Text style={styles.webBtnText}>Cấp quyền</Text>
        </Pressable>
      </View>
    );
  }

  // ==========================================
  // RENDER: MOBILE REVIEW KẾT QUẢ (FULL SCREEN)
  // ==========================================
  if (imageUri) {
    return (
      <SafeAreaView style={styles.mobileReviewContainer}>
        <View style={styles.mobileHeader}>
          <Pressable onPress={handleRetake} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="#1A1D1E" />
          </Pressable>
          <Text style={styles.headerTitle}>Kết quả nhận diện</Text>
          <View style={{ width: 28 }} />
        </View>

        {isAnalyzing ? (
          <View style={styles.centerAll}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ marginTop: 16 }}>AI đang phân tích...</Text>
          </View>
        ) : aiResults ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {scanMode === 'diary' 
              ? <DiaryResult imageUri={imageUri} data={aiResults} onSave={handleSave} />
              : <PantryResult imageUri={imageUri} data={aiResults} onSave={handleSave} />
            }
          </ScrollView>
        ) : null}

        {isSaving && (
            <View style={[StyleSheet.absoluteFillObject, styles.savingOverlay]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.savingText}>Đang đồng bộ dữ liệu...</Text>
            </View>
        )}
      </SafeAreaView>
    );
  }

  // ==========================================
  // RENDER: MOBILE CAMERA (NGẮM CHỤP)
  // ==========================================
  return (
    <View style={styles.containerBlack}>
        <CameraView style={StyleSheet.absoluteFillObject} facing="back" ref={cameraRef} />

        {/* Overlay Khung ngắm */}
        <View style={[StyleSheet.absoluteFillObject, styles.overlay]} pointerEvents="none">
            <View style={styles.scanFrame} />
            <Text style={styles.scanInstruction}>
            {scanMode === 'diary' ? 'Đưa món ăn vào khung ngắm' : 'Đưa nguyên liệu vào khung ngắm'}
            </Text>
        </View>

        <Pressable onPress={() => navigation.goBack()} style={styles.cameraBackBtn}>
            <Ionicons name="close" size={32} color="#FFF" />
        </Pressable>

        <View style={styles.cameraControls}>
            <ModeSwitcher mode={scanMode} setMode={setScanMode} />
            
            <View style={styles.cameraActionRow}>
            <Pressable style={styles.galleryBtn} onPress={handlePickImage}>
                <Ionicons name="image-outline" size={28} color="#FFF" />
            </Pressable>
            <Pressable style={styles.captureBtnOuter} onPress={handleTakePicture}>
                <View style={styles.captureBtnInner} />
            </Pressable>
            <View style={{ width: 56 }} />
            </View>
        </View>

        {isSaving && (
            <View style={[StyleSheet.absoluteFillObject, styles.savingOverlay]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.savingText}>Đang đồng bộ dữ liệu...</Text>
            </View>
        )}
    </View>
  );
};

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  centerAll: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  
  // Switcher
  switcherContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 30, padding: 4, alignSelf: 'center', marginBottom: 24 },
  switchBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 26 },
  switchBtnActive: { backgroundColor: COLORS.primary },
  switchText: { color: '#FFF', fontWeight: '600' },
  switchTextActive: { color: '#FFF', fontWeight: '800' },

  // Web Layout
  webContainer: { flex: 1, flexDirection: 'row', backgroundColor: '#F0F2F5' },
  webLeftCol: { width: '40%', padding: 32, borderRightWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FFF' },
  webRightCol: { width: '60%', backgroundColor: '#F8F9FA' },
  webUploadCard: { flex: 1, borderWidth: 2, borderColor: '#E0E0E0', borderStyle: 'dashed', borderRadius: 24, justifyContent: 'center', alignItems: 'center', padding: 24, overflow: 'hidden' },
  webPreviewImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.5 },
  webUploadTitle: { fontSize: 20, fontWeight: '700', marginTop: 16 },
  webUploadSub: { color: '#888', marginTop: 8, marginBottom: 24 },
  webBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, zIndex: 10 },
  webBtnText: { color: '#FFF', fontWeight: '700' },

  // Mobile Layout
  containerBlack: { flex: 1, backgroundColor: '#000' },
  overlay: { backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  scanFrame: { width: 280, height: 280, borderWidth: 2, borderColor: COLORS.primary, borderRadius: 24 },
  scanInstruction: { color: '#FFF', fontSize: 16, fontWeight: '600', marginTop: 24 },
  
  cameraBackBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  cameraControls: { position: 'absolute', bottom: 40, left: 0, right: 0, zIndex: 10 },
  cameraActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 40 },
  galleryBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  captureBtnOuter: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  captureBtnInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF' },

  // Mobile Review
  mobileReviewContainer: { flex: 1, backgroundColor: '#FFF' },
  mobileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F0F0F0' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1D1E' },

  savingOverlay: { backgroundColor: 'rgba(255,255,255,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  savingText: { marginTop: 16, fontSize: 16, fontWeight: '700', color: COLORS.primary },
});

export default ScanCameraScreen;