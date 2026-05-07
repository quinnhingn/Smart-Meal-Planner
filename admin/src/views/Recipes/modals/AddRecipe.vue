<template>
  <div class="add-recipe-container">
    <div class="page-header">
      <button class="back-btn" @click="router.back()">
        <i class="fa-solid fa-arrow-left"></i> Trở về
      </button>
      <h1>{{ isEditMode ? 'Chỉnh sửa công thức' : 'Thêm công thức mới' }}</h1>
    </div>

    <div class="form-grid">
      <!-- Left Column: Form Details -->
      <div class="form-main">
        <div class="card-panel">
          <h3>Thông tin cơ bản</h3>
          <div class="input-group full-width">
            <label><i class="fa-solid fa-utensils"></i> Tên món ăn</label>
            <div class="input-with-action ai-integrated">
              <input type="text" placeholder="Nhập tên món ăn (VD: Salad ức gà)" v-model="form.name">
              <button class="btn-ai-search-minimal" @click="handleAISearch" :disabled="!form.name || isSearchingAI">
                <i :class="isSearchingAI ? 'fa-solid fa-spinner fa-spin' : 'fas fa-magic'"></i>
                <span>{{ isSearchingAI ? 'AI Tự điền' : 'AI Search' }}</span>
              </button>
            </div>
          </div>

          <div class="row-group">
            <div class="input-group">
              <label><i class="fa-solid fa-layer-group"></i> Loại món</label>
              <div class="modern-pill-tags category-tags">
                <span 
                  v-for="cat in categoryOptions" 
                  :key="cat.id"
                  class="pill-tag"
                  :class="{ active: form.category === cat.id }"
                  @click="form.category = cat.id"
                >
                  {{ cat.label }}
                </span>
              </div>
            </div>
            <div class="input-group">
              <label><i class="fa-solid fa-gauge-high"></i> Độ khó</label>
              <div class="modern-pill-tags difficulty-tags">
                <span 
                  v-for="diff in difficultyOptions" 
                  :key="diff"
                  class="pill-tag"
                  :class="{ active: form.difficulty === diff }"
                  @click="form.difficulty = diff"
                >
                  {{ diff }}
                </span>
              </div>
            </div>
          </div>

          <div class="row-group-three quick-info">
            <div class="input-group">
              <label><i class="fa-solid fa-clock"></i> Thời gian nấu</label>
              <input type="text" v-model="form.cookingTime" placeholder="30 phút">
            </div>
            <div class="input-group">
              <label><i class="fa-solid fa-users"></i> Khẩu phần</label>
              <input type="text" v-model="form.servings" placeholder="1 người">
            </div>
          </div>

          <div class="row-group">
            <div class="input-group">
              <label><i class="fa-solid fa-bullseye"></i> Mục tiêu dinh dưỡng</label>
              <div class="modern-pill-tags goal-tags">
                <span 
                  v-for="g in goalOptions" 
                  :key="g.id"
                  class="pill-tag"
                  :class="{ active: form.goals.includes(g.id) }"
                  @click="toggleGoal(g.id)"
                >
                  {{ g.label }}
                </span>
              </div>
            </div>
            <div class="input-group">
              <label><i class="fa-solid fa-cloud-sun"></i> Bữa ăn phù hợp</label>
              <div class="modern-pill-tags meal-tags">
                <span 
                  v-for="m in mealOptions" 
                  :key="m.id"
                  class="pill-tag"
                  :class="{ active: form.mealTimes.includes(m.id) }"
                  @click="toggleMealTime(m.id)"
                >
                  {{ m.label }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Ingredients Section -->
        <div class="card-panel">
          <h3>Thành phần nguyên liệu</h3>
          <p class="panel-desc">Tìm kiếm và thêm nguyên liệu. Lượng Calories sẽ được hệ thống tính toán tự động dựa trên số gram và loại hình dinh dưỡng.</p>
          
          <div class="search-ingredients">
            <div class="search-box">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" placeholder="Tìm nguyên liệu..." v-model="searchIng">
            </div>
            <div class="tags-container">
              <span 
                class="ingredient-tag" 
                v-for="ing in filteredAvailable" 
                :key="ing.id"
                :style="{ backgroundColor: ing.bgColor, color: ing.color, borderColor: ing.bgColor }"
                @click="addIngredient(ing)"
              >
                {{ ing.name }} <i class="fa-solid fa-plus"></i>
              </span>
            </div>
          </div>

          <!-- Table -->
          <div class="ingredients-table" v-if="form.ingredients.length > 0">
            <table>
              <thead>
                <tr>
                  <th>Nguyên liệu</th>
                  <th width="150">Khối lượng (g)</th>
                  <th width="140">Calories (kcal)</th>
                  <th width="60"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in form.ingredients" :key="item.id">
                  <td>
                    <div class="ing-name-cell">
                      <span class="color-dot" :style="{ background: item.color }"></span>
                      {{ item.name }}
                    </div>
                  </td>
                  <td>
                    <div class="gram-wrapper">
                      <input type="number" class="gram-input" v-model="item.grams" min="0">
                      <span>g</span>
                    </div>
                  </td>
                  <td>
                    <div class="cal-value">{{ calculateItemCalories(item).toFixed(0) }} kcal</div>
                  </td>
                  <td>
                    <button class="remove-btn" @click="removeIngredient(index)">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="empty-state" v-else>
            <i class="fa-solid fa-basket-shopping" style="font-size: 30px; margin-bottom: 12px; color: #CBD5E1; display: block;"></i>
            Chưa có nguyên liệu nào được chọn.
          </div>
        </div>

        <!-- Instructions -->
        <div class="card-panel">
          <div class="steps-header">
            <h3>Các bước thực hiện</h3>
          </div>

          <div class="video-section">
            <label>Video hướng dẫn (Link YouTube)</label>
            <div class="video-input-group">
              <input type="text" placeholder="Dán link YouTube vào đây..." v-model="form.videoUrl">
              <button class="ai-search-video" @click="findAIVideo" :disabled="isSearchingVideo">
                <i :class="isSearchingVideo ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-magnifying-glass'"></i>
                {{ isSearchingVideo ? 'Đang tìm...' : 'AI Tìm video' }}
              </button>
            </div>
            <div class="video-preview" v-if="youtubeEmbedUrl">
              <iframe 
                width="100%" 
                height="315" 
                :src="youtubeEmbedUrl" 
                title="YouTube video player" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
              </iframe>
            </div>
          </div>

          <div class="steps-list">
            <div class="step-item" v-for="(step, index) in form.steps" :key="index">
              <div class="step-num">{{ index + 1 }}</div>
              <textarea placeholder="Mô tả chi tiết bước làm..." v-model="form.steps[index]"></textarea>
              <button class="remove-step" @click="removeStep(index)" v-if="form.steps.length > 1">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
          <button class="add-step-btn" @click="addStep">
            <i class="fa-solid fa-plus"></i> Thêm bước mới
          </button>
        </div>
      </div>

      <!-- Right Column: Summary & Actions -->
      <div class="form-sidebar">
        <!-- Media -->
        <div class="card-panel">
          <div class="panel-header-inline">
            <h3>Hình ảnh món ăn</h3>
            <div class="image-toggle">
              <button :class="{ active: imageMode === 'upload' }" @click="imageMode = 'upload'">
                <i class="fa-solid fa-upload"></i>
              </button>
              <button :class="{ active: imageMode === 'url' }" @click="imageMode = 'url'">
                <i class="fa-solid fa-link"></i>
              </button>
            </div>
          </div>

          <div v-if="imageMode === 'upload'" class="upload-area" :class="{ 'has-preview': imagePreview }" @click="triggerFileInput">
            <template v-if="!imagePreview">
              <i class="fa-solid fa-cloud-arrow-up"></i>
              <p>Kéo thả ảnh hoặc <span>Tải lên</span></p>
              <small>PNG, JPG tối mã 5MB</small>
            </template>
            <template v-else>
              <img :src="imagePreview" class="img-preview" />
              <div class="upload-overlay">
                <i class="fa-solid fa-camera-rotate"></i>
                <span>Đổi ảnh khác</span>
              </div>
              <button class="remove-img-btn" @click="clearImage">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </template>
            <input type="file" ref="fileInput" style="display: none" accept="image/*" @change="handleFileChange">
          </div>

          <div v-else class="url-input-container">
            <div class="input-group">
              <input 
                type="text" 
                v-model="imageUrlInput" 
                placeholder="Dán link ảnh từ Google/Web..." 
                @input="handleUrlInput"
              >
            </div>
            <div class="url-preview-box" v-if="imagePreview">
              <img :src="imagePreview" class="img-preview">
              <button class="remove-preview-btn" @click="clearImage">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div class="url-empty-preview" v-else>
              <i class="fa-solid fa-image"></i>
              <p>Chưa có ảnh. Hãy dán URL vào ô trên.</p>
            </div>
          </div>

          <!-- AI Remove BG Button -->
          <button 
            class="ai-remove-bg-btn" 
            v-if="imagePreview" 
            @click.stop="handleRemoveBg" 
            :disabled="isRemovingBg"
          >
            <i v-if="isRemovingBg" class="fa-solid fa-spinner fa-spin"></i>
            <i v-else class="fa-solid fa-wand-magic-sparkles"></i>
            {{ isRemovingBg ? 'Đang tách nền...' : 'AI Tách nền' }}
          </button>
        </div>

        <!-- Nutrition Summary -->
        <div class="card-panel nutrition-panel">
          <h3>Tổng quan dinh dưỡng</h3>
          <p class="goal-badge" :class="form.goals[0]">
            <i class="fa-solid fa-bullseye"></i> {{ goalText }}
          </p>

          <div class="nutrition-fact">
            <div class="fact-row main">
              <span>Tổng Calories</span>
              <strong>{{ totalCalories.toFixed(0) }} kcal</strong>
            </div>
            <div class="fact-row">
              <span>Đạm (Protein)</span>
              <strong>{{ totalProtein.toFixed(1) }} g</strong>
            </div>
            <div class="fact-row">
              <span>Tinh bột (Carbs)</span>
              <strong>{{ totalCarbs.toFixed(1) }} g</strong>
            </div>
            <div class="fact-row">
              <span>Chất béo (Fat)</span>
              <strong>{{ totalFat.toFixed(1) }} g</strong>
            </div>
          </div>
          
          <div class="ai-insight" v-if="totalCalories > 0">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            <div>
              <p v-if="form.goals.includes('lose') && totalCalories > 600"><strong>AI Cảnh báo:</strong> Món ăn này hơi vượt mức calories cho một bữa giảm cân. Bạn có thể giảm bớt lượng tinh bột hoặc tăng rau xanh.</p>
              <p v-else-if="form.goals.includes('gain') && totalProtein < 30"><strong>AI Gợi ý:</strong> Nên bổ sung thêm đạm (Thịt bò, Ức gà) để hỗ trợ quá trình tăng cơ hiệu quả hơn.</p>
              <p v-else><strong>AI Đánh giá:</strong> Hàm lượng dinh dưỡng rất cân đối và phù hợp với mục tiêu thiết lập!</p>
            </div>
          </div>
        </div>

        <button class="save-btn" @click="handleSave" :disabled="isSaving">
          <i v-if="isSaving" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-check"></i> 
          {{ isSaving ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật công thức' : 'Lưu công thức') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useRecipeStore } from '@/stores/recipeStore';

const router = useRouter();
const route = useRoute();
const recipeStore = useRecipeStore();
const isEditMode = ref(false);

const form = ref({
  name: '',
  category: 'rice',
  difficulty: 'Trung bình',
  cookingTime: '30 phút',
  servings: '1 người',
  goals: ['maintain'] as string[],
  mealTimes: ['lunch'] as string[],
  ingredients: [] as any[],
  steps: [''],
  videoUrl: '',
  imageUrl: ''
});

const categoryOptions = [
  { id: 'rice', label: 'Món cơm' },
  { id: 'noodles', label: 'Bún / Mì / Phở' },
  { id: 'soup', label: 'Canh / Súp' },
  { id: 'salad', label: 'Salad / Gỏi' },
  { id: 'snacks', label: 'Món ăn vặt' },
  { id: 'drinks', label: 'Đồ uống' },
  { id: 'dessert', label: 'Tráng miệng' },
  { id: 'other', label: 'Món khác' }
];

const difficultyOptions = ['Dễ', 'Trung bình', 'Khó'];

const isRemovingBg = ref(false);
const imageMode = ref<'upload' | 'url'>('upload');
const imageUrlInput = ref('');
const imagePreview = ref<string | null>(null);
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const isSearchingAI = ref(false);
const isSearchingVideo = ref(false);
const isSaving = ref(false);

const handleSave = async () => {
  if (!form.value.name) {
    alert("Vui lòng nhập tên món ăn!");
    return;
  }
  
  if (form.value.ingredients.length === 0) {
    alert("Vui lòng thêm ít nhất một nguyên liệu!");
    return;
  }

  isSaving.value = true;
  try {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    
    if (!token) {
      alert("❌ Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
      isSaving.value = false;
      return;
    }
    
    const payload = {
      ...form.value,
      total_calories: totalCalories.value,
      total_protein: totalProtein.value,
      total_carbs: totalCarbs.value,
      total_fat: totalFat.value
    };

    const url = isEditMode.value ? `http://localhost:5000/api/recipes/${route.params.id}` : 'http://localhost:5000/api/recipes';
    const method = isEditMode.value ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      alert(`🎉 Chúc mừng! Công thức đã được ${isEditMode.value ? 'cập nhật' : 'lưu'} thành công.`);
      // Clear cache để load lại
      recipeStore.clearCache();
      router.push('/recipes');
    } else {
      const errorMsg = data.message || data.msg || "Lỗi không xác định";
      alert("❌ Lỗi: " + errorMsg);
    }
  } catch (err) {
    console.error("Lỗi Save Recipe:", err);
    alert("❌ Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại backend.");
  } finally {
    isSaving.value = false;
  }
};

const findAIVideo = async () => {
  if (!form.value.name) {
    alert('Vui lòng nhập tên món ăn trước!');
    return;
  }

  isSearchingVideo.value = true;
  try {
    const res = await fetch('http://localhost:5000/api/recipes/search-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.value.name })
    });
    const data = await res.json();
    if (data.success && data.video_url) {
      form.value.videoUrl = data.video_url;
      alert('Đã tìm thấy video hướng dẫn tốt nhất!');
    } else {
      alert('Không tìm thấy video phù hợp.');
    }
  } catch (err) {
    console.error('Lỗi tìm video:', err);
    alert('Có lỗi xảy ra khi tìm video.');
  } finally {
    isSearchingVideo.value = false;
  }
};

const handleAISearch = async () => {
  if (!form.value.name) return
  
  isSearchingAI.value = true;
  try {
    const res = await fetch(`http://localhost:5000/api/recipes/search-json?q=${encodeURIComponent(form.value.name)}`);
    const data = await res.json();
    
    if (data && data.length > 0) {
      const bestMatch = data[0];
      
      // 1. Điền thông tin cơ bản
      form.value.name = bestMatch.name;
      if (bestMatch.category) form.value.category = bestMatch.category;
      if (bestMatch.difficulty) form.value.difficulty = bestMatch.difficulty;
      if (bestMatch.cooking_time) form.value.cookingTime = bestMatch.cooking_time;
      if (bestMatch.servings) form.value.servings = bestMatch.servings;
      
      // 2. Map Mục tiêu
      if (bestMatch.goals) {
        const goalMap: Record<string, string> = {
          'giảm cân': 'lose',
          'giữ dáng': 'maintain',
          'tăng cơ': 'gain',
          'keto': 'keto',
          'ăn chay': 'vegetarian',
          'tiểu đường': 'diabetic'
        };
        const newGoals: string[] = [];
        bestMatch.goals.forEach((g: string) => {
          const lowerG = g.toLowerCase();
          Object.entries(goalMap).forEach(([key, value]) => {
            if (lowerG.includes(key)) newGoals.push(value);
          });
        });
        if (newGoals.length > 0) form.value.goals = newGoals;
      }

      // 3. Map Bữa ăn
      if (bestMatch.meal_times) {
        const mealMap: Record<string, string> = {
          'sáng': 'breakfast',
          'trưa': 'lunch',
          'tối': 'dinner',
          'vặt': 'snack',
          'chính': 'lunch'
        };
        const newMeals: string[] = [];
        bestMatch.meal_times.forEach((m: string) => {
          const lowerM = m.toLowerCase();
          Object.entries(mealMap).forEach(([key, value]) => {
            if (lowerM.includes(key)) newMeals.push(value);
          });
        });
        if (newMeals.length > 0) form.value.mealTimes = newMeals;
      }

      // 4. Map Nguyên liệu
      if (bestMatch.ingredients && bestMatch.ingredients.length > 0) {
        form.value.ingredients = bestMatch.ingredients.map((ing: any) => {
          // Tìm xem nguyên liệu này có trong DB của mình chưa để lấy thông tin dinh dưỡng
          const dbMatch = dbIngredients.value.find(db => ing.name.toLowerCase().includes(db.name.toLowerCase()));
          if (dbMatch) {
            return {
              ...dbMatch,
              grams: ing.grams || 100
            };
          }
          // Nếu không có trong DB thì tạo mới tạm thời
          return {
            id: Date.now() + Math.random(),
            name: ing.name,
            grams: ing.grams || 100,
            color: '#6B7280',
            bgColor: '#F3F4F6',
            cal: 0, protein: 0, carb: 0, fat: 0
          };
        });
      }

      // 5. Map Các bước làm
      if (bestMatch.steps && bestMatch.steps.length > 0) {
        form.value.steps = bestMatch.steps;
      } else if (bestMatch.instruction) {
        // Nếu là từ file recipe-add.json (dạng text dài), tách theo dấu chấm hoặc xuống dòng
        form.value.steps = bestMatch.instruction.split(/[.\n]/).filter((s: string) => s.trim().length > 10);
      }

      alert(`AI đã tìm thấy món: ${bestMatch.name}. Dữ liệu đã được tự động điền!`);

      // 6. Tự động tra cứu USDA cho các nguyên liệu lạ (cal = 0)
      form.value.ingredients.forEach(async (ing: any, index: number) => {
        if (ing.cal === 0) {
          try {
            console.log(`Tra cứu USDA cho: ${ing.name}`);
            const usdaRes = await fetch('http://localhost:5000/api/ingredients/lookup-usda', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: ing.name })
            });
            const usdaData = await usdaRes.json();
            
            if (usdaData.success) {
              // Cập nhật giá trị dinh dưỡng vào đúng dòng đó
              form.value.ingredients[index].cal = usdaData.calories;
              form.value.ingredients[index].protein = usdaData.protein;
              form.value.ingredients[index].carb = usdaData.carbs;
              form.value.ingredients[index].fat = usdaData.fat;
              // Thêm tooltip hoặc ghi chú nếu cần
              console.log(`Đã cập nhật dinh dưỡng cho ${ing.name} từ USDA`);
            }
          } catch (usdaErr) {
            console.error(`Lỗi tra cứu USDA cho ${ing.name}:`, usdaErr);
          }
        }
      });

    } else {
      alert('AI không tìm thấy món ăn này trong kho dữ liệu cục bộ.');
    }
  } catch (err) {
    console.error('Lỗi AI Search:', err);
    alert('Có lỗi xảy ra khi kết nối với bộ não AI.');
  } finally {
    isSearchingAI.value = false;
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước ảnh không được vượt quá 5MB!");
      return;
    }
    selectedFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
      form.value.imageUrl = imagePreview.value;
    };
    reader.readAsDataURL(file);
  }
};

