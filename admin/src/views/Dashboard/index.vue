<template>
  <div class="dashboard-container">
    <div class="welcome-section">
      <div class="welcome-text">
        <h1>Chào buổi sáng, Admin! </h1>
        <p>Hệ thống của bạn hiện đang chạy rất ổn định. Đây là tình hình hôm nay.</p>
      </div>
      <div class="date-display">
        <i class="fa-regular fa-calendar"></i>
        <span>{{ currentDate }}</span>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card" :style="{ '--color': stat.color }">
        <div class="stat-icon">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.label }}</p>
        </div>
        <div class="stat-trend" :class="stat.trendUp ? 'up' : 'down'">
          <i :class="stat.trendUp ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'"></i>
          {{ stat.trend }}
        </div>
      </div>
    </div>

    <div class="charts-section">
      <div class="chart-card main-chart">
        <div class="chart-header">
          <h3>Tăng trưởng người dùng</h3>
          <div class="chart-actions">
            <button class="action-btn active">7 ngày</button>
            <button class="action-btn">30 ngày</button>
          </div>
        </div>
        <div class="chart-body">
          <canvas ref="growthChartCanvas"></canvas>
        </div>
      </div>

      <div class="chart-card side-list">
        <div class="chart-header">
          <h3>Hoạt động gần đây</h3>
          <button class="view-all">Xem hết</button>
        </div>
        <div class="activity-list">
          <div v-for="(activity, index) in recentActivities" :key="index" class="activity-item">
            <div class="activity-avatar" :style="{ background: activity.color }">
              <i :class="activity.icon"></i>
            </div>
            <div class="activity-content">
              <p class="activity-text"><strong>{{ activity.user }}</strong> {{ activity.action }}</p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-section">
      <!-- Left: Top Recipes -->
      <div class="info-card ranking-list">
        <h3>Công thức yêu thích</h3>
        <div class="ranking-item" v-for="(item, index) in topRecipes" :key="index">
          <span class="rank-num">#{{ index + 1 }}</span>
          <img :src="item.image" :alt="item.name" class="rank-img">
          <div class="rank-details">
            <span class="rank-name">{{ item.name }}</span>
            <span class="rank-category">{{ item.category }}</span>
          </div>
          <div class="rank-stats">
            <i class="fa-solid fa-heart"></i>
            {{ item.likes }}
          </div>
        </div>
      </div>

      <!-- Right: AI Effectiveness -->
      <div class="info-card ai-efficiency">
        <div class="card-header-flex">
          <h3>Hiệu quả tư vấn AI</h3>
          <span class="badge-ai">Live</span>
        </div>
        <div class="ai-stats-container">
          <div class="ai-stat-item" v-for="ai in aiEfficiency" :key="ai.label">
            <div class="ai-stat-header">
              <span>{{ ai.label }}</span>
              <span class="ai-percent">{{ ai.value }}%</span>
            </div>
            <div class="ai-progress-bar">
              <div class="ai-progress-fill" :style="{ width: ai.value + '%', background: ai.color }"></div>
            </div>
          </div>
        </div>
        <div class="ai-footer-note">
          <i class="fa-solid fa-robot"></i>
          <span>AI đã tiết kiệm cho User <strong>240 giờ</strong> nấu ăn tuần này.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import { stats, recentActivities, topRecipes, aiEfficiency } from './mocks/dashboardData';

Chart.register(...registerables);

const growthChartCanvas = ref<HTMLCanvasElement | null>(null);
const currentDate = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

onMounted(() => {
  if (growthChartCanvas.value) {
    const ctx = growthChartCanvas.value.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'rgba(74, 140, 84, 0.4)');
      gradient.addColorStop(1, 'rgba(74, 140, 84, 0.0)');

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
          datasets: [{
            label: 'Người dùng mới',
            data: [150, 230, 180, 290, 250, 380, 410],
            borderColor: '#4a8c54',
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#4a8c54',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              border: { display: false },
              grid: { display: true, color: '#f0f0f0' },
              ticks: { font: { family: "'Poppins', sans-serif" } }
            },
            x: {
              grid: { display: false },
              ticks: { font: { family: "'Poppins', sans-serif" } }
            }
          }
        }
      });
    }
  }
});
</script>

<style scoped>
.dashboard-container {
  padding: 10px;
}

/* Welcome Section */
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.welcome-text h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.welcome-text p {
  color: var(--text-muted);
}

.date-display {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: white;
  border-radius: 15px;
  border: 1px solid var(--primary-green);
  font-weight: 600;
  color: var(--primary-green);
  box-shadow: 0 4px 10px rgba(74, 140, 84, 0.05);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid rgba(74, 140, 84, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px);
  border-color: var(--color);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 60px;
  height: 60px;
  background: var(--color);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.stat-info h3 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark);
}

.stat-info p {
  color: var(--text-muted);
  font-size: 14px;
}

.stat-trend {
  position: absolute;
  top: 24px;
  right: 24px;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-trend.up { color: #52c41a; }
.stat-trend.down { color: #ff4d4f; }

/* Charts Section */
.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  padding: 25px;
  border-radius: 30px;
  border: 1px solid rgba(74, 140, 84, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.chart-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-dark);
}

.chart-actions {
  display: flex;
  background: var(--bg-color);
  padding: 5px;
  border-radius: 12px;
}

.action-btn {
  padding: 8px 15px;
  border: none;
  background: transparent;
  font-family: inherit;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  border-radius: 10px;
  color: var(--text-muted);
  transition: all 0.2s;
}

.action-btn.active {
  background: white;
  color: var(--primary-green);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.chart-body {
  height: 300px;
}

/* Activity List */
.view-all {
  background: none;
  border: none;
  color: var(--primary-green);
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.activity-avatar {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-dark);
  font-size: 18px;
}

.activity-text {
  font-size: 14px;
  color: var(--text-dark);
}

.activity-time {
  font-size: 12px;
  color: var(--text-muted);
}

/* Bottom Section */
.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}

.info-card {
  background: white;
  padding: 25px;
  border-radius: 30px;
  border: 1px solid rgba(74, 140, 84, 0.1);
  display: flex;
  flex-direction: column;
}

.info-card h3 {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 700;
}

/* AI Efficiency */
.card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.badge-ai { background: #f6ffed; color: #52c41a; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; border: 1px solid #b7eb8f; }
.ai-stats-container { display: flex; flex-direction: column; gap: 20px; flex: 1; }
.ai-stat-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: 600; font-size: 14px; }
.ai-progress-bar { height: 8px; background: #f5f5f5; border-radius: 10px; overflow: hidden; }
.ai-progress-fill { height: 100%; border-radius: 10px; transition: width 0.5s ease; }
.ai-footer-note { margin-top: 25px; padding-top: 15px; border-top: 1px dashed #eee; display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--text-muted); }
.ai-footer-note i { color: var(--primary-green); }

.ranking-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  border-radius: 18px;
  transition: background 0.2s;
}

.ranking-item:hover {
  background: var(--bg-color);
}


.rank-num {
  font-weight: 800;
  color: var(--primary-green);
  width: 30px;
}

.rank-img {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  object-fit: cover;
}

.rank-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.rank-name {
  font-weight: 700;
  font-size: 15px;
}

.rank-category {
  font-size: 12px;
  color: var(--text-muted);
}

.rank-stats {
  font-weight: 700;
  color: #ff4d4f;
}

@media (max-width: 1024px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}
</style>
