<template>
  <div class="add-ing-container">
    <div class="page-header">
      <button class="back-btn" @click="router.back()">
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <div>
        <h1>Thêm nguyên liệu mới</h1>
        <p class="header-desc">Bổ sung nguyên liệu và thông số dinh dưỡng vào hệ thống tư vấn công thức.</p>
      </div>
    </div>

    <div class="form-grid">
      <!-- Left: Main form -->
      <div class="form-main">

        <!-- Basic Info -->
        <div class="card-panel">
          <h3>Thông tin cơ bản</h3>
          <div class="row-group">
            <div class="lookup-group">
            <div class="input-group" style="flex:1; margin-bottom:0">
              <label>Tên nguyên liệu <span class="required">*</span></label>
              <input type="text" v-model="form.name" placeholder="VD: Ức gà, Cà chua bi..." @input="lookupResult = null">
            </div>
            <button class="autofill-btn" @click="llmAutoFill" :disabled="!form.name.trim()" title="Tự động điền thông tin bằng AI LLM">
              <i class="fa-solid fa-wand-magic-sparkles"></i> AI Tự động điền
            </button>
          </div>

          <!-- Lookup result suggestions -->
          <div class="lookup-suggestions" v-if="suggestions.length > 0">
            <p class="sug-title">Chọn kết quả phù hợp nhất:</p>
            <div
              class="sug-item"
              v-for="s in suggestions"
              :key="s.name"
              @click="applyLookup(s)"
            >
              <div>
                <strong>{{ s.name }}</strong>
                <span>{{ s.nameEn }}</span>
              </div>
              <div class="sug-macros">
                <span>{{ s.calories }} kcal</span>
                <span>P {{ s.protein }}g</span>
                <span>C {{ s.carbs }}g</span>
                <span>F {{ s.fat }}g</span>
              </div>
            </div>
          </div>
          <div class="no-result" v-if="noResult">
            <i class="fa-solid fa-circle-exclamation"></i> Không tìm thấy trong CSDL. Bạn có thể nhập thủ công bên dưới.
          </div>
            <div class="input-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label style="margin-bottom: 0;">Tên tiếng Anh</label>
                <button class="mini-translate-btn" @click="autoTranslate" :disabled="isTranslating || !form.name.trim()" title="Dịch từ Tên nguyên liệu">
                  <i v-if="isTranslating" class="fa-solid fa-spinner fa-spin"></i>
                  <i v-else class="fa-solid fa-language"></i> Dịch nhanh
                </button>
              </div>
              <input type="text" v-model="form.nameEn" placeholder="VD: Chicken breast, Cherry tomato...">
            </div>
          </div>
          <div class="row-group">
            <div class="input-group">
              <label>Danh mục <span class="required">*</span></label>
              <select v-model="form.category">
                <option value="">-- Chọn danh mục --</option>
                <option value="meat">Thịt & Hải sản</option>
                <option value="vegetables">Rau củ quả</option>
                <option value="milks">Sữa & Trứng</option>
                <option value="grains">Ngũ cốc & Tinh bột</option>
                <option value="fruits">Trái cây</option>
                <option value="spices">Gia vị & Dầu ăn</option>
              </select>
            </div>
            <div class="input-group">
              <label>Đơn vị tính phổ biến</label>
              <select v-model="form.unit">
                <option value="g">Gram (g)</option>
                <option value="ml">Mililit (ml)</option>
                <option value="piece">Cái / Quả / Củ</option>
                <option value="tbsp">Muỗng canh</option>
              </select>
            </div>
          </div>
          <div class="input-group">
            <label>Mô tả ngắn</label>
            <textarea v-model="form.description" placeholder="Mô tả đặc điểm, nguồn gốc, ứng dụng phổ biến của nguyên liệu này..."></textarea>
          </div>
        </div>

        <!-- Suitability Tags (MOVED UP) -->
        <div class="card-panel">
          <h3>Phù hợp với đối tượng</h3>
          <p class="panel-desc">Chọn mục tiêu — hệ thống sẽ đề xuất phần trăm dinh dưỡng tối ưu dựa trên đó.</p>
          <div class="tags-select">
            <div
              class="select-tag"
              v-for="tag in suitabilityOptions"
              :key="tag.value"
              :class="{ active: form.suitability.includes(tag.value) }"
              @click="toggleTag(tag.value)"
            >
              <i :class="tag.icon"></i> {{ tag.label }}
            </div>
          </div>
        </div>

        <!-- Nutrition per 100g -->
        <div class="card-panel">
          <div class="section-title-row">
            <h3>Thông số dinh dưỡng</h3>
            <div style="display:flex; gap:8px; align-items:center">
              <button class="ai-calc-btn" @click="autoFill" :disabled="isLoading || !form.name" style="background:#F0FDF4; color:#166534; border-color:#BBF7D0;">
                <i v-if="isLoading" class="fa-solid fa-spinner fa-spin"></i>
                <i v-else class="fa-solid fa-cloud-arrow-down"></i> 
                Lấy dữ liệu USDA
              </button>
              <button class="ai-calc-btn" @click="calcNutritionFromSuitability" v-if="form.suitability.length > 0 && form.nutrition.calories">
                <i class="fa-solid fa-bullseye"></i> Tính theo mục tiêu
              </button>
              <span class="unit-note">Trên <strong>100g</strong></span>
            </div>
          </div>
          <p class="panel-desc">Nhập thủ công hoặc dùng nút "Lấy dữ liệu USDA" để tra cứu tự động.</p>

          <!-- Macro -->
          <div class="nutrition-group-label">Nhóm đa lượng (Macros)</div>
          <div class="nutrition-grid">
            <div class="nut-input-card" v-for="macro in macros" :key="macro.key">
              <div class="nut-icon" :style="{ background: macro.bg }">
                <i :class="macro.icon" :style="{ color: macro.color }"></i>
              </div>
              <label>{{ macro.label }}</label>
              <div class="nut-field">
                <input type="number" min="0" step="0.1" v-model="form.nutrition[macro.key]" placeholder="0">
                <span>{{ macro.unit }}</span>
              </div>
            </div>
          </div>

          <!-- Dynamic Micronutrients -->
          <div class="nutrition-group-label dynamic-header">
            <span>Vi chất & Thành phần phụ (Tuỳ chọn)</span>
            <div class="add-micro-dropdown">
              <button class="add-micro-btn" type="button" @click="showMicroDropdown = !showMicroDropdown">
                <i class="fa-solid fa-plus"></i> Thêm vi chất
              </button>
              <div class="micro-dropdown-menu" v-if="showMicroDropdown">
                <div class="micro-option" v-for="m in availableMicros" :key="m.key" @click="addMicroField(m.key)">
                  {{ m.label }} ({{ m.unit }})
                </div>
                <div class="micro-empty" v-if="availableMicros.length === 0">Đã thêm tất cả</div>
              </div>
            </div>
          </div>

          <div class="dynamic-micros" v-if="activeMicros.length > 0">
            <div class="row-group">
              <div class="input-group small" v-for="key in activeMicros" :key="key">
                <label class="dynamic-label">
                  {{ getMicroLabel(key) }}
                  <i class="fa-solid fa-xmark remove-micro" @click="removeMicroField(key)" title="Xoá vi chất này"></i>
                </label>
                <div class="input-with-unit">
                  <input type="number" min="0" step="0.01" v-model="form.nutrition[key as NutritionKey]" placeholder="0">
                  <span>{{ getMicroUnit(key) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="empty-micros" v-else>
            <i class="fa-solid fa-flask"></i>
            <p>Chưa có vi chất nào. Bấm "Thêm vi chất" hoặc dùng Tự động điền.</p>
          </div>
        </div>

        <!-- Storage & Notes -->
        <div class="card-panel">
          <h3>Bảo quản & Gợi ý sử dụng</h3>
          <div class="row-group">
            <div class="input-group">
              <label>Cách bảo quản</label>
              <input type="text" v-model="form.storage" placeholder="VD: Bảo quản ngăn mát 0–4°C...">
            </div>
            <div class="input-group">
              <label>Mùa vụ / Thời điểm</label>
              <select v-model="form.season">
                <option value="all">Quanh năm</option>
                <option value="spring">Xuân</option>
                <option value="summer">Hè</option>
                <option value="autumn">Thu</option>
                <option value="winter">Đông</option>
              </select>
            </div>
          </div>

          <!-- Weight range -->
          <div class="weight-range-section">
            <label class="weight-label"><i class="fa-solid fa-weight-scale"></i> Phù hợp cho người nặng khoảng</label>
            <div class="weight-inputs">
              <input type="number" v-model="form.weightMin" placeholder="45" min="30" max="200">
              <span>—</span>
              <input type="number" v-model="form.weightMax" placeholder="75" min="30" max="200">
              <span>kg</span>
            </div>
          </div>

          <div class="input-group" style="margin-top:16px">
            <label>Ghi chú thêm</label>
            <textarea v-model="form.notes" placeholder="Lưu ý dị ứng, thầy thế, đối tượng nên hạn chế..."></textarea>
          </div>
        </div>

      </div>

      <!-- Right: Preview & Summary -->
      <div class="form-sidebar">
        <!-- Image upload -->
        <div class="card-panel">
          <h3>Hình ảnh</h3>
          <div class="upload-area">
            <i class="fa-solid fa-cloud-arrow-up"></i>
            <p>Kéo thả ảnh vào đây hoặc <span>Tải lên</span></p>
            <small>PNG, JPG tối đa 5MB</small>
          </div>
        </div>

        <!-- Nutrition Preview -->
        <div class="card-panel nutrition-preview">
          <h3>Xem trước dinh dưỡng</h3>
          <p class="preview-note">Trên 100g nguyên liệu</p>

          <div class="cal-highlight">
            <span class="cal-num">{{ form.nutrition.calories || 0 }}</span>
            <span class="cal-unit">kcal</span>
          </div>

          <div class="macro-bars">
            <div class="bar-row" v-for="m in macroPreview" :key="m.key">
              <div class="bar-label">
                <span class="dot" :style="{ background: m.color }"></span>{{ m.label }}
              </div>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: barWidth(m.key, m.max) + '%', background: m.color }"></div>
              </div>
              <span class="bar-val">{{ form.nutrition[m.key] || 0 }}g</span>
            </div>
          </div>

          <!-- AI Auto Tags -->
          <div class="ai-tags-section" v-if="autoTags.length > 0">
            <div class="ai-tag-title"><i class="fa-solid fa-wand-magic-sparkles"></i> AI tự gán nhãn</div>
            <div class="ai-tags-wrap">
              <span class="ai-tag" v-for="t in autoTags" :key="t">{{ t }}</span>
            </div>
          </div>
        </div>

        <!-- AI Insight -->
        <div class="card-panel ai-card">
          <div class="ai-title"><i class="fa-solid fa-wand-magic-sparkles"></i> Gợi ý từ AI</div>
          <p>{{ aiInsight }}</p>
        </div>

        <button class="save-btn" @click="saveIngredient" :disabled="isSaving">
          <i v-if="isSaving" class="fa-solid fa-circle-notch fa-spin"></i>
          <i v-else class="fa-solid fa-check"></i> 
          <span v-if="isSaving">Đang lưu...</span>
          <span v-else>Lưu nguyên liệu</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const isSaving = ref(false);

const saveIngredient = async () => {
  if (!form.value.name || form.value.nutrition.calories === null) {
    alert('Vui lòng nhập tên nguyên liệu và lượng calo!');
    return;
  }
  isSaving.value = true;
  try {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      alert('Bạn chưa đăng nhập hoặc mất Token. Vui lòng đăng nhập lại.');
      router.push('/login');
      return;
    }

    const payload = {
      name_vn: form.value.name,
      name_en: form.value.nameEn || '',
      category: form.value.category || 'other',
      default_unit: form.value.unit || 'g',
      calories_per_100g: form.value.nutrition.calories,
      protein_per_100g: form.value.nutrition.protein || 0,
      fat_per_100g: form.value.nutrition.fat || 0,
      carbs_per_100g: form.value.nutrition.carbs || 0,
      image_url: null,
      gram_per_unit: 1.0
    };

    const res = await fetch('http://localhost:5000/api/ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    if (data.success) {
      alert('Thêm nguyên liệu thành công vào Database!');
      router.back();
    } else {
      alert('Lỗi từ Server: ' + data.message);
    }
  } catch (err) {
    console.error(err);
    alert('Lỗi kết nối đến Backend Server (Port 5000)');
  } finally {
    isSaving.value = false;
  }
};