const handleUrlInput = () => {
  imagePreview.value = imageUrlInput.value;
  form.value.imageUrl = imageUrlInput.value;
  selectedFile.value = null; 
};

const clearImage = (e: Event) => {
  e.stopPropagation();
  imagePreview.value = null;
  selectedFile.value = null;
  imageUrlInput.value = '';
  form.value.imageUrl = '';
  if (fileInput.value) fileInput.value.value = '';
};


const handleRemoveBg = async () => {
  if (!imagePreview.value) return;
  isRemovingBg.value = true;
  
  try {
    const token = localStorage.getItem('admin_token');
    let urlToProcess = imagePreview.value;

    // Nếu là file base64, upload trước
    if (selectedFile.value) {
      const formData = new FormData();
      formData.append('image', selectedFile.value);
      const uploadRes = await fetch('http://localhost:5000/api/ingredients/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (uploadData.success) {
        urlToProcess = uploadData.image_url;
      }
    }

    const res = await fetch('http://localhost:5000/api/ingredients/remove-bg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ image_url: urlToProcess })
    });
    
    const data = await res.json();
    if (data.success) {
      imagePreview.value = data.image_url;
      form.value.imageUrl = data.image_url;
      selectedFile.value = null;
    } else {
      const errorMsg = data.message || data.msg || "Lỗi không xác định";
      alert("Lỗi tách nền: " + errorMsg);
    }
  } catch (err: any) {
    alert("Lỗi khi kết nối AI tách nền");
  } finally {
    isRemovingBg.value = false;
  }
};


