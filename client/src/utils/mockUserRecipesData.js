// src/utils/mockUserRecipesData.js

export const myRecipes = [
  {
    id: 'my_recipe_1',
    title: 'Bò Lúc Lắc Cà Chua',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
    videoUrl: null,
    labels: ['Bữa tối', 'Tăng cơ', 'High Protein'],
    macros: { protein: 45, carbs: 15, fat: 20, calories: 420 },
    cookTime: 25,
    servings: 2,
    difficulty: 'Trung bình',
    author: { name: 'Bạn', avatar: 'https://i.pravatar.cc/150?u=you' },
    ingredients: [
      { name: 'Thịt bò', amount: '300g', calories: 750, protein: 78, carbs: 0, fat: 45, category: 'meat' },
      { name: 'Cà chua bi', amount: '100g', calories: 18, protein: 1, carbs: 4, fat: 0, category: 'vegetable' },
      { name: 'Hành tây', amount: '50g', calories: 20, protein: 0, carbs: 5, fat: 0, category: 'vegetable' },
      { name: 'Ớt chuông', amount: '50g', calories: 15, protein: 0, carbs: 3, fat: 0, category: 'vegetable' },
      { name: 'Dầu hào', amount: '15ml', calories: 20, protein: 0, carbs: 5, fat: 0, category: 'condiment' },
    ],
    steps: [
      { order: 1, description: 'Thịt bò thái khối vuông, ướp với dầu hào, tiêu, tỏi băm trong 15 phút.', image: null },
      { order: 2, description: 'Cà chua, hành tây, ớt chuông thái vuông vừa ăn.', image: null },
      { order: 3, description: 'Áp chảo thịt bò lửa lớn xém cạnh, trút ra đĩa.', image: null },
      { order: 4, description: 'Xào rau củ chín tới, đổ thịt bò vào đảo nhanh tay. Tắt bếp.', image: null },
    ],
    reviews: { avgRating: 0, total: 0 },
    isSaved: false,
  },
  {
    id: 'my_recipe_2',
    title: 'Sinh Tố Detox Xanh',
    image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600',
    videoUrl: null,
    labels: ['Bữa sáng', 'Giữ dáng', 'Low Carb', 'Bữa phụ'],
    macros: { protein: 5, carbs: 22, fat: 2, calories: 120 },
    cookTime: 10,
    servings: 1,
    difficulty: 'Dễ',
    author: { name: 'Bạn', avatar: 'https://i.pravatar.cc/150?u=you' },
    ingredients: [
      { name: 'Cần tây', amount: '100g', calories: 16, protein: 1, carbs: 3, fat: 0, category: 'vegetable' },
      { name: 'Táo xanh', amount: '1 quả', calories: 52, protein: 0, carbs: 14, fat: 0, category: 'fruit' },
      { name: 'Gừng', amount: '5g', calories: 4, protein: 0, carbs: 1, fat: 0, category: 'condiment' },
    ],
    steps: [
      { order: 1, description: 'Cần tây rửa sạch, cắt khúc. Táo bỏ lõi, cắt nhỏ.', image: null },
      { order: 2, description: 'Cho tất cả vào máy ép lạnh hoặc máy xay sinh tố với ít nước lọc.', image: null },
      { order: 3, description: 'Lọc lấy nước hoặc uống nguyên xơ tùy thích.', image: null },
    ],
    reviews: { avgRating: 0, total: 0 },
    isSaved: false,
  },
];

export const draftRecipes = [
  {
    id: 'draft_recipe_1',
    title: 'Cơm Chiên Tỏi Trứng (Nháp)',
    image: null,
    videoUrl: '',
    labels: ['Nhanh gọn', 'Bữa trưa'],
    macros: { protein: 0, carbs: 0, fat: 0, calories: 0 },
    cookTime: 15,
    servings: 2,
    difficulty: 'Dễ',
    author: { name: 'Bạn', avatar: 'https://i.pravatar.cc/150?u=you' },
    isDraft: true, // Cờ nhận diện bản nháp
    ingredients: [
      { name: 'Cơm nguội', amount: '2 bát', calories: 400, protein: 8, carbs: 90, fat: 2, category: 'grain' },
      { name: 'Trứng', amount: '2 quả', calories: 140, protein: 12, carbs: 1, fat: 10, category: 'dairy' },
    ],
    steps: [
      { order: 1, description: 'Trộn cơm nguội với 1 quả trứng cho tơi hạt.', image: null },
      // Đang viết dở bước 2...
    ],
  }
];

// Giả lập danh sách ID các công thức đã lưu từ Cộng đồng
// Trùng khớp với các bài có isSaved: true trong mockRecipes.js
export const savedRecipeIds = new Set(['recipe_2', 'recipe_5', 'recipe_9']);