// src/utils/mockDiaryData.js

export const MOCK_DIARY_ITEMS = [
  // BỮA SÁNG
  { 
    id: 'd1', 
    name: 'Phở bò tái', 
    value: 1, 
    mode: 'portion', 
    desc: '1 bát (450g)', 
    calo: 450, 
    protein: 30, carbs: 60, fat: 15, 
    mealType: 'Sáng', 
    image: 'https://cdn-icons-png.flaticon.com/512/3388/3388506.png' // Icon tô phở
  },
  { 
    id: 'd2', 
    name: 'Nước cam tươi', 
    value: 200, 
    mode: 'grams', 
    desc: '200 ml', 
    calo: 80, 
    protein: 1, carbs: 19, fat: 0, 
    mealType: 'Sáng', 
    image: 'https://cdn-icons-png.flaticon.com/512/10896/10896677.png' // Icon ly nước cam
  },

  // BỮA TRƯA
  { 
    id: 'd3', 
    name: 'Cơm gà', 
    value: 1, 
    mode: 'portion', 
    desc: '1 đĩa (350g)', 
    calo: 520, 
    protein: 35, carbs: 65, fat: 12, 
    mealType: 'Trưa', 
    image: 'https://cdn-icons-png.flaticon.com/512/2836/2836582.png' // Icon đĩa cơm
  },
  { 
    id: 'd4', 
    name: 'Rau luộc', 
    value: 100, 
    mode: 'grams', 
    desc: '100g', 
    calo: 45, 
    protein: 2, carbs: 8, fat: 0, 
    mealType: 'Trưa', 
    image: 'https://cdn-icons-png.flaticon.com/512/2153/2153788.png' // Icon rau
  },
  { 
    id: 'd5', 
    name: 'Canh', 
    value: 1, 
    mode: 'portion', 
    desc: '1 bát nhỏ', 
    calo: 155, 
    protein: 5, carbs: 10, fat: 5, 
    mealType: 'Trưa', 
    image: 'https://cdn-icons-png.flaticon.com/512/3501/3501108.png' // Icon bát canh
  },

  // BỮA TỐI
  { 
    id: 'd6', 
    name: 'Cá hồi nướng', 
    value: 150, 
    mode: 'grams', 
    desc: '150g', 
    calo: 310, 
    protein: 34, carbs: 0, fat: 19, 
    mealType: 'Tối', 
    image: 'https://cdn-icons-png.flaticon.com/512/1971/1971033.png' // Icon cá
  },
  { 
    id: 'd7', 
    name: 'Salad', 
    value: 1, 
    mode: 'portion', 
    desc: '1 đĩa', 
    calo: 310, 
    protein: 5, carbs: 15, fat: 20, 
    mealType: 'Tối', 
    image: 'https://cdn-icons-png.flaticon.com/512/3944/3944111.png' // Icon salad
  },
];