const goalOptions = [
  { id: 'lose', label: 'Giảm cân' },
  { id: 'maintain', label: 'Giữ dáng' },
  { id: 'gain', label: 'Tăng cơ' },
  { id: 'keto', label: 'Keto / Low-carb' },
  { id: 'vegetarian', label: 'Ăn chay' },
  { id: 'diabetic', label: 'Tiểu đường' }
];

const mealOptions = [
  { id: 'breakfast', label: 'Bữa sáng' },
  { id: 'lunch', label: 'Bữa trưa' },
  { id: 'dinner', label: 'Bữa tối' },
  { id: 'snack', label: 'Ăn vặt' }
];

const toggleGoal = (id: string) => {
  const idx = form.value.goals.indexOf(id);
  if (idx > -1) {
    if (form.value.goals.length > 1) form.value.goals.splice(idx, 1);
  } else {
    form.value.goals.push(id);
  }
};

const toggleMealTime = (id: string) => {
  const idx = form.value.mealTimes.indexOf(id);
  if (idx > -1) {
    if (form.value.mealTimes.length > 1) form.value.mealTimes.splice(idx, 1);
  } else {
    form.value.mealTimes.push(id);
  }
};

onMounted(async () => {
  if (route.params.id) {
    isEditMode.value = true;
    const d = await recipeStore.fetchRecipeDetail(route.params.id as string);
    if (d) {
      form.value.name = d.name_vn;
      form.value.category = d.category;
      form.value.difficulty = d.difficulty;
      form.value.cookingTime = d.cooking_time;
      form.value.servings = d.servings;
      form.value.videoUrl = d.video_url;
      
      // Parse JSON fields
      form.value.goals = typeof d.goals === 'string' ? JSON.parse(d.goals) : d.goals;
      form.value.mealTimes = typeof d.meal_times === 'string' ? JSON.parse(d.meal_times) : d.meal_times;
      form.value.steps = typeof d.steps === 'string' ? JSON.parse(d.steps) : d.steps;
      
      const ingredients = typeof d.ingredients === 'string' ? JSON.parse(d.ingredients) : d.ingredients;
      form.value.ingredients = ingredients.map((i: any) => ({
        ...i,
        cal: i.cal || i.calories || 0,
        carb: i.carb || i.carbs || 0
      }));

      if (d.image_url) {
        form.value.imageUrl = d.image_url;
        imageMode.value = 'url';
        imageUrlInput.value = d.image_url;
        imagePreview.value = d.image_url;
      }
    }
  } else if (route.query.name) {
    form.value.name = route.query.name as string;
  }
});

