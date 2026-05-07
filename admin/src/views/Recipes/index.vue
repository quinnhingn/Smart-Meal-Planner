<template>
  <div class="recipe-overview-container">
    <div class="header-section">
      <div class="header-text">
        <h1>Quản lý Công thức</h1>
        <p>Phát triển kho dữ liệu dựa trên xu hướng và nhu cầu từ cộng đồng.</p>
      </div>
      <button class="add-btn" @click="router.push({ name: 'recipe-add' })">
        <i class="fa-solid fa-plus"></i>
        <span>Thêm mới</span>
      </button>
    </div>

    <!-- Top Section -->
    <div class="top-layout">
      <!-- Left: Categories -->
      <div class="panel-card categories-panel">
        <div class="panel-header">
          <h2>Danh mục món ăn</h2>
          <div class="total-badge">{{ totalDisplayCount }} món</div>
        </div>
        <div class="category-grid">
          <div v-for="cat in categories" :key="cat.id" class="category-card" @click="goToCategory(cat.id)">
            <div class="cat-icon" :style="{ backgroundColor: cat.bgColor, color: cat.color }">
              <i :class="cat.icon"></i>
            </div>
            <div class="cat-info">
              <h4>{{ cat.name }}</h4>
              <span>{{ cat.count }} món</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Goal Distribution -->
      <div class="panel-card stats-panel">
        <div class="panel-header">
          <h2>Phân bổ mục tiêu</h2>
          <i class="fa-solid fa-chart-pie"></i>
        </div>
        <div class="goal-stats-list">
          <div class="goal-stat-item" v-for="goal in goalStats" :key="goal.label">
            <div class="goal-info">
              <span class="dot" :style="{ background: goal.color }"></span>
              <span class="label">{{ goal.label }}</span>
              <span class="val">{{ goal.percent }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: goal.percent + '%', background: goal.color }"></div>
            </div>
          </div>
        </div>
        <div class="ai-suggestion-box">
          <div class="ai-icon-sm"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
          <p>Gợi ý: Cần thêm món <strong>Tăng cơ</strong>.</p>
        </div>
      </div>
    </div>

    <!-- Bottom Section: Redesigned 2x2 Grid -->
    <div class="requests-section">
      <div class="section-header">
        <div class="title-group">
          <div class="fire-icon-bg"><i class="fa-solid fa-fire-flame-curved"></i></div>
          <h2>Yêu cầu món mới ({{ pendingRequests.length }})</h2>
        </div>
        <div class="carousel-nav">
          <button class="nav-round" @click="scrollCarousel(-1)" :disabled="currentPage === 0">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <div class="dots">
            <span v-for="i in totalPages" :key="i" class="dot" :class="{ active: currentPage === i - 1 }" @click="currentPage = i - 1"></span>
          </div>
          <button class="nav-round" @click="scrollCarousel(1)" :disabled="currentPage === totalPages - 1">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div class="carousel-viewport">
        <div class="carousel-track" :style="{ transform: `translateX(-${currentPage * 100}%)` }">
          <div class="request-page" v-for="pIndex in totalPages" :key="pIndex">
            <div class="request-grid-2x2">
              <div class="req-card-v2" v-for="req in getPageItems(pIndex - 1)" :key="req.name">
                <!-- Status Tags -->
                <div class="req-tags">
                  <span class="tag-status" :class="req.priority">{{ req.priority === 'high' ? 'HOT' : 'NEW' }}</span>
                  <span class="tag-scans"><i class="fa-solid fa-camera"></i> {{ req.scans }}</span>
                </div>
                
                <!-- Main Content (Centered like Categories) -->
                <div class="req-main-content">
                  <div class="req-visual">
                    <i class="fa-solid fa-utensils"></i>
                  </div>
                  <h3>{{ req.name }}</h3>
                  <p class="req-location">{{ req.region }}</p>
                </div>

                <!-- System Yellow Button -->
                <button class="system-yellow-btn" @click="createFromRequest(req.name)">
                  Tạo công thức <i class="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRecipeStore } from '@/stores/recipeStore';

const router = useRouter();
const recipeStore = useRecipeStore();
const currentPage = ref(0);

