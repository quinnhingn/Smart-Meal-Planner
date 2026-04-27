<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Quản lý gói đăng ký</h1>
        <p class="header-desc">Theo dõi doanh thu, trạng thái gói dùng và danh sách thuê bao hiện tại.</p>
      </div>
      <button class="add-btn"><i class="fa-solid fa-plus"></i> Tạo gói mới</button>
    </div>

    <!-- Revenue stats -->
    <div class="stats-row">
      <div class="stat-card" v-for="s in stats" :key="s.label">
        <div class="stat-icon" :style="{ background: s.bg }"><i :class="s.icon" :style="{ color: s.color }"></i></div>
        <div class="stat-body">
          <div class="stat-num">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
        <span class="stat-change up"><i class="fa-solid fa-arrow-up"></i> {{ s.change }}</span>
      </div>
    </div>

    <!-- Plans -->
    <div class="section-title">Các gói hiện tại</div>
    <div class="plans-grid">
      <div class="plan-card" v-for="p in plans" :key="p.name" :class="{ popular: p.popular }">
        <div class="plan-badge" v-if="p.popular">Phổ biến nhất</div>
        <div class="plan-icon" :style="{ background: p.bg }"><i :class="p.icon" :style="{ color: p.color }"></i></div>
        <h3 class="plan-name">{{ p.name }}</h3>
        <div class="plan-price"><span class="price-num">{{ p.price }}</span><span class="price-unit">/tháng</span></div>
        <div class="plan-users"><i class="fa-solid fa-users"></i> {{ p.users }} người dùng</div>
        <ul class="plan-features">
          <li v-for="f in p.features" :key="f"><i class="fa-solid fa-circle-check"></i> {{ f }}</li>
        </ul>
        <div class="plan-revenue">
          <span class="rev-label">Doanh thu tháng này</span>
          <span class="rev-val">{{ p.revenue }}</span>
        </div>
      </div>
    </div>

    <!-- Toggle button -->
    <button class="toggle-feat-btn" @click="showFeatures = !showFeatures">
      <i :class="showFeatures ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
      {{ showFeatures ? 'Ẩn bảng so sánh tính năng' : 'Xem bảng so sánh tính năng theo gói' }}
    </button>

    <!-- Feature Comparison Table (collapsible) -->
    <div class="feat-collapse" v-show="showFeatures">
      <div class="card-panel feat-table-wrap">
        <table class="feat-table">
          <thead>
            <tr>
              <th class="feat-col">Tính năng</th>
              <th class="feat-col-note">Mô tả</th>
              <th class="plan-col">
                <div class="plan-head free"><i class="fa-solid fa-seedling"></i> Free</div>
              </th>
              <th class="plan-col">
                <div class="plan-head plus"><i class="fa-solid fa-star"></i> Plus</div>
              </th>
              <th class="plan-col">
                <div class="plan-head pro"><i class="fa-solid fa-crown"></i> Pro</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="group in featureMatrix" :key="group.group">
              <tr class="group-header-row">
                <td colspan="5">
                  <div class="group-header-label">
                    <i :class="group.icon"></i> {{ group.group }}
                  </div>
                </td>
              </tr>
              <tr v-for="feat in group.features" :key="feat.name" class="feat-row">
                <td class="feat-name">{{ feat.name }}</td>
                <td class="feat-note">{{ feat.note }}</td>
                <td class="plan-cell">
                  <span v-if="feat.free === true" class="check yes"><i class="fa-solid fa-check"></i></span>
                  <span v-else-if="feat.free === false" class="check no"><i class="fa-solid fa-xmark"></i></span>
                  <span v-else class="check partial">{{ feat.free }}</span>
                </td>
                <td class="plan-cell">
                  <span v-if="feat.plus === true" class="check yes"><i class="fa-solid fa-check"></i></span>
                  <span v-else-if="feat.plus === false" class="check no"><i class="fa-solid fa-xmark"></i></span>
                  <span v-else class="check partial">{{ feat.plus }}</span>
                </td>
                <td class="plan-cell">
                  <span v-if="feat.pro === true" class="check yes"><i class="fa-solid fa-check"></i></span>
                  <span v-else-if="feat.pro === false" class="check no"><i class="fa-solid fa-xmark"></i></span>
                  <span v-else class="check partial">{{ feat.pro }}</span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
    <div class="card-panel">
      <div class="table-header">
        <h3>Danh sách thuê bao</h3>
        <div class="header-tools">
          <div class="search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="Tìm kiếm..." v-model="search">
          </div>
          <select class="filter-select" v-model="filterPlan">
            <option value="">Tất cả gói</option>
            <option value="free">Free</option>
            <option value="plus">Plus</option>
            <option value="pro">Pro</option>
          </select>
        </div>
      </div>
      <table class="sub-table">
        <thead>
          <tr>
            <th>Người dùng</th>
            <th>Gói</th>
            <th>Ngày đăng ký</th>
            <th>Gia hạn tiếp</th>
            <th>Thanh toán</th>
            <th>Trạng thái</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filteredSubs" :key="s.id">
            <td>
              <div class="user-cell">
                <div class="avatar" :style="{ background: s.color }">{{ s.name[0] }}</div>
                <div>
                  <div class="user-name">{{ s.name }}</div>
                  <div class="user-email">{{ s.email }}</div>
                </div>
              </div>
            </td>
            <td><span class="plan-tag" :class="s.plan">{{ planLabel(s.plan) }}</span></td>
            <td class="date-cell">{{ s.startDate }}</td>
            <td class="date-cell">{{ s.nextDate }}</td>
            <td><strong>{{ s.amount }}</strong></td>
            <td><span class="sub-status" :class="s.status">{{ statusLabel(s.status) }}</span></td>
            <td>
              <div class="actions">
                <button class="act-btn"><i class="fa-solid fa-pen"></i></button>
                <button class="act-btn danger"><i class="fa-solid fa-ban"></i></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const search = ref('');