const searchIng = ref('');

// Cơ sở dữ liệu mẫu chứa giá trị dinh dưỡng trên 100g
const dbIngredients = ref([
  { id: 1, name: 'Cà chua', color: '#B91C1C', bgColor: '#FEE2E2', cal: 18, protein: 0.9, carb: 3.9, fat: 0.2 },
  { id: 2, name: 'Thịt bò', color: '#991B1B', bgColor: '#FEE2E2', cal: 250, protein: 26, carb: 0, fat: 15 },
  { id: 3, name: 'Hành tây', color: '#6B21A8', bgColor: '#F3E8FF', cal: 40, protein: 1.1, carb: 9.3, fat: 0.1 },
  { id: 4, name: 'Tỏi', color: '#374151', bgColor: '#F3F4F6', cal: 149, protein: 6.4, carb: 33, fat: 0.5 },
  { id: 5, name: 'Cà rốt', color: '#C2410C', bgColor: '#FFEDD5', cal: 41, protein: 0.9, carb: 9.6, fat: 0.2 },
  { id: 6, name: 'Khoai tây', color: '#A16207', bgColor: '#FEF9C3', cal: 77, protein: 2, carb: 17, fat: 0.1 },
  { id: 7, name: 'Trứng gà', color: '#B45309', bgColor: '#FEF3C7', cal: 155, protein: 13, carb: 1.1, fat: 11 },
  { id: 8, name: 'Bông cải xanh', color: '#15803D', bgColor: '#DCFCE7', cal: 34, protein: 2.8, carb: 6.6, fat: 0.4 },
  { id: 9, name: 'Ức gà', color: '#BE185D', bgColor: '#FCE7F3', cal: 165, protein: 31, carb: 0, fat: 3.6 },
  { id: 10, name: 'Nấm hương', color: '#78350F', bgColor: '#FFEDD5', cal: 34, protein: 2.2, carb: 6.8, fat: 0.5 },
  { id: 11, name: 'Đậu hũ', color: '#047857', bgColor: '#D1FAE5', cal: 76, protein: 8, carb: 1.9, fat: 4.8 },
  { id: 12, name: 'Rau muống', color: '#166534', bgColor: '#DCFCE7', cal: 19, protein: 2.6, carb: 3.1, fat: 0.2 },
  { id: 13, name: 'Cơm trắng', color: '#1A1A1A', bgColor: '#F1F5F9', cal: 130, protein: 2.7, carb: 28, fat: 0.3 }
]);