const categories = ref([
  { id: 'rice', name: 'Cơm', count: 145, icon: 'fa-solid fa-bowl-rice', bgColor: '#fff1f0', color: '#f5222d' },
  { id: 'noodles', name: 'Mì & Phở', count: 86, icon: 'fa-solid fa-bowl-food', bgColor: '#fff7e6', color: '#fa8c16' },
  { id: 'soup', name: 'Canh & Súp', count: 124, icon: 'fa-solid fa-spoon', bgColor: '#f6ffed', color: '#52c41a' },
  { id: 'snacks', name: 'Ăn vặt', count: 215, icon: 'fa-solid fa-cookie', bgColor: '#e6f7ff', color: '#1890ff' },
  { id: 'salad', name: 'Salad', count: 68, icon: 'fa-solid fa-leaf', bgColor: '#f4ffb8', color: '#a0d911' },
  { id: 'drinks', name: 'Đồ uống', count: 112, icon: 'fa-solid fa-mug-hot', bgColor: '#e6fffb', color: '#13c2c2' },
  { id: 'dessert', name: 'Tráng miệng', count: 45, icon: 'fa-solid fa-ice-cream', bgColor: '#fff0f6', color: '#eb2f96' },
  { id: 'other', name: 'Khác', count: 23, icon: 'fa-solid fa-utensils', bgColor: '#f8f9fa', color: '#64748B' }
]);

const goalStats = ref([
  { id: 'lose', label: 'Giảm cân', percent: 45, color: '#f59e0b' },
  { id: 'maintain', label: 'Giữ dáng', percent: 35, color: '#10b981' },
  { id: 'gain', label: 'Tăng cơ', percent: 20, color: '#3b82f6' },
]);

const fetchDashboardData = async () => {
  try {
    await recipeStore.fetchRecipes();
    updateStats();
  } catch (err) {
    console.error("Lỗi lấy dữ liệu dashboard:", err);
  }
};

const updateStats = () => {
  // 1. Cập nhật số lượng món theo danh mục (Khớp ID trực tiếp)
  categories.value.forEach(cat => {
    const dbCount = recipeStore.recipes.filter(r => r.category?.toLowerCase() === cat.id).length;
    // Cộng dồn vào mock data
    cat.count += dbCount;
  });

  // 2. Cập nhật phân bổ mục tiêu
  if (recipeStore.recipes.length > 0) {
    goalStats.value.forEach(goal => {
      const dbCount = recipeStore.recipes.filter(r => {
        const recipeGoals = typeof r.goals === 'string' ? JSON.parse(r.goals) : r.goals;
        return Array.isArray(recipeGoals) && recipeGoals.includes(goal.id);
      }).length;
      
      if (dbCount > 0) {
        goal.percent = Math.min(90, goal.percent + Math.ceil((dbCount / recipeStore.recipes.length) * 5));
      }
    });
  }
};

const totalDisplayCount = computed(() => {
  const sum = categories.value.reduce((s, c) => s + c.count, 0);
  return sum.toLocaleString();
});

onMounted(() => {
  fetchDashboardData();
});

const pendingRequests = [
  { name: 'Bún đậu mắm tôm', scans: 154, priority: 'high', region: 'Vùng: Hà Nội' },
  { name: 'Bánh xèo miền Tây', scans: 98, priority: 'high', region: 'Vùng: TP.HCM' },
  { name: 'Gỏi cuốn tôm thịt', scans: 76, priority: 'normal', region: 'Vùng: Đà Nẵng' },
  { name: 'Bún chả Hà Nội', scans: 62, priority: 'normal', region: 'Vùng: Toàn quốc' },
  { name: 'Cơm sườn nướng', scans: 45, priority: 'normal', region: 'Miền Nam' },
  { name: 'Bánh canh cua', scans: 42, priority: 'normal', region: 'Miền Trung' },
  { name: 'Mì Quảng', scans: 38, priority: 'normal', region: 'Quảng Nam' },
  { name: 'Cháo lòng', scans: 35, priority: 'normal', region: 'Toàn quốc' },
];

const totalPages = Math.ceil(pendingRequests.length / 4);
const getPageItems = (page: number) => pendingRequests.slice(page * 4, (page + 1) * 4);
const scrollCarousel = (dir: number) => {
  const next = currentPage.value + dir;
  if (next >= 0 && next < totalPages) currentPage.value = next;
};
const goToCategory = (id: string) => router.push({ name: 'recipe-list', params: { category: id } });
const createFromRequest = (name: string) => router.push({ name: 'recipe-add', query: { name } });
</script>