// ── Auto-fill database ──────────────────────────────
const nutritionDB = [
  { name: 'Thịt ba chỉ heo', nameEn: 'Pork Belly', category: 'meat', calories: 518, protein: 9, carbs: 0, fat: 53, sugar: 0, fiber: 0, saturatedFat: 19, sodium: 32, calcium: 10, iron: 0.8, vitaminC: 0, vitaminA: 0 },
  { name: 'Sữa tươi không đường', nameEn: 'Unsweetened Whole Milk', category: 'milks', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, sugar: 4.8, fiber: 0, saturatedFat: 1.9, sodium: 43, calcium: 113, iron: 0, vitaminC: 0, vitaminA: 46 },
  { name: 'Gạo lứt', nameEn: 'Brown Rice (cooked)', category: 'grains', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, sugar: 0.4, fiber: 1.8, saturatedFat: 0.2, sodium: 5, calcium: 10, iron: 0.4, vitaminC: 0, vitaminA: 0 },
  { name: 'Ức gà', nameEn: 'Chicken Breast', category: 'meat', calories: 165, protein: 31, carbs: 0, fat: 3.6, sugar: 0, fiber: 0, saturatedFat: 1, sodium: 74, calcium: 15, iron: 1, vitaminC: 0, vitaminA: 9 },
  { name: 'Thịt bò', nameEn: 'Beef', category: 'meat', calories: 250, protein: 26, carbs: 0, fat: 15, sugar: 0, fiber: 0, saturatedFat: 6, sodium: 72, calcium: 18, iron: 2.6, vitaminC: 0, vitaminA: 0 },
  { name: 'Cà chua', nameEn: 'Tomato', category: 'vegetables', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, sugar: 2.6, fiber: 1.2, saturatedFat: 0, sodium: 5, calcium: 10, iron: 0.3, vitaminC: 14, vitaminA: 42 },
  { name: 'Bông cải xanh', nameEn: 'Broccoli', category: 'vegetables', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, sugar: 1.7, fiber: 2.6, saturatedFat: 0.1, sodium: 33, calcium: 47, iron: 0.7, vitaminC: 89, vitaminA: 31 },
  { name: 'Cà rốt', nameEn: 'Carrot', category: 'vegetables', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, sugar: 4.7, fiber: 2.8, saturatedFat: 0, sodium: 69, calcium: 33, iron: 0.3, vitaminC: 6, vitaminA: 835 },
  { name: 'Khoai tây', nameEn: 'Potato', category: 'vegetables', calories: 77, protein: 2, carbs: 17, fat: 0.1, sugar: 0.8, fiber: 2.2, saturatedFat: 0, sodium: 6, calcium: 12, iron: 0.8, vitaminC: 20, vitaminA: 0 },
  { name: 'Trứng gà', nameEn: 'Chicken Egg', category: 'milks', calories: 155, protein: 13, carbs: 1.1, fat: 11, sugar: 1.1, fiber: 0, saturatedFat: 3.3, sodium: 124, calcium: 56, iron: 1.8, vitaminC: 0, vitaminA: 149 },
  { name: 'Rau muống', nameEn: 'Water Spinach', category: 'vegetables', calories: 19, protein: 2.6, carbs: 3.1, fat: 0.2, sugar: 0, fiber: 2.1, saturatedFat: 0, sodium: 113, calcium: 77, iron: 1.7, vitaminC: 55, vitaminA: 380 },
  { name: 'Cơm trắng', nameEn: 'White Rice (cooked)', category: 'grains', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, sugar: 0, fiber: 0.4, saturatedFat: 0.1, sodium: 1, calcium: 10, iron: 0.2, vitaminC: 0, vitaminA: 0 },
  { name: 'Quinoa', nameEn: 'Quinoa (cooked)', category: 'grains', calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, sugar: 0.9, fiber: 2.8, saturatedFat: 0.2, sodium: 7, calcium: 17, iron: 1.5, vitaminC: 0, vitaminA: 1 },
  { name: 'Nấm hương', nameEn: 'Shiitake Mushroom', category: 'vegetables', calories: 34, protein: 2.2, carbs: 6.8, fat: 0.5, sugar: 2.4, fiber: 2.5, saturatedFat: 0.1, sodium: 9, calcium: 2, iron: 0.4, vitaminC: 0, vitaminA: 0 },
  { name: 'Đậu hũ', nameEn: 'Tofu (firm)', category: 'milks', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, sugar: 0.5, fiber: 0.3, saturatedFat: 0.7, sodium: 7, calcium: 350, iron: 1.6, vitaminC: 0.1, vitaminA: 0 },
  { name: 'Chuối', nameEn: 'Banana', category: 'fruits', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, sugar: 12, fiber: 2.6, saturatedFat: 0.1, sodium: 1, calcium: 5, iron: 0.3, vitaminC: 8.7, vitaminA: 3 },
  { name: 'Táo', nameEn: 'Apple', category: 'fruits', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, sugar: 10, fiber: 2.4, saturatedFat: 0, sodium: 1, calcium: 6, iron: 0.1, vitaminC: 4.6, vitaminA: 3 },
  { name: 'Sữa tươi', nameEn: 'Whole Milk', category: 'milks', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, sugar: 4.8, fiber: 0, saturatedFat: 1.9, sodium: 43, calcium: 113, iron: 0, vitaminC: 0, vitaminA: 46 },
  { name: 'Dầu ô liu', nameEn: 'Olive Oil', category: 'spices', calories: 884, protein: 0, carbs: 0, fat: 100, sugar: 0, fiber: 0, saturatedFat: 14, sodium: 2, calcium: 1, iron: 0.6, vitaminC: 0, vitaminA: 0 },
  { name: 'Tỏi', nameEn: 'Garlic', category: 'spices', calories: 149, protein: 6.4, carbs: 33, fat: 0.5, sugar: 1, fiber: 2.1, saturatedFat: 0.1, sodium: 17, calcium: 181, iron: 1.7, vitaminC: 31, vitaminA: 0 },
  { name: 'Hành tây', nameEn: 'Onion', category: 'vegetables', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, sugar: 4.2, fiber: 1.7, saturatedFat: 0, sodium: 4, calcium: 23, iron: 0.2, vitaminC: 7.4, vitaminA: 0 },
  { name: 'Cá hồi', nameEn: 'Salmon', category: 'meat', calories: 208, protein: 20, carbs: 0, fat: 13, sugar: 0, fiber: 0, saturatedFat: 3.1, sodium: 59, calcium: 12, iron: 0.3, vitaminC: 3.9, vitaminA: 12 },
  { name: 'Tôm', nameEn: 'Shrimp', category: 'meat', calories: 85, protein: 18, carbs: 0.9, fat: 0.9, sugar: 0, fiber: 0, saturatedFat: 0.2, sodium: 189, calcium: 52, iron: 0.5, vitaminC: 1.9, vitaminA: 0 },
];

