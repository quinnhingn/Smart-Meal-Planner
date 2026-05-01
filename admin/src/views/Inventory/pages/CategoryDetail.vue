<template>
  <div class="cat-container">
    <!-- Header -->
    <div class="page-header">
      <button class="back-btn" @click="router.back()">
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <div>
        <h1>{{ categoryTitle }}</h1>
        <p class="header-desc">Danh sách nguyên liệu và thông số dinh dưỡng trong danh mục này.</p>
      </div>
      <button class="add-btn" @click="router.push({ name: 'ingredient-add' })">
        <i class="fa-solid fa-plus"></i> Thêm nguyên liệu
      </button>
    </div>

    <!-- Search + Filter -->
    <div class="toolbar">
      <div class="search-box">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" placeholder="Tìm kiếm nguyên liệu..." v-model="searchQuery">
      </div>
      <div class="filter-tags">
        <span class="ftag" 
          v-for="f in categoryFilters" 
          :key="f.id"
          :class="{ active: activeFilter === f.id }" 
          @click="activeFilter = f.id"
        >
          {{ f.label }}
        </span>
      </div>
    </div>

    <!-- Grid -->
    <div class="ing-grid">
      <div
        class="ing-card"
        v-for="item in filteredItems"
        :key="item.id"
        @click="goToDetail(item.id)"
      >
        <!-- Coloured top with overflowing image -->
        <div class="card-top" :style="{ background: item.cardColor }">
          <div class="card-img-wrap">
            <img :src="item.image" :alt="item.name" class="card-img">
          </div>
          <div class="card-badges">
            <span class="cbadge" v-if="item.protein >= 20">
              <i class="fa-solid fa-dumbbell"></i> Giàu Protein
            </span>
            <span class="cbadge" v-if="item.carbs < 10">
              <i class="fa-solid fa-leaf"></i> Low-Carb
            </span>
            <span class="cbadge" v-if="item.calories < 100">
              <i class="fa-solid fa-fire"></i> Ít Cal
            </span>
          </div>
        </div>

        <!-- White info bottom -->
        <div class="card-bottom">
          <div class="cb-header">
            <div>
              <h4 class="ing-name">{{ item.name }}</h4>
              <span class="ing-en">{{ item.nameEn }}</span>
            </div>
            <div class="completeness-badge">
              <span class="dot-g"></span> {{ item.completeness }}%
            </div>
          </div>

          <div class="macro-row">
            <div class="macro-chip cal"><i class="fa-solid fa-fire"></i> {{ item.calories }}</div>
            <div class="macro-chip prot">P {{ item.protein }}g</div>
            <div class="macro-chip carb">C {{ item.carbs }}g</div>
            <div class="macro-chip fat">F {{ item.fat }}g</div>
          </div>

          <div class="suit-row">
            <span class="suit-tag" v-for="s in item.suitability" :key="s">{{ suitLabel(s) }}</span>
          </div>

          <button class="view-btn">
            <i class="fa-solid fa-eye"></i> Xem chi tiết
          </button>
        </div>
      </div>
    </div>

    <div class="empty-state" v-if="filteredItems.length === 0">
      <i class="fa-solid fa-magnifying-glass" style="font-size:32px; color:#CBD5E1; margin-bottom:12px; display:block"></i>
      Không tìm thấy nguyên liệu phù hợp.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import meatImg from '@/stores/image/image.png';
import meatImg2 from '@/stores/image/image2.png';
import meatImg3 from '@/stores/image/image3.png';

const route = useRoute();
const router = useRouter();
const searchQuery = ref('');
const activeFilter = ref('all');

const categoryTitle = computed(() => {
  const titles: Record<string, string> = {
    meat: 'Thịt & Hải sản', vegetables: 'Rau củ quả',
    milks: 'Sữa & Trứng', grains: 'Ngũ cốc & Tinh bột',
    fruits: 'Trái cây', spices: 'Gia vị & Dầu ăn'
  };
  return titles[route.params.id as string] || 'Danh mục nguyên liệu';
});