const filteredAvailable = computed(() => {
  return dbIngredients.value
    .filter(i => i.name.toLowerCase().includes(searchIng.value.toLowerCase()))
    .filter(i => !form.value.ingredients.find(s => s.id === i.id));
});

const goalText = computed(() => {
  const texts = form.value.goals.map(g => {
    const option = goalOptions.find(opt => opt.id === g);
    return option ? option.label : g;
  });
  return 'Mục tiêu: ' + texts.join(', ');
});

// Tính toán lượng Calories dựa vào số gam và "Mục tiêu dinh dưỡng"
const calculateItemCalories = (item: any) => {
  let base = (item.cal * (item.grams || 0)) / 100;
  
  // Nếu có mục tiêu giảm cân trong danh sách, ưu tiên tối ưu giảm 5%
  if (form.value.goals.includes('lose')) base = base * 0.95; 
  else if (form.value.goals.includes('gain')) base = base * 1.05;
  
  return base || 0;
};

const totalCalories = computed(() => {
  return form.value.ingredients.reduce((sum, item) => sum + calculateItemCalories(item), 0);
});

const totalProtein = computed(() => {
  return form.value.ingredients.reduce((sum, item) => sum + ((item.protein * (item.grams || 0)) / 100 || 0), 0);
});

const totalCarbs = computed(() => {
  return form.value.ingredients.reduce((sum, item) => sum + ((item.carb * (item.grams || 0)) / 100 || 0), 0);
});

