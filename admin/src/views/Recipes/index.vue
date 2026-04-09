<template>
  <div class="recipes-container">
    <div class="header">
      <h1>Quản lý Công thức nấu ăn</h1>
      <p>Kiểm tra và chỉnh sửa thông số dinh dưỡng của các món ăn trong hệ thống.</p>
    </div>

    <div class="menu-grid">
      <div v-for="item in menuData" :key="item.id" class="menu-card">
        <img :src="item.image" :alt="item.title" class="food-img">
        
        <div class="ai-badge" title="Độ chính xác AI">
          {{ item.aiMatch }} <i class="fa-solid fa-check-circle"></i>
        </div>

        <i class="fa-solid fa-heart heart-btn"></i>
        
        <div class="info-container">
          <div class="food-title" :title="item.title">{{ item.title }}</div>
          
          <div class="food-macro">
            <span title="Protein">P: {{ item.protein }}</span>
            <span title="Carbs">C: {{ item.carbs }}</span>
            <span title="Fat">F: {{ item.fat }}</span>
          </div>
        </div>
        
        <div class="card-footer">
          <button class="edit-btn">
            <i class="fa-solid fa-pen"></i> Sửa
          </button>
          <div class="calories">{{ item.calories }} <span>Kcal</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const menuData = ref([
  {
    id: '1',
    title: 'Salad Quinoa Ức Gà',
    protein: '35g',
    carbs: '45g',
    fat: '12g',
    calories: '420',
    aiMatch: '98%',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '2',
    title: 'Mì Ý Sốt Cà Gà Viên',
    protein: '28g',
    carbs: '65g',
    fat: '15g',
    calories: '510',
    aiMatch: '95%',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '3',
    title: 'Tôm Xào Bông Cải',
    protein: '22g',
    carbs: '15g',
    fat: '8g',
    calories: '250',
    aiMatch: '92%',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '4',
    title: 'Gà Nướng Chanh Thảo Mộc',
    protein: '45g',
    carbs: '5g',
    fat: '18g',
    calories: '360',
    aiMatch: '99%',
    image: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  }
]);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&display=swap');

.recipes-container {
  padding: 20px 10px;
  font-family: 'Montserrat', sans-serif;
}

.header {
  margin-bottom: 90px;
  text-align: center;
}

.header h1 {
  font-size: 28px;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.header p {
  font-size: 15px;
  color: #718096;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  column-gap: 30px;
  row-gap: 100px;
  padding-top: 20px;
}

.menu-card {
  background-color: #ffffff;
  border-radius: 32px;
  border: 2px solid #8EAE82;
  padding: 85px 24px 24px 24px;
  box-shadow: 0 12px 35px rgba(142, 174, 130, 0.1);
  position: relative;
  transition: all 0.3s ease;
}

.menu-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(142, 174, 130, 0.2);
}

.food-img {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  position: absolute;
  top: -70px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 15px 25px -5px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
  border: 4px solid #ffffff;
}

.menu-card:hover .food-img {
  transform: translateX(-50%) scale(1.05) rotate(5deg);
}

.ai-badge {
  position: absolute;
  top: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  color: #166534;
}

.ai-badge i {
  color: #22c55e;
  margin-left: 4px;
}

.heart-btn {
  color: #cbd5e1;
  font-size: 22px;
  cursor: pointer;
  margin-bottom: 12px;
  display: inline-block;
  transition: color 0.2s;
}

.heart-btn:hover {
  color: #ff4d4f;
}

.info-container {
  text-align: left;
  margin-bottom: 24px;
}

.food-title {
  font-size: 18px;
  font-weight: 800;
  color: #333d4e;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.food-macro {
  font-size: 12px;
  font-weight: 600;
  color: #718096;
  display: flex;
  gap: 8px;
}

.food-macro span {
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 6px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-btn {
  background-color: #E8CA72;
  color: #333;
  border: none;
  border-radius: 14px;
  display: flex;
  align-items: center;
  padding: 10px 16px;
  font-weight: 700;
  font-size: 13px;
  font-family: inherit;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(232, 202, 114, 0.3);
  transition: all 0.2s;
}

.edit-btn:hover {
  background-color: #d6b75c;
  transform: translateY(-2px);
}

.calories {
  font-size: 22px;
  font-weight: 800;
  color: #e53e3e;
}

.calories span {
  font-size: 13px;
  color: #718096;
  font-weight: 600;
}
</style>
