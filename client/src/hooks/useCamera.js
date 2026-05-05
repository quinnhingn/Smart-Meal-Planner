// src/hooks/useCamera.js
import { useState } from 'react';
import { Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useCameraPermissions } from 'expo-camera';

export const useCamera = () => {
  // 1. Quản lý quyền Camera (Chỉ thực sự cần trên Mobile)
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  
  // 2. State lưu trữ URI của ảnh sau khi chụp/chọn
  const [imageUri, setImageUri] = useState(null);

  // 3. Hàm chọn ảnh từ Thư viện (Gallery) hoặc Cửa sổ chọn file (Web)
  const pickImageFromGallery = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Lỗi quyền', 'Ứng dụng cần quyền truy cập thư viện ảnh của bạn.');
          return null; // Trả về null nếu từ chối
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        // FIX CẢNH BÁO LOG: Đổi sang dùng mảng ['images'] thay vì MediaTypeOptions cũ
        mediaTypes: ['images'], 
        allowsEditing: Platform.OS !== 'web', 
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        return uri; // Trả về uri để bên ngoài (Screen) sử dụng
      }
      return null;
    } catch (error) {
      console.error("Lỗi khi chọn ảnh:", error);
      return null;
    }
  };

  // 4. Reset ảnh (Dùng khi người dùng bấm nút "Chụp lại" hoặc "Hủy")
  const clearImage = () => {
    setImageUri(null);
  };

  return {
    hasCameraPermission: cameraPermission?.granted || false,
    requestCameraPermission,
    imageUri,
    setImageUri, // Expose hàm set để Màn hình Camera có thể trực tiếp gán ảnh vừa chụp vào
    pickImageFromGallery,
    clearImage
  };
};