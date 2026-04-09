<template>
  <div class="category-detail-container">
    <div class="header-section">
      <div class="back-btn" @click="goBack">
        <i class="fa-solid fa-arrow-left"></i>
      </div>
      <div class="header-content">
        <h1 class="category-title">{{ categoryTitle }}</h1>
        <p class="subtitle">Khám phá các loại nguyên liệu thượng hạng</p>
      </div>
    </div>

    <!-- Grouped Sections -->
    <div v-for="group in itemGroups" :key="group.title" class="sticker-section">
      <div class="section-header">
         <h2 class="group-title">{{ group.title }}</h2>
         <span class="item-count">{{ group.items.length }} sản phẩm</span>
      </div>
      
      <div class="scroll-wrapper">
        <div v-for="(item, index) in group.items" :key="index" class="sticker-card" :style="{ '--accent-color': item.color }">
          <div class="image-orb-wrapper">
            <img :src="item.image" :alt="item.name" class="image-orb shadow-pulse">
            <button class="orbit-add-btn" @click.stop="addItem(item)">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
          
          <div class="card-body">
            <div class="glass-content">
              <h3 class="item-name">{{ item.name }}</h3>
              <div class="divider"></div>
              <div class="card-footer">
                <div class="price-tag">
                  <span class="amount">{{ item.calories }}</span>
                  <span class="unit">Kcal</span>
                </div>
                <div class="stock-badge" :class="item.stockLevel">
                  {{ item.stock }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Action Button -->
    <button class="fab-add">
      <i class="fa-solid fa-plus"></i>
      <span>Thêm mặt hàng</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const id = computed(() => route.params.id as string);

const categoryTitle = computed(() => {
  const titles: Record<string, string> = {
    meat: 'Nhóm Thực phẩm tươi',
    vegetables: 'Rau củ hữu cơ',
    milks: 'Sữa & Bơ',
    grains: 'Ngũ cốc',
    fruits: 'Trái cây',
    spices: 'Gia vị'
  };
  return titles[id.value] || 'Chi tiết danh mục';
});

// Structured data for grouped display
const itemGroups = ref([
  {
    title: 'Thịt heo Iberico',
    items: [
      { name: 'Thịt cổ heo', calories: '240', stock: '15kg', stockLevel: 'high', color: '#ff7e5f', image: 'https://gofood.vn/upload/r/san-pham/thit-heo-iberico/thit-co-heo-1.jpg' },
      { name: 'Dẻ sườn heo', calories: '310', stock: '8kg', stockLevel: 'mid', color: '#feb47b', image: 'https://gofood.vn/upload/r/san-pham/thit-heo-iberico/thit-co-heo-1.jpg' },
      { name: 'Thịt thăn heo', calories: '180', stock: '2kg', stockLevel: 'low', color: '#ff4b2b', image: 'https://gofood.vn/upload/r/san-pham/thit-heo-iberico/thit-co-heo-1.jpg' },
      { name: 'Mỡ heo Iberico', calories: '850', stock: '25kg', stockLevel: 'high', color: '#6a11cb', image: 'https://gofood.vn/upload/r/san-pham/thit-heo-iberico/thit-co-heo-1.jpg' }
    ]
  },
  {
    title: 'Thịt cừu Úc (Premium)',
    items: [
      { name: 'Sườn cừu có xương', calories: '280', stock: '5kg', stockLevel: 'mid', color: '#8EAE82', image: 'https://gofood.vn/upload/r/san-pham/thit-cuu-uc/suon-cuu-cat-kieu-phap.jpg' },
      { name: 'Đùi cừu rút xương', calories: '210', stock: '12kg', stockLevel: 'high', color: '#1890ff', image: 'https://gofood.vn/upload/r/san-pham/thit-cuu-uc/suon-cuu-cat-kieu-phap.jpg' },
      { name: 'Thịt vai cừu', calories: '230', stock: '3kg', stockLevel: 'low', color: '#f4c553', image: 'https://gofood.vn/upload/r/san-pham/thit-cuu-uc/suon-cuu-cat-kieu-phap.jpg' }
    ]
  }
]);

const goBack = () => {
  router.back();
};

const addItem = (item: any) => {
  console.log('Adding item:', item.name);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');

.category-detail-container {
  padding: 10px;
  font-family: 'Outfit', sans-serif;
  min-height: 80vh;
}

.header-section {
  display: flex;
  align-items: center;
  gap: 25px;
  margin-bottom: 40px;
}

.back-btn {
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-green);
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(74, 140, 84, 0.1);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.back-btn:hover {
  transform: scale(1.1) rotate(-10deg);
  background: var(--primary-green);
  color: white;
}

.category-title {
  font-size: 36px;
  font-weight: 800;
  color: var(--text-dark);
  letter-spacing: -1px;
}

.subtitle {
  color: var(--text-muted);
  font-size: 16px;
}

/* Grouped Sections */
.sticker-section {
  margin-bottom: 60px;
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 15px;
  margin-bottom: 20px;
  padding-left: 20px;
}

.group-title {
  font-size: 24px;
  font-weight: 800;
  color: #000000;
  position: relative;
}

.group-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 30px;
  height: 4px;
  background: var(--primary-green);
  border-radius: 2px;
}

.item-count {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 600;
}

/* Sticker Cards */
.scroll-wrapper {
  display: flex;
  gap: 40px;
  overflow-x: auto;
  padding: 80px 20px 40px;
  scrollbar-width: none;
}

.scroll-wrapper::-webkit-scrollbar {
  display: none;
}

.sticker-card {
  min-width: 260px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.sticker-card:hover {
  transform: translateY(-15px) rotate(2deg);
}

.image-orb-wrapper {
  position: absolute;
  top: -65px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  width: 180px;
  height: 180px;
}

.image-orb {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  transition: all 0.4s ease;
}

.sticker-card:hover .image-orb {
  transform: scale(1.1);
}

/* Orbit Button */
.orbit-add-btn {
  position: absolute;
  bottom: 10px;
  right: 15px;
  width: 50px;
  height: 50px;
  background: var(--primary-yellow);
  color: #333;
  border: 4px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 11;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.orbit-add-btn:hover {
  transform: scale(1.2) rotate(90deg);
  background: var(--primary-green);
}

/* Card Body */
.card-body {
  background: white;
  border-radius: 50px;
  padding: 130px 25px 35px;
  height: 100%;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.05);
  border: 2px dashed var(--primary-green);
  position: relative;
  overflow: hidden;
}

/* Mesh Gradient Shadow Effect */
.sticker-card::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 10%;
  width: 80%;
  height: 40px;
  background: var(--accent-color);
  filter: blur(40px);
  opacity: 0.15;
  z-index: -1;
  transition: opacity 0.3s ease;
}

.sticker-card:hover::after {
  opacity: 0.5;
}

.item-name {
  font-size: 20px;
  font-weight: 800;
  text-align: center;
  color: var(--text-dark);
  margin-bottom: 15px;
}

.divider {
  width: 40px;
  height: 4px;
  background: var(--accent-color);
  margin: 0 auto 20px;
  border-radius: 10px;
  opacity: 0.3;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-tag {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.unit {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  margin-left: 4px;
}

.amount {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-dark);
}

.stock-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 800;
  background: #f0f2f5;
}

.stock-badge.high { color: var(--primary-green); background: #f0f7f1; }
.stock-badge.mid { color: #f4c553; background: #fffdf5; }
.stock-badge.low { color: #ff4d4f; background: #fff5f5; }

/* FAB */
.fab-add {
  position: fixed;
  bottom: 40px;
  right: 40px;
  padding: 18px 28px;
  background: black;
  color: white;
  border: none;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: inherit;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  z-index: 100;
}

.fab-add:hover {
  transform: translateY(-5px) scale(1.02);
  background: var(--primary-green);
}
</style>