const isLoading = ref(false);
const suggestions = ref<any[]>([]);
const lookupResult = ref<any>(null);
const noResult = ref(false);
const isTranslating = ref(false);

const autoTranslate = async () => {
  const q = form.value.name.trim();
  if (!q) {
    alert("Vui lòng nhập Tên nguyên liệu trước khi bấm dịch!");
    return;
  }
  
  isTranslating.value = true;
  try {
    const token = localStorage.getItem('admin_token');
    const res = await fetch('http://localhost:5000/api/ingredients/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ text: q })
    });
    
    const data = await res.json();
    if (data.success && data.translated_text) {
      form.value.nameEn = data.translated_text;
    }
  } catch (err) {
    console.error('Lỗi khi dịch tự động:', err);
  } finally {
    isTranslating.value = false;
  }
};

const llmAutoFill = () => {
  alert("Tính năng AI LLM tự động điền đang được phát triển. Vui lòng cuộn xuống mục Thông số dinh dưỡng và dùng nút 'Lấy dữ liệu USDA' nhé!");
};

const autoFill = async () => {
  if (!form.value.name) {
    alert("Vui lòng nhập Tên nguyên liệu trước khi bấm Tự động điền!");
    return;
  }
  
  // Nếu chưa dịch sang tiếng Anh, tự động chạy hàm dịch trước
  if (!form.value.nameEn) {
    await autoTranslate();
  }
  
  const query = form.value.nameEn.trim();
  if (!query) {
    alert("Cần có Tên tiếng Anh để tra cứu Dữ liệu Dinh dưỡng Quốc tế.");
    return;
  }
  
  isLoading.value = true;
  
  try {
    const token = localStorage.getItem('admin_token');
    const res = await fetch('http://localhost:5000/api/ingredients/auto-fill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ query })
    });
    
    const data = await res.json();
    if (data.success && data.data) {
      // Đổ dữ liệu vào form
      Object.assign(form.value.nutrition, data.data);
      
      // Tự động mọc vi chất nếu thông số > 0
      activeMicros.value = [];
      allMicros.forEach(m => {
        const val = data.data[m.key];
        if (val !== undefined && val !== null && val > 0) {
          activeMicros.value.push(m.key);
        }
      });
      
      // Hiển thị thông báo nhỏ
      console.log("USDA FDC Match:", data.source);
    } else {
      alert("Lỗi: " + data.message);
    }
  } catch (err) {
    console.error('Lỗi khi tra cứu USDA:', err);
    alert("Lỗi kết nối tới Server!");
  } finally {
    isLoading.value = false;
  }
};