const totalFat = computed(() => {
  return form.value.ingredients.reduce((sum, item) => sum + ((item.fat * (item.grams || 0)) / 100 || 0), 0);
});

const addIngredient = (ing: any) => {
  // Mặc định thêm vào sẽ là 100g
  form.value.ingredients.push({ ...ing, grams: 100 });
};

const removeIngredient = (index: number) => {
  form.value.ingredients.splice(index, 1);
};

const addStep = () => {
  form.value.steps.push('');
};

const removeStep = (index: number) => {
  form.value.steps.splice(index, 1);
};

const generateAISteps = () => {
  form.value.steps = [
    'Sơ chế nguyên liệu: Rửa sạch thịt bò, thái miếng vừa ăn. Ướp với 1 muỗng canh tỏi băm, 1/2 muỗng cà phê tiêu, 1 muỗng canh nước tương trong 15 phút.',
    'Làm nóng chảo với 1 muỗng canh dầu ăn. Cho thịt bò vào xào nhanh tay trên lửa lớn để thịt không bị dai.',
    'Khi thịt bò chín tái, cho bông cải xanh và cà rốt (đã luộc sơ) vào đảo đều. Nêm nếm lại gia vị cho vừa ăn.',
    'Tắt bếp, trình bày ra đĩa. Trang trí thêm một ít ngò rí và tiêu. Thưởng thức khi còn nóng.'
  ];
};


const youtubeEmbedUrl = computed(() => {
  if (!form.value.videoUrl) return '';
  const match = form.value.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
});
</script>

<style scoped>
.add-recipe-container {
  padding: 30px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.back-btn {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 10px 16px;
  font-family: inherit;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-dark);
  cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #F1F5F9;
  border-color: #CBD5E1;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark);
}

.add-recipe-container {
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Inter', 'Outfit', sans-serif;
  color: #1E293B;
  background: #FDFDFF;
}

.page-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 850;
  color: #0F172A;
  letter-spacing: -1px;
}

/* Card & Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1.8fr 1.2fr;
  gap: 32px;
}

.card-panel {
  background: white;
  border-radius: 24px;
  padding: 32px;
  border: 1px solid #F1F5F9;
  margin-bottom: 32px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.03);
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.card-panel h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #0F172A;
}

/* Unified Label & Input Styling */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-group label {
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 750;
  color: #334155;
  margin-bottom: 2px;
  letter-spacing: -0.2px;
}

