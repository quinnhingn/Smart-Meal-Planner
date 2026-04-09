<template>
  <div class="inventory-container">
    <div class="food-header">
      <span class="brand">Hệ thống quản lý</span>
      <h1>Tổng quan kho</h1>
      <p>Theo dõi số lượng, giá trị và tình trạng biến động của nguyên vật liệu theo thời gian thực.</p>
    </div>

    <div class="metrics-main">
      <div class="metrics-grid">
        <div class="metric-card yellow">
          <h2>1,245</h2>
          <p>mặt hàng</p>
        </div>
        <div class="metric-card yellow">
          <h2>15.4T</h2>
          <p>khối lượng (tấn)</p>
        </div>
        <div class="metric-card green">
          <h2>850M ₫</h2>
          <p>tổng giá trị tồn</p>
        </div>
      </div>

      <div class="centerpiece">
        <div class="side-elements">
          <canvas ref="warningChartCanvas"></canvas>
        </div>
        <div class="main-dish">
          <canvas ref="warehouseChartCanvas"></canvas>
        </div>
      </div>
    </div>

    <div class="showcase-wrapper">
      <button class="nav-btn prev-btn" @click="scrollLeft"><i class="fas fa-chevron-left"></i></button>

      <div class="showcase-scroll" ref="categoryScroll">
        <div v-for="(item, index) in categories" :key="index" class="showcase-card">
          <img :src="item.image" :alt="item.name" class="showcase-image img-showcase">
          <span class="product-name">{{ item.name }}</span>
        </div>
      </div>

      <button class="nav-btn next-btn" @click="scrollRight"><i class="fas fa-chevron-right"></i></button>
    </div>

    <div class="inventory-dashboard">
      <div class="status-legend">
        <div class="legend-item"><span class="legend-dot" style="background: #8EAE82;"></span>Tươi mới</div>
        <div class="legend-item"><span class="legend-dot" style="background: #1890ff;"></span>Ổn định</div>
        <div class="legend-item"><span class="legend-dot" style="background: #faad14;"></span>Sắp hết hạn</div>
        <div class="legend-item"><span class="legend-dot" style="background: #ff4d4f;"></span>Đã hết hạn</div>
      </div>

      <div class="cooking-review">
        <div class="review-meta">
          <span v-for="label in labels" :key="label" class="review-label">{{ label }}</span>
        </div>

        <div class="progress-grid">
          <div v-for="(row, rowIndex) in progressData" :key="rowIndex" class="progress-row">
            <div v-for="(cell, cellIndex) in row" :key="cellIndex" class="progress-cell">
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" :style="{ width: cell.value + '%', background: cell.color }"></div>
              </div>
              <div class="progress-text" :class="cell.textClass">{{ cell.value }}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const warningChartCanvas = ref<HTMLCanvasElement | null>(null);
const warehouseChartCanvas = ref<HTMLCanvasElement | null>(null);
const categoryScroll = ref<HTMLElement | null>(null);

