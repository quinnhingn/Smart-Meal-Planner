<template>
  <div class="user-mgmt-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1>Quản lý người dùng</h1>
        <p class="header-desc">Theo dõi thông tin sức khỏe và hoạt động của {{ users.length }} thành viên.</p>
      </div>
      <div class="header-actions">
        <div class="search-wrapper">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Tìm tên hoặc email..." v-model="search">
        </div>
        <button class="export-btn">
          <i class="fa-solid fa-file-export"></i> Xuất báo cáo
        </button>
      </div>
    </div>

    <!-- Main Table Card -->
    <div class="table-card" :class="{ 'drawer-open': selectedUser }">
      <div class="table-toolbar">
        <div class="filter-group">
          <span 
            v-for="tab in tabs" 
            :key="tab.id"
            class="filter-tab"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
            <span class="count" v-if="tab.count">{{ tab.count }}</span>
          </span>
        </div>
        <div class="secondary-filters">
          <select v-model="filterGoal" class="select-filter">
            <option value="">Tất cả mục tiêu</option>
            <option value="lose">Giảm cân</option>
            <option value="gain">Tăng cơ</option>
            <option value="maintain">Giữ dáng</option>
          </select>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Chỉ số & BMI</th>
              <th>Mục tiêu</th>
              <th>TDEE</th>
              <th>Hoạt động cuối</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in filteredUsers" :key="u.id" @click="selectedUser = u" :class="{ selected: selectedUser?.id === u.id }">
              <td class="user-cell">
                <div class="user-profile">
                  <div class="avatar-placeholder" :style="{ background: u.avatarColor }">{{ u.name[0] }}</div>
                  <div class="user-info">
                    <div class="name">{{ u.name }}</div>
                    <div class="email">{{ u.email }}</div>
                  </div>
                </div>
              </td>
              <td class="nowrap">
                <div class="stats-group">
                  <span class="body-info">{{ u.age }}t · {{ u.height }}cm · {{ u.weight }}kg</span>
                  <span class="bmi-badge" :class="bmiClass(u.bmi)">BMI {{ u.bmi }}</span>
                </div>
              </td>
              <td class="nowrap">
                <span class="goal-tag" :class="u.goal">{{ goalLabel(u.goal) }}</span>
              </td>
              <td class="nowrap">
                <span class="tdee-val"><strong>{{ u.tdee }}</strong> kcal</span>
              </td>
              <td class="nowrap">{{ u.lastActive }}</td>
              <td class="nowrap">
                <span class="status-chip" :class="u.status">
                  <span class="dot"></span> {{ u.status === 'active' ? 'Hoạt động' : 'Tạm dừng' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="table-footer">
        <div class="pagination-info">Hiển thị {{ filteredUsers.length }} người dùng</div>
        <div class="pagination">
          <button disabled><i class="fa-solid fa-angle-left"></i></button>
          <button class="active">1</button>
          <button><i class="fa-solid fa-angle-right"></i></button>
        </div>
      </div>
    </div>

    <!-- Backdrop for Drawer -->
    <div class="drawer-backdrop" v-if="selectedUser" @click="selectedUser = null"></div>

    <!-- Detail Drawer -->
    <transition name="slide">
      <div class="detail-drawer" v-if="selectedUser">
        <div class="drawer-header">
          <div class="header-main">
            <h3>Chi tiết người dùng</h3>
            <button class="close-drawer" @click="selectedUser = null"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="user-hero">
            <div class="hero-avatar" :style="{ background: selectedUser.avatarColor }">{{ selectedUser.name[0] }}</div>
            <div class="hero-info">
              <h4>{{ selectedUser.name }}</h4>
              <p>{{ selectedUser.email }}</p>
              <div class="hero-tags">
                <span class="tag">ID: #USR-00{{ selectedUser.id }}</span>
                <span class="tag">Joined: {{ selectedUser.joined }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="drawer-content">
          <!-- Section AI INSIGHTS (NEW) -->
          <div class="drawer-section ai-insights">
            <div class="section-title ai-title"><i class="fa-solid fa-wand-magic-sparkles"></i> Phân tích từ hệ thống AI</div>
            <div class="insight-cards">
              <div class="insight-item" v-for="ins in selectedUserInsights" :key="ins.text" :class="ins.type">
                <div class="ins-icon"><i :class="ins.icon"></i></div>
                <div class="ins-body">
                  <div class="ins-text">{{ ins.text }}</div>
                  <button class="ins-action" v-if="ins.action">{{ ins.action }}</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Section: Health Summary -->
          <div class="drawer-section">
            <div class="section-title">Chỉ số sức khỏe</div>
            <div class="health-grid">
              <div class="h-item">
                <label>BMI Hiện tại</label>
                <div class="val" :class="bmiClass(selectedUser.bmi)">{{ selectedUser.bmi }}</div>
                <small>{{ bmiLabel(selectedUser.bmi) }}</small>
              </div>
              <div class="h-item">
                <label>Định mức TDEE</label>
                <div class="val">{{ selectedUser.tdee }}</div>
                <small>kcal/ngày</small>
              </div>
              <div class="h-item">
                <label>Vận động</label>
                <div class="val-small">{{ selectedUser.activityLevel }}</div>
              </div>
            </div>
          </div>

          <!-- Section: Recent Activity -->
          <div class="drawer-section">
            <div class="section-title">Nhật ký ăn uống gần đây</div>
            <div class="activity-timeline">
              <div class="timeline-item" v-for="log in recentLogs" :key="log.time">
                <div class="time">{{ log.time }}</div>
                <div class="content">
                  <div class="food-name">{{ log.food }}</div>
                  <div class="food-meta">{{ log.calories }} kcal · {{ log.method }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section: Actions -->
          <div class="drawer-section">
            <div class="section-title">Thao tác quản trị</div>
            <div class="action-buttons">
              <button class="btn secondary"><i class="fa-solid fa-paper-plane"></i> Gửi thông báo</button>
              <button class="btn danger"><i class="fa-solid fa-user-slash"></i> Khóa tài khoản</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const search = ref('');
const filterGoal = ref('');
const activeTab = ref('all');
const selectedUser = ref<any>(null);

const tabs = [
  { id: 'all', label: 'Tất cả', count: 1248 },
  { id: 'active', label: 'Hoạt động', count: 342 },
  { id: 'inactive', label: 'Tạm dừng', count: 906 },
];

const users = ref([
  { 
    id: 1, name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', age: 28, height: 172, weight: 78, goal: 'lose', bmi: 26.4, tdee: 2180, status: 'active', joined: '12/01/2025', avatarColor: '#3B82F6', activityLevel: 'Vừa phải', lastActive: '2 phút trước',
    insights: [
      { type: 'warning', icon: 'fa-solid fa-triangle-exclamation', text: 'Vượt định mức Calo 3 ngày liên tiếp (TB +15%)', action: 'Gửi thực đơn Low-carb' },
      { type: 'tip', icon: 'fa-solid fa-lightbulb', text: 'Thường xuyên bỏ bữa sáng trong tuần này', action: 'Nhắc nhở' }
    ]
  },
  { 
    id: 2, name: 'Trần Thị Bình', email: 'binh.tran@gmail.com', age: 24, height: 160, weight: 55, goal: 'maintain', bmi: 21.5, tdee: 1840, status: 'active', joined: '15/01/2025', avatarColor: '#EC4899', activityLevel: 'Ít vận động', lastActive: '1 giờ trước',
    insights: [
      { type: 'success', icon: 'fa-solid fa-circle-check', text: 'Duy trì cân nặng ổn định trong 2 tuần qua', action: 'Khen ngợi' },
      { type: 'tip', icon: 'fa-solid fa-utensils', text: 'Thiếu hụt chất xơ (trung bình chỉ đạt 12g/ngày)', action: 'Gợi ý món Rau' }
    ]
  },
  { id: 3, name: 'Lê Minh Cường', email: 'cuong.le@gmail.com', age: 32, height: 175, weight: 65, goal: 'gain', bmi: 21.2, tdee: 2560, status: 'active', joined: '20/01/2025', avatarColor: '#10B981', activityLevel: 'Rất tích cực', lastActive: 'Hôm qua', insights: [] },
  { id: 4, name: 'Phạm Thu Hà', email: 'ha.pham@gmail.com', age: 26, height: 158, weight: 62, goal: 'lose', bmi: 24.8, tdee: 1720, status: 'inactive', joined: '22/01/2025', avatarColor: '#F59E0B', activityLevel: 'Ít vận động', lastActive: '3 ngày trước', insights: [] },
  { id: 5, name: 'Đỗ Quốc Hùng', email: 'hung.do@gmail.com', age: 30, height: 178, weight: 85, goal: 'lose', bmi: 26.8, tdee: 2340, status: 'active', joined: '28/01/2025', avatarColor: '#6366F1', activityLevel: 'Vừa phải', lastActive: '5 phút trước', insights: [] },
  { id: 6, name: 'Vũ Thị Lan', email: 'lan.vu@gmail.com', age: 22, height: 162, weight: 50, goal: 'gain', bmi: 19.1, tdee: 1980, status: 'active', joined: '02/02/2025', avatarColor: '#EF4444', activityLevel: 'Tích cực', lastActive: '12 giờ trước', insights: [] },
]);

const recentLogs = [
  { time: '12:30 Hôm nay', food: 'Phở bò tái lăn', calories: 450, method: 'AI Scan' },
  { time: '08:15 Hôm nay', food: 'Bánh mì ốp la', calories: 320, method: 'Manual' },
  { time: '19:00 Hôm qua', food: 'Salad ức gà', calories: 280, method: 'AI Scan' },
  { time: '13:00 Hôm qua', food: 'Cơm tấm sườn bì', calories: 650, method: 'AI Scan' },
];

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const matchSearch = !search.value || u.name.toLowerCase().includes(search.value.toLowerCase()) || u.email.includes(search.value);
    const matchGoal = !filterGoal.value || u.goal === filterGoal.value;
    const matchTab = activeTab.value === 'all' || u.status === activeTab.value;
    return matchSearch && matchGoal && matchTab;
  });
});