.input-group input[type="text"],
.input-group input[type="number"],
.input-group textarea {
  width: 100%;
  padding: 14px 18px;
  background: #F8FAFC;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: #1E293B;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-group input:focus,
.input-group textarea:focus {
  outline: none;
  background: white;
  border-color: #3B82F6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.input-with-action {
  display: flex;
  gap: 12px;
  width: 100%;
}

.btn-ai-search {
  padding: 0 24px;
  background: #F1F5F9;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  font-weight: 700;
  font-size: 14px;
  color: #64748B;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: 0.2s;
}

.btn-ai-search:hover:not(:disabled) {
  border-color: #3B82F6;
  color: #2563EB;
  background: white;
}

/* Modern Pill Design */
.modern-pill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill-tag {
  padding: 6px 14px;
  background: #F1F5F9;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #64748B;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.pill-tag:hover {
  background: #E2E8F0;
  color: #475569;
}

/* Group Themes - Selected Only */
.category-tags .pill-tag.active {
  background: #3B82F6; color: white;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
}

.difficulty-tags .pill-tag.active {
  background: #F59E0B; color: white;
  box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);
}

.goal-tags .pill-tag.active {
  background: #22C55E; color: white;
  box-shadow: 0 4px 10px rgba(34, 197, 94, 0.3);
}

.meal-tags .pill-tag.active {
  background: #A855F7; color: white;
  box-shadow: 0 4px 10px rgba(168, 85, 247, 0.3);
}

/* Integrated AI Search */
.ai-integrated {
  position: relative;
}

.btn-ai-search-minimal {
  position: absolute;
  right: 6px;
  top: 6px;
  bottom: 6px;
  background: #0F172A;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0 15px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: 0.2s;
}

.btn-ai-search-minimal:hover:not(:disabled) {
  background: #334155;
  transform: scale(1.02);
}

.btn-ai-search-minimal:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-group label i {
  color: #94A3B8;
  margin-right: 6px;
  font-size: 14px;
}

.row-group, .row-group-three {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}


.input-group input:focus, .input-group select:focus {
  outline: none;
  border-color: #8EAE82;
  background: white;
  box-shadow: 0 0 0 3px rgba(142, 174, 130, 0.15);
}

/* Ingredients */
.search-box {
  background: white;
  border: 1px solid #CBD5E1;
  border-radius: 12px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.search-box input { border: none; outline: none; width: 100%; font-family: inherit; }
.search-box i { color: #94A3B8; }

.tags-container {
  display: flex; flex-wrap: wrap; gap: 10px;
  margin-bottom: 24px;
}
.ingredient-tag {
  padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 6px; transition: all 0.2s; border: 1px solid transparent;
}
.ingredient-tag:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.08); }
.ingredient-tag i { font-size: 11px; opacity: 0.6; }

/* Table */
.ingredients-table table {
  width: 100%;
  border-collapse: collapse;
}
.ingredients-table th {
  text-align: left;
  padding: 12px;
  font-size: 13px;
  color: var(--text-muted);
  border-bottom: 1px solid #E2E8F0;
  font-weight: 600;
  white-space: nowrap;
}
.ingredients-table td {
  padding: 12px;
  border-bottom: 1px solid #F1F5F9;
  vertical-align: middle;
}
.ing-name-cell {
  display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--text-dark); font-size: 14px;
}
.color-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.gram-wrapper { display: flex; align-items: center; gap: 8px; }
.input-with-action {
  display: flex;
  gap: 10px;
}
.input-with-action input {
  flex: 1;
}
.btn-ai-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #6366F1 0%, #A855F7 100%);
  color: white;
  border: none;
  padding: 0 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}
