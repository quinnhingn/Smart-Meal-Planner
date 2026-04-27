<template>
  <aside class="sidebar">
    <div class="logo">
      <div class="logo-icon">
        <i class="fa-solid fa-leaf"></i>
      </div>
      <span class="logo-text">Admin Panel</span>
    </div>

    <ul class="nav-menu">
      <li 
        v-for="(item, index) in menuItems" 
        :key="index"
        class="nav-item"
        :class="{ active: activeIndex === index }"
        @click="setActive(item.name)"
      >
        <a href="#" class="nav-link" @click.prevent>
          <i :class="item.icon"></i>
          <span>{{ item.title }}</span>
        </a>
      </li>
    </ul>

    <div class="promo-card">
      <div class="promo-illustration">
        <i class="fa-solid fa-book-open"></i>
        <div class="discount-tag">
          <i class="fa-solid fa-bolt"></i> Mới
        </div>
      </div>
      <p>Khám phá tài liệu hướng dẫn tích hợp API phiên bản 2.0</p>
      <button class="upgrade-btn">Xem tài liệu</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const menuItems = [
  { title: 'Trang tổng quan', icon: 'fa-solid fa-chart-line', name: 'dashboard' },
  { title: 'Quản lý kho nguyên liệu', icon: 'fa-solid fa-boxes-stacked', name: 'inventory' },
  { title: 'Quản lý công thức', icon: 'fa-solid fa-flask', name: 'recipes' },
  { title: 'Quản lý người dùng', icon: 'fa-solid fa-users', name: 'users' },
  { title: 'Tiềm năng & Chiến lược', icon: 'fa-solid fa-lightbulb', name: 'market-insights' },
  { title: 'Quản lý API & Models', icon: 'fa-solid fa-cubes', name: 'api-models' },
  { title: 'Quản lý gói đăng ký', icon: 'fa-solid fa-crown', name: 'subscriptions' },
];

const activeIndex = computed(() => {
  return menuItems.findIndex(item => item.name === route.name);
});

const setActive = (name: string) => {
  router.push({ name });
};
</script>

<style scoped>
.sidebar {
  width: 320px;
  height: 100%;
  background-color: var(--sidebar-bg);
  border-radius: 30px;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(74, 140, 84, 0.08);
  border: 1px solid var(--primary-green);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(74, 140, 84, 0.15);
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 0 10px;
  margin-bottom: 40px;
}

.logo-icon {
  background-color: var(--primary-yellow);
  color: #ffffff;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  font-size: 20px;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-dark);
}

.nav-menu {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.nav-item {
  border-radius: 15px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 15px;
  text-decoration: none;
  color: var(--text-dark);
  padding: 15px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 15px;
  transition: all 0.3s ease;
}

.nav-link i {
  font-size: 18px;
  color: var(--text-muted);
  width: 24px;
  text-align: center;
  transition: all 0.3s ease;
}

.nav-item:hover .nav-link {
  background-color: var(--nav-hover-bg);
  color: var(--primary-green);
}

.nav-item:hover .nav-link i {
  color: var(--primary-green);
}

.nav-item.active {
  background-color: var(--nav-active-bg);
  box-shadow: 0 4px 15px rgba(244, 197, 83, 0.15);
}

.nav-item.active .nav-link {
  color: var(--primary-green);
  font-weight: 600;
}

.promo-card {
  background-color: var(--promo-bg);
  border-radius: 20px;
  padding: 30px 20px;
  text-align: center;
  position: relative;
  margin-top: auto;
  border: 2px dashed #f4c553; /* Màu vàng đậm hơn để rõ nét */
  box-shadow: 0 4px 10px rgba(244, 197, 83, 0.1);
}

.promo-illustration {
  position: relative;
  font-size: 50px;
  color: var(--primary-green);
  margin-bottom: 15px;
  display: inline-block;
}

.discount-tag {
  position: absolute;
  bottom: -5px;
  right: -15px;
  background-color: #ff6b6b;
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 8px;
  transform: rotate(15deg);
  border: 2px solid white;
}

.promo-card p {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 20px;
  font-weight: 500;
}

.upgrade-btn {
  background-color: var(--primary-yellow);
  color: var(--text-dark);
  border: none;
  padding: 12px 20px;
  width: 100%;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.upgrade-btn:hover {
  background-color: var(--yellow-hover);
}
</style>