const applyLookup = (data: any) => {
  form.value.name = data.name;
  form.value.nameEn = data.nameEn;
  form.value.category = data.category;
  Object.assign(form.value.nutrition, {
    calories: data.calories, protein: data.protein, carbs: data.carbs, fat: data.fat,
    sugar: data.sugar, fiber: data.fiber, saturatedFat: data.saturatedFat,
    sodium: data.sodium, calcium: data.calcium, iron: data.iron,
    vitaminC: data.vitaminC, vitaminA: data.vitaminA,
  });
  
  // Tự động thêm các vi chất có thông số > 0 vào danh sách hiển thị
  activeMicros.value = [];
  allMicros.forEach(m => {
    const val = data[m.key];
    if (val !== undefined && val !== null && val > 0) {
      activeMicros.value.push(m.key);
    }
  });

  suggestions.value = [];
  noResult.value = false;
};

const form = ref({
  name: '', nameEn: '', category: '', unit: 'g',
  description: '', storage: '', season: 'all', notes: '',
  weightMin: null as number | null,
  weightMax: null as number | null,
  suitability: [] as string[],
  nutrition: {
    calories: null as number | null, protein: null as number | null,
    carbs: null as number | null, fat: null as number | null,
    sugar: null as number | null, fiber: null as number | null,
    saturatedFat: null as number | null, sodium: null as number | null,
    calcium: null as number | null, iron: null as number | null,
    vitaminC: null as number | null, vitaminA: null as number | null,
  }
});