const categories = [
  { name: 'Meat', image: 'https://images.immediate.co.uk/production/volatile/sites/30/2024/06/Red-meat440-980233e.jpg?quality=90&webp=true&resize=440,400' },
  { name: 'Vegetables', image: 'https://cdn.britannica.com/17/196817-050-6A15DAC3/vegetables.jpg?w=300' },
  { name: 'Milks', image: 'https://emi.parkview.com/media/Image/Dashboard_952_Plant-Milk_10_22.jpg' },
  { name: 'Ngũ cốc', image: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Ngu-coc-granola-vua-hat-ngon.jpg' },
  { name: 'Trái cây', image: 'https://cdn.tgdd.vn/Files/2019/12/03/1224621/trai-cay-tot-nhung-nen-tranh-an-vao-cac-thoi-diem-nay-neu-khong-muon-tang-can-202112271556593399.jpg' },
  { name: 'Gia vị', image: 'https://hoasenfoods.vn/wp-content/uploads/2024/01/danh-sach-gia-vi.jpg' }
];

const labels = ['Nhóm Thịt cá', 'Nhóm Rau củ', 'Nhóm Bơ sữa', 'Nhóm Đồ khô'];

const progressData = [
  [
    { value: 60, color: '#8EAE82' },
    { value: 30, color: '#1890ff' },
    { value: 10, color: '#faad14', textClass: 'text-warning' },
    { value: 0, color: '#ff4d4f' }
  ],
  [
    { value: 40, color: '#8EAE82' },
    { value: 35, color: '#1890ff' },
    { value: 20, color: '#faad14', textClass: 'text-warning' },
    { value: 5, color: '#ff4d4f', textClass: 'text-danger' }
  ],
  [
    { value: 50, color: '#8EAE82' },
    { value: 40, color: '#1890ff' },
    { value: 10, color: '#faad14', textClass: 'text-warning' },
    { value: 0, color: '#ff4d4f' }
  ],
  [
    { value: 90, color: '#8EAE82' },
    { value: 10, color: '#1890ff' },
    { value: 0, color: '#faad14' },
    { value: 0, color: '#ff4d4f' }
  ]
];

const scrollLeft = () => {
  if (categoryScroll.value) {
    categoryScroll.value.scrollLeft -= 160;
  }
};

const scrollRight = () => {
  if (categoryScroll.value) {
    categoryScroll.value.scrollLeft += 160;
  }
};

onMounted(() => {
  if (warningChartCanvas.value) {
    new Chart(warningChartCanvas.value, {
      type: 'doughnut',
      data: {
        labels: ['Chưa khớp nhãn AI', 'Thiếu ảnh/Dinh dưỡng', 'Đã chuẩn hóa 100%'],
        datasets: [{
          data: [12, 18, 70],
          backgroundColor: ['#ff4d4f', '#E8CA72', '#8EAE82'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            titleFont: { family: "'Poppins', sans-serif" },
            bodyFont: { family: "'Poppins', sans-serif" }
          }
        }
      }
    });
  }

  if (warehouseChartCanvas.value) {
    new Chart(warehouseChartCanvas.value, {
      type: 'pie',
      data: {
        labels: ['Thịt (Meat)', 'Rau củ (Vegetable)', 'Sữa (Dairy)', 'Ngũ cốc (Grain)', 'Trái cây (Fruit)', 'Gia vị (Seasoning)'],
        datasets: [{
          data: [25, 30, 10, 15, 12, 8],
          backgroundColor: ['#ff7875', '#8EAE82', '#1890ff', '#E8CA72', '#ffc069', '#d9d9d9'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 15,
              font: { family: "'Poppins', sans-serif", size: 11 }
            }
          },
          tooltip: {
            titleFont: { family: "'Poppins', sans-serif" },
            bodyFont: { family: "'Poppins', sans-serif" }
          }
        }
      }
    });
  }
});
</script>

<style scoped>
.inventory-container {
  padding: 10px;
}

.food-header {
  margin-bottom: 40px;
}

.brand {
  font-size: 14px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.food-header h1 {
  font-size: 42px;
  margin: 10px 0;
  color: #2c3e50;
  font-weight: 700;
}

.food-header p {
  font-size: 14px;
  color: #95a5a6;
  margin: 0;
  max-width: 350px;
  line-height: 1.6;
}

.metrics-main {
  display: flex;
  gap: 20px;
  margin-bottom: 50px;
  flex-wrap: wrap;
}

.metrics-grid {
  width: 320px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.metric-card {
  border-radius: 20px;
  padding: 20px 15px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.metric-card.yellow {
  background: #FFF9E6;
  color: #333;
}

.metric-card.green {
  background: #8EAE82;
  color: #ffffff;
  grid-column: span 2;
  padding: 25px 15px;
}

.metric-card h2 {
  font-size: 22px;
  margin: 0 0 5px 0;
  font-weight: 700;
}

.metric-card.green h2 {
  font-size: 32px;
}

.metric-card p {
  font-size: 12px;
  margin: 0;
  opacity: 0.8;
  text-transform: lowercase;
}

.centerpiece {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  position: relative;
  min-width: 300px;
}

.main-dish {
  width: 380px;
  height: 380px;
  position: relative;
}

.side-elements {
  width: 220px;
  height: 220px;
  position: relative;
}

.showcase-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 40px;
  position: relative;
}

.nav-btn {
  background: #ffffff;
  border: 1px solid #d1d8dd;
  color: #2c3e50;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  min-width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  z-index: 2;
}

.nav-btn:hover {
  background: #f0f2f5;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.showcase-scroll {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  flex: 1;
  padding: 10px 0;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.showcase-scroll::-webkit-scrollbar {
  display: none;
}

.showcase-card {
  text-align: center;
  min-width: 140px;
  flex: 0 0 auto;
  cursor: pointer;
}

.showcase-image {
  height: 120px;
  width: 120px;
  margin: 0 auto 15px;
  border-radius: 50%;
}

.img-showcase {
  object-fit: cover;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  display: block;
}

.showcase-card:hover .img-showcase {
  border-color: #8EAE82;
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(142, 174, 130, 0.3);
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
}

.status-legend {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  font-size: 13px;
  color: #555;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}

.cooking-review {
  background: #FAFAFA;
  border-radius: 30px;
  padding: 30px 40px;
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.review-meta {
  width: 130px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.review-label {
  font-size: 14px;
  font-weight: 700;
  color: #333;
  padding: 10px 0;
}

.progress-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
  min-width: 300px;
}

.progress-row {
  display: flex;
  gap: 15px;
  width: 100%;
}

.progress-cell {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-bar-bg {
  background: #E8ECEF;
  height: 8px;
  border-radius: 10px;
  width: 100%;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 10px;
}

.progress-text {
  font-size: 12px;
  color: #888;
  text-align: right;
}

.text-warning {
  color: #faad14;
  font-weight: bold;
}

.text-danger {
  color: #ff4d4f;
  font-weight: bold;
}
</style>
