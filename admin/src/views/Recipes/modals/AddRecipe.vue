<template>
  <div class="add-recipe-container">
    <div class="page-header">
      <button class="back-btn" @click="router.back()">
        <i class="fa-solid fa-arrow-left"></i> Trở về
      </button>
      <h1>Thêm công thức mới</h1>
    </div>

    <div class="form-grid">
      <!-- Left Column: Form Details -->
      <div class="form-main">
        <div class="card-panel">
          <h3>Thông tin cơ bản</h3>
          <div class="input-group">
            <label>Tên món ăn</label>
            <input type="text" placeholder="Nhập tên món ăn (VD: Salad ức gà)" v-model="form.name">
          </div>

          <div class="row-group">
            <div class="input-group">
              <label>Mục tiêu dinh dưỡng</label>
              <select v-model="form.goal">
                <option value="lose">Giảm cân (Cắt giảm Calories)</option>
                <option value="maintain">Giữ dáng (Cân bằng)</option>
                <option value="gain">Tăng cân (Tăng cơ, tăng Calories)</option>
              </select>
            </div>
            <div class="input-group">
              <label>Bữa ăn phù hợp</label>
              <select v-model="form.mealTime">
                <option value="breakfast">Bữa sáng</option>
                <option value="lunch">Bữa trưa</option>
                <option value="dinner">Bữa tối</option>
                <option value="snack">Ăn vặt / Phụ</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Ingredients Section -->
        <div class="card-panel">
          <h3>Thành phần nguyên liệu</h3>
          <p class="panel-desc">Tìm kiếm và thêm nguyên liệu. Lượng Calories sẽ được hệ thống tính toán tự động dựa trên số gram và loại hình dinh dưỡng.</p>
          
          <div class="search-ingredients">
            <div class="search-box">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" placeholder="Tìm nguyên liệu..." v-model="searchIng">
            </div>
            <div class="tags-container">
              <span 
                class="ingredient-tag" 
                v-for="ing in filteredAvailable" 
                :key="ing.id"
                :style="{ backgroundColor: ing.bgColor, color: ing.color, borderColor: ing.bgColor }"
                @click="addIngredient(ing)"
              >
                {{ ing.name }} <i class="fa-solid fa-plus"></i>
              </span>
            </div>
          </div>

          <!-- Table -->
          <div class="ingredients-table" v-if="form.ingredients.length > 0">
            <table>
              <thead>
                <tr>
                  <th>Nguyên liệu</th>
                  <th width="120">Khối lượng (g)</th>
                  <th width="140">Calories (kcal)</th>
                  <th width="60"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in form.ingredients" :key="item.id">
                  <td>
                    <div class="ing-name-cell">
                      <span class="color-dot" :style="{ background: item.color }"></span>
                      {{ item.name }}
                    </div>
                  </td>
                  <td>
                    <div class="gram-wrapper">
                      <input type="number" class="gram-input" v-model="item.grams" min="0">
                      <span>g</span>
                    </div>
                  </td>
                  <td>
                    <div class="cal-value">{{ calculateItemCalories(item).toFixed(0) }} kcal</div>
                  </td>
                  <td>
                    <button class="remove-btn" @click="removeIngredient(index)">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="empty-state" v-else>
            <i class="fa-solid fa-basket-shopping" style="font-size: 30px; margin-bottom: 12px; color: #CBD5E1; display: block;"></i>
            Chưa có nguyên liệu nào được chọn.
          </div>
        </div>

        <!-- Instructions -->
        <div class="card-panel">
          <div class="steps-header">
            <h3>Các bước thực hiện</h3>
            <button class="ai-generate-btn" @click="generateAISteps">
              <i class="fa-solid fa-wand-magic-sparkles"></i> AI Viết hộ
            </button>
          </div>

          <div class="video-section">
            <label>Video hướng dẫn (Link YouTube)</label>
            <div class="video-input-group">
              <input type="text" placeholder="Dán link YouTube vào đây..." v-model="form.videoUrl">
              <button class="ai-search-video" @click="findAIVideo">
                <i class="fa-solid fa-magnifying-glass"></i> AI Tìm video
              </button>
            </div>
            <div class="video-preview" v-if="youtubeEmbedUrl">
              <iframe 
                width="100%" 
                height="315" 
                :src="youtubeEmbedUrl" 
                title="YouTube video player" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
              </iframe>
            </div>
          </div>

          <div class="steps-list">
            <div class="step-item" v-for="(step, index) in form.steps" :key="index">
              <div class="step-num">{{ index + 1 }}</div>
              <textarea placeholder="Mô tả chi tiết bước làm..." v-model="form.steps[index]"></textarea>
              <button class="remove-step" @click="removeStep(index)" v-if="form.steps.length > 1">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
          <button class="add-step-btn" @click="addStep">
            <i class="fa-solid fa-plus"></i> Thêm bước mới
          </button>
        </div>
      </div>

      <!-- Right Column: Summary & Actions -->
      <div class="form-sidebar">
        <!-- Media -->
        <div class="card-panel">
          <h3>Hình ảnh món ăn</h3>
          <div class="upload-area">
            <i class="fa-solid fa-cloud-arrow-up"></i>
            <p>Kéo thả ảnh vào đây hoặc <span>Tải lên</span></p>
          </div>
        </div>

        <!-- Nutrition Summary -->
        <div class="card-panel nutrition-panel">
          <h3>Tổng quan dinh dưỡng</h3>
          <p class="goal-badge" :class="form.goal">
            <i class="fa-solid fa-bullseye"></i> {{ goalText }}
          </p>

          <div class="nutrition-fact">
            <div class="fact-row main">
              <span>Tổng Calories</span>
              <strong>{{ totalCalories.toFixed(0) }} kcal</strong>
            </div>
            <div class="fact-row">
              <span>Đạm (Protein)</span>
              <strong>{{ totalProtein.toFixed(1) }} g</strong>
            </div>
            <div class="fact-row">
              <span>Tinh bột (Carbs)</span>
              <strong>{{ totalCarbs.toFixed(1) }} g</strong>
            </div>
            <div class="fact-row">
              <span>Chất béo (Fat)</span>
              <strong>{{ totalFat.toFixed(1) }} g</strong>
            </div>
          </div>
          
          <div class="ai-insight" v-if="totalCalories > 0">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            <div>
              <p v-if="form.goal === 'lose' && totalCalories > 600"><strong>AI Cảnh báo:</strong> Món ăn này hơi vượt mức calories cho một bữa giảm cân. Bạn có thể giảm bớt lượng tinh bột hoặc tăng rau xanh.</p>
              <p v-else-if="form.goal === 'gain' && totalProtein < 30"><strong>AI Gợi ý:</strong> Nên bổ sung thêm đạm (Thịt bò, Ức gà) để hỗ trợ quá trình tăng cơ hiệu quả hơn.</p>
              <p v-else><strong>AI Đánh giá:</strong> Hàm lượng dinh dưỡng rất cân đối và phù hợp với mục tiêu thiết lập!</p>
            </div>
          </div>
        </div>

        <button class="save-btn" @click="router.back()">
          <i class="fa-solid fa-check"></i> Lưu công thức
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const form = ref({
  name: '',
  goal: 'maintain',
  mealTime: 'lunch',
  ingredients: [] as any[],
  steps: [''],
  videoUrl: ''
});

