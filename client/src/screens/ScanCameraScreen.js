// src/screens/ScanCameraScreen.js
import { useAppStore } from '../store/useAppStore';
import React, { useState, useRef, useCallback } from 'react';
import { 
  View, Text, StyleSheet, Pressable, Platform, 
  Image, ActivityIndicator, ScrollView, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useCamera } from '../hooks/useCamera';
import { analyzeImageReal } from '../services/aiService';
import { recipeApi } from '../services/api';
import SessionConfirmSheet from '../components/scan/SessionConfirmSheet';
import { COLORS } from '../constants/theme';

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
  const isSaving = useAppStore(state => state.isSaving);
  const setTabBarVisible = useAppStore(state => state.setTabBarVisible);
  
  // STATE CHÍNH
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResults, setAiResults] = useState(null);

  // ===== ẨN TAB BAR KHI VÀO SCAN =====
  useFocusEffect(
    useCallback(() => {
      if (setTabBarVisible) setTabBarVisible(false);
      return () => {
        if (setTabBarVisible) setTabBarVisible(true);
      };
    }, [setTabBarVisible])
  );

  // XỬ LÝ CHỤP / TẢI ẢNH
  const handleTakePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      setImageUri(photo.uri);
      processImage(photo.uri, 'diary');
    }
  };

  const handlePickImage = async () => {
    const uri = await pickImageFromGallery();
    if (uri) processImage(uri, 'diary');
  };

  const processImage = async (uri, currentMode) => {
    setIsAnalyzing(true);
    try {
      const results = await analyzeImageReal(uri, currentMode);
      setAiResults(results);
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể kết nối với AI Server. Vui lòng kiểm tra IP hoặc Máy tính đang chạy AI.');
      setAiResults(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    clearImage();
    setAiResults(null);
  };

  const handleSave = async (itemsArray, selectedMeal) => {
    try {
      setIsAnalyzing(true); // Re-use this state for saving indicator
      console.log("💾 [AI Flow] Đang lưu mảng món ăn...", itemsArray);

      for (const item of itemsArray) {
        const logData = {
          meal_name: item.name,
          meal_type: selectedMeal,
          servings: item.servings_input || 1,
          calories: Math.round(item.base_calo * (item.servings_input || 1)),
          protein: Math.round(item.base_protein * (item.servings_input || 1)),
          carbs: Math.round(item.base_carbs * (item.servings_input || 1)),
          fat: Math.round(item.base_fat * (item.servings_input || 1)),
          recipe_id: item.recipe_id, // Truyền ID để lấy ảnh
          created_at: new Date().toISOString()
        };
        await addDiaryItem(logData);
      }

      // Thông báo thành công đã được addDiaryItem xử lý (Toast)
      navigation.goBack();
      
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      Alert.alert("Lỗi", "Không thể lưu nhật ký.");
    } finally {
      setIsAnalyzing(false);
      clearImage();
      setAiResults(null);
    }
  };

  const handleCancelSession = () => {
    setAiResults(null);
    clearImage();
  };



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
      <View style={styles.mobileReviewContainer}>
        {/* Background Image */}
        <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFillObject} />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />

        <SafeAreaView style={{ flex: 1 }}>
          <View style={[styles.mobileHeader, { borderBottomWidth: 0 }]}>
            <Pressable onPress={handleRetake} style={[styles.backBtn, { backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 20 }]}>
              <Ionicons name="arrow-back" size={28} color="#1A1D1E" />
            </Pressable>
          </View>

          {isAnalyzing ? (
            <View style={[styles.centerAll, { backgroundColor: 'transparent' }]}>
              <ActivityIndicator size="large" color="#FFF" />
              <Text style={{ marginTop: 16, color: '#FFF', fontWeight: '700' }}>AI đang phân tích mâm cơm...</Text>
            </View>
          ) : aiResults ? (
            <SessionConfirmSheet 
              items={aiResults} 
              onConfirm={handleSave} 
              onCancel={handleCancelSession} 
            />
          ) : null}

          {isSaving && (
            <View style={[StyleSheet.absoluteFillObject, styles.savingOverlay]}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.savingText}>Đang lưu nhật ký...</Text>
            </View>
          )}
        </SafeAreaView>
      </View>
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
          Đưa món ăn vào khung ngắm
        </Text>
      </View>

      <Pressable onPress={() => navigation.goBack()} style={styles.cameraBackBtn}>
        <Ionicons name="close" size={32} color="#FFF" />
      </Pressable>

      <View style={styles.cameraControls}>
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