const categoryFilters = computed(() => {
  const catId = route.params.id as string;
  if (catId === 'meat') {
    return [
      { id: 'all', label: 'Tất cả' },
      { id: 'red-meat', label: 'Thịt đỏ' },
      { id: 'white-meat', label: 'Gia cầm' },
      { id: 'seafood', label: 'Hải sản' },
      { id: 'fish', label: 'Các loại cá' }
    ];
  }
  if (catId === 'vegetables') {
    return [
      { id: 'all', label: 'Tất cả' },
      { id: 'leafy', label: 'Rau xanh' },
      { id: 'root', label: 'Củ' },
      { id: 'fruit-veg', label: 'Quả' },
      { id: 'mushroom', label: 'Nấm' }
    ];
  }
  return [
    { id: 'all', label: 'Tất cả' },
    { id: 'lose', label: 'Giảm cân' },
    { id: 'gain', label: 'Tăng cơ' },
    { id: 'keto', label: 'Keto' }
  ];
});

const ingredients = ref<any[]>([
  { id: 'uc-ga', name: 'Ức gà (Mock)', nameEn: 'Chicken Breast', type: 'white-meat', calories: 165, protein: 31, carbs: 0, fat: 3.6, completeness: 98, suitability: ['gain', 'lose', 'keto'], image: meatImg, cardColor: '#2D4A35' },
  { id: 'thit-bo', name: 'Thịt bò (Mock)', nameEn: 'Beef', type: 'red-meat', calories: 250, protein: 26, carbs: 0, fat: 15, completeness: 95, suitability: ['gain'], image: meatImg2, cardColor: '#7A3535' },
]);

onMounted(async () => {
  try {
    const token = localStorage.getItem('admin_token');
    const res = await fetch('http://localhost:5000/api/ingredients', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    
    if (data.success && data.data) {
      // Map API data to the UI format
      const apiItems = data.data.map((item: any) => ({
        id: String(item.id),
        name: item.name_vn,
        nameEn: item.name_en || '',
        type: item.category || 'other',
        calories: item.calories_per_100g,
        protein: item.protein_per_100g,
        carbs: item.carbs_per_100g,
        fat: item.fat_per_100g,
        completeness: 100, // Data xịn từ DB là 100%
        suitability: [], // Chưa có mapping suitability thật
        image: item.image_url || meatImg3, // Hình fallback
        cardColor: '#4A3D7A' // Màu nền random/fallback
      }));
      
      // Merge mock data và data thật từ DB
      ingredients.value = [...ingredients.value, ...apiItems];
    }
  } catch (err) {
    console.error('Lỗi khi fetch danh sách nguyên liệu:', err);
  }
});

const filteredItems = computed(() => {
  let list = ingredients.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(i => i.name.toLowerCase().includes(q) || i.nameEn.toLowerCase().includes(q));
  }
  if (activeFilter.value !== 'all') {
    // Check if filter is by type or suitability
    list = list.filter(i => {
      const isType = ['red-meat', 'white-meat', 'seafood', 'fish', 'leafy', 'root', 'fruit-veg', 'mushroom'].includes(activeFilter.value);
      if (isType) return i.type === activeFilter.value;
      return i.suitability.includes(activeFilter.value);
    });
  }
  return list;
});

const suitLabel = (s: string) => ({ lose: 'Giảm cân', gain: 'Tăng cơ', keto: 'Keto', maintain: 'Giữ dáng', diabetic: 'Tiểu đường', vegetarian: 'Chay', kids: 'Trẻ em' }[s] || s);

const goToDetail = (ingredientId: string) => {
  router.push({ name: 'ingredient-detail', params: { id: route.params.id, ingredientId } });
};
</script>

<style scoped>
.cat-container { padding: 30px; }

