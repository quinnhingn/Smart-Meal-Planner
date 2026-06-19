import { Platform } from 'react-native';

const BACKEND_URL = 'http://192.168.1.8:5001/api';

/**
 * Gửi ảnh lên Backend để xử lý trọn gói (AI + Cloudinary + Logging)
 * @param {string} imageUri - Đường dẫn ảnh (URI)
 * @param {string} mode - 'diary' hoặc 'pantry'
 */
export const analyzeImageReal = async (imageUri, mode) => {
  try {
    const { useAppStore } = require('../store/useAppStore');
    const token = useAppStore.getState().token;

    const formData = new FormData();
    formData.append('image', {
      uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
      type: 'image/jpeg',
      name: 'scan.jpg',
    });
    formData.append('mode', mode);

    const response = await fetch(`${BACKEND_URL}/ai/predict`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Lỗi nhận diện');
    }

    if (result.data && result.data.items) {
      return result.data.items;
    }

    return [];

  } catch (error) {
    console.error("Lỗi AI Service:", error);
    throw error;
  }
};
