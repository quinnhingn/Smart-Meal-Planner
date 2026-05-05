<template>
  <div class="inventory-container">

    <!-- Page Header -->
    <div class="page-header">
      <div class="header-text">
        <h1>Quản lý Nguyên liệu</h1>
        <p>Kiểm soát kho nguyên liệu</p>
      </div>
      <button class="add-btn" @click="router.push({ name: 'ingredient-add' })">
        <i class="fa-solid fa-plus"></i>
        <span>Thêm mới</span>
      </button>
    </div>

    <!-- Main Content -->
    <div class="main-layout">
      <!-- Left: Category List -->
      <div class="panel-card categories-panel">
        <div class="panel-header">
          <h3>Danh mục nguyên liệu</h3>
          <span class="total-badge">{{ categories.length }} nhóm</span>
        </div>
        <div class="cat-list">
          <div class="cat-item" v-for="cat in categories" :key="cat.id" @click="goToDetail(cat.id)">
            <div class="cat-thumb" :style="{ background: cat.bgColor }">
              <img :src="cat.image" :alt="cat.name">
            </div>
            <div class="cat-main">
              <div class="name">{{ cat.name }}</div>
              <div class="count">{{ cat.count }} nguyên liệu</div>
            </div>
            <div class="cat-status">
              <div class="progress">
                <div class="fill" :style="{ width: cat.completeness + '%' }"></div>
              </div>
              <span>{{ cat.completeness }}% dữ liệu</span>
            </div>
            <i class="fa-solid fa-chevron-right arrow"></i>
          </div>
        </div>
      </div>

      <div class="right-col">
        <!-- Distribution Chart -->
        <div class="panel-card chart-panel">
          <div class="panel-header">
            <h3>Phân bổ kho dữ liệu</h3>
          </div>
          <div class="chart-box">
            <canvas ref="warehouseChartCanvas"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Hub Section (Refined) -->
    <div class="ai-hub-container">
      <div class="panel-card discovery-panel">
        <div class="hub-header">
          <div class="hub-title-compact">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            <h2>Nguyên liệu từ người dùng </h2>
            <span class="status-pill-mini"><span class="dot-blink"></span>  Active</span>
          </div>
        </div>

        <div class="discovery-inbox-refined">
          <div class="inbox-row" v-for="item in aiDetected" :key="item.name">
            <div class="row-main">
              <div class="orb-sm" :style="{ background: getOrbGradient(item.scans) }">{{ item.scans }}</div>
              <div class="name-box">
                <h4>{{ item.name }}</h4>
                <span class="meta">{{ item.category }} • {{ item.date }}</span>
              </div>
            </div>
            <div class="row-status">
              <span class="pending-pill">Thêm nguyên liệu</span>
            </div>
            <div class="row-actions">
              <button class="mini-update-btn" @click="router.push({ name: 'ingredient-add', query: { name: item.name } })">
                Thêm mới <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Smart Grid (Refined) -->
      <div class="smart-config-wrapper">
        <div class="panel-card config-unit">
          <div class="sub-header">
            <i class="fa-solid fa-scale-unbalanced-flip"></i>
            <span>Quy đổi đơn vị AI</span>
          </div>
          <div class="pill-grid">
            <div class="smart-pill" v-for="(u, index) in unitConversions" :key="index">
              <span class="p-from">{{ u.from }}</span>
              <i class="fa-solid fa-arrow-right-long p-arrow"></i>
              <span class="p-to">{{ u.to }}</span>
              <button class="pill-delete" @click="removeUnit(index)"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <button class="add-pill-btn" @click="openQuickAdd('unit')"><i class="fa-solid fa-plus"></i></button>
          </div>
        </div>

        <div class="panel-card config-alt">
          <div class="sub-header">
            <i class="fa-solid fa-shuffle"></i>
            <span>Ma trận thay thế</span>
          </div>
          <div class="pill-grid">
            <div class="smart-pill alt" v-for="(s, index) in substitutions" :key="index">
              <span class="p-item">{{ s.item1 }}</span>
              <i class="fa-solid fa-arrows-rotate p-arrow"></i>
              <span class="p-item">{{ s.item2 }}</span>
              <button class="pill-delete" @click="removeSub(index)"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <button class="add-pill-btn" @click="openQuickAdd('sub')"><i class="fa-solid fa-plus"></i></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Add Modal (Teleported to body to avoid clipping) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content">
            <div class="modal-header">
              <h3>{{ modalType === 'unit' ? 'Thêm quy đổi đơn vị' : 'Thêm cặp thay thế' }}</h3>
              <button class="close-btn" @click="closeModal"><i class="fa-solid fa-xmark"></i></button>
            </div>
            
            <div class="modal-body">
              <div v-if="modalType === 'unit'" class="input-group">
                <div class="field">
                  <label>Đơn vị gốc (VD: 1 quả Táo)</label>
                  <input v-model="newItem.from" type="text" placeholder="Nhập đơn vị...">
                </div>
                <div class="modal-arrow"><i class="fa-solid fa-arrow-right"></i></div>
                <div class="field">
                  <label>Giá trị quy đổi (VD: 150g)</label>
                  <input v-model="newItem.to" type="text" placeholder="Nhập giá trị...">
                </div>
              </div>

              <div v-else class="input-group">
                <div class="field">
                  <label>Nguyên liệu 1</label>
                  <input v-model="newItem.item1" type="text" placeholder="Nhập tên...">
                </div>
                <div class="modal-arrow"><i class="fa-solid fa-arrows-rotate"></i></div>
                <div class="field">
                  <label>Nguyên liệu 2 (Thay thế)</label>
                  <input v-model="newItem.item2" type="text" placeholder="Nhập tên...">
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="cancel-btn" @click="closeModal">Hủy</button>
              <button class="save-btn" @click="saveQuickAdd">Lưu cấu hình</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Chart, registerables } from 'chart.js';