const filterPlan = ref('');
const showFeatures = ref(false);

const stats = [
  { label: 'Doanh thu tháng', value: '42,800,000₫', change: '+18%', icon: 'fa-solid fa-money-bill-trend-up', color: '#22C55E', bg: '#F0FDF4' },
  { label: 'Thuê bao Plus', value: '412', change: '+12%', icon: 'fa-solid fa-star', color: '#3B82F6', bg: '#EFF6FF' },
  { label: 'Thuê bao Pro', value: '168', change: '+24%', icon: 'fa-solid fa-crown', color: '#F59E0B', bg: '#FFFBEB' },
  { label: 'Tỷ lệ gia hạn', value: '87.4%', change: '+3%', icon: 'fa-solid fa-rotate', color: '#8B5CF6', bg: '#F5F3FF' },
];

const plans = [
  {
    name: 'Free', price: '0₫', users: 668, revenue: '0₫', popular: false,
    icon: 'fa-solid fa-seedling', color: '#22C55E', bg: '#F0FDF4',
    features: ['Tủ lạnh tối đa 20 nguyên liệu', 'Gợi ý món ăn cơ bản', 'Nhật ký bữa ăn', 'Tính BMI & TDEE']
  },
  {
    name: 'Plus', price: '49,000₫', users: 412, revenue: '20,188,000₫', popular: true,
    icon: 'fa-solid fa-star', color: '#3B82F6', bg: '#EFF6FF',
    features: ['Tủ lạnh không giới hạn', 'Quét ảnh nhận diện AI', 'Gợi ý cá nhân hoá', 'Danh sách đi chợ', 'Nhận diện món chín']
  },
  {
    name: 'Pro', price: '129,000₫', users: 168, revenue: '21,672,000₫', popular: false,
    icon: 'fa-solid fa-crown', color: '#F59E0B', bg: '#FFFBEB',
    features: ['Tất cả tính năng Plus', 'Báo cáo dinh dưỡng nâng cao', 'Tư vấn AI không giới hạn', 'Ưu tiên hỗ trợ', 'Xuất dữ liệu PDF']
  },
];