.btn-ai-search:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
  filter: brightness(1.1);
}
.btn-ai-search:disabled {
  background: #E2E8F0;
  color: #94A3B8;
  cursor: not-allowed;
}
.btn-ai-search i {
  font-size: 14px;
}
@keyframes pulse-ai {
  0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(168, 85, 247, 0); }
  100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
}
.btn-ai-search:not(:disabled) {
  animation: pulse-ai 2s infinite;
}
.premium-input {
  /* Giữ nguyên style cũ của input */
}
.gram-input {
  width: 70px; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-family: inherit; font-weight: 600; text-align: center;
}
.gram-input:focus { outline: none; border-color: #8EAE82; }
.cal-value {
  font-weight: 700; color: #F59E0B; background: #FFFBEB; padding: 6px 12px; border-radius: 8px; display: inline-block;
}
.remove-btn {
  background: none; border: none; color: #EF4444; cursor: pointer; padding: 6px; border-radius: 8px; transition: 0.2s;
}
.remove-btn:hover { background: #FEE2E2; }
.empty-state { text-align: center; padding: 40px; color: var(--text-muted); font-size: 14px; background: #F8FAFC; border-radius: 12px; border: 2px dashed #E2E8F0; }

/* Steps */
.steps-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.steps-header h3 { margin: 0; }
.ai-generate-btn {
  background: linear-gradient(to right, #8EAE82, #4a8c54); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; box-shadow: 0 4px 10px rgba(74, 140, 84, 0.2); transition: 0.2s;
}
.ai-generate-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(74, 140, 84, 0.3); }

.video-section { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #E2E8F0; }
.video-section label { display: block; font-size: 14px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px; }
.video-input-group { display: flex; gap: 10px; margin-bottom: 16px; }
.video-input-group input { flex: 1; padding: 12px 16px; border: 1px solid #CBD5E1; border-radius: 12px; font-family: inherit; font-size: 14px; background: #F8FAFC; }
.video-input-group input:focus { outline: none; border-color: #8EAE82; background: white; }
.ai-search-video { background: white; border: 1px solid #8EAE82; color: #4a8c54; padding: 0 16px; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
.ai-search-video:hover { background: #E6EFE5; }

.video-preview {
  border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border: 1px solid #E2E8F0; background: black;
}

.steps-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
.step-item { display: flex; gap: 16px; align-items: flex-start; }
.step-num { width: 32px; height: 32px; background: #E6EFE5; color: #1A2F23; font-weight: 700; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.step-item textarea { flex: 1; height: 80px; padding: 12px 16px; border: 1px solid #CBD5E1; border-radius: 12px; font-family: inherit; resize: none; line-height: 1.5; }
.step-item textarea:focus { outline: none; border-color: #8EAE82; }
.remove-step { background: none; border: none; color: #94A3B8; font-size: 16px; cursor: pointer; padding: 8px; }
.remove-step:hover { color: #EF4444; }
.add-step-btn { background: white; border: 1px dashed #8EAE82; color: #4a8c54; padding: 12px; border-radius: 12px; font-weight: 600; cursor: pointer; width: 100%; transition: 0.2s; }
.add-step-btn:hover { background: #E6EFE5; }

.panel-header-inline {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
}
.panel-header-inline h3 { margin: 0; }

.image-toggle {
  display: flex; background: #F1F5F9; border-radius: 8px; padding: 4px;
}
.image-toggle button {
  border: none; background: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; color: #64748B; transition: 0.2s;
}
.image-toggle button.active {
  background: white; color: #8EAE82; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.url-input-container {
  display: flex; flex-direction: column; gap: 16px;
}
.url-preview-box {
  width: 100%; height: 200px; border-radius: 16px; overflow: hidden; position: relative; border: 1px solid #E2E8F0;
}
.remove-preview-btn {
  position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,0.9); border: none; color: #EF4444; cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.url-empty-preview {
  height: 200px; border: 2px dashed #E2E8F0; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94A3B8; gap: 12px; background: #F8FAFC;
}
.url-empty-preview i { font-size: 32px; }
.url-empty-preview p { margin: 0; font-size: 14px; }
.upload-area {
  border: 2px dashed #E2E8F0;
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #F8FAFC;
  position: relative;
  overflow: hidden;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #8EAE82;
  background: #F0F9FF;
}

.upload-area i {
  font-size: 32px;
  color: #94A3B8;
  margin-bottom: 12px;
}

.upload-area p {
  margin: 0;
  font-size: 14px;
  color: #64748B;
}

.upload-area p span {
  color: #3B82F6;
  font-weight: 600;
}

.upload-area small {
  display: block;
  margin-top: 8px;
  color: #94A3B8;
  font-size: 12px;
}

.upload-area.has-preview {
  padding: 0;
  border-style: solid;
}

.img-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.upload-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: white;
  opacity: 0;
  transition: opacity 0.2s;
}

.upload-area:hover .upload-overlay {
  opacity: 1;
}

.upload-overlay i {
  color: white;
  margin: 0;
}

.remove-img-btn {
  position: absolute;
  top: 10px; right: 10px;
  width: 30px; height: 30px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  border: none;
  color: #EF4444;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.ai-remove-bg-btn {
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #DDD6FE;
  background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%);
  color: #5B21B6;
  font-weight: 600;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.2s;
}

.ai-remove-bg-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
}

.ai-remove-bg-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.goal-badge {
  display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 700; margin-bottom: 24px;
}
.goal-badge.lose { background: #DCFCE7; color: #166534; }
.goal-badge.maintain { background: #FEF3C7; color: #92400E; }
.goal-badge.gain { background: #FEE2E2; color: #991B1B; }

.nutrition-fact {
  display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;
}
.fact-row {
  display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #F1F5F9; font-size: 14px;
}
.fact-row:last-child { border-bottom: none; padding-bottom: 0; }
.fact-row span { color: var(--text-muted); }
.fact-row strong { color: var(--text-dark); font-weight: 700; }
.fact-row.main { font-size: 16px; }
.fact-row.main strong { color: #F59E0B; font-size: 20px; }

.ai-insight {
  background: linear-gradient(145deg, #F3F7F2, #E6EFE5); border: 1px solid #8EAE82; border-radius: 12px; padding: 16px; display: flex; gap: 12px; color: #1A2F23; font-size: 13px; line-height: 1.5;
}
.ai-insight i { color: #f4c553; font-size: 16px; margin-top: 2px; flex-shrink: 0; }
.ai-insight p { margin: 0; }

.save-btn {
  width: 100%; background: var(--primary-yellow, #f4c553); color: #1A1A1A; border: none; padding: 16px; border-radius: 16px; font-weight: 700; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 15px rgba(244, 197, 83, 0.3); transition: 0.2s;
}
.save-btn:hover { background: var(--yellow-hover, #e0b240); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(244, 197, 83, 0.4); }
</style>
