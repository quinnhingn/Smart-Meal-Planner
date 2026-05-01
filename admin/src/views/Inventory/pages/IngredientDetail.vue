<template>
  <div class="detail-container">
    <!-- Header -->
    <div class="page-header">
      <button class="back-btn" @click="router.back()">
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <div>
        <h1>{{ ingredient.name }} <span class="name-en">/ {{ ingredient.nameEn }}</span></h1>
        <p class="header-desc">Chi tiết thông số dinh dưỡng nguyên liệu</p>
      </div>
      <div class="header-actions">
        <button class="btn-outline"><i class="fa-solid fa-pen"></i> Chỉnh sửa</button>
        <button class="btn-danger"><i class="fa-solid fa-trash"></i> Xoá</button>
      </div>
    </div>

    <div class="detail-grid">
      <!-- Left -->
      <div class="detail-main">

        <!-- Hero -->
        <div class="card-panel hero-card">
          <img :src="ingredient.image" :alt="ingredient.name" class="hero-img">
          <div class="hero-meta">
            <div class="meta-tags">
              <span class="tag cat-tag">
                <i class="fa-solid fa-layer-group"></i> {{ ingredient.categoryLabel }}
              </span>
              <span class="tag" v-for="s in ingredient.suitability" :key="s" :class="s">
                <i :class="suitIcon(s)"></i> {{ suitLabel(s) }}
              </span>
              <span class="tag ai-tag">
                <i class="fa-solid fa-circle-check"></i> {{ ingredient.completeness }}% đủ data
              </span>
            </div>

            <div class="weight-range-badge" v-if="ingredient.weightMin">
              <i class="fa-solid fa-weight-scale"></i>
              Phù hợp cho người nặng <strong>{{ ingredient.weightMin }}–{{ ingredient.weightMax }} kg</strong>
            </div>
          </div>
        </div>

        <!-- Detailed Nutrition Tabbed Redesign -->
        <div class="card-panel nutrition-detailed-panel">
          <div class="nut-panel-header-tabs">
            <div class="nut-tabs">
              <button class="nut-tab-btn" :class="{ active: activeNutTab === 'macros' }" @click="activeNutTab = 'macros'">
                Đại lượng chính
              </button>
              <button class="nut-tab-btn" :class="{ active: activeNutTab === 'micros' }" @click="activeNutTab = 'micros'">
                Vi chất & Khoáng chất
              </button>
            </div>
            <div class="nut-legend">
              <span class="high-dot"></span>
              <span>Cao (>15% DV)</span>
            </div>
          </div>

          <div class="nut-tab-content">
            <Transition name="fade-slide" mode="out-in">
              <!-- Macros Tab -->
              <div class="nut-list" v-if="activeNutTab === 'macros'" key="macros">
                <div class="nut-item-row" v-for="row in macroDetailedRows" :key="row.label" :class="{ 'is-sub': row.isSub, 'high-value': row.dv > 15 }">
                  <div class="nut-name">
                    <span class="dot" :style="{ background: row.color, opacity: row.isSub ? 0.5 : 1 }"></span>
                    {{ row.label }}
                  </div>
                  <div class="nut-val-wrap">
                    <span class="nut-val"><strong>{{ row.value }}</strong> {{ row.unit }}</span>
                    <div class="nut-progress-mini">
                      <div class="nut-progress-fill" :style="{ width: row.dv + '%', background: row.color }"></div>
                    </div>
                    <span class="nut-pct" :class="{ 'pct-high': row.dv > 15 }">{{ row.dv }}%</span>
                  </div>
                </div>
              </div>

              <!-- Micros Tab -->
              <div class="nut-list" v-else key="micros">
                <div class="nut-item-row" v-for="row in microDetailedRows" :key="row.label" :class="{ 'high-value': row.dv > 10 }">
                  <div class="nut-name">
                    <span class="dot" :style="{ background: row.color }"></span>
                    {{ row.label }}
                  </div>
                  <div class="nut-val-wrap">
                    <span class="nut-val"><strong>{{ row.value }}</strong> {{ row.unit }}</span>
                    <div class="nut-progress-mini">
                      <div class="nut-progress-fill" :style="{ width: row.dv + '%', background: row.color }"></div>
                    </div>
                    <span class="nut-pct" :class="{ 'pct-high': row.dv > 10 }">{{ row.dv }}%</span>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Usage Tips -->
        <div class="card-panel">
          <h3>Ghi chú & Gợi ý sử dụng</h3>
          <div class="tips-grid">
            <div class="tip-card" v-for="t in ingredient.tips" :key="t.title">
              <div class="tip-icon" :style="{ background: t.bg }">
                <i :class="t.icon" :style="{ color: t.color }"></i>
              </div>
              <div>
                <div class="tip-title">{{ t.title }}</div>
                <div class="tip-body">{{ t.body }}</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Right sidebar -->
      <div class="detail-sidebar">
        <!-- Premium Overview (Moved to Top) -->
        <div class="card-panel cal-panel">
          <div class="panel-header-inline">
            <h3>Tổng quan</h3>
            <span class="per-note">/ 100g</span>
          </div>
          
          <div class="overview-main">
            <div class="donut-area">
              <svg viewBox="0 0 120 120" class="donut-chart">
                <!-- Background track -->
                <circle cx="60" cy="60" r="52" fill="none" stroke="#F1F5F9" stroke-width="12"/>
                <!-- Glow effect for Calories -->
                <circle cx="60" cy="60" r="52" fill="none" stroke="url(#calGradient)" stroke-width="12"
                  stroke-dasharray="326" stroke-dashoffset="0" stroke-linecap="round" class="donut-fill"/>
                
                <defs>
                  <linearGradient id="calGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#F59E0B;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#fbbf24;stop-opacity:1" />
                  </linearGradient>
                </defs>
              </svg>
              <div class="donut-center">
                <i class="fa-solid fa-fire cal-icon-mini"></i>
                <strong>{{ ingredient.calories }}</strong>
                <span>kcal</span>
              </div>
            </div>

            <div class="macro-bars-premium">
              <div class="bar-item" v-for="b in barData" :key="b.key">
                <div class="bar-info">
                  <div class="bar-label-wrap">
                    <div class="bar-icon-sm" :style="{ background: b.color + '20', color: b.color }">
                      <i :class="getMacroIcon(b.key)"></i>
                    </div>
                    <span class="bar-label-text">{{ b.label }}</span>
                  </div>
                  <span class="bar-value-text">{{ (ingredient as any)[b.key] }}g</span>
                </div>
                <div class="bar-progress-container">
                  <div class="bar-progress-fill" :style="{ width: barWidth(b.key, b.max) + '%', background: b.color }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Insight -->
        <div class="card-panel ai-card">
          <div class="ai-title"><i class="fa-solid fa-wand-magic-sparkles"></i> AI Nhận xét</div>
          <p>{{ aiInsight }}</p>
          <div class="ai-tags-wrap" v-if="autoTags.length">
            <span class="ai-tag" v-for="t in autoTags" :key="t">{{ t }}</span>
          </div>
        </div>

        <!-- Allergens & Diet Labels -->
        <div class="card-panel diet-panel">
          <h3>Cảnh báo & Ăn kiêng</h3>
          <div class="allergen-grid">
            <div class="allergen-item" v-for="a in allergens" :key="a.label" 
              :class="{ active: a.active }"
              :style="{ 
                '--item-color': a.color, 
                '--item-bg': a.bg,
                '--item-border': a.border 
              }">
              <i :class="a.icon"></i>
              <span>{{ a.label }}</span>
            </div>
          </div>
        </div>

        <!-- Related Recipes -->
        <div class="card-panel recipes-panel">
          <h3>Công thức liên quan</h3>
          <div class="recipe-list-mini">
            <div class="recipe-item-mini" v-for="r in relatedRecipes" :key="r.id">
              <img :src="r.image" :alt="r.name" class="recipe-img-sm">
              <div class="recipe-info-sm">
                <div class="recipe-name-sm">{{ r.name }}</div>
                <div class="recipe-meta-sm">
                  <span><i class="fa-regular fa-clock"></i> {{ r.time }}p</span>
                  <span><i class="fa-solid fa-fire"></i> {{ r.calories }} kcal</span>
                </div>
              </div>
              <button class="recipe-view-btn"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import meatImg from '@/stores/image/image.png';