const subscribers = ref([
  { id: 1, name: 'Nguyễn Văn An', email: 'an@gmail.com', plan: 'pro', startDate: '01/03/2025', nextDate: '01/04/2025', amount: '129,000₫', status: 'active', color: '#3B82F6' },
  { id: 2, name: 'Trần Thị Bình', email: 'binh@gmail.com', plan: 'plus', startDate: '15/02/2025', nextDate: '15/03/2025', amount: '49,000₫', status: 'active', color: '#EC4899' },
  { id: 3, name: 'Lê Minh Cường', email: 'cuong@gmail.com', plan: 'plus', startDate: '20/01/2025', nextDate: '20/04/2025', amount: '49,000₫', status: 'active', color: '#10B981' },
  { id: 4, name: 'Phạm Thu Hà', email: 'ha@gmail.com', plan: 'free', startDate: '22/02/2025', nextDate: '—', amount: '0₫', status: 'active', color: '#F59E0B' },
  { id: 5, name: 'Đỗ Quốc Hùng', email: 'hung@gmail.com', plan: 'pro', startDate: '01/02/2025', nextDate: '01/04/2025', amount: '129,000₫', status: 'expired', color: '#6366F1' },
  { id: 6, name: 'Vũ Thị Lan', email: 'lan@gmail.com', plan: 'plus', startDate: '10/03/2025', nextDate: '10/04/2025', amount: '49,000₫', status: 'cancelled', color: '#EF4444' },
]);

const filteredSubs = computed(() => {
  return subscribers.value.filter(s => {
    const matchSearch = !search.value || s.name.toLowerCase().includes(search.value.toLowerCase());
    const matchPlan = !filterPlan.value || s.plan === filterPlan.value;
    return matchSearch && matchPlan;
  });
});

const planLabel = (p: string) => ({ free: 'Free', plus: 'Plus ⭐', pro: 'Pro 👑' }[p] || p);
const statusLabel = (s: string) => ({ active: 'Đang hoạt động', expired: 'Đã hết hạn', cancelled: 'Đã huỷ' }[s] || s);

const featureMatrix = [
  {
    group: 'Nền tảng cơ bản',
    icon: 'fa-solid fa-layer-group',
    features: [
      { name: 'Đăng ký / Đăng nhập', note: 'Xác thực qua Email + JWT', free: true, plus: true, pro: true },
      { name: 'Thiết lập Profile', note: 'Tuổi, giới tính, chiều cao, cân nặng, vận động', free: true, plus: true, pro: true },
      { name: 'Tính BMI & TDEE', note: 'Tự động tính dựa trên Profile', free: true, plus: true, pro: true },
      { name: 'Chọn mục tiêu', note: 'Giảm cân / Giữ cân / Tăng cơ', free: true, plus: true, pro: true },
    ]
  },
  {
    group: 'Quản lý thực phẩm',
    icon: 'fa-solid fa-box-open',
    features: [
      { name: 'Tủ lạnh (kho nguyên liệu)', note: 'Số lượng nguyên liệu lưu trữ', free: 'Tối đa 20', plus: 'Không giới hạn', pro: 'Không giới hạn' },
      { name: 'Quét ảnh nhận diện nguyên liệu', note: 'AI (YOLO) nhận diện thực phẩm thô', free: false, plus: true, pro: true },
      { name: 'Xác nhận & Lưu kho', note: 'Chỉnh sửa trước khi lưu vào DB', free: false, plus: true, pro: true },
      { name: 'Cảnh báo hết hạn', note: 'Đánh dấu màu sắp hỏng', free: false, plus: false, pro: true },
    ]
  },
  {
    group: 'Gợi ý & Công thức',
    icon: 'fa-solid fa-wand-magic-sparkles',
    features: [
      { name: 'Gợi ý món ăn cơ bản', note: 'Lọc món dựa trên nguyên liệu sẵn có', free: true, plus: true, pro: true },
      { name: 'Gợi ý cá nhân hoá', note: 'Dựa trên mục tiêu & lịch sử dàng', free: false, plus: true, pro: true },
      { name: 'Chi tiết công thức', note: 'Thành phần, bước nấu, calo, thời gian', free: true, plus: true, pro: true },
      { name: 'Tích hợp Spoonacular', note: 'Món quốc tế khi không có trong CSDL', free: false, plus: false, pro: true },
      { name: 'Danh sách đi chợ', note: 'Liệt kê nguyên liệu còn thiếu cho công thức', free: false, plus: true, pro: true },
    ]
  },
  {
    group: 'Theo dõi & Nhật ký',
    icon: 'fa-solid fa-chart-line',
    features: [
      { name: 'Nhật ký bữa ăn', note: 'Ghi nhận bữa ăn hàng ngày', free: true, plus: true, pro: true },
      { name: 'Nhận diện món ăn chín', note: 'AI nhận diện đĩa ăn để cộng calo', free: false, plus: true, pro: true },
      { name: 'Dashboard báo cáo cơ bản', note: 'Biểu đồ calo nạp vs định mức', free: true, plus: true, pro: true },
      { name: 'Báo cáo dinh dưỡng nâng cao', note: 'Phân tích Macro/Micro chi tiết', free: false, plus: false, pro: true },
      { name: 'Xuất dữ liệu PDF', note: 'In báo cáo dinh dưỡng tháng', free: false, plus: false, pro: true },
    ]
  },
  {
    group: 'Hỗ trợ & ưu tiên',
    icon: 'fa-solid fa-headset',
    features: [
      { name: 'Hỗ trợ cộng đồng', note: 'Diễn đàn & FAQ', free: true, plus: true, pro: true },
      { name: 'Hỗ trợ qua Email', note: 'Phản hồi trong 48h', free: false, plus: true, pro: true },
      { name: 'Ưu tiên hỗ trợ', note: 'Phản hồi trong 4h', free: false, plus: false, pro: true },
      { name: 'Tư vấn AI không giới hạn', note: 'Gợi ý không giới hạn lượt', free: '5 lượt/ngày', plus: '30 lượt/ngày', pro: 'Không giới hạn' },
    ]
  },
];
</script>

