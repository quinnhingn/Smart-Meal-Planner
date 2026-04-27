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
              <span class="tag ai-tag">
                <i class="fa-solid fa-check-circle"></i> {{ recipe.aiMatch }} AI
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
              <div class="step-num">{{ i + 1 }}</div>
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
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// Mock recipe data — in real app, fetch by route.params.id
const recipe = computed(() => ({
  id: route.params.id,
  title: 'Salad Quinoa Ức Gà',
  goal: 'maintain',
  mealTime: 'lunch',
  protein: '35g', carbs: '45g', fat: '12g',
  calories: '420',
  aiMatch: '98%',
  image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  videoId: '7V2e1-Lh1S8',
  cookTime: '30 phút',
  servings: 2,
  difficulty: 'Dễ',
  fiber: '6.2g', sugar: '4.1g', sodium: '320mg', calcium: '80mg',
  aiInsight: 'Món ăn này rất phù hợp với mục tiêu giữ dáng. Hàm lượng protein cao từ ức gà giúp no lâu, trong khi quinoa cung cấp carbs phức tạp giải phóng năng lượng từ từ. Gợi ý: ăn vào bữa trưa để tối ưu năng lượng.',
  ingredients: [
    { name: 'Ức gà', grams: 150, calories: 247, protein: '46.5', carbs: '0', fat: '5.4', color: '#BE185D' },
    { name: 'Quinoa', grams: 80, calories: 120, protein: '4.4', carbs: '21.3', fat: '1.9', color: '#374151' },
    { name: 'Cà chua', grams: 100, calories: 18, protein: '0.9', carbs: '3.9', fat: '0.2', color: '#B91C1C' },
    { name: 'Bông cải xanh', grams: 100, calories: 34, protein: '2.8', carbs: '6.6', fat: '0.4', color: '#15803D' },
    { name: 'Dầu ô liu', grams: 10, calories: 88, protein: '0', carbs: '0', fat: '10', color: '#A16207' },
  ],
  steps: [
    'Luộc quinoa với nước muối nhạt trong 15 phút cho đến khi quinoa nở và nước cạn. Để nguội.',
    'Ức gà ướp với muối, tiêu, tỏi bột 10 phút. Áp chảo trên lửa vừa mỗi mặt 6 phút. Để nguội rồi xé sợi.',
    'Bông cải xanh cắt nhỏ, luộc sơ 2 phút trong nước sôi. Vớt ra ngâm nước đá giữ màu xanh.',
    'Trộn đều quinoa, rau củ, thêm dầu ô liu, muối, tiêu. Cho thịt gà lên trên. Thưởng thức ngay.'
  ]
}));

const goalText = computed(() => ({
  lose: 'Giảm cân', maintain: 'Giữ dáng', gain: 'Tăng cân'
}[recipe.value.goal] || 'Giữ dáng'));

const mealTimeText = computed(() => ({
  breakfast: 'Bữa sáng', lunch: 'Bữa trưa', dinner: 'Bữa tối', snack: 'Ăn vặt'
}[recipe.value.mealTime] || 'Bữa trưa'));
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