.page-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 28px; }
.page-header h1 { margin: 0 0 4px 0; font-size: 24px; font-weight: 800; color: var(--text-dark); }
.header-desc { margin: 0; font-size: 14px; color: var(--text-muted); }
.back-btn {
  width: 40px; height: 40px; background: white; border: 1px solid #E2E8F0; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  flex-shrink: 0; transition: 0.2s; color: var(--text-dark);
}
.back-btn:hover { background: #F8FAFC; border-color: #CBD5E1; }
.add-btn {
  margin-left: auto; background: var(--primary-yellow, #f4c553); color: #1A1A1A;
  border: none; padding: 12px 20px; border-radius: 14px; font-weight: 700;
  font-size: 14px; font-family: inherit; cursor: pointer; display: flex;
  align-items: center; gap: 8px; white-space: nowrap;
  box-shadow: 0 4px 12px rgba(244,197,83,0.3); transition: 0.2s;
}
.add-btn:hover { transform: translateY(-2px); }

/* Toolbar */
.toolbar { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
.search-box {
  background: white; border: 1px solid #E2E8F0; border-radius: 14px;
  padding: 10px 16px; display: flex; align-items: center; gap: 10px; flex: 1; max-width: 400px;
}
.search-box input { border: none; outline: none; font-family: inherit; font-size: 14px; width: 100%; }
.search-box i { color: #94A3B8; }
.filter-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.ftag {
  padding: 8px 16px; border-radius: 20px; border: 1px solid #E2E8F0;
  background: white; font-size: 13px; font-weight: 600; color: var(--text-muted);
  cursor: pointer; transition: 0.2s;
}
.ftag:hover { border-color: #8EAE82; color: #4a8c54; }
.ftag.active { background: #E6EFE5; border-color: #8EAE82; color: #1A2F23; }

/* Grid */
.ing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
  padding-top: 20px;
}

.ing-card {
  background: white;
  border: 2px solid #E2E8F0;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: 0.25s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.04);
}
.ing-card:hover {
  border-color: #8EAE82;
  transform: translateY(-6px);
  box-shadow: 0 18px 40px rgba(142,174,130,0.18);
}

/* Coloured top */
.card-top {
  position: relative;
  height: 160px;
  display: flex;
  align-items: flex-end;
  padding: 14px;
  overflow: hidden;
}
.card-img-wrap {
  position: absolute;
  top: -20px; right: -10px;
  width: 190px; height: 190px;
  pointer-events: none;
}
.card-img {
  width: 100%; height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 12px 24px rgba(0,0,0,0.4));
  transition: transform 0.35s ease;
}
.ing-card:hover .card-img {
  transform: scale(1.07) translateY(-6px);
}
.card-badges {
  display: flex; flex-direction: column; gap: 5px; z-index: 1;
}
.cbadge {
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.3);
  color: white; font-size: 11px; font-weight: 700;
  padding: 4px 10px; border-radius: 20px;
  display: flex; align-items: center; gap: 5px;
}

/* White bottom */
.card-bottom {
  padding: 18px 20px 20px;
  background: white;
}
.cb-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 12px;
}
.ing-name { margin: 0 0 2px 0; font-size: 16px; font-weight: 800; color: var(--text-dark); }
.ing-en { font-size: 12px; color: var(--text-muted); }
.completeness-badge {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 700; color: #166534;
  background: #DCFCE7; padding: 4px 10px; border-radius: 20px; white-space: nowrap;
}

.macro-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.macro-chip {
  font-size: 12px; font-weight: 700; padding: 5px 10px; border-radius: 8px;
  display: flex; align-items: center; gap: 4px;
}
.macro-chip.cal { background: #FFFBEB; color: #D97706; }
.macro-chip.prot { background: #EFF6FF; color: #1D4ED8; }
.macro-chip.carb { background: #F0FDF4; color: #166534; }
.macro-chip.fat { background: #FEF2F2; color: #DC2626; }

.suit-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
.suit-tag {
  font-size: 11px; font-weight: 600; padding: 3px 10px;
  border-radius: 20px; background: #F1F5F9; color: var(--text-muted);
}

.view-btn {
  width: 100%; background: white; border: 1.5px solid #E2E8F0;
  padding: 10px; border-radius: 12px; font-size: 13px; font-weight: 700;
  cursor: pointer; color: var(--text-dark); display: flex; align-items: center;
  justify-content: center; gap: 8px; transition: 0.2s; font-family: inherit;
}
.view-btn:hover { border-color: #8EAE82; color: #4a8c54; background: #F0FDF4; }

.ing-body { padding: 18px 20px; }
.ing-top { margin-bottom: 12px; }
.ing-name { margin: 0 0 2px 0; font-size: 17px; font-weight: 800; color: var(--text-dark); }
.ing-en { font-size: 13px; color: var(--text-muted); }

.macro-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.macro-chip {
  font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 8px;
  display: flex; align-items: center; gap: 4px;
}

.suitability-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
.suit-tag {
  font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px;
  background: #F1F5F9; color: var(--text-muted);
}

.ing-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F1F5F9; padding-top: 12px; }
.completeness { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; font-weight: 600; }
.dot-g { width: 8px; height: 8px; border-radius: 50%; background: #22C55E; flex-shrink: 0; }
.view-btn {
  background: white; border: 1px solid #CBD5E1; padding: 7px 14px; border-radius: 10px;
  font-size: 13px; font-weight: 600; cursor: pointer; color: var(--text-dark);
  display: flex; align-items: center; gap: 6px; transition: 0.2s;
}
.view-btn:hover { border-color: #8EAE82; color: #4a8c54; }

.empty-state { text-align: center; padding: 60px; color: var(--text-muted); font-size: 14px; }
</style>