const router = useRouter();
const route = useRoute();
const activeNutTab = ref('macros');

// Mock data — replace with API call using route.params.ingredientId
const ingredient = computed(() => ({
  id: route.params.ingredientId,
  name: 'Ức gà',
  nameEn: 'Chicken Breast',
  categoryLabel: 'Thịt & Hải sản',
  calories: 165,
  protein: 31,
  carbs: 0,
  fat: 3.6,
  sugar: 0,
  fiber: 0,
  saturatedFat: 1,
  sodium: 74,
  calcium: 15,
  iron: 1,
  vitaminC: 0,
  vitaminA: 9,
  completeness: 98,
  weightMin: 50,
  weightMax: 90,
  suitability: ['gain', 'lose', 'keto'],
  image: meatImg,
  tips: [
    { title: 'Bảo quản', body: 'Ngăn đá tối đa 3 tháng. Ngăn mát dùng trong 2–3 ngày.', icon: 'fa-solid fa-snowflake', color: '#3B82F6', bg: '#EFF6FF' },
    { title: 'Chế biến', body: 'Áp chảo, hấp hoặc nướng để giữ protein. Tránh chiên ngập dầu.', icon: 'fa-solid fa-fire-flame-curved', color: '#F97316', bg: '#FFF7ED' },
    { title: 'Kết hợp tốt', body: 'Salad, cơm gạo lứt, rau luộc, quinoa.', icon: 'fa-solid fa-bowl-food', color: '#22C55E', bg: '#F0FDF4' },
    { title: 'Lưu ý', body: 'Người bị gút nên hạn chế vì hàm lượng purine. Không dùng thịt tái.', icon: 'fa-solid fa-triangle-exclamation', color: '#F59E0B', bg: '#FFFBEB' },
  ]
}));