onMounted(() => {
  if (route.query.name) {
    form.value.name = route.query.name as string;
  }
});

const searchIng = ref('');

// Cơ sở dữ liệu mẫu chứa giá trị dinh dưỡng trên 100g
const dbIngredients = ref([
  { id: 1, name: 'Cà chua', color: '#B91C1C', bgColor: '#FEE2E2', cal: 18, protein: 0.9, carb: 3.9, fat: 0.2 },
  { id: 2, name: 'Thịt bò', color: '#991B1B', bgColor: '#FEE2E2', cal: 250, protein: 26, carb: 0, fat: 15 },
  { id: 3, name: 'Hành tây', color: '#6B21A8', bgColor: '#F3E8FF', cal: 40, protein: 1.1, carb: 9.3, fat: 0.1 },
  { id: 4, name: 'Tỏi', color: '#374151', bgColor: '#F3F4F6', cal: 149, protein: 6.4, carb: 33, fat: 0.5 },
  { id: 5, name: 'Cà rốt', color: '#C2410C', bgColor: '#FFEDD5', cal: 41, protein: 0.9, carb: 9.6, fat: 0.2 },
  { id: 6, name: 'Khoai tây', color: '#A16207', bgColor: '#FEF9C3', cal: 77, protein: 2, carb: 17, fat: 0.1 },
  { id: 7, name: 'Trứng gà', color: '#B45309', bgColor: '#FEF3C7', cal: 155, protein: 13, carb: 1.1, fat: 11 },
  { id: 8, name: 'Bông cải xanh', color: '#15803D', bgColor: '#DCFCE7', cal: 34, protein: 2.8, carb: 6.6, fat: 0.4 },
  { id: 9, name: 'Ức gà', color: '#BE185D', bgColor: '#FCE7F3', cal: 165, protein: 31, carb: 0, fat: 3.6 },
  { id: 10, name: 'Nấm hương', color: '#78350F', bgColor: '#FFEDD5', cal: 34, protein: 2.2, carb: 6.8, fat: 0.5 },
  { id: 11, name: 'Đậu hũ', color: '#047857', bgColor: '#D1FAE5', cal: 76, protein: 8, carb: 1.9, fat: 4.8 },
  { id: 12, name: 'Rau muống', color: '#166534', bgColor: '#DCFCE7', cal: 19, protein: 2.6, carb: 3.1, fat: 0.2 },
  { id: 13, name: 'Cơm trắng', color: '#1A1A1A', bgColor: '#F1F5F9', cal: 130, protein: 2.7, carb: 28, fat: 0.3 }
]);

