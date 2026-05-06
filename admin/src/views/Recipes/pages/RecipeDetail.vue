<template>
  <div class="detail-container">
    <!-- Header -->
    <div class="page-header">
      <button class="back-btn" @click="router.back()">
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <div>
        <h1>{{ recipe.title }}</h1>
        <p class="header-desc">Chi tiết công thức và thông số dinh dưỡng</p>
      </div>
      <div class="header-actions">
        <button class="btn-outline"><i class="fa-solid fa-pen"></i> Chỉnh sửa</button>
        <button class="btn-danger"><i class="fa-solid fa-trash"></i> Xoá</button>
      </div>
    </div>

    <div class="detail-grid">
      <!-- Left column -->
      <div class="detail-main">

        <!-- Hero Image + Basic Info -->
        <div class="card-panel hero-card">
          <img :src="recipe.image" :alt="recipe.title" class="hero-img">
          <div class="hero-meta">
            <div class="meta-tags">
              <span class="tag goal-tag" :class="recipe.goal">
                <i class="fa-solid fa-bullseye"></i> {{ goalText }}
              </span>
              <span class="tag meal-tag">
                <i class="fa-solid fa-clock"></i> {{ mealTimeText }}
              </span>

            </div>
            <div class="quick-macros">
              <div class="macro-pill"><span>P</span> {{ recipe.protein }}</div>
              <div class="macro-pill"><span>C</span> {{ recipe.carbs }}</div>
              <div class="macro-pill"><span>F</span> {{ recipe.fat }}</div>
              <div class="macro-pill calories-pill">{{ recipe.calories }} Kcal</div>
            </div>
          </div>
        </div>

        <!-- Video -->
        <div class="card-panel" v-if="recipe.videoId">
          <h3>Video hướng dẫn</h3>
          <div class="video-wrap">
            <iframe
              width="100%"
              height="360"
              :src="`https://www.youtube.com/embed/${recipe.videoId}`"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen>
            </iframe>
          </div>
        </div>

        <!-- Ingredients Table -->
        <div class="card-panel">
          <h3>Nguyên liệu</h3>
          <table class="ing-table">
            <thead>
              <tr>
                <th>Nguyên liệu</th>
                <th>Khối lượng</th>
                <th>Calories</th>
                <th>Protein</th>
                <th>Carbs</th>
                <th>Fat</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ing in recipe.ingredients" :key="ing.name">
                <td>
                  <div class="ing-name">
                    <span class="dot" :style="{ background: ing.color }"></span>
                    {{ ing.name }}
                  </div>
                </td>
                <td>{{ ing.grams }}g</td>
                <td><span class="cal-badge">{{ ing.calories }} kcal</span></td>
                <td>{{ ing.protein }}g</td>
                <td>{{ ing.carbs }}g</td>
                <td>{{ ing.fat }}g</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Steps -->
        <div class="card-panel">
          <h3>Các bước thực hiện</h3>
          <div class="steps-list">
            <div class="step-item" v-for="(step, i) in recipe.steps" :key="i">
              <div class="step-num">{{ Number(i) + 1 }}</div>
              <p>{{ step }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="detail-sidebar">
        <div class="card-panel nutrition-card">
          <h3>Tổng quan dinh dưỡng</h3>

          <div class="donut-area">
            <svg viewBox="0 0 120 120" class="donut-chart">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#F1F5F9" stroke-width="18"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="#F59E0B" stroke-width="18"
                stroke-dasharray="314" stroke-dashoffset="0" stroke-linecap="round"/>
            </svg>
            <div class="donut-center">
              <strong>{{ recipe.calories }}</strong>
              <span>Kcal</span>
            </div>
          </div>

          <div class="macro-bars">
            <div class="bar-row">
              <div class="bar-label"><span class="dot" style="background:#3B82F6"></span> Protein</div>
              <div class="bar-track"><div class="bar-fill" style="background:#3B82F6; width: 60%"></div></div>
              <div class="bar-val">{{ recipe.protein }}</div>
            </div>
            <div class="bar-row">
              <div class="bar-label"><span class="dot" style="background:#F59E0B"></span> Carbs</div>
              <div class="bar-track"><div class="bar-fill" style="background:#F59E0B; width: 80%"></div></div>
              <div class="bar-val">{{ recipe.carbs }}</div>
            </div>
            <div class="bar-row">
              <div class="bar-label"><span class="dot" style="background:#EF4444"></span> Fat</div>
              <div class="bar-track"><div class="bar-fill" style="background:#EF4444; width: 40%"></div></div>
              <div class="bar-val">{{ recipe.fat }}</div>
            </div>
          </div>

          <div class="extra-nutrition">
            <div class="extra-row"><span>Chất xơ</span><strong>{{ recipe.fiber }}</strong></div>
            <div class="extra-row"><span>Đường</span><strong>{{ recipe.sugar }}</strong></div>
            <div class="extra-row"><span>Natri</span><strong>{{ recipe.sodium }}</strong></div>
            <div class="extra-row"><span>Canxi</span><strong>{{ recipe.calcium }}</strong></div>
          </div>
        </div>

        <!-- AI Insight -->
        <div class="card-panel ai-card">
          <div class="ai-title"><i class="fa-solid fa-wand-magic-sparkles"></i> AI Nhận xét</div>
          <p>{{ recipe.aiInsight }}</p>
        </div>

        <!-- Info -->
        <div class="card-panel info-card">
          <div class="info-row"><i class="fa-solid fa-clock"></i><span>Thời gian nấu</span><strong>{{ recipe.cookTime }}</strong></div>
          <div class="info-row"><i class="fa-solid fa-users"></i><span>Khẩu phần</span><strong>{{ recipe.servings }} người</strong></div>
          <div class="info-row"><i class="fa-solid fa-star"></i><span>Độ khó</span><strong>{{ recipe.difficulty }}</strong></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { useRecipeStore } from '@/stores/recipeStore';

const router = useRouter();
const route = useRoute();
const recipeStore = useRecipeStore();
interface Ingredient {
  name: string;
  grams: number;
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  color: string;
}

interface Recipe {
  id?: string;
  title: string;
  goal: string;
  mealTime: string;
  protein: string;
  carbs: string;
  fat: string;
  calories: number;
  image: string;
  videoId: string;
  cookTime: string;
  servings: number | string;
  difficulty: string;
  aiInsight: string;
  fiber?: string;
  sugar?: string;
  sodium?: string;
  calcium?: string;
  ingredients: Ingredient[];
  steps: string[];
}

const isLoading = ref(true);

// Bộ dữ liệu mẫu chuẩn để hiển thị khi nhấn vào card mock
const mockRecipes: Record<string, Recipe> = {
  'm1': {
    title: 'Salad Quinoa Ức Gà', goal: 'maintain', mealTime: 'lunch',
    protein: '35g', carbs: '45g', fat: '12g', calories: 420,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    videoId: '7V2e1-Lh1S8', cookTime: '30 phút', servings: 2, difficulty: 'Dễ',
    aiInsight: 'Món ăn này rất phù hợp với mục tiêu giữ dáng. Hàm lượng protein cao từ ức gà giúp no lâu.',
    fiber: '6.2g', sugar: '4.1g', sodium: '320mg', calcium: '80mg',
    ingredients: [
      { name: 'Ức gà', grams: 150, calories: 247, protein: '46.5', carbs: '0', fat: '5.4', color: '#BE185D' },
      { name: 'Quinoa', grams: 80, calories: 120, protein: '4.4', carbs: '21.3', fat: '1.9', color: '#374151' }
    ],
    steps: ['Luộc quinoa 15 phút.', 'Áp chảo ức gà.', 'Trộn đều và thưởng thức.']
  },
  'm2': {
    title: 'Mì Ý Sốt Cà Gà Viên', goal: 'gain', mealTime: 'lunch',
    protein: '28g', carbs: '65g', fat: '15g', calories: 510,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    videoId: 'MS6Vn3f4M98', cookTime: '25 phút', servings: 1, difficulty: 'Trung bình',
    aiInsight: 'Cung cấp năng lượng dồi dào từ tinh bột mì Ý, hỗ trợ tăng cân hiệu quả.',
    fiber: '4.5g', sugar: '8.2g', sodium: '450mg', calcium: '60mg',
    ingredients: [
      { name: 'Mì Ý', grams: 100, calories: 350, protein: '12', carbs: '70', fat: '2', color: '#F59E0B' },
      { name: 'Thịt gà viên', grams: 120, calories: 160, protein: '16', carbs: '5', fat: '8', color: '#EF4444' }
    ],
    steps: ['Luộc mì Ý.', 'Làm sốt cà chua và gà viên.', 'Trộn mì và thưởng thức.']
  },
  'm5': {
    title: 'Cơm Tấm Sườn Bì Chả', goal: 'gain', mealTime: 'breakfast',
    protein: '32g', carbs: '85g', fat: '22g', calories: 650,
    image: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&w=800&q=80',
    videoId: 'qC8eK4pB87I', cookTime: '45 phút', servings: 1, difficulty: 'Khó',
    aiInsight: 'Món ăn truyền thống giàu năng lượng, phù hợp cho bữa sáng đầy đủ dưỡng chất.',
    fiber: '2.5g', sugar: '3.0g', sodium: '850mg', calcium: '45mg',
    ingredients: [
      { name: 'Gạo tấm', grams: 150, calories: 400, protein: '8', carbs: '80', fat: '1', color: '#CBD5E1' },
      { name: 'Sườn nướng', grams: 120, calories: 250, protein: '24', carbs: '5', fat: '21', color: '#B91C1C' }
    ],
    steps: ['Nấu cơm tấm.', 'Nướng sườn.', 'Làm nước mắm và thưởng thức.']
  }
};

const recipe = ref<Recipe>({
  title: 'Đang tải...',
  goal: 'maintain',
  mealTime: 'lunch',
  protein: '0g',
  carbs: '0g',
  fat: '0g',
  calories: 0,
  image: '',
  videoId: '',
  cookTime: '',
  servings: 1,
  difficulty: 'Dễ',
  aiInsight: '',
  fiber: '0g',
  sugar: '0g',
  sodium: '0mg',
  calcium: '0mg',
  ingredients: [],
  steps: []
});

const getYoutubeId = (url: string) => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }
  return url;
};

