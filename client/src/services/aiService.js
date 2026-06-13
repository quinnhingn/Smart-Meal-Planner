import axios from 'axios';
import { Platform } from 'react-native';
import { recipeApi } from './api';

// TRỎ VỀ BACKEND CHÍNH (Port 5001) - Để Backend xử lý cả Upload, AI và Log
const BACKEND_URL = 'http://192.168.1.6:5001/api';

/**
 * Gửi ảnh lên Backend để xử lý trọn gói (AI + Cloudinary + Logging)
 * @param {string} imageUri - Đường dẫn ảnh (URI)
 * @param {string} mode - 'diary' hoặc 'pantry'
 */
export const analyzeImageReal = async (imageUri, mode) => {
  console.log('📡 [Mock AI Flow] Giả lập nhận diện ảnh mâm cơm (Multi-item)...');

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('✅ [Mock AI Flow] Trả về mảng món ăn giả lập');
      
      resolve([
        {
          id: 'mock-item-1',
          name: 'Cơm trắng',
          base_calo: 130,
          base_protein: 2.7,
          base_carbs: 28,
          base_fat: 0.3,
          gram_input: 200,
          image_url: 'https://via.placeholder.com/150/FFF/000?text=Com',
          candidates: [
            { id: '101a', name: 'Cơm trắng', confidence: 0.95, base_calo: 130, base_protein: 2.7, base_carbs: 28, base_fat: 0.3 },
            { id: '101b', name: 'Xôi trắng', confidence: 0.72, base_calo: 290, base_protein: 6.8, base_carbs: 60, base_fat: 1.5 },
            { id: '101c', name: 'Cơm gạo lứt', confidence: 0.45, base_calo: 110, base_protein: 2.6, base_carbs: 23, base_fat: 0.9 }
          ]
        },
        {
          id: 'mock-item-2',
          name: 'Thịt kho tàu',
          base_calo: 220,
          base_protein: 14,
          base_carbs: 6,
          base_fat: 16,
          gram_input: 150,
          image_url: 'https://via.placeholder.com/150/FFF/000?text=ThitKho',
          candidates: [
            { id: '102a', name: 'Thịt kho tàu', confidence: 0.88, base_calo: 220, base_protein: 14, base_carbs: 6, base_fat: 16 },
            { id: '102b', name: 'Thịt quay', confidence: 0.65, base_calo: 250, base_protein: 16, base_carbs: 0, base_fat: 20 },
            { id: '102c', name: 'Sườn xào chua ngọt', confidence: 0.30, base_calo: 280, base_protein: 12, base_carbs: 15, base_fat: 18 }
          ]
        },
        {
          id: 'mock-item-3',
          name: 'Rau muống luộc',
          base_calo: 25,
          base_protein: 3,
          base_carbs: 5,
          base_fat: 0,
          gram_input: 100,
          image_url: 'https://via.placeholder.com/150/FFF/000?text=RauMuong',
          candidates: [
            { id: '103a', name: 'Rau muống luộc', confidence: 0.75, base_calo: 25, base_protein: 3, base_carbs: 5, base_fat: 0 },
            { id: '103b', name: 'Rau dền luộc', confidence: 0.55, base_calo: 23, base_protein: 2.5, base_carbs: 4, base_fat: 0 },
            { id: '103c', name: 'Canh rau ngót', confidence: 0.40, base_calo: 30, base_protein: 4, base_carbs: 6, base_fat: 1 }
          ]
        }
      ]);
    }, 1500);
  });
};