const filteredAvailable = computed(() => {
  return dbIngredients.value
    .filter(i => i.name.toLowerCase().includes(searchIng.value.toLowerCase()))
    .filter(i => !form.value.ingredients.find(s => s.id === i.id));
});

const goalText = computed(() => {
  if (form.value.goal === 'lose') return 'Mục tiêu: Giảm cân';
  if (form.value.goal === 'gain') return 'Mục tiêu: Tăng cân';
  return 'Mục tiêu: Giữ dáng';
});

// Tính toán lượng Calories dựa vào số gam và "Mục tiêu dinh dưỡng"
const calculateItemCalories = (item: any) => {
  let base = (item.cal * (item.grams || 0)) / 100;
  
  // Mô phỏng AI tự động tối ưu hóa calories dựa trên mục tiêu
  // Ví dụ giảm cân: AI gợi ý cách chế biến làm giảm 5% năng lượng hấp thụ
  // Tăng cân: Phối hợp gia vị để tăng 5% hấp thụ
  if (form.value.goal === 'lose') base = base * 0.95; 
  if (form.value.goal === 'gain') base = base * 1.05;
  
  return base || 0;
};

const totalCalories = computed(() => {
  return form.value.ingredients.reduce((sum, item) => sum + calculateItemCalories(item), 0);
});

const totalProtein = computed(() => {
  return form.value.ingredients.reduce((sum, item) => sum + ((item.protein * (item.grams || 0)) / 100 || 0), 0);
});

const totalCarbs = computed(() => {
  return form.value.ingredients.reduce((sum, item) => sum + ((item.carb * (item.grams || 0)) / 100 || 0), 0);
});

const totalFat = computed(() => {
  return form.value.ingredients.reduce((sum, item) => sum + ((item.fat * (item.grams || 0)) / 100 || 0), 0);
});

const addIngredient = (ing: any) => {
  // Mặc định thêm vào sẽ là 100g
  form.value.ingredients.push({ ...ing, grams: 100 });
};

const removeIngredient = (index: number) => {
  form.value.ingredients.splice(index, 1);
};

const addStep = () => {
  form.value.steps.push('');
};

const removeStep = (index: number) => {
  form.value.steps.splice(index, 1);
};

