import axios from 'axios';
import { Platform } from 'react-native';
import { recipeApi } from './api';

// TRỎ VỀ BACKEND CHÍNH (Port 5001) - Để Backend xử lý cả Upload, AI và Log
const BACKEND_URL = 'http://192.168.1.233:5001/api';

/**
 * Gửi ảnh lên Backend để xử lý trọn gói (AI + Cloudinary + Logging)
 * @param {string} imageUri - Đường dẫn ảnh (URI)
 * @param {string} mode - 'diary' hoặc 'pantry'
 */
export const analyzeImageReal = async (imageUri, mode) => {
  try {
    const formData = new FormData();
    formData.append('mode', mode);

    if (Platform.OS === 'web') {
      const fetchResponse = await fetch(imageUri);
      const blob = await fetchResponse.blob();
      formData.append('image', blob, 'photo.jpg');
    } else {
      formData.append('image', {
        uri: imageUri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });
    }

    console.log('📡 [AI Flow] Đang gửi ảnh tới Backend xử lý:', `${BACKEND_URL}/ai/predict`);

    // Lưu ý: Cần Token JWT vì API Backend có @jwt_required()
    const { useAppStore } = require('../store/useAppStore');
    const token = useAppStore.getState().token;

    const response = await axios.post(`${BACKEND_URL}/ai/predict`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      timeout: 30000, // Chờ tối đa 30s vì qua nhiều bước
    });

    const result = response.data;
    console.log('✅ [AI Flow] Kết quả từ Backend:', result);

    if (result.success) {
      const data = result.data;

      if (mode === 'diary') {
        return {
          topResult: {
            id: data.log_id,
            recipe_id: data.recipe_id, // Nhận ID từ Backend
            name: data.label,
            calo: data.nutrition?.calories || 0,
            protein: data.nutrition?.protein || 0,
            carbs: data.nutrition?.carbs || 0,
            fat: data.nutrition?.fat || 0,
            confidence: data.confidence,
            image_url: data.image_url // Link ảnh trên Cloudinary
          },
          fallback: data.predictions.slice(1).map((p, idx) => ({
            id: `fallback-${idx}`,
            name: p.label,
            calo: 0,
            confidence: Math.round(p.confidence * 100)
          }))
        };
      } else {
        // Mode Pantry: Trả về danh sách nguyên liệu với metadata từ Gemini
        return data.predictions.map((p, idx) => ({
          id: `pantry-${idx}-${Date.now()}`,
          name: p.label || p.name,
          quantity: p.quantity || 1,
          unit: p.unit || 'phần',
          storage: p.storage || 'fridge',
          expiryDays: p.expiry_days || 3
        }));
      }
    } else {
      throw new Error(result.message || 'Lỗi xử lý ảnh');
    }
  } catch (error) {
    console.error('❌ [AI Flow] Lỗi:', error.message);
    throw error;
  }
};
