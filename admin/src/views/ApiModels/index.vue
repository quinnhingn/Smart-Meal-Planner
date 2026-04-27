<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Giám sát Hệ thống <span class="status-dot-pulse"></span></h1>
        <p class="header-desc">Hệ thống đang hoạt động ổn định. Đã kiểm tra 1 phút trước.</p>
      </div>
    </div>

    <div class="main-layout">
      <!-- 2. API Quota & Usage -->
      <div class="card-panel">
        <div class="card-header">
          <h3>Hạn mức API bên ngoài</h3>
          <span class="badge info">Cập nhật 1 phút trước</span>
        </div>
        <div class="usage-list">
          <div class="usage-item" v-for="api in externalAPIs" :key="api.name">
            <div class="u-info">
              <span class="u-name"><i :class="api.icon" :style="{color: api.color}"></i> {{ api.name }}</span>
              <span class="u-count">{{ api.used }} / {{ api.limit }}</span>
            </div>
            <div class="u-bar-bg">
              <div class="u-bar-fill" :style="{ width: (api.used/api.limit*100) + '%', background: api.color }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. AI Models Status -->
      <div class="card-panel">
        <div class="card-header">
          <h3>Trạng thái AI Models</h3>
        </div>
        <div class="model-compact-list">
          <div class="m-item" v-for="m in models" :key="m.name">
            <div class="m-icon-box" :style="{ background: m.bg }">
              <i :class="m.icon" :style="{ color: m.color }"></i>
            </div>
            <div class="m-details">
              <div class="m-name">{{ m.name }}</div>
              <div class="m-meta">Hiệu suất: {{ m.accuracy }}% · Latency: {{ m.latency }}ms</div>
            </div>
            <div class="m-status-tag" :class="m.status">{{ m.statusLabel }}</div>
          </div>
        </div>
      </div>

      <!-- 4. Error Logs (Compact) -->
      <div class="card-panel wide">
        <div class="card-header">
          <h3>Cảnh báo & Nhật ký lỗi</h3>
          <button class="view-all-btn">Xem tất cả nhật ký</button>
        </div>
        <div class="error-logs">
          <div class="log-entry" v-for="log in errorLogs" :key="log.id">
            <div class="l-time">{{ log.time }}</div>
            <div class="l-api">{{ log.api }}</div>
            <div class="l-msg">{{ log.endpoint }} - <span class="err-text">{{ log.code }}</span></div>
            <div class="l-retry"><button><i class="fa-solid fa-redo"></i> Thử lại</button></div>
          </div>
          <div v-if="errorLogs.length === 0" class="no-errors">
            <i class="fa-solid fa-circle-check"></i>
            <p>Tuyệt vời! Không có lỗi nào được ghi nhận trong 24h qua.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const externalAPIs = [
  { name: 'Spoonacular', icon: 'fa-solid fa-utensils', color: '#F59E0B', used: 4500, limit: 5000 },
  { name: 'USDA Dinh dưỡng', icon: 'fa-solid fa-leaf', color: '#22C55E', used: 1200, limit: 10000 },
  { name: 'YouTube API', icon: 'fa-brands fa-youtube', color: '#EF4444', used: 850, limit: 1000 },
  { name: 'Firebase Auth', icon: 'fa-solid fa-shield-halved', color: '#F97316', used: 12840, limit: 50000 },
];

const models = [
  { name: 'YOLO v8 Food', icon: 'fa-solid fa-camera', color: '#3B82F6', bg: '#EFF6FF', status: 'active', statusLabel: 'Online', accuracy: 94.8, latency: 145 },
  { name: 'Nutrition Est.', icon: 'fa-solid fa-calculator', color: '#8B5CF6', bg: '#F5F3FF', status: 'active', statusLabel: 'Online', accuracy: 88.2, latency: 32 },
  { name: 'Recipe AI', icon: 'fa-solid fa-wand-magic-sparkles', color: '#22C55E', bg: '#F0FDF4', status: 'active', statusLabel: 'Online', accuracy: 91.5, latency: 68 },
];

const logs = [
  { id: 1, time: '20:45:33', api: 'YOLO', endpoint: '/detect/cooked', status: 'err', code: '500 Internal Server Error' },
  { id: 2, time: '20:41:08', api: 'Spoonacular', endpoint: '/recipes/complexSearch', status: 'err', code: '429 Rate Limit Exceeded' },
];

const errorLogs = computed(() => logs.filter(l => l.status === 'err'));
</script>

<style scoped>
.page { padding: 30px; min-height: 100vh; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.page-header h1 { font-size: 24px; font-weight: 800; color: #1e293b; }
.header-desc { color: #64748b; font-size: 14px; }

.refresh-btn:hover { background: #f8fafc; }

/* Status Pulse Dot */
.status-dot-pulse {
  display: inline-block; width: 10px; height: 10px; background: #22c55e;
  border-radius: 50%; margin-left: 8px; position: relative; vertical-align: middle;
}
.status-dot-pulse::after {
  content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  border-radius: 50%; background: #22c55e; animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(3); opacity: 0; }
}

/* Main Layout */
.main-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.card-panel { background: white; padding: 20px; border-radius: 24px; border: 1px solid #e2e8f0; }
.card-panel.wide { grid-column: span 2; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.card-header h3 { font-size: 16px; font-weight: 800; color: #1e293b; }

/* Usage List */
.usage-list { display: flex; flex-direction: column; gap: 18px; }
.u-info { display: flex; justify-content: space-between; margin-bottom: 6px; }
.u-name { font-size: 13px; font-weight: 700; color: #334155; }
.u-count { font-size: 12px; font-weight: 600; color: #64748b; }
.u-bar-bg { height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
.u-bar-fill { height: 100%; border-radius: 10px; transition: width 0.5s ease; }

/* Model Compact */
.model-compact-list { display: flex; flex-direction: column; gap: 12px; }
.m-item { 
  display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 16px;
  background: #f8fafc; border: 1px solid #f1f5f9;
}
.m-icon-box { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.m-details { flex: 1; }
.m-name { font-size: 14px; font-weight: 700; color: #1e293b; }
.m-meta { font-size: 11px; color: #64748b; font-weight: 500; }
.m-status-tag { font-size: 11px; font-weight: 700; color: #166534; background: #dcfce7; padding: 4px 10px; border-radius: 20px; }

/* Logs */
.error-logs { display: flex; flex-direction: column; gap: 10px; }
.log-entry { 
  display: flex; align-items: center; gap: 20px; padding: 12px 18px; 
  background: #fff1f0; border: 1px solid #ffa39e; border-radius: 14px;
}
.l-time { font-family: monospace; font-size: 12px; color: #f5222d; font-weight: 700; }
.l-api { font-weight: 800; font-size: 12px; color: #1e293b; background: white; padding: 2px 8px; border-radius: 6px; }
.l-msg { flex: 1; font-size: 13px; color: #434343; }
.err-text { color: #cf1322; font-weight: 700; }
.l-retry button { background: white; border: 1px solid #d9d9d9; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; }

.no-errors { text-align: center; padding: 40px; color: #22c55e; }
.no-errors i { font-size: 40px; margin-bottom: 15px; }
.no-errors p { font-weight: 700; }

.view-all-btn { background: none; border: none; color: #3b82f6; font-weight: 700; font-size: 12px; cursor: pointer; }
</style>