// Goal-based multipliers: adjust macros for each goal
const calcNutritionFromSuitability = () => {
  const n = form.value.nutrition;
  const goals = form.value.suitability;
  if (!n.calories) return;
  // Simulate: if 'lose' is selected, suggest reducing carbs by 20% and fat by 10%
  // if 'gain', increase protein by 20% and calories by 10%
  // if 'keto', reduce carbs by 50%, increase fat by 20%
  // if 'diabetic', reduce sugar by 50%
  let cals = n.calories; let prot = n.protein || 0;
  let carbs = n.carbs || 0; let fat = n.fat || 0;
  let sugar = n.sugar || 0;
  if (goals.includes('lose')) { carbs = +(carbs * 0.8).toFixed(1); fat = +(fat * 0.9).toFixed(1); }
  if (goals.includes('gain')) { prot = +(prot * 1.2).toFixed(1); cals = +(cals * 1.1).toFixed(0); }
  if (goals.includes('keto')) { carbs = +(carbs * 0.5).toFixed(1); fat = +(fat * 1.2).toFixed(1); }
  if (goals.includes('diabetic')) { sugar = +(sugar * 0.5).toFixed(1); }
  // Recalculate calories using Atwater: 4*P + 4*C + 9*F
  cals = Math.round(4 * prot + 4 * carbs + 9 * fat);
  Object.assign(form.value.nutrition, { calories: cals, protein: prot, carbs, fat, sugar });
};

type NutritionKey = 'calories' | 'protein' | 'carbs' | 'fat' | 'sugar' | 'fiber' | 'saturatedFat' | 'sodium' | 'calcium' | 'iron' | 'vitaminC' | 'vitaminA';

const macros: { key: NutritionKey, label: string, unit: string, icon: string, color: string, bg: string }[] = [
  { key: 'calories', label: 'Calories', unit: 'kcal', icon: 'fa-solid fa-fire', color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'protein', label: 'Protein', unit: 'g', icon: 'fa-solid fa-dumbbell', color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'carbs', label: 'Carbs', unit: 'g', icon: 'fa-solid fa-wheat-awn', color: '#22C55E', bg: '#F0FDF4' },
  { key: 'fat', label: 'Chất béo', unit: 'g', icon: 'fa-solid fa-droplet', color: '#EF4444', bg: '#FEF2F2' },
];

