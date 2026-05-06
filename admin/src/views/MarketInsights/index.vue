<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Phân tích Chiến lược & Tiềm năng</h1>
        <p class="header-desc">Dữ liệu phân tích hành vi để tối ưu hóa tính năng và thu hút người dùng.</p>
      </div>
      <div class="header-actions">
        <button class="export-btn"><i class="fa-solid fa-file-pdf"></i> Xuất báo cáo chiến lược</button>
      </div>
    </div>

    <div class="insights-grid">
      <!-- 1. Dietary Trends (Target Audience) -->
      <div class="card-panel diet-card">
        <div class="card-header">
          <h3>Thị hiếu người dùng</h3>
          <span class="badge info">Nên tập trung: Giảm cân</span>
        </div>
        <div class="chart-box">
          <div class="diet-stats">
            <div class="diet-item" v-for="d in dietaryTrends" :key="d.label">
              <div class="diet-label">
                <span>{{ d.label }}</span>
                <span>{{ d.value }}%</span>
              </div>
              <div class="diet-progress"><div class="fill" :style="{ width: d.value + '%', background: d.color }"></div></div>
            </div>
          </div>
        </div>
        <div class="insight-note">
          <i class="fa-solid fa-lightbulb"></i>
          <p>Người dùng quan tâm đến <strong>Giảm cân</strong> chiếm đa số. Gợi ý: Ưu tiên thêm 20+ công thức Salad và Low-carb.</p>
        </div>
      </div>

      <!-- 2. Content Gap (The Opportunity) -->
      <div class="card-panel gap-card">
        <div class="card-header">
          <h3>Tiềm năng nội dung</h3>
          <span class="badge warn">Cần cập nhật</span>
        </div>
        <div class="gap-list">
          <div class="gap-item" v-for="g in contentGaps" :key="g.name">
            <div class="gap-info">
              <span class="gap-name">{{ g.name }}</span>
              <span class="gap-count">{{ g.scans }} lượt quét</span>
            </div>
            <button class="yellow-btn">Thêm công thức</button>
          </div>
        </div>
        <div class="insight-note">
          <i class="fa-solid fa-circle-exclamation"></i>
          <p><strong>Cá hồi</strong> & <strong>Măng tây</strong> là xu hướng nhưng đang thiếu món liên quan.</p>
        </div>
      </div>

      <!-- 3. Conversion Funnel & AI Efficiency -->
      <div class="card-panel wide">
        <div class="split-layout">
          <!-- Left: Funnel -->
          <div class="funnel-side">
            <h3>Phễu chuyển đổi & Giữ chân</h3>
            <div class="funnel-container">
              <div class="funnel-step" v-for="(s, i) in funnel" :key="s.label" 
                :style="{ width: (85 - i * 15) + '%', background: s.color }">
                <div class="step-label">{{ s.label }}</div>
                <div class="step-val">{{ s.value }}</div>
                <div class="step-drop" v-if="i < funnel.length - 1">
                  <i class="fa-solid fa-arrow-down-long"></i>
                  <span>{{ s.drop }}%</span>
                </div>
              </div>
            </div>
            <div class="insight-summary">
              <div class="s-item problem-box">
                <h4>Vấn đề</h4>
                <p>25% dừng sau Profile.</p>
              </div>
              <div class="s-item solution-box">
                <h4>Giải pháp</h4>
                <p>Tặng công thức chào mừng.</p>
              </div>
            </div>
          </div>

          <!-- Right: AI Efficiency -->
          <div class="ai-side">
            <h3>Hiệu quả tư vấn AI</h3>
            <div class="ai-stats-compact">
              <div class="ai-stat-row" v-for="a in aiStats" :key="a.label">
                <div class="ai-label-row">
                  <span class="ai-label">{{ a.label }}</span>
                  <span class="ai-val">{{ a.value }}</span>
                </div>
                <div class="ai-bar"><div class="ai-fill" :style="{ width: a.pct + '%', background: a.color }"></div></div>
              </div>
            </div>
            <div class="ai-highlight-compact">
              <div class="ai-h-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
              <div>
                <div class="ai-h-title">Tỷ lệ hài lòng</div>
                <div class="ai-h-val">92.4%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. AI Performance & Satisfaction -->
      <div class="card-panel ai-perf-card">
        <h3>Độ thông minh AI</h3>
        <div class="ai-satisfaction">
          <div class="gauge-area">
            <svg viewBox="0 0 100 50" class="gauge">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="8" />
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f4c553" stroke-width="8" 
                stroke-dasharray="125.6" stroke-dashoffset="25.12" />
            </svg>
            <div class="gauge-val">82%</div>
          </div>
          <div class="ai-stats-list">
            <div class="ai-s-row"><span>Nhận diện đúng:</span> <strong>82%</strong></div>
            <div class="ai-s-row"><span>Người dùng phải sửa:</span> <strong class="red">18%</strong></div>
            <div class="ai-s-row"><span>Thời gian phản hồi:</span> <strong>1.2s</strong></div>
          </div>
        </div>
        <div class="insight-note ai-note">
          <i class="fa-solid fa-gear"></i>
          <p>Model đang nhầm giữa <strong>Hành tây</strong> & <strong>Tỏi tây</strong>. Cần bổ sung tập dữ liệu ảnh.</p>
        </div>
      </div>

      <!-- 5. Market Potential (Shopping List) -->
      <div class="card-panel market-card">
        <h3>Nhu cầu thị trường</h3>
        <div class="market-list">
          <div class="m-row" v-for="m in shoppingTrends" :key="m.name">
            <div class="m-icon" :style="{ background: m.bg, color: m.color }"><i :class="m.icon"></i></div>
            <div class="m-info">
              <div class="m-name">{{ m.name }}</div>
              <div class="m-trend">Nằm trong {{ m.percent }}% danh sách đi chợ</div>
            </div>
            <div class="m-status" :class="m.up ? 'up' : 'down'">
              <i :class="m.up ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'"></i>
              {{ m.change }}%
            </div>
          </div>
        </div>
        <div class="insight-note market-note">
          <i class="fa-solid fa-hand-holding-dollar"></i>
          <p>Tiềm năng liên kết với các cửa hàng <strong>Thực phẩm sạch</strong> để cung cấp nguyên liệu thiếu.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { dietaryTrends, contentGaps, funnel, aiStats, shoppingTrends } from './mocks/marketData';