const generateAISteps = () => {
  form.value.steps = [
    'Sơ chế nguyên liệu: Rửa sạch thịt bò, thái miếng vừa ăn. Ướp với 1 muỗng canh tỏi băm, 1/2 muỗng cà phê tiêu, 1 muỗng canh nước tương trong 15 phút.',
    'Làm nóng chảo với 1 muỗng canh dầu ăn. Cho thịt bò vào xào nhanh tay trên lửa lớn để thịt không bị dai.',
    'Khi thịt bò chín tái, cho bông cải xanh và cà rốt (đã luộc sơ) vào đảo đều. Nêm nếm lại gia vị cho vừa ăn.',
    'Tắt bếp, trình bày ra đĩa. Trang trí thêm một ít ngò rí và tiêu. Thưởng thức khi còn nóng.'
  ];
};

const findAIVideo = () => {
  // Mock finding a video
  form.value.videoUrl = 'https://www.youtube.com/watch?v=7V2e1-Lh1S8';
};

const youtubeEmbedUrl = computed(() => {
  if (!form.value.videoUrl) return '';
  const match = form.value.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
});
</script>

<style scoped>
.add-recipe-container {
  padding: 30px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.back-btn {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 10px 16px;
  font-family: inherit;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-dark);
  cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #F1F5F9;
  border-color: #CBD5E1;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark);
}

.form-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.card-panel {
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #E2E8F0;
  margin-bottom: 24px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}

.card-panel h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-dark);
}

.panel-desc {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 20px;
  line-height: 1.5;
}

.input-group {
  margin-bottom: 20px;
  display: flex; flex-direction: column; gap: 8px;
}
.row-group {
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
}

.input-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
}

.input-group input, .input-group select {
  padding: 14px 16px;
  border: 1px solid #CBD5E1;
  border-radius: 12px;
  font-family: inherit;
  font-size: 14px;
  color: var(--text-dark);
  transition: all 0.2s;
  background: #F8FAFC;
}

.input-group input:focus, .input-group select:focus {
  outline: none;
  border-color: #8EAE82;
  background: white;
  box-shadow: 0 0 0 3px rgba(142, 174, 130, 0.15);
}

/* Ingredients */
.search-box {
  background: white;
  border: 1px solid #CBD5E1;
  border-radius: 12px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.search-box input { border: none; outline: none; width: 100%; font-family: inherit; }
.search-box i { color: #94A3B8; }

.tags-container {
  display: flex; flex-wrap: wrap; gap: 10px;
  margin-bottom: 24px;
}
.ingredient-tag {
  padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 6px; transition: all 0.2s; border: 1px solid transparent;
}
.ingredient-tag:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.08); }
.ingredient-tag i { font-size: 11px; opacity: 0.6; }