const allMicros = [
  { key: 'sugar', label: 'Đường (Sugar)', unit: 'g' },
  { key: 'fiber', label: 'Chất xơ (Fiber)', unit: 'g' },
  { key: 'saturatedFat', label: 'Béo bão hòa', unit: 'g' },
  { key: 'sodium', label: 'Natri (Sodium)', unit: 'mg' },
  { key: 'calcium', label: 'Canxi (Calcium)', unit: 'mg' },
  { key: 'iron', label: 'Sắt (Iron)', unit: 'mg' },
  { key: 'vitaminC', label: 'Vitamin C', unit: 'mg' },
  { key: 'vitaminA', label: 'Vitamin A', unit: 'mcg' },
];

const showMicroDropdown = ref(false);
const activeMicros = ref<string[]>([]); 

const availableMicros = computed(() => {
  return allMicros.filter(m => !activeMicros.value.includes(m.key));
});

const getMicroLabel = (key: string) => allMicros.find(m => m.key === key)?.label || key;
const getMicroUnit = (key: string) => allMicros.find(m => m.key === key)?.unit || '';

const addMicroField = (key: string) => {
  if (!activeMicros.value.includes(key)) {
    activeMicros.value.push(key);
  }
  showMicroDropdown.value = false;
};

const removeMicroField = (key: string) => {
  activeMicros.value = activeMicros.value.filter(k => k !== key);
  form.value.nutrition[key as NutritionKey] = null;
};

const macroPreview: { key: NutritionKey, label: string, color: string, max: number }[] = [
  { key: 'protein', label: 'Protein', color: '#3B82F6', max: 40 },
  { key: 'carbs', label: 'Carbs', color: '#22C55E', max: 80 },
  { key: 'fat', label: 'Fat', color: '#EF4444', max: 50 },
  { key: 'fiber', label: 'Fiber', color: '#8B5CF6', max: 20 },
];

const suitabilityOptions = [
  { value: 'lose', label: 'Giảm cân', icon: 'fa-solid fa-arrow-trend-down' },
  { value: 'gain', label: 'Tăng cơ', icon: 'fa-solid fa-dumbbell' },
  { value: 'maintain', label: 'Giữ dáng', icon: 'fa-solid fa-bullseye' },
  { value: 'diabetic', label: 'Tiểu đường', icon: 'fa-solid fa-heart-pulse' },
  { value: 'hypertension', label: 'Huyết áp cao', icon: 'fa-solid fa-droplet' },
  { value: 'vegetarian', label: 'Chay / Thuần chay', icon: 'fa-solid fa-leaf' },
  { value: 'keto', label: 'Keto', icon: 'fa-solid fa-bacon' },
  { value: 'kids', label: 'Trẻ em', icon: 'fa-solid fa-child' },
];

const toggleTag = (val: string) => {
  const idx = form.value.suitability.indexOf(val);
  if (idx >= 0) form.value.suitability.splice(idx, 1);
  else form.value.suitability.push(val);
};

const barWidth = (key: string, max: number) => {
  const val = (form.value.nutrition as any)[key] || 0;
  return Math.min((val / max) * 100, 100);
};

const autoTags = computed(() => {
  const tags: string[] = [];
  const n = form.value.nutrition;
  if ((n.protein || 0) >= 20) tags.push('Giàu Protein');
  if ((n.calories || 0) < 50) tags.push('Ít Calories');
  if ((n.fiber || 0) >= 5) tags.push('Giàu Chất xơ');
  if ((n.fat || 0) < 5) tags.push('Ít béo');
  if ((n.carbs || 0) < 10) tags.push('Low-Carb');
  if ((n.vitaminC || 0) >= 30) tags.push('Giàu Vitamin C');
  return tags;
});

const aiInsight = computed(() => {
  const n = form.value.nutrition;
  const goals = form.value.suitability;
  const wMin = form.value.weightMin; const wMax = form.value.weightMax;
  const weightNote = wMin && wMax ? ` Phù hợp cho người nặng ${wMin}–${wMax}kg.` : '';
  if (!n.calories) return 'Nhập thông số dinh dưỡng hoặc dùng "Tự động điền" để AI phân tích.';
  if (goals.includes('lose') && (n.calories || 0) < 50) return `Ử nguyên liệu này rất thấp calories — lý tưởng cho thực đơn giảm cân.${weightNote}`;
  if (goals.includes('gain') && (n.protein || 0) >= 20) return `Giàu protein, rất phù hợp để tăng cơ.${weightNote}`;
  if (goals.includes('keto') && (n.carbs || 0) < 10) return `Ít tinh bột — phù hợp cho thực đơn Keto.${weightNote}`;
  if ((n.protein || 0) >= 25) return `Giàu protein — phù hợp cho công thức tăng cơ.${weightNote}`;
  return `Hàm lượng dinh dưỡng cân đối, phù hợp nhiều loại công thức.${weightNote}`;
});
</script>

<style scoped>
.add-ing-container { padding: 30px; }

.page-header {
  display: flex; align-items: flex-start; gap: 16px; margin-bottom: 30px;
}
.page-header h1 { margin: 0 0 4px 0; font-size: 24px; font-weight: 800; color: var(--text-dark); }
.header-desc { margin: 0; font-size: 14px; color: var(--text-muted); }