const selectedUserInsights = computed(() => {
  return selectedUser.value?.insights || [
    { type: 'tip', icon: 'fa-solid fa-magnifying-glass', text: 'Chưa có đủ dữ liệu hoạt động trong 24h qua.', action: null }
  ];
});

const goalLabel = (g: string) => ({ lose: 'Giảm cân', gain: 'Tăng cơ', maintain: 'Giữ dáng' }[g] || g);
const bmiLabel = (bmi: number) => bmi < 18.5 ? 'Gầy' : bmi < 25 ? 'Bình thường' : bmi < 30 ? 'Tiền béo phì' : 'Béo phì';
const bmiClass = (bmi: number) => bmi < 18.5 ? 'thin' : bmi < 25 ? 'normal' : bmi < 30 ? 'overweight' : 'obese';
</script>

<style scoped>
.user-mgmt-container { padding: 30px; background: #fcfcfc; min-height: 100vh; position: relative; overflow-x: hidden; }

/* Header */
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.header-left h1 { font-size: 26px; font-weight: 800; color: #1e293b; margin: 0 0 4px 0; }
.header-desc { color: #64748b; font-size: 14px; margin: 0; }
.header-actions { display: flex; gap: 12px; }
.search-wrapper { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 16px; display: flex; align-items: center; gap: 10px; width: 320px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.search-wrapper input { border: none; outline: none; width: 100%; font-size: 14px; font-family: inherit; }
.search-wrapper i { color: #94a3b8; }
.export-btn { background: #1e293b; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; font-family: inherit; }
.export-btn:hover { background: #334155; }

/* Table Card */
.table-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); overflow: hidden; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.table-card.drawer-open { margin-right: 420px; opacity: 0.6; pointer-events: none; }

.table-toolbar { padding: 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.filter-group { display: flex; gap: 8px; }
.filter-tab { padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 8px; }
.filter-tab:hover { background: #f8fafc; color: #1e293b; }
.filter-tab.active { background: #f1f5f9; color: #1e293b; }
.filter-tab .count { background: #e2e8f0; padding: 2px 6px; border-radius: 6px; font-size: 11px; }
.select-filter { border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 10px; font-size: 13px; outline: none; cursor: pointer; font-family: inherit; }

.table-wrapper { overflow-x: auto; }
.modern-table { width: 100%; border-collapse: collapse; min-width: 900px; }
.modern-table th { text-align: left; padding: 16px 20px; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #f1f5f9; white-space: nowrap; }
.modern-table td { padding: 16px 20px; border-bottom: 1px solid #f8fafc; font-size: 14px; color: #334155; }
.modern-table tr { cursor: pointer; transition: 0.1s; }
.modern-table tr:hover td { background: #fcfcfd; }
.modern-table tr.selected td { background: #f0f7ff; }

.nowrap { white-space: nowrap; }
.user-profile { display: flex; align-items: center; gap: 12px; }
.avatar-placeholder { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; flex-shrink: 0; font-size: 14px; }
.user-info .name { font-weight: 700; color: #1e293b; }
.user-info .email { font-size: 12px; color: #64748b; }
.stats-group { display: flex; align-items: center; gap: 8px; }
.body-info { color: #64748b; }
.bmi-badge { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
.bmi-badge.thin { color: #2563eb; background: #eff6ff; }
.bmi-badge.normal { color: #059669; background: #ecfdf5; }
.bmi-badge.overweight { color: #d97706; background: #fffbeb; }
.bmi-badge.obese { color: #dc2626; background: #fef2f2; }
.goal-tag { font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 8px; }
.goal-tag.lose { background: #fffbeb; color: #d97706; }
.goal-tag.gain { background: #f5f3ff; color: #7c3aed; }
.goal-tag.maintain { background: #f0fdf4; color: #16a34a; }
.status-chip { font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px; }
.status-chip .dot { width: 6px; height: 6px; border-radius: 50%; }
.status-chip.active { background: #dcfce7; color: #166534; }
.status-chip.active .dot { background: #22c55e; }
.status-chip.inactive { background: #f1f5f9; color: #64748b; }
.status-chip.inactive .dot { background: #cbd5e1; }

.table-footer { padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; }
.pagination-info { font-size: 13px; color: #64748b; }
.pagination { display: flex; gap: 4px; }
.pagination button { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; cursor: pointer; font-size: 13px; color: #64748b; display: flex; align-items: center; justify-content: center; }
.pagination button.active { background: #1e293b; color: white; border-color: #1e293b; }

/* Drawer */
.drawer-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.1); backdrop-filter: blur(2px); z-index: 100; }
.detail-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 420px; background: white; z-index: 101; box-shadow: -10px 0 30px rgba(0,0,0,0.05); display: flex; flex-direction: column; }

.drawer-header { padding: 24px; border-bottom: 1px solid #f1f5f9; background: #fcfcfd; }
.header-main { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.header-main h3 { margin: 0; font-size: 16px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.close-drawer { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; color: #64748b; transition: 0.2s; }
.close-drawer:hover { background: #e2e8f0; color: #1e293b; }

.user-hero { display: flex; gap: 20px; align-items: center; }
.hero-avatar { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: white; }
.hero-info h4 { margin: 0 0 4px 0; font-size: 18px; font-weight: 800; color: #1e293b; }
.hero-info p { margin: 0 0 8px 0; font-size: 13px; color: #64748b; }
.hero-tags { display: flex; gap: 8px; }
.tag { font-size: 11px; font-weight: 700; color: #94a3b8; background: white; padding: 2px 8px; border: 1px solid #e2e8f0; border-radius: 6px; }

.drawer-content { flex: 1; overflow-y: auto; padding: 24px; }
.drawer-section { margin-bottom: 32px; }
.section-title { font-size: 12px; font-weight: 800; color: #1e293b; text-transform: uppercase; margin-bottom: 16px; letter-spacing: 0.5px; }

/* AI Insights CSS */
.ai-insights { background: #f5f3ff; padding: 16px; border-radius: 16px; border: 1px solid #ddd6fe; }
.ai-title { color: #6d28d9; display: flex; align-items: center; gap: 8px; }
.ai-title i { color: #a855f7; }
.insight-cards { display: flex; flex-direction: column; gap: 12px; }
.insight-item { background: white; border-radius: 12px; padding: 12px; display: flex; gap: 12px; border: 1px solid rgba(0,0,0,0.05); }
.ins-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
.insight-item.warning .ins-icon { background: #fff7ed; color: #ea580c; }
.insight-item.tip .ins-icon { background: #eff6ff; color: #2563eb; }
.insight-item.success .ins-icon { background: #f0fdf4; color: #16a34a; }
.ins-body { flex: 1; }
.ins-text { font-size: 13px; font-weight: 600; color: #334155; line-height: 1.4; margin-bottom: 6px; }
.ins-action { background: #f1f5f9; border: none; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; color: #475569; cursor: pointer; transition: 0.2s; }
.ins-action:hover { background: #e2e8f0; color: #1e293b; }

.health-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.h-item { background: #f8fafc; padding: 12px; border-radius: 12px; text-align: center; border: 1px solid #f1f5f9; }
.h-item label { display: block; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px; }
.h-item .val { font-size: 18px; font-weight: 800; }
.h-item .val.thin { color: #2563eb; }
.h-item .val.normal { color: #059669; }
.h-item .val.overweight { color: #d97706; }
.h-item .val-small { font-size: 13px; font-weight: 700; color: #1e293b; margin: 4px 0; }
.h-item small { font-size: 10px; color: #94a3b8; font-weight: 600; }

.activity-timeline { display: flex; flex-direction: column; gap: 16px; }
.timeline-item { display: flex; gap: 16px; position: relative; }
.timeline-item::before { content: ''; position: absolute; left: 0; top: 20px; bottom: -20px; width: 1px; background: #f1f5f9; }
.timeline-item:last-child::before { display: none; }
.timeline-item .time { font-size: 11px; font-weight: 700; color: #94a3b8; min-width: 80px; padding-top: 2px; }
.timeline-item .content { background: #f8fafc; padding: 10px 14px; border-radius: 10px; flex: 1; border: 1px solid #f1f5f9; }
.food-name { font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 2px; }
.food-meta { font-size: 12px; color: #64748b; }

.action-buttons { display: flex; flex-direction: column; gap: 10px; }
.btn { padding: 12px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; font-family: inherit; }
.btn.secondary { background: white; border: 1px solid #e2e8f0; color: #334155; }
.btn.secondary:hover { border-color: #94a3b8; background: #f8fafc; }
.btn.danger { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
.btn.danger:hover { background: #fee2e2; }

/* Transitions */
.slide-enter-active, .slide-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>
