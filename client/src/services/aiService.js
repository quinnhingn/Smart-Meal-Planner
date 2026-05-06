import axios from 'axios';

// ĐỊA CHỈ AI SERVER (Cổng 8001 đã test OK)
const AI_SERVER_URL = 'http://192.168.1.177:8001';

/**
 * Gửi ảnh lên AI Server để nhận diện món ăn
 * @param {string} imageUri - Đường dẫn ảnh (URI) từ Camera hoặc Thư viện
 * @param {string} mode - 'diary' (Nhật ký) hoặc 'pantry' (Tủ lạnh)
 */
export const analyzeImageReal = async (imageUri, mode) => {
  try {
    const formData = new FormData();
    
    // Xử lý chuẩn để gửi ảnh qua Multipart Form Data
    formData.append('image', {
      uri: imageUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    console.log('📡 Đang gửi ảnh tới AI Server:', `${AI_SERVER_URL}/predict`);

    const response = await axios.post(`${AI_SERVER_URL}/predict`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 15000, // Chờ tối đa 15s vì xử lý AI hơi nặng
    });

    const result = response.data;
    console.log('✅ AI Response:', result);

    if (result.success) {
      const allPreds = result.predictions; // [{label, confidence}, ...]
      const top1 = allPreds[0];
      const others = allPreds.slice(1);

      if (mode === 'diary') {
        return {
          topResult: {
            id: Date.now(),
            name: top1.label,
            calo: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            confidence: Math.round(top1.confidence * 100)
          },
          fallback: others.map((p, idx) => ({
            id: Date.now() + idx + 1,
            name: p.label,
            calo: 0,
            confidence: Math.round(p.confidence * 100)
          }))
        };
      } else {
        // Mode Tủ lạnh: Nhận diện danh sách nhiều nguyên liệu
        return allPreds.map((p, idx) => ({
          id: Date.now() + idx,
          name: p.label,
          quantity: 1,
          unit: 'phần',
          expiryDays: 3
        }));
      }
    } else {
      throw new Error(result.message || 'AI không nhận diện được');
    }
  } catch (error) {
    console.error('❌ Lỗi kết nối AI Server:', error.message);
    throw error;
  }
};