const fetchRecipeDetail = async () => {
  const id = route.params.id as string;
  
  // 1. Kiểm tra nếu là mock data
  if (id.startsWith('m')) {
    const foundMock = mockRecipes[id];
    if (foundMock) {
      recipe.value = foundMock;
    } else {
      recipe.value = mockRecipes['m1'];
    }
    isLoading.value = false;
    return;
  }

  // 2. Nếu là data thật từ database
  try {
    const d = await recipeStore.fetchRecipeDetail(id);
    if (d) {
      recipe.value = {
        id: d.id,
        title: d.name_vn,
        goal: (d.goals && d.goals[0]) || 'maintain',
        mealTime: (d.meal_times && d.meal_times[0]) || 'lunch',
        protein: Math.round(d.total_protein || 0) + 'g',
        carbs: Math.round(d.total_carbs || 0) + 'g',
        fat: Math.round(d.total_fat || 0) + 'g',
        calories: Math.round(d.total_calories || 0),
        image: d.image_url || 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=800&q=80',
        videoId: getYoutubeId(d.video_url),
        cookTime: d.cooking_time || '30 phút',
        servings: d.servings || 1,
        difficulty: d.difficulty || 'Trung bình',
        aiInsight: d.ai_insight || 'Chưa có nhận xét từ AI.',
        ingredients: (d.ingredients || []).map((ing: any) => ({
          ...ing,
          color: '#' + Math.floor(Math.random()*16777215).toString(16)
        })) as Ingredient[],
        steps: d.steps || []
      };
    }
  } catch (err) {
    console.error("Lỗi tải chi tiết:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchRecipeDetail();
});

const goalText = computed(() => {
  const map: Record<string, string> = {
    lose: 'Giảm cân',
    maintain: 'Giữ dáng',
    gain: 'Tăng cơ'
  };
  return map[recipe.value.goal] || 'Giữ dáng';
});

const mealTimeText = computed(() => {
  const map: Record<string, string> = {
    breakfast: 'Bữa sáng',
    lunch: 'Bữa trưa',
    dinner: 'Bữa tối',
    snack: 'Ăn vặt'
  };
  return map[recipe.value.mealTime] || 'Bữa trưa';
});
</script>

<style scoped>
.detail-container { padding: 30px; }

.page-header {
  display: flex; align-items: center; gap: 16px; margin-bottom: 30px;
}
.page-header h1 { margin: 0; font-size: 24px; font-weight: 800; color: var(--text-dark); }
.page-header p { margin: 0; }
.header-desc { font-size: 14px; color: var(--text-muted); margin-top: 4px; }
.header-actions { margin-left: auto; display: flex; gap: 10px; }

.back-btn {
  width: 40px; height: 40px; background: white; border: 1px solid #E2E8F0; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;
  transition: 0.2s; color: var(--text-dark);
}
.back-btn:hover { background: #F8FAFC; border-color: #CBD5E1; }

.btn-outline {
  background: white; border: 1px solid #CBD5E1; padding: 10px 18px; border-radius: 12px;
  font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px;
  transition: 0.2s; color: var(--text-dark);
}
.btn-outline:hover { border-color: #8EAE82; color: #4a8c54; }

.btn-danger {
  background: white; border: 1px solid #FCA5A5; color: #DC2626; padding: 10px 18px;
  border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer;
  display: flex; align-items: center; gap: 8px; transition: 0.2s;
}
.btn-danger:hover { background: #FEE2E2; }

/* Layout */
.detail-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }

.card-panel {
  background: white; border-radius: 20px; padding: 24px;
  border: 1px solid #E2E8F0; margin-bottom: 24px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}
.card-panel h3 { margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: var(--text-dark); }

/* Hero */
.hero-card { padding: 0; overflow: hidden; }
.hero-img { width: 100%; height: 300px; object-fit: cover; display: block; }
.hero-meta { padding: 20px 24px; }
.meta-tags { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
.tag {
  padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;
  display: flex; align-items: center; gap: 6px;
}
.tag.lose { background: #DCFCE7; color: #166534; }
.tag.maintain { background: #FEF3C7; color: #92400E; }
.tag.gain { background: #FEE2E2; color: #991B1B; }
.meal-tag { background: #EFF6FF; color: #1D4ED8; }
.ai-tag { background: #F0FDF4; color: #166534; }

.quick-macros { display: flex; gap: 10px; flex-wrap: wrap; }
.macro-pill {
  background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;
  padding: 8px 14px; font-size: 14px; font-weight: 700; color: var(--text-dark);
}
.macro-pill span { color: var(--text-muted); font-weight: 500; margin-right: 4px; }
.calories-pill { background: #FFFBEB; border-color: #FDE68A; color: #D97706; }

/* Video */
.video-wrap { border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; }

/* Table */
.ing-table { width: 100%; border-collapse: collapse; }
.ing-table th { text-align: left; padding: 12px; font-size: 13px; color: var(--text-muted); border-bottom: 1px solid #E2E8F0; font-weight: 600; }
.ing-table td { padding: 12px; border-bottom: 1px solid #F1F5F9; font-size: 14px; color: var(--text-dark); }
.ing-table tr:last-child td { border-bottom: none; }
.ing-name { display: flex; align-items: center; gap: 8px; font-weight: 600; }
.dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.cal-badge { background: #FFFBEB; color: #D97706; font-weight: 700; padding: 4px 10px; border-radius: 8px; font-size: 13px; }

/* Steps */
.steps-list { display: flex; flex-direction: column; gap: 16px; }
.step-item { display: flex; gap: 16px; align-items: flex-start; }
.step-num { width: 32px; height: 32px; background: #E6EFE5; color: #1A2F23; font-weight: 700; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.step-item p { margin: 0; font-size: 14px; line-height: 1.7; color: var(--text-dark); padding-top: 4px; }

/* Sidebar */
.nutrition-card {}

.donut-area { position: relative; width: 140px; height: 140px; margin: 0 auto 24px; }
.donut-chart { width: 100%; height: 100%; transform: rotate(-90deg); }
.donut-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
.donut-center strong { display: block; font-size: 22px; font-weight: 800; color: var(--text-dark); }
.donut-center span { font-size: 12px; color: var(--text-muted); font-weight: 600; }

.macro-bars { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }
.bar-row { display: flex; align-items: center; gap: 10px; }
.bar-label { display: flex; align-items: center; gap: 6px; width: 70px; font-size: 13px; font-weight: 600; color: var(--text-dark); }
.bar-track { flex: 1; background: #F1F5F9; border-radius: 20px; height: 8px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 20px; }
.bar-val { font-size: 13px; font-weight: 700; color: var(--text-dark); width: 35px; text-align: right; }

.extra-nutrition { border-top: 1px solid #E2E8F0; padding-top: 16px; display: flex; flex-direction: column; gap: 12px; }
.extra-row { display: flex; justify-content: space-between; font-size: 14px; }
.extra-row span { color: var(--text-muted); }
.extra-row strong { color: var(--text-dark); font-weight: 700; }

/* AI card */
.ai-card { background: linear-gradient(145deg, #F3F7F2, #E6EFE5); border-color: #8EAE82; }
.ai-title { font-size: 15px; font-weight: 700; color: #1A2F23; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
.ai-title i { color: #f4c553; }
.ai-card p { margin: 0; font-size: 13px; line-height: 1.7; color: #2D4A35; }

/* Info card */
.info-card { display: flex; flex-direction: column; gap: 14px; }
.info-row { display: flex; align-items: center; gap: 10px; font-size: 14px; }
.info-row i { color: #8EAE82; width: 18px; text-align: center; }
.info-row span { color: var(--text-muted); flex: 1; }
.info-row strong { color: var(--text-dark); font-weight: 700; }

.menu-card { cursor: pointer; }
</style>
