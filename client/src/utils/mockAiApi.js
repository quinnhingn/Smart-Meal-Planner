// src/utils/mockAiApi.js

export const mockAnalyzeImage = async (uri, mode) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (mode === 'diary') {
        // Dữ liệu giả lập cho Mode NHẬT KÝ (Top 1 + Fallback)
        resolve({
          topResult: { id: 1, name: 'Cơm sườn nướng', calo: 527, protein: 24, carbs: 62, fat: 18, confidence: 92 },
          fallback: [
            { id: 2, name: 'Cơm tấm bì chả', calo: 480 },
            { id: 3, name: 'Thịt nướng (không cơm)', calo: 320 }
          ]
        });
      } else {
        // Dữ liệu giả lập cho Mode TỦ LẠNH (Danh sách nguyên liệu)
        resolve([
          { id: 1, name: 'Cà chua', quantity: 5, unit: 'quả', expiryDays: 5 },
          { id: 2, name: 'Thịt bò', quantity: 500, unit: 'g', expiryDays: 3 },
          { id: 3, name: 'Hành lá', quantity: 1, unit: 'bó', expiryDays: 7 }
        ]);
      }
    }, 1500); // Trễ 1.5s
  });
};