</script>

<style scoped>
.page { padding: 30px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
.page-header h1 { font-size: 26px; font-weight: 800; color: var(--text-dark); margin-bottom: 8px; }
.header-desc { color: var(--text-muted); font-size: 14px; }

.export-btn {
  background: white; border: 1.5px solid var(--primary-green); color: var(--primary-green);
  padding: 10px 24px; border-radius: 14px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; gap: 8px; transition: all 0.2s;
}
.export-btn:hover { background: var(--primary-green); color: white; transform: translateY(-2px); }

.insights-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; align-items: stretch; }
.card-panel { background: white; padding: 24px; border-radius: 30px; border: 1px solid rgba(74,140,84,0.1); display: flex; flex-direction: column; }
.card-panel.wide { grid-column: span 2; }

.diet-card { background: #F0FDF4; border-color: #DCFCE7; }
.gap-card { background: #FFFBEB; border-color: #FEF3C7; }

.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.card-header h3 { font-size: 16px; font-weight: 800; color: var(--text-dark); }

.badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.badge.info { background: #DCFCE7; color: #166534; border: 1px solid #BBF7D0; }
.badge.warn { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }

/* Dietary Stats */
.diet-stats { display: flex; flex-direction: column; gap: 12px; margin-bottom: 15px; }
.diet-item .diet-label { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: var(--text-dark); margin-bottom: 6px; }
.diet-progress { height: 6px; background: rgba(255,255,255,0.5); border-radius: 10px; overflow: hidden; }
.diet-progress .fill { height: 100%; border-radius: 10px; transition: width 0.5s ease; }

/* Insight Note */
.insight-note { 
  display: flex; gap: 10px; background: rgba(255,255,255,0.6); padding: 12px; border-radius: 18px;
  font-size: 12px; color: var(--text-dark); line-height: 1.4; margin-top: auto;
}
.insight-note i { color: var(--primary-green); font-size: 14px; }

/* Gap List */
.gap-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; flex: 1; }
.gap-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: white; border-radius: 14px; border: 1px solid rgba(0,0,0,0.03); }
.gap-name { font-weight: 800; font-size: 13px; color: var(--text-dark); }
.gap-count { font-size: 11px; color: #92400E; margin-left: 8px; font-weight: 600; }

.yellow-btn { 
  padding: 8px 16px; border-radius: 12px; border: none; background: var(--primary-yellow); 
  color: var(--text-dark); font-size: 11px; font-weight: 800; cursor: pointer; 
  white-space: nowrap; flex-shrink: 0; box-shadow: 0 4px 10px rgba(244,197,83,0.2);
}
.yellow-btn:hover { background: var(--yellow-hover); transform: translateY(-2px); }

/* Funnel Section */
.split-layout { display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; align-items: stretch; }
.funnel-side { border-right: 1px solid #f1f5f9; padding-right: 40px; display: flex; flex-direction: column; }
.ai-side { display: flex; flex-direction: column; }

.funnel-container { display: flex; flex-direction: column; align-items: center; gap: 8px; margin: 15px 0; }
.funnel-step { 
  color: white; padding: 10px; border-radius: 14px;
  text-align: center; position: relative; font-weight: 700; font-size: 11px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}
.step-val { font-size: 14px; opacity: 0.9; }
.step-drop { position: absolute; right: -40px; top: 50%; transform: translateY(-50%); color: #ff4d4f; font-size: 11px; display: flex; align-items: center; gap: 3px; font-weight: 800; }

.insight-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
.s-item { padding: 14px; border-radius: 18px; border: 1px solid transparent; }
.s-item.problem-box { background: #F5F3FF; border-color: #DDD6FE; }
.s-item.solution-box { background: #FFFBEB; border-color: #FEF3C7; }
.s-item h4 { font-size: 11px; margin-bottom: 4px; text-transform: uppercase; font-weight: 800; }
.problem-box h4 { color: #7C3AED; }
.solution-box h4 { color: #D97706; }
.s-item p { font-size: 12px; color: var(--text-dark); line-height: 1.4; font-weight: 500; }

/* AI Stats Compact */
.ai-side h3 { margin-bottom: 20px; }
.ai-stats-compact { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.ai-label-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
.ai-label { font-size: 13px; font-weight: 600; color: var(--text-dark); }
.ai-val { font-size: 12px; font-weight: 700; color: #8B5CF6; }
.ai-bar { height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
.ai-fill { height: 100%; border-radius: 10px; }

.ai-highlight-compact { 
  background: #ECFDF5; border-radius: 20px; padding: 20px; display: flex; align-items: center; gap: 15px;
  border: 1px solid #A7F3D0; margin-top: auto;
}
.ai-h-icon { width: 45px; height: 45px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: var(--primary-yellow); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.ai-h-title { font-size: 12px; color: var(--text-muted); font-weight: 600; }
.ai-h-val { font-size: 24px; font-weight: 800; color: var(--text-dark); }

/* AI Satisfaction */
.ai-perf-card { background: #FFF7ED; border-color: #FFEDD5; }
.ai-satisfaction { margin-top: 15px; margin-bottom: 15px; flex: 1; }
.gauge-area { position: relative; width: 140px; margin: 0 auto 15px; }
.gauge { transform: rotate(0deg); }
.gauge-val { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); font-size: 22px; font-weight: 800; color: #9A3412; }
.ai-stats-list { display: flex; flex-direction: column; gap: 10px; background: white; padding: 14px; border-radius: 18px; border: 1px solid rgba(0,0,0,0.03); }
.ai-s-row { display: flex; justify-content: space-between; font-size: 13px; color: #431407; font-weight: 600; }
.red { color: #EF4444; }

.ai-note { background: white; border: 1px solid #FFEDD5; }

/* Market Trends */
.market-card { background: #EEF2FF; border-color: #E0E7FF; }
.market-list { display: flex; flex-direction: column; gap: 15px; margin-top: 15px; margin-bottom: 15px; flex: 1; }
.m-row { display: flex; align-items: center; gap: 12px; background: white; padding: 12px; border-radius: 18px; }
.m-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.m-info { flex: 1; }
.m-name { font-weight: 800; font-size: 14px; color: var(--text-dark); }
.m-trend { font-size: 11px; color: var(--text-muted); font-weight: 500; }
.m-status { font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 4px; }
.m-status.up { color: #22C55E; }
.m-status.down { color: #EF4444; }

.market-note { background: white; border: 1px solid #E0E7FF; }
</style>