const macroCards = [
  { key: 'calories', label: 'Calories', unit: 'kcal', icon: 'fa-solid fa-fire', color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'protein', label: 'Protein', unit: 'g', icon: 'fa-solid fa-dumbbell', color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'carbs', label: 'Carbs', unit: 'g', icon: 'fa-solid fa-wheat-awn', color: '#22C55E', bg: '#F0FDF4' },
  { key: 'fat', label: 'Chất béo', unit: 'g', icon: 'fa-solid fa-droplet', color: '#EF4444', bg: '#FEF2F2' },
];

const macroDetailedRows = computed(() => {
  const ing = ingredient.value;
  return [
    { label: 'Protein', value: ing.protein, unit: 'g', color: '#3B82F6', dv: Math.min(Math.round(ing.protein / 50 * 100), 100), isSub: false },
    { label: 'Carbohydrate', value: ing.carbs, unit: 'g', color: '#22C55E', dv: Math.min(Math.round(ing.carbs / 300 * 100), 100), isSub: false },
    { label: 'Đường', value: ing.sugar, unit: 'g', color: '#A3E635', dv: Math.min(Math.round(ing.sugar / 25 * 100), 100), isSub: true },
    { label: 'Chất xơ', value: ing.fiber, unit: 'g', color: '#4ADE80', dv: Math.min(Math.round(ing.fiber / 30 * 100), 100), isSub: true },
    { label: 'Chất béo', value: ing.fat, unit: 'g', color: '#EF4444', dv: Math.min(Math.round(ing.fat / 65 * 100), 100), isSub: false },
    { label: 'Bão hòa', value: ing.saturatedFat, unit: 'g', color: '#F87171', dv: Math.min(Math.round(ing.saturatedFat / 20 * 100), 100), isSub: true },
  ];
});

const microDetailedRows = computed(() => {
  const ing = ingredient.value;
  return [
    { label: 'Natri', value: ing.sodium, unit: 'mg', color: '#F59E0B', dv: Math.min(Math.round(ing.sodium / 2300 * 100), 100) },
    { label: 'Canxi', value: ing.calcium, unit: 'mg', color: '#8B5CF6', dv: Math.min(Math.round(ing.calcium / 1000 * 100), 100) },
    { label: 'Sắt', value: ing.iron, unit: 'mg', color: '#6366F1', dv: Math.min(Math.round(ing.iron / 18 * 100), 100) },
    { label: 'Vitamin C', value: ing.vitaminC, unit: 'mg', color: '#F97316', dv: Math.min(Math.round(ing.vitaminC / 90 * 100), 100) },
    { label: 'Vitamin A', value: ing.vitaminA, unit: 'mcg', color: '#EAB308', dv: Math.min(Math.round(ing.vitaminA / 900 * 100), 100) },
  ];
});