import { categories, aiDetected, initialUnitConversions, initialSubstitutions } from './mocks/inventoryData';

Chart.register(...registerables);

const router = useRouter();
const warehouseChartCanvas = ref<HTMLCanvasElement | null>(null);

const unitConversions = ref(initialUnitConversions);
const substitutions = ref(initialSubstitutions);

// Modal State
const isModalOpen = ref(false);
const modalType = ref<'unit' | 'sub'>('unit');
const newItem = ref<any>({ from: '', to: '', item1: '', item2: '' });

const openQuickAdd = (type: 'unit' | 'sub') => {
  modalType.value = type;
  newItem.value = { from: '', to: '', item1: '', item2: '' };
  isModalOpen.value = true;
};

const closeModal = () => isModalOpen.value = false;

const saveQuickAdd = () => {
  if (modalType.value === 'unit') {
    if (newItem.value.from && newItem.value.to) {
      unitConversions.value.push({ from: newItem.value.from, to: newItem.value.to });
    }
  } else {
    if (newItem.value.item1 && newItem.value.item2) {
      substitutions.value.push({ item1: newItem.value.item1, item2: newItem.value.item2 });
    }
  }
  closeModal();
};

const removeUnit = (index: number) => {
  unitConversions.value.splice(index, 1);
};

const removeSub = (index: number) => {
  substitutions.value.splice(index, 1);
};

const getOrbGradient = (scans: number) => {
  if (scans > 100) return 'linear-gradient(135deg, #f59e0b, #ea580c)';
  if (scans > 50) return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
  return 'linear-gradient(135deg, #94a3b8, #64748b)';
};

const goToDetail = (id: string) => router.push({ name: 'category-detail', params: { id } });

onMounted(() => {
  if (warehouseChartCanvas.value) {
    new Chart(warehouseChartCanvas.value, {
      type: 'doughnut',
      data: {
        labels: ['Thịt', 'Rau củ', 'Sữa', 'Ngũ cốc', 'Trái cây'],
        datasets: [{
          data: [68, 95, 34, 42, 51],
          backgroundColor: ['#F87171', '#4ADE80', '#60A5FA', '#FBBF24', '#FB923C'],
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 8, padding: 10, font: { size: 10, weight: 600 } } }
        }
      }
    });
  }
});
</script>