/* Table */
.ingredients-table table {
  width: 100%;
  border-collapse: collapse;
}
.ingredients-table th {
  text-align: left;
  padding: 12px;
  font-size: 13px;
  color: var(--text-muted);
  border-bottom: 1px solid #E2E8F0;
  font-weight: 600;
}
.ingredients-table td {
  padding: 12px;
  border-bottom: 1px solid #F1F5F9;
  vertical-align: middle;
}
.ing-name-cell {
  display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--text-dark); font-size: 14px;
}
.color-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.gram-wrapper { display: flex; align-items: center; gap: 8px; }
.gram-input {
  width: 70px; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-family: inherit; font-weight: 600; text-align: center;
}
.gram-input:focus { outline: none; border-color: #8EAE82; }
.cal-value {
  font-weight: 700; color: #F59E0B; background: #FFFBEB; padding: 6px 12px; border-radius: 8px; display: inline-block;
}
.remove-btn {
  background: none; border: none; color: #EF4444; cursor: pointer; padding: 6px; border-radius: 8px; transition: 0.2s;
}
.remove-btn:hover { background: #FEE2E2; }
.empty-state { text-align: center; padding: 40px; color: var(--text-muted); font-size: 14px; background: #F8FAFC; border-radius: 12px; border: 2px dashed #E2E8F0; }

/* Steps */
.steps-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.steps-header h3 { margin: 0; }
.ai-generate-btn {
  background: linear-gradient(to right, #8EAE82, #4a8c54); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; box-shadow: 0 4px 10px rgba(74, 140, 84, 0.2); transition: 0.2s;
}
.ai-generate-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(74, 140, 84, 0.3); }

.video-section { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #E2E8F0; }
.video-section label { display: block; font-size: 14px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px; }
.video-input-group { display: flex; gap: 10px; margin-bottom: 16px; }
.video-input-group input { flex: 1; padding: 12px 16px; border: 1px solid #CBD5E1; border-radius: 12px; font-family: inherit; font-size: 14px; background: #F8FAFC; }
.video-input-group input:focus { outline: none; border-color: #8EAE82; background: white; }
.ai-search-video { background: white; border: 1px solid #8EAE82; color: #4a8c54; padding: 0 16px; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
.ai-search-video:hover { background: #E6EFE5; }

.video-preview {
  border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border: 1px solid #E2E8F0; background: black;
}

.steps-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
.step-item { display: flex; gap: 16px; align-items: flex-start; }
.step-num { width: 32px; height: 32px; background: #E6EFE5; color: #1A2F23; font-weight: 700; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.step-item textarea { flex: 1; height: 80px; padding: 12px 16px; border: 1px solid #CBD5E1; border-radius: 12px; font-family: inherit; resize: none; line-height: 1.5; }
.step-item textarea:focus { outline: none; border-color: #8EAE82; }
.remove-step { background: none; border: none; color: #94A3B8; font-size: 16px; cursor: pointer; padding: 8px; }
.remove-step:hover { color: #EF4444; }
.add-step-btn { background: white; border: 1px dashed #8EAE82; color: #4a8c54; padding: 12px; border-radius: 12px; font-weight: 600; cursor: pointer; width: 100%; transition: 0.2s; }
.add-step-btn:hover { background: #E6EFE5; }

/* Right Column */
.upload-area {
  border: 2px dashed #CBD5E1; border-radius: 16px; padding: 40px 20px; text-align: center; cursor: pointer; background: #F8FAFC; transition: 0.2s;
}
.upload-area:hover { border-color: #8EAE82; background: #E6EFE5; }
.upload-area i { font-size: 40px; color: #94A3B8; margin-bottom: 16px; }
.upload-area p { margin: 0; color: var(--text-muted); font-size: 14px; }
.upload-area span { color: #3B82F6; font-weight: 600; }

.goal-badge {
  display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 700; margin-bottom: 24px;
}
.goal-badge.lose { background: #DCFCE7; color: #166534; }
.goal-badge.maintain { background: #FEF3C7; color: #92400E; }
.goal-badge.gain { background: #FEE2E2; color: #991B1B; }

.nutrition-fact {
  display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;
}
.fact-row {
  display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #F1F5F9; font-size: 14px;
}
.fact-row:last-child { border-bottom: none; padding-bottom: 0; }
.fact-row span { color: var(--text-muted); }
.fact-row strong { color: var(--text-dark); font-weight: 700; }
.fact-row.main { font-size: 16px; }
.fact-row.main strong { color: #F59E0B; font-size: 20px; }

.ai-insight {
  background: linear-gradient(145deg, #F3F7F2, #E6EFE5); border: 1px solid #8EAE82; border-radius: 12px; padding: 16px; display: flex; gap: 12px; color: #1A2F23; font-size: 13px; line-height: 1.5;
}
.ai-insight i { color: #f4c553; font-size: 16px; margin-top: 2px; flex-shrink: 0; }
.ai-insight p { margin: 0; }

.save-btn {
  width: 100%; background: var(--primary-yellow, #f4c553); color: #1A1A1A; border: none; padding: 16px; border-radius: 16px; font-weight: 700; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 15px rgba(244, 197, 83, 0.3); transition: 0.2s;
}
.save-btn:hover { background: var(--yellow-hover, #e0b240); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(244, 197, 83, 0.4); }
</style>