const barData = [
  { key: 'protein', label: 'Protein', color: '#3B82F6', max: 40 },
  { key: 'carbs', label: 'Carbs', color: '#22C55E', max: 80 },
  { key: 'fat', label: 'Fat', color: '#EF4444', max: 50 },
];
const barWidth = (key: string, max: number) => Math.min(((ingredient.value as any)[key] / max) * 100, 100);

const autoTags = computed(() => {
  const i = ingredient.value;
  const tags: string[] = [];
  if (i.protein >= 20) tags.push('Giàu Protein');
  if (i.calories < 50) tags.push('Ít Calories');
  if (i.carbs < 10) tags.push('Low-Carb');
  if (i.fat < 5) tags.push('Ít béo');
  if (i.fiber >= 5) tags.push('Giàu Chất xơ');
  return tags;
});

const aiInsight = computed(() => {
  const i = ingredient.value;
  if (i.protein >= 25) return `Đây là nguồn protein tuyệt vời với ${i.protein}g/100g — rất phù hợp để bổ sung vào công thức tăng cơ hoặc ăn kiêng.`;
  if (i.calories < 100 && i.carbs < 5) return 'Ít calories và rất ít carb — lý tưởng cho thực đơn Keto hoặc giảm cân.';
  return 'Nguyên liệu cân đối về dinh dưỡng, dễ kết hợp với nhiều loại công thức khác nhau.';
});

const allergens = [
  { label: 'Không Gluten', icon: 'fa-solid fa-bread-slice', active: true, color: '#C2410C', bg: '#FFF7ED', border: '#FFEDD5' },
  { label: 'Hải sản', icon: 'fa-solid fa-shrimp', active: false, color: '#0369A1', bg: '#F0F9FF', border: '#E0F2FE' },
  { label: 'Đậu nành', icon: 'fa-solid fa-leaf', active: false, color: '#15803D', bg: '#F0FDF4', border: '#DCFCE7' },
  { label: 'Hạt', icon: 'fa-solid fa-seedling', active: false, color: '#A16207', bg: '#FEFCE8', border: '#FEF9C3' },
  { label: 'Trứng', icon: 'fa-solid fa-egg', active: false, color: '#B45309', bg: '#FFFBEB', border: '#FEF3C7' },
  { label: 'Sữa', icon: 'fa-solid fa-glass-water', active: false, color: '#4338CA', bg: '#EEF2FF', border: '#E0E7FF' },
];

