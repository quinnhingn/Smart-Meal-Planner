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

        <!-- Macro Table -->
        <div class="card-panel">
          <h3>Thông số dinh dưỡng <span class="per-note">/ 100g</span></h3>
          <div class="macro-big-grid">
            <div class="macro-big-card" v-for="m in macroCards" :key="m.key">
              <div class="macro-icon" :style="{ background: m.bg }">
                <i :class="m.icon" :style="{ color: m.color }"></i>
              </div>
              <span class="macro-val">{{ (ingredient as any)[m.key] }}</span>
              <span class="macro-unit">{{ m.unit }}</span>
              <span class="macro-label">{{ m.label }}</span>
            </div>
          </div>
        </div>

        <!-- Detailed Nutrition Table -->
        <div class="card-panel">
          <h3>Chi tiết thành phần</h3>
          <table class="nut-table">
            <thead>
              <tr>
                <th>Thành phần</th>
                <th>Giá trị / 100g</th>
                <th>% Nhu cầu hàng ngày</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in nutritionRows" :key="row.label">
                <td>
                  <div class="nut-label-cell">
                    <span class="dot" :style="{ background: row.color }"></span>
                    {{ row.label }}
                  </div>
                </td>
                <td><strong>{{ row.value }} {{ row.unit }}</strong></td>
                <td>
                  <div class="dv-bar-wrap">
                    <div class="dv-bar"><div class="dv-fill" :style="{ width: row.dv + '%', background: row.color }"></div></div>
                    <span class="dv-pct">{{ row.dv }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
        <!-- Image -->
        <div class="card-panel img-panel">
          <img :src="ingredient.image" :alt="ingredient.name" class="side-img">
        </div>

        <!-- Calories ring -->
        <div class="card-panel cal-panel">
          <h3>Tổng quan</h3>
          <div class="donut-area">
            <svg viewBox="0 0 120 120" class="donut-chart">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#F1F5F9" stroke-width="18"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="#F59E0B" stroke-width="18"
                stroke-dasharray="314" stroke-dashoffset="0" stroke-linecap="round"/>
            </svg>
            <div class="donut-center">
              <strong>{{ ingredient.calories }}</strong>
              <span>kcal</span>
            </div>
          </div>
          <div class="macro-bars">
            <div class="bar-row" v-for="b in barData" :key="b.key">
              <div class="bar-label">
                <span class="dot" :style="{ background: b.color }"></span>{{ b.label }}
              </div>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: barWidth(b.key, b.max) + '%', background: b.color }"></div>
              </div>
              <span class="bar-val">{{ (ingredient as any)[b.key] }}g</span>
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

        <!-- Suitable For -->
        <div class="card-panel">
          <h3>Phù hợp với</h3>
          <div class="suit-list">
            <div class="suit-row" v-for="s in ingredient.suitability" :key="s">
              <div class="suit-icon" :class="s"><i :class="suitIcon(s)"></i></div>
              <span>{{ suitLabel(s) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import meatImg from '@/stores/image/image.png';

const router = useRouter();
const route = useRoute();

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

const nutritionRows = computed(() => {
  const ing = ingredient.value;
  return [
    { label: 'Protein', value: ing.protein, unit: 'g', color: '#3B82F6', dv: Math.min(Math.round(ing.protein / 50 * 100), 100) },
    { label: 'Carbohydrate', value: ing.carbs, unit: 'g', color: '#22C55E', dv: Math.min(Math.round(ing.carbs / 300 * 100), 100) },
    { label: '— Đường', value: ing.sugar, unit: 'g', color: '#A3E635', dv: Math.min(Math.round(ing.sugar / 25 * 100), 100) },
    { label: '— Chất xơ', value: ing.fiber, unit: 'g', color: '#4ADE80', dv: Math.min(Math.round(ing.fiber / 30 * 100), 100) },
    { label: 'Chất béo', value: ing.fat, unit: 'g', color: '#EF4444', dv: Math.min(Math.round(ing.fat / 65 * 100), 100) },
    { label: '— Bão hòa', value: ing.saturatedFat, unit: 'g', color: '#F87171', dv: Math.min(Math.round(ing.saturatedFat / 20 * 100), 100) },
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

const suitLabel = (s: string) => ({ lose: 'Giảm cân', gain: 'Tăng cơ', keto: 'Keto', maintain: 'Giữ dáng', diabetic: 'Tiểu đường', vegetarian: 'Chay', kids: 'Trẻ em' }[s] || s);
const suitIcon = (s: string) => ({ lose: 'fa-solid fa-arrow-trend-down', gain: 'fa-solid fa-dumbbell', keto: 'fa-solid fa-leaf', maintain: 'fa-solid fa-bullseye', diabetic: 'fa-solid fa-heart-pulse', vegetarian: 'fa-solid fa-seedling', kids: 'fa-solid fa-child' }[s] || 'fa-solid fa-tag');
</script>

<style scoped>
.detail-container { padding: 30px; }

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
.detail-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
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

/* Macro grid */
.per-note { font-size: 14px; font-weight: 500; color: var(--text-muted); margin-left: 6px; }
.macro-big-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
.macro-big-card {
  background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px;
  padding: 18px 14px; display: flex; flex-direction: column; align-items: center; gap: 6px;
  text-align: center;
}
.macro-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 4px; }
.macro-val { font-size: 24px; font-weight: 800; color: var(--text-dark); line-height: 1; }
.macro-unit { font-size: 12px; color: var(--text-muted); font-weight: 600; }
.macro-label { font-size: 13px; color: var(--text-muted); font-weight: 600; }

/* Nutrition table */
.nut-table { width: 100%; border-collapse: collapse; }
.nut-table th { text-align: left; padding: 10px 12px; font-size: 13px; color: var(--text-muted); border-bottom: 1px solid #E2E8F0; font-weight: 600; }
.nut-table td { padding: 11px 12px; border-bottom: 1px solid #F1F5F9; font-size: 14px; }
.nut-table tr:last-child td { border-bottom: none; }
.nut-label-cell { display: flex; align-items: center; gap: 8px; color: var(--text-dark); }
.dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.dv-bar-wrap { display: flex; align-items: center; gap: 8px; }
.dv-bar { flex: 1; height: 7px; background: #F1F5F9; border-radius: 20px; overflow: hidden; max-width: 120px; }
.dv-fill { height: 100%; border-radius: 20px; }
.dv-pct { font-size: 12px; font-weight: 700; color: var(--text-muted); width: 34px; }

/* Tips */
.tips-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.tip-card { background: #F8FAFC; border-radius: 14px; padding: 16px; display: flex; gap: 12px; align-items: flex-start; }
.tip-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tip-title { font-size: 13px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
.tip-body { font-size: 13px; color: var(--text-muted); line-height: 1.5; }

/* Sidebar */
.img-panel { padding: 0; overflow: hidden; }
.side-img { width: 100%; height: 200px; object-fit: cover; display: block; border-radius: 20px; }

.donut-area { position: relative; width: 130px; height: 130px; margin: 0 auto 20px; }
.donut-chart { width: 100%; height: 100%; transform: rotate(-90deg); }
.donut-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); text-align: center; }
.donut-center strong { display: block; font-size: 20px; font-weight: 800; color: var(--text-dark); }
.donut-center span { font-size: 11px; color: var(--text-muted); font-weight: 600; }

.macro-bars { display: flex; flex-direction: column; gap: 12px; }
.bar-row { display: flex; align-items: center; gap: 8px; }
.bar-label { display: flex; align-items: center; gap: 6px; width: 65px; font-size: 12px; font-weight: 600; color: var(--text-dark); }
.bar-track { flex: 1; height: 8px; background: #F1F5F9; border-radius: 20px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 20px; transition: width 0.4s; }
.bar-val { font-size: 12px; font-weight: 700; color: var(--text-dark); width: 30px; text-align: right; }

.ai-card { background: linear-gradient(145deg, #F3F7F2, #E6EFE5); border-color: #8EAE82; }
.ai-title { font-size: 14px; font-weight: 700; color: #1A2F23; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.ai-title i { color: #f4c553; }
.ai-card p { margin: 0 0 12px 0; font-size: 13px; color: #2D4A35; line-height: 1.7; }
.ai-tags-wrap { display: flex; flex-wrap: wrap; gap: 7px; }
.ai-tag { background: white; border: 1px solid #BBF7D0; color: #166534; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 8px; }

.suit-list { display: flex; flex-direction: column; gap: 10px; }
.suit-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: #F8FAFC; border-radius: 12px; font-size: 14px; font-weight: 600; color: var(--text-dark); }
.suit-icon { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.suit-icon.gain { background: #EFF6FF; color: #1D4ED8; }
.suit-icon.lose { background: #DCFCE7; color: #166534; }
.suit-icon.keto { background: #FEF9C3; color: #854D0E; }
.suit-icon.maintain { background: #FFF7ED; color: #9A3412; }

.detail-sidebar { display: flex; flex-direction: column; }
</style>