<style scoped>
.recipe-overview-container { padding: 24px; background: #fcfcfc; min-height: 100vh; }

/* Global Panels */
.panel-card { background: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }

/* Header */
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.header-text h1 { font-size: 24px; font-weight: 800; color: #1e293b; margin: 0; }
.header-text p { font-size: 13px; color: #64748b; margin: 4px 0 0 0; }
.add-btn { background: #f4c553; color: #1a1a1a; border: none; border-radius: 12px; padding: 10px 20px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; }

/* Top Layout */
.top-layout { display: grid; grid-template-columns: 1fr 320px; gap: 20px; margin-bottom: 28px; }

.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.panel-header h2 { font-size: 15px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
.total-badge { background: #f1f5f9; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; color: #64748b; }

/* Category Grid (Consistent Style) */
.category-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.category-card { background: #fafafa; border: 1px solid #f1f5f9; border-radius: 20px; padding: 14px; cursor: pointer; transition: 0.2s; text-align: center; }
.category-card:hover { background: white; border-color: #8EAE82; transform: translateY(-3px); box-shadow: 0 6px 15px rgba(0,0,0,0.03); }
.cat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; margin: 0 auto 10px; }
.cat-info h4 { margin: 0; font-size: 13px; font-weight: 800; color: #1e293b; }
.cat-info span { font-size: 11px; color: #94a3b8; font-weight: 600; }

/* Stats Panel */
.goal-stats-list { display: flex; flex-direction: column; gap: 14px; margin-bottom: 15px; }
.goal-info { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800; }
.goal-info .dot { width: 6px; height: 6px; border-radius: 50%; }
.goal-info .val { margin-left: auto; color: #94a3b8; }
.progress-bar { height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 10px; transition: 1s ease; }
.ai-suggestion-box { background: #f5f3ff; border-radius: 14px; padding: 10px; display: flex; gap: 10px; align-items: center; }
.ai-icon-sm { color: #7c3aed; font-size: 12px; }
.ai-suggestion-box p { margin: 0; font-size: 11px; color: #5b21b6; font-weight: 600; }

/* Requests Section Redesign */
.requests-section { width: 100%; }
.requests-section .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.title-group { display: flex; align-items: center; gap: 12px; }
.fire-icon-bg { width: 32px; height: 32px; background: #fff1f0; color: #f5222d; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.title-group h2 { font-size: 18px; font-weight: 800; color: #1e293b; margin: 0; }

.carousel-nav { display: flex; align-items: center; gap: 16px; }
.nav-round { width: 32px; height: 32px; border: 1px solid #e2e8f0; background: white; border-radius: 50%; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: 0.2s; }
.nav-round:hover:not(:disabled) { border-color: #1e293b; color: #1e293b; }
.dots { display: flex; gap: 6px; }
.dots .dot { width: 6px; height: 6px; border-radius: 50%; background: #e2e8f0; cursor: pointer; transition: 0.3s; }
.dots .dot.active { width: 16px; background: #1e293b; border-radius: 10px; }

.carousel-viewport { overflow: hidden; }
.carousel-track { display: flex; transition: 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
.request-page { min-width: 100%; }

.request-grid-2x2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

/* Redesigned Card Style v2 */
.req-card-v2 { background: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 20px; transition: 0.2s; position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; }
.req-card-v2:hover { border-color: #f4c553; transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.03); }

.req-tags { position: absolute; top: 15px; left: 20px; right: 20px; display: flex; justify-content: space-between; align-items: center; width: calc(100% - 40px); }
.tag-status { font-size: 9px; font-weight: 800; padding: 3px 8px; border-radius: 8px; }
.tag-status.high { background: #fff1f0; color: #f5222d; }
.tag-status.normal { background: #f6ffed; color: #52c41a; }
.tag-scans { font-size: 11px; font-weight: 700; color: #94a3b8; }

.req-main-content { margin: 15px 0 20px 0; }
.req-visual { width: 44px; height: 44px; background: #fafafa; color: #cbd5e1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; margin: 0 auto 12px; border: 1px solid #f1f5f9; }
.req-card-v2:hover .req-visual { color: #f4c553; background: #fffbeb; border-color: #fef3c7; }

.req-card-v2 h3 { margin: 0 0 4px 0; font-size: 16px; font-weight: 800; color: #1e293b; }
.req-location { font-size: 11px; color: #94a3b8; font-weight: 600; margin: 0; }

/* SYSTEM YELLOW BUTTON */
.system-yellow-btn { width: 100%; background: #f4c553; color: #1a1a1a; border: none; padding: 10px; border-radius: 14px; font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; box-shadow: 0 4px 10px rgba(244, 197, 83, 0.2); }
.system-yellow-btn:hover { background: #e0b240; transform: scale(1.02); box-shadow: 0 6px 15px rgba(244, 197, 83, 0.3); }
</style>