const relatedRecipes = [
  { id: 1, name: 'Ức gà nướng mật ong', time: 25, calories: 350, image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=100&h=100&fit=crop' },
  { id: 2, name: 'Salad ức gà áp chảo', time: 15, calories: 280, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop' },
  { id: 3, name: 'Súp gà ngô non', time: 30, calories: 220, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop' },
];

const suitLabel = (s: string) => ({ lose: 'Giảm cân', gain: 'Tăng cơ', keto: 'Keto', maintain: 'Giữ dáng', diabetic: 'Tiểu đường', vegetarian: 'Chay', kids: 'Trẻ em' }[s] || s);
const suitIcon = (s: string) => ({ lose: 'fa-solid fa-arrow-trend-down', gain: 'fa-solid fa-dumbbell', keto: 'fa-solid fa-leaf', maintain: 'fa-solid fa-bullseye', diabetic: 'fa-solid fa-heart-pulse', vegetarian: 'fa-solid fa-seedling', kids: 'fa-solid fa-child' }[s] || 'fa-solid fa-tag');

const getMacroIcon = (key: string) => ({
  protein: 'fa-solid fa-dumbbell',
  carbs: 'fa-solid fa-wheat-awn',
  fat: 'fa-solid fa-droplet'
}[key] || 'fa-solid fa-circle');
</script>

<style scoped>
.detail-container { 
  padding: 30px; 
  max-width: 100%;
  box-sizing: border-box;
}

.page-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 30px; }
.page-header h1 { margin: 0 0 4px 0; font-size: 22px; font-weight: 800; color: var(--text-dark); }
.name-en { font-size: 16px; font-weight: 500; color: var(--text-muted); }
.header-desc { margin: 0; font-size: 14px; color: var(--text-muted); }
.header-actions { margin-left: auto; display: flex; gap: 10px; flex-shrink: 0; }
.btn-outline {
  background: white; border: 1px solid #CBD5E1; padding: 10px 18px; border-radius: 12px;
  font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center;
  gap: 8px; transition: 0.2s; color: var(--text-dark);
}
.btn-outline:hover { border-color: #8EAE82; color: #4a8c54; }
.btn-danger {
  background: white; border: 1px solid #FCA5A5; color: #DC2626; padding: 10px 18px;
  border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer;
  display: flex; align-items: center; gap: 8px; transition: 0.2s;
}
.btn-danger:hover { background: #FEE2E2; }
.back-btn {
  width: 40px; height: 40px; background: white; border: 1px solid #E2E8F0;
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; transition: 0.2s; color: var(--text-dark);
}
.back-btn:hover { background: #F8FAFC; }

/* Layout */
.detail-grid { 
  display: grid; 
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); 
  gap: 24px; 
  width: 100%;
}
.card-panel {
  background: white; border-radius: 20px; padding: 24px;
  border: 1px solid #E2E8F0; margin-bottom: 24px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}
.card-panel h3 { margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: var(--text-dark); }

/* Hero */
.hero-card { padding: 0; overflow: hidden; }
.hero-img { width: 100%; height: 260px; object-fit: cover; display: block; }
.hero-meta { padding: 18px 24px; }
.meta-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.tag {
  padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;
  display: flex; align-items: center; gap: 6px;
}
.cat-tag { background: #F1F5F9; color: #475569; }
.ai-tag { background: #F0FDF4; color: #166534; }
.lose { background: #DCFCE7; color: #166534; }
.gain { background: #EFF6FF; color: #1D4ED8; }
.keto { background: #FEF9C3; color: #854D0E; }
.maintain { background: #FFF7ED; color: #9A3412; }
.weight-range-badge {
  background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;
  padding: 10px 16px; font-size: 13px; color: var(--text-muted);
  display: flex; align-items: center; gap: 8px;
}
.weight-range-badge i { color: #8EAE82; }
.weight-range-badge strong { color: var(--text-dark); }

/* Common */
.per-note { font-size: 14px; font-weight: 500; color: var(--text-muted); margin-left: 6px; }

/* Sidebar Premium Overview */
.cal-panel { background: white; border-radius: 24px; padding: 24px; }
.panel-header-inline { display: flex; align-items: baseline; gap: 8px; margin-bottom: 24px; }
.panel-header-inline h3 { margin: 0; }

.overview-main { display: flex; flex-direction: column; gap: 24px; align-items: center; }

.donut-area { position: relative; width: 150px; height: 150px; }
.donut-chart { width: 100%; height: 100%; transform: rotate(-90deg); filter: drop-shadow(0 4px 10px rgba(245, 158, 11, 0.15)); }
.donut-fill { transition: stroke-dashoffset 1s ease-out; }
.donut-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); text-align: center; }
.cal-icon-mini { color: #F59E0B; font-size: 14px; margin-bottom: 4px; display: block; }
.donut-center strong { display: block; font-size: 28px; font-weight: 900; color: var(--text-dark); letter-spacing: -1px; }
.donut-center span { font-size: 12px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; }

.macro-bars-premium { width: 100%; display: flex; flex-direction: column; gap: 16px; }
.bar-item { width: 100%; }
.bar-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.bar-label-wrap { display: flex; align-items: center; gap: 10px; }
.bar-icon-sm { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; }
.bar-label-text { font-size: 13px; font-weight: 700; color: var(--text-dark); }
.bar-value-text { font-size: 13px; font-weight: 800; color: var(--text-dark); }
.bar-progress-container { width: 100%; height: 8px; background: #F1F5F9; border-radius: 10px; overflow: hidden; }
.bar-progress-fill { height: 100%; border-radius: 10px; transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }

/* Detailed Nutrition Tabbed Layout */
.nutrition-detailed-panel { padding: 24px; min-height: 400px; }
.nut-panel-header-tabs { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; border-bottom: 1px solid #F1F5F9; padding-bottom: 0px; }
.nut-tabs { display: flex; gap: 4px; }
.nut-tab-btn {
  padding: 12px 24px; border: none; background: none; font-size: 14px; font-weight: 700;
  color: var(--text-muted); cursor: pointer; position: relative; transition: 0.3s;
  border-bottom: 3px solid transparent;
}
.nut-tab-btn.active { color: #8EAE82; border-bottom-color: #8EAE82; }
.nut-tab-btn:hover:not(.active) { color: var(--text-dark); background: #F8FAFC; border-radius: 8px 8px 0 0; }

.nut-legend { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: var(--text-muted); background: #F8FAFC; padding: 6px 14px; border-radius: 20px; border: 1px solid #E2E8F0; }
.high-dot { width: 8px; height: 8px; background: #EF4444; border-radius: 50%; box-shadow: 0 0 8px rgba(239, 68, 68, 0.5); }

.nut-list { display: flex; flex-direction: column; gap: 4px; }

.nut-item-row {
  display: flex; align-items: center; padding: 12px 16px;
  border-radius: 14px; transition: 0.2s;
  min-height: 48px;
}
.nut-item-row:hover { background: #F8FAFC; transform: translateX(5px); }
.nut-item-row.is-sub { background: rgba(248, 250, 252, 0.4); }
.nut-item-row.high-value { background: #FEF2F2; }

.nut-name { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: var(--text-dark); width: 160px; flex-shrink: 0; }
.dot { width: 8px; height: 8px; border-radius: 50%; }

.nut-val-wrap { flex: 1; display: flex; align-items: center; justify-content: flex-end; gap: 16px; }
.nut-val { font-size: 14px; color: var(--text-dark); font-weight: 700; width: 80px; text-align: right; }
.nut-progress-mini { width: 80px; height: 6px; background: #F1F5F9; border-radius: 10px; overflow: hidden; flex-shrink: 0; }
.nut-progress-fill { height: 100%; border-radius: 10px; }
.nut-pct { font-size: 12px; font-weight: 800; color: var(--text-muted); width: 40px; text-align: right; }
.pct-high { color: #DC2626; }

/* Transitions */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateX(20px); }
.fade-slide-leave-to { opacity: 0; transform: translateX(-20px); }



/* Tips */
.tips-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.tip-card { background: #F8FAFC; border-radius: 14px; padding: 16px; display: flex; gap: 12px; align-items: flex-start; }
.tip-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tip-title { font-size: 13px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
.tip-body { font-size: 13px; color: var(--text-muted); line-height: 1.5; }


.ai-card { background: linear-gradient(145deg, #F3F7F2, #E6EFE5); border-color: #8EAE82; }
.ai-title { font-size: 14px; font-weight: 700; color: #1A2F23; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.ai-title i { color: #f4c553; }
.ai-card p { margin: 0 0 12px 0; font-size: 13px; color: #2D4A35; line-height: 1.7; }
.ai-tags-wrap { display: flex; flex-wrap: wrap; gap: 7px; }
.ai-tag { background: white; border: 1px solid #BBF7D0; color: #166534; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 8px; }

/* Allergens & Recipes */
.allergen-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.allergen-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 5px;
  background: var(--item-bg); 
  border-radius: 12px; 
  border: 1px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--item-color);
  opacity: 0.5;
  filter: saturate(0.6);
}
.allergen-item i { font-size: 20px; margin-bottom: 2px; }
.allergen-item span { font-size: 11px; font-weight: 700; text-align: center; line-height: 1.2; }
.allergen-item.active { 
  opacity: 1; 
  filter: saturate(1.2); 
  border-color: var(--item-border);
  box-shadow: 0 4px 12px var(--item-border);
  transform: translateY(-3px);
  background: white;
}

.recipe-list-mini { display: flex; flex-direction: column; gap: 12px; }
.recipe-item-mini {
  display: flex; align-items: center; gap: 12px; padding: 10px;
  background: #F8FAFC; border-radius: 14px; border: 1px solid #F1F5F9;
  transition: 0.2s;
}
.recipe-item-mini:hover { background: white; border-color: #8EAE82; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.recipe-img-sm { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; }
.recipe-info-sm { flex: 1; min-width: 0; }
.recipe-name-sm { font-size: 13px; font-weight: 700; color: var(--text-dark); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.recipe-meta-sm { display: flex; gap: 10px; font-size: 11px; color: var(--text-muted); font-weight: 600; }
.recipe-view-btn {
  width: 28px; height: 28px; border-radius: 8px; border: none; background: #F1F5F9;
  color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: 0.2s;
}
.recipe-item-mini:hover .recipe-view-btn { background: #8EAE82; color: white; }

.detail-sidebar { 
  display: flex; 
  flex-direction: column; 
  min-width: 0;
}
</style>