<style scoped>
.page { padding: 30px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
.page-header h1 { margin: 0 0 4px 0; font-size: 24px; font-weight: 800; color: var(--text-dark); }
.header-desc { margin: 0; font-size: 14px; color: var(--text-muted); }
.add-btn { background: var(--primary-yellow, #f4c553); color: #1A1A1A; border: none; padding: 12px 20px; border-radius: 14px; font-weight: 700; font-size: 14px; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(244,197,83,0.3); transition: 0.2s; }
.add-btn:hover { transform: translateY(-2px); }

/* Stats */
.stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 18px; margin-bottom: 32px; }
.stat-card { background: white; border: 1px solid #E2E8F0; border-radius: 20px; padding: 20px 22px; display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
.stat-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.stat-body { flex: 1; }
.stat-num { font-size: 20px; font-weight: 800; color: var(--text-dark); }
.stat-label { font-size: 13px; color: var(--text-muted); font-weight: 600; }
.stat-change { font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 4px; }
.stat-change.up { color: #22C55E; }

/* Plans */
.section-title { font-size: 18px; font-weight: 700; color: var(--text-dark); margin-bottom: 18px; }
.plans-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-bottom: 0; }

/* Toggle button */
.toggle-feat-btn {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  width: 100%; margin: 14px 0 0 0; padding: 13px 20px;
  background: white; border: 1.5px solid #E2E8F0; border-radius: 16px;
  font-size: 14px; font-weight: 700; color: var(--text-muted); font-family: inherit;
  cursor: pointer; transition: 0.2s;
}
.toggle-feat-btn:hover { border-color: #8EAE82; color: #4a8c54; background: #F0FDF4; }
.toggle-feat-btn i { font-size: 12px; }

.feat-collapse { margin-top: 14px; margin-bottom: 28px; }
.plan-card { background: white; border: 2px solid #E2E8F0; border-radius: 24px; padding: 28px 24px; position: relative; transition: 0.2s; }
.plan-card.popular { border-color: #8EAE82; box-shadow: 0 8px 30px rgba(142,174,130,0.15); }
.plan-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.08); }
.plan-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #8EAE82, #4a8c54); color: white; font-size: 12px; font-weight: 700; padding: 4px 18px; border-radius: 20px; white-space: nowrap; }
.plan-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 14px; }
.plan-name { font-size: 22px; font-weight: 800; color: var(--text-dark); margin: 0 0 10px 0; }
.plan-price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 8px; }
.price-num { font-size: 32px; font-weight: 800; color: var(--text-dark); }
.price-unit { font-size: 14px; color: var(--text-muted); }
.plan-users { font-size: 13px; color: var(--text-muted); margin-bottom: 18px; display: flex; align-items: center; gap: 7px; }
.plan-features { list-style: none; padding: 0; margin: 0 0 20px 0; display: flex; flex-direction: column; gap: 9px; }
.plan-features li { font-size: 13px; color: var(--text-dark); display: flex; align-items: center; gap: 8px; }
.plan-features li i { color: #22C55E; }
.plan-revenue { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
.rev-label { font-size: 12px; color: var(--text-muted); font-weight: 600; }
.rev-val { font-size: 16px; font-weight: 800; color: var(--text-dark); }

/* Table */
.card-panel { background: white; border: 1px solid #E2E8F0; border-radius: 20px; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.table-header h3 { margin: 0; font-size: 18px; font-weight: 700; color: var(--text-dark); }
.header-tools { display: flex; gap: 10px; }
.search-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 9px 14px; display: flex; align-items: center; gap: 8px; }
.search-box input { border: none; outline: none; font-family: inherit; font-size: 14px; background: transparent; width: 160px; }
.search-box i { color: #94A3B8; font-size: 13px; }
.filter-select { padding: 9px 14px; border: 1px solid #E2E8F0; border-radius: 12px; font-family: inherit; font-size: 14px; background: #F8FAFC; outline: none; cursor: pointer; }

.sub-table { width: 100%; border-collapse: collapse; }
.sub-table th { text-align: left; padding: 10px 12px; font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #E2E8F0; }
.sub-table td { padding: 14px 12px; border-bottom: 1px solid #F1F5F9; font-size: 14px; }
.sub-table tr:last-child td { border-bottom: none; }
.sub-table tr:hover td { background: #F8FAFC; }

.user-cell { display: flex; align-items: center; gap: 12px; }
.avatar { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; color: white; flex-shrink: 0; }
.user-name { font-weight: 700; color: var(--text-dark); font-size: 14px; }
.user-email { font-size: 12px; color: var(--text-muted); }

.plan-tag { font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; }
.plan-tag.free { background: #F1F5F9; color: #64748B; }
.plan-tag.plus { background: #EFF6FF; color: #1D4ED8; }
.plan-tag.pro { background: #FFFBEB; color: #D97706; }

.date-cell { font-size: 13px; color: var(--text-muted); }

.sub-status { font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; }
.sub-status.active { background: #DCFCE7; color: #166534; }
.sub-status.expired { background: #FEE2E2; color: #DC2626; }
.sub-status.cancelled { background: #F1F5F9; color: #64748B; }

.actions { display: flex; gap: 6px; }
.act-btn { width: 32px; height: 32px; border: 1px solid #E2E8F0; background: white; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; color: var(--text-muted); transition: 0.2s; }
.act-btn:hover { border-color: #8EAE82; color: #4a8c54; }
.act-btn.danger:hover { border-color: #FCA5A5; color: #DC2626; }

/* Feature Matrix Table */
.feat-table-wrap { margin-bottom: 28px; overflow-x: auto; }
.feat-table { width: 100%; border-collapse: collapse; min-width: 700px; }
.feat-table thead tr { border-bottom: 2px solid #E2E8F0; }
.feat-table th { padding: 12px 16px; font-size: 13px; font-weight: 700; color: var(--text-muted); }
.feat-col { text-align: left; width: 30%; }
.feat-col-note { text-align: left; width: 36%; }
.plan-col { text-align: center; width: 34%; }

.plan-head { display: inline-flex; align-items: center; gap: 7px; padding: 7px 20px; border-radius: 20px; font-size: 14px; font-weight: 800; }
.plan-head.free { background: #F0FDF4; color: #166534; }
.plan-head.plus { background: #EFF6FF; color: #1D4ED8; }
.plan-head.pro { background: #FFFBEB; color: #D97706; }

.group-header-row td { padding: 0; }
.group-header-label {
  background: #F8FAFC; padding: 10px 16px;
  font-size: 12px; font-weight: 800; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.5px;
  display: flex; align-items: center; gap: 8px;
  border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0;
}
.group-header-label i { color: #8EAE82; }

.feat-row:hover td { background: #F8FAFC; }
.feat-row td { padding: 13px 16px; border-bottom: 1px solid #F1F5F9; }
.feat-row:last-child td { border-bottom: none; }

.feat-name { font-size: 14px; font-weight: 700; color: var(--text-dark); }
.feat-note { font-size: 13px; color: var(--text-muted); }

.plan-cell { text-align: center; }
.check {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 50%; font-size: 13px; font-weight: 700;
}
.check.yes { background: #DCFCE7; color: #16A34A; }
.check.no { background: #F1F5F9; color: #CBD5E1; }
.check.partial {
  width: auto; border-radius: 12px; padding: 4px 12px;
  background: #FFF7ED; color: #D97706; font-size: 12px;
}
</style>