<style scoped>
.inventory-container { padding: 0; background: #fff; min-height: 100vh; }

/* Header */
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.header-text h1 { font-size: 24px; font-weight: 800; color: #1e293b; margin: 0; }
.header-text p { font-size: 13px; color: #64748b; margin: 4px 0 0 0; }
.add-btn { background: #f4c553; color: #1a1a1a; border: none; border-radius: 12px; padding: 10px 18px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; }

/* Main Layout */
.main-layout { display: grid; grid-template-columns: 1fr 320px; gap: 20px; margin-bottom: 28px; align-items: stretch; }
.panel-card { background: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 18px; box-shadow: 0 4px 15px rgba(0,0,0,0.01); display: flex; flex-direction: column; }

.right-col { display: flex; flex-direction: column; }
.chart-panel { flex: 1; }
.chart-box { flex: 1; min-height: 200px; display: flex; align-items: center; justify-content: center; }

.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.panel-header h3 { font-size: 14px; font-weight: 800; color: var(--text-dark); text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
.total-badge { background: #f1f5f9; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; color: var(--text-muted); }

/* Category List */
.cat-list { display: flex; flex-direction: column; gap: 8px; }
.cat-item { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 18px; border: 1px solid #f8fafc; cursor: pointer; transition: 0.2s; }
.cat-item:hover { background: #f8fafc; border-color: var(--primary-green); transform: translateX(3px); }
.cat-thumb { width: 40px; height: 40px; border-radius: 12px; overflow: hidden; }
.cat-thumb img { width: 100%; height: 100%; object-fit: cover; }
.cat-main { flex: 1; }
.cat-main .name { font-size: 14px; font-weight: 700; color: var(--text-dark); }
.cat-main .count { font-size: 12px; color: var(--text-muted); }
.cat-status { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; width: 120px; margin-right: 10px; }
.cat-status .progress { width: 100%; height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
.cat-status .fill { height: 100%; background: var(--primary-green); border-radius: 10px; }
.cat-status span { font-size: 11px; color: var(--text-muted); font-weight: 700; white-space: nowrap; }
.arrow { color: #cbd5e1; font-size: 14px; }

/* AI HUB SECTION REFINED */
.ai-hub-container { display: flex; flex-direction: column; gap: 24px; }
.discovery-panel { background: white; }

.hub-header { margin-bottom: 20px; }
.hub-title-compact { display: flex; align-items: center; gap: 12px; }
.hub-title-compact i { color: var(--primary-green); font-size: 18px; }
.hub-title-compact h2 { font-size: 18px; font-weight: 800; color: var(--text-dark); margin: 0; }

.status-pill-mini { 
  font-size: 11px; font-weight: 700; color: var(--primary-green); background: #f0fdf4; 
  padding: 4px 10px; border-radius: 20px; display: flex; align-items: center; gap: 6px; 
  margin-left: 10px;
}
.dot-blink { width: 6px; height: 6px; background: var(--primary-green); border-radius: 50%; animation: pulse-green 2s infinite; }

.discovery-inbox-refined { 
  display: grid; 
  grid-template-rows: repeat(2, 1fr);
  grid-auto-flow: column;
  grid-auto-columns: 480px;
  gap: 12px 20px;
  overflow-x: auto; 
  padding: 4px 4px 16px 4px; 
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
  scrollbar-color: var(--primary-yellow) #f1f5f9;
}

.discovery-inbox-refined::-webkit-scrollbar { height: 6px; }
.discovery-inbox-refined::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
.discovery-inbox-refined::-webkit-scrollbar-thumb { background: var(--primary-yellow); border-radius: 10px; }

.inbox-row { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  padding: 12px 18px; 
  background: #fafafb; 
  border: 1px solid #f1f5f9; 
  border-radius: 20px; 
  transition: 0.3s; 
  scroll-snap-align: start;
  width: 100%;
}
.inbox-row:hover { background: white; border-color: var(--primary-yellow); transform: scale(1.02); box-shadow: 0 8px 16px rgba(0,0,0,0.04); }

.row-main { flex: 1; display: flex; align-items: center; gap: 12px; }
.orb-sm { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 800; flex-shrink: 0; }
.name-box h4 { margin: 0; font-size: 14px; font-weight: 700; color: var(--text-dark); }
.name-box .meta { font-size: 11px; color: var(--text-muted); font-weight: 600; display: block; margin-top: 1px; }

.row-status { display: flex; align-items: center; margin-right: 8px; }
.pending-pill { font-size: 9px; font-weight: 800; color: #d97706; background: #fffbeb; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; white-space: nowrap; }

.row-actions { display: flex; align-items: center; }
.mini-update-btn { background: var(--primary-yellow); color: var(--text-dark); border: none; padding: 7px 14px; border-radius: 12px; font-weight: 700; font-size: 11px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 4px; white-space: nowrap; }
.mini-update-btn:hover { background: var(--yellow-hover); }

/* Smart Config Wrapper */
.smart-config-wrapper { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.config-unit { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-color: #bae6fd; }
.config-alt { background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border-color: #ddd6fe; }

.sub-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; }
.sub-header i { color: var(--text-muted); }

.pill-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.smart-pill { background: white; border: 1px solid rgba(255,255,255,0.8); padding: 8px 14px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.3s; box-shadow: 0 2px 6px rgba(0,0,0,0.03); }
.smart-pill:hover { border-color: var(--primary-green); transform: translateY(-3px); box-shadow: 0 6px 15px rgba(0,0,0,0.06); }
.smart-pill .p-from { font-size: 13px; font-weight: 700; color: var(--text-dark); }
.smart-pill .p-to { font-size: 13px; font-weight: 800; color: var(--primary-green); }
.p-arrow { font-size: 11px; color: var(--text-muted); }

.pill-delete { 
  background: none; border: none; padding: 0; margin-left: 8px;
  color: #cbd5e1; cursor: pointer; font-size: 10px; transition: 0.2s;
  display: flex; align-items: center; justify-content: center;
  opacity: 0;
}
.smart-pill:hover .pill-delete { opacity: 1; color: #ef4444; }

.smart-pill.alt .p-item { font-size: 13px; font-weight: 700; color: var(--text-dark); }
.smart-pill.alt .p-arrow { color: #8b5cf6; }

.add-pill-btn { width: 36px; height: 36px; border: 2px dashed rgba(0,0,0,0.1); background: rgba(255,255,255,0.4); border-radius: 12px; color: var(--text-muted); cursor: pointer; transition: 0.2s; }
.add-pill-btn:hover { border-color: var(--text-dark); color: var(--text-dark); background: white; }

/* Modal Styling */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white; border-radius: 30px; width: 450px;
  padding: 30px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease-out;
}

.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.modal-header h3 { font-size: 18px; font-weight: 800; color: var(--text-dark); }
.close-btn { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; color: var(--text-muted); }

.input-group { display: flex; align-items: flex-end; gap: 16px; }
.field { flex: 1; }
.field label { display: block; font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; }
.field input { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1.5px solid #e2e8f0; outline: none; font-size: 14px; transition: 0.2s; }
.field input:focus { border-color: var(--primary-yellow); box-shadow: 0 0 0 4px rgba(244, 197, 83, 0.1); }

.modal-arrow { padding-bottom: 12px; color: #cbd5e1; font-size: 18px; }

.modal-footer { display: flex; gap: 12px; margin-top: 32px; }
.modal-footer button { flex: 1; padding: 12px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; }
.cancel-btn { background: #f8fafc; border: none; color: var(--text-muted); }
.save-btn { background: var(--primary-green); border: none; color: white; }
.save-btn:hover { background: #3d7545; transform: translateY(-2px); }

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes pulse-green {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes pulse-green {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}
</style>