.back-btn {
  width: 40px; height: 40px; background: white; border: 1px solid #E2E8F0;
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; transition: 0.2s; color: var(--text-dark);
}
.back-btn:hover { background: #F8FAFC; border-color: #CBD5E1; }

.form-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }

.card-panel {
  background: white; border-radius: 20px; padding: 24px;
  border: 1px solid #E2E8F0; margin-bottom: 24px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}
.card-panel h3 { margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: var(--text-dark); }
.panel-desc { font-size: 13px; color: var(--text-muted); margin: -12px 0 18px 0; line-height: 1.5; }

.section-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.section-title-row h3 { margin-bottom: 0; }
.unit-note { font-size: 13px; font-weight: 600; color: var(--text-muted); background: #F1F5F9; padding: 4px 12px; border-radius: 8px; }

.input-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.input-group.small { margin-bottom: 0; }
.input-group label { font-size: 14px; font-weight: 600; color: var(--text-dark); }
.required { color: #EF4444; }

.input-group input, .input-group select, .input-group textarea {
  padding: 12px 16px; border: 1px solid #CBD5E1; border-radius: 12px;
  font-family: inherit; font-size: 14px; color: var(--text-dark); background: #F8FAFC; transition: 0.2s;
}
.input-group textarea { height: 80px; resize: vertical; line-height: 1.5; }
.input-group input:focus, .input-group select:focus, .input-group textarea:focus {
  outline: none; border-color: #8EAE82; background: white; box-shadow: 0 0 0 3px rgba(142,174,130,0.15);
}

.row-group { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.row-group .input-group { margin-bottom: 0; }

/* Auto-fill */
.lookup-group {
  display: flex; align-items: flex-end; gap: 12px;
  grid-column: 1 / -1; margin-bottom: 20px;
}
.autofill-btn {
  background: linear-gradient(135deg, #8EAE82, #4a8c54);
  color: white; border: none; padding: 12px 20px; border-radius: 12px;
  font-weight: 700; font-size: 14px; font-family: inherit; cursor: pointer;
  white-space: nowrap; display: flex; align-items: center; gap: 8px;
  box-shadow: 0 4px 12px rgba(74,140,84,0.25); transition: 0.2s; height: 48px;
}
.autofill-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(74,140,84,0.35); }
.autofill-btn:disabled { background: #CBD5E1; box-shadow: none; cursor: not-allowed; }

.lookup-suggestions {
  background: white; border: 1px solid #E2E8F0; border-radius: 16px;
  padding: 16px; margin-bottom: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}
.sug-title { margin: 0 0 12px 0; font-size: 13px; font-weight: 600; color: var(--text-muted); }
.sug-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 14px; border-radius: 10px; cursor: pointer; transition: 0.15s; margin-bottom: 4px;
}
.sug-item:hover { background: #F0FDF4; }
.sug-item strong { display: block; font-size: 14px; color: var(--text-dark); }
.sug-item span { font-size: 12px; color: var(--text-muted); }
.sug-macros { display: flex; gap: 8px; }
.sug-macros span { font-size: 12px; font-weight: 600; background: #F1F5F9; padding: 3px 8px; border-radius: 6px; color: var(--text-dark); }

.no-result {
  background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px;
  padding: 12px 16px; font-size: 13px; color: #92400E; font-weight: 600;
  display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
}

/* Nutrition grid */
.nutrition-group-label {
  font-size: 12px; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px;
}
.nutrition-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
.nut-input-card {
  background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px;
  padding: 14px; display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.nut-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.nut-input-card label { font-size: 12px; font-weight: 700; color: var(--text-muted); }
.nut-field { display: flex; align-items: center; gap: 4px; width: 100%; }
.nut-field input {
  flex: 1; padding: 8px; border: 1px solid #CBD5E1; border-radius: 8px;
  font-family: inherit; font-size: 14px; font-weight: 700; text-align: center; background: white; width: 0;
}
.nut-field input:focus { outline: none; border-color: #8EAE82; }
.nut-field span { font-size: 11px; color: var(--text-muted); font-weight: 600; }

.dynamic-header { display: flex; justify-content: space-between; align-items: center; margin-top: 30px; margin-bottom: 16px; }
.add-micro-dropdown { position: relative; }
.add-micro-btn {
  background: white; border: 1px dashed #CBD5E1; color: var(--text-dark);
  padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.2s;
}
.add-micro-btn:hover { border-color: #8EAE82; color: #4a8c54; }

.micro-dropdown-menu {
  position: absolute; top: calc(100% + 4px); right: 0; width: 180px;
  background: white; border: 1px solid #E2E8F0; border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 10; padding: 6px;
}
.micro-option {
  padding: 8px 12px; font-size: 13px; color: var(--text-dark); font-weight: 600;
  border-radius: 8px; cursor: pointer; transition: 0.2s;
}
.micro-option:hover { background: #F0FDF4; color: #166534; }
.micro-empty { padding: 10px; font-size: 12px; color: var(--text-muted); text-align: center; }

.empty-micros {
  border: 1px dashed #CBD5E1; border-radius: 14px; padding: 24px;
  text-align: center; background: #F8FAFC; color: #94A3B8;
}
.empty-micros i { font-size: 24px; margin-bottom: 8px; }
.empty-micros p { margin: 0; font-size: 13px; }

.dynamic-label { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.remove-micro { 
  color: #CBD5E1; cursor: pointer; font-size: 13px; padding: 4px;
  transition: 0.2s; border-radius: 50%;
}
.remove-micro:hover { color: #EF4444; background: #FEF2F2; }

.input-with-unit { display: flex; align-items: center; gap: 8px; }
.input-with-unit input {
  flex: 1; padding: 12px 16px; border: 1px solid #CBD5E1; border-radius: 12px;
  font-family: inherit; font-size: 14px; background: #F8FAFC;
}
.input-with-unit input:focus { outline: none; border-color: #8EAE82; background: white; }
.input-with-unit span { font-size: 13px; font-weight: 600; color: var(--text-muted); white-space: nowrap; }

/* Suitability tags */
.tags-select { display: flex; flex-wrap: wrap; gap: 10px; }
.select-tag {
  padding: 9px 16px; border-radius: 20px; border: 1px solid #E2E8F0;
  background: white; font-size: 13px; font-weight: 600; color: var(--text-muted);
  cursor: pointer; display: flex; align-items: center; gap: 7px; transition: 0.2s;
}
.select-tag:hover { border-color: #8EAE82; color: #4a8c54; }
.select-tag.active { background: #E6EFE5; border-color: #8EAE82; color: #1A2F23; }

.ai-calc-btn {
  background: #EFF6FF; border: 1px solid #BFDBFE; color: #1D4ED8;
  padding: 6px 14px; border-radius: 10px; font-size: 12px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.2s;
}
.ai-calc-btn:hover { background: #DBEAFE; }

.mini-translate-btn {
  background: #F0FDF4; border: 1px solid #BBF7D0; color: #166534;
  padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; gap: 4px; transition: 0.2s;
}
.mini-translate-btn:hover:not(:disabled) { background: #DCFCE7; }
.mini-translate-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* Weight range */
.weight-range-section {
  background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px;
  padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;
}
.weight-label { font-size: 14px; font-weight: 700; color: var(--text-dark); display: flex; align-items: center; gap: 8px; }
.weight-label i { color: #8EAE82; }
.weight-inputs { display: flex; align-items: center; gap: 10px; }
.weight-inputs input {
  width: 70px; padding: 10px 12px; border: 1px solid #CBD5E1; border-radius: 10px;
  font-family: inherit; font-size: 15px; font-weight: 700; text-align: center; background: white;
}
.weight-inputs input:focus { outline: none; border-color: #8EAE82; }
.weight-inputs span { font-size: 14px; font-weight: 600; color: var(--text-muted); }

/* Sidebar */
.upload-area {
  border: 2px dashed #CBD5E1; border-radius: 16px; padding: 36px 20px;
  text-align: center; cursor: pointer; background: #F8FAFC; transition: 0.2s;
}
.upload-area:hover { border-color: #8EAE82; background: #E6EFE5; }
.upload-area i { font-size: 36px; color: #94A3B8; margin-bottom: 12px; display: block; }
.upload-area p { margin: 0 0 4px 0; color: var(--text-muted); font-size: 14px; }
.upload-area span { color: #3B82F6; font-weight: 600; }
.upload-area small { color: #94A3B8; font-size: 12px; }

.preview-note { font-size: 12px; color: var(--text-muted); margin: -14px 0 16px 0; }
.cal-highlight { text-align: center; margin-bottom: 20px; }
.cal-num { font-size: 48px; font-weight: 800; color: #F59E0B; line-height: 1; }
.cal-unit { font-size: 16px; color: var(--text-muted); font-weight: 600; margin-left: 6px; }

.macro-bars { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.bar-row { display: flex; align-items: center; gap: 8px; }
.bar-label { display: flex; align-items: center; gap: 6px; width: 70px; font-size: 12px; font-weight: 600; color: var(--text-dark); }
.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.bar-track { flex: 1; height: 8px; background: #F1F5F9; border-radius: 20px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 20px; transition: width 0.4s; }
.bar-val { font-size: 12px; font-weight: 700; color: var(--text-dark); width: 30px; text-align: right; }

.ai-tags-section { border-top: 1px solid #E2E8F0; padding-top: 14px; }
.ai-tag-title { font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
.ai-tag-title i { color: #f4c553; }
.ai-tags-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
.ai-tag { background: #FFFBEB; border: 1px solid #FDE68A; color: #92400E; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 8px; }

.ai-card { background: linear-gradient(145deg, #F3F7F2, #E6EFE5); border-color: #8EAE82; }
.ai-title { font-size: 14px; font-weight: 700; color: #1A2F23; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.ai-title i { color: #f4c553; }
.ai-card p { margin: 0; font-size: 13px; color: #2D4A35; line-height: 1.7; }

.save-btn {
  width: 100%; background: var(--primary-yellow, #f4c553); color: #1A1A1A;
  border: none; padding: 16px; border-radius: 16px; font-weight: 700; font-size: 16px;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
  box-shadow: 0 4px 15px rgba(244,197,83,0.3); transition: 0.2s; font-family: inherit;
}
.save-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(244,197,83,0.4); }

.form-sidebar { display: flex; flex-direction: column; }
</style>
