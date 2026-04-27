<template>
  <header class="navbar">
    <div class="navbar-left">
      <h2 class="page-title">{{ title }}</h2>
    </div>
    
    <div class="navbar-right">
      <div class="search-bar">
        <i class="fa-solid fa-search"></i>
        <input type="text" placeholder="Tìm kiếm...">
      </div>
      
      <div class="nav-actions">
        <button class="icon-btn">
          <i class="fa-regular fa-bell"></i>
          <span class="badge">3</span>
        </button>
        
        <div class="user-profile">
          <img src="https://ui-avatars.com/api/?name=Admin&background=4a8c54&color=fff" alt="Admin" class="avatar">
          <div class="user-info">
            <span class="user-name">Admin</span>
            <span class="user-role">Quản trị viên</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const title = ref('Dashboard');
</script>

<style scoped>
.navbar {
  height: 80px;
  background-color: var(--sidebar-bg, #ffffff);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  border-radius: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  border: 1px solid var(--primary-green);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-dark, #243326);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 30px;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: var(--bg-color, #f2f5f3);
  padding: 10px 15px;
  border-radius: 12px;
  width: 300px;
}

.search-bar i {
  color: var(--text-muted, #6b7a6d);
  margin-right: 10px;
}

.search-bar input {
  border: none;
  background: transparent;
  outline: none;
  font-family: inherit;
  width: 100%;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-muted, #6b7a6d);
  cursor: pointer;
  position: relative;
  transition: color 0.3s ease;
}

.icon-btn:hover {
  color: var(--primary-green, #4a8c54);
}

.badge {
  position: absolute;
  top: -5px;
  right: -8px;
  background-color: #ff6b6b;
  color: white;
  font-size: 10px;
  font-weight: bold;
  height: 16px;
  min-width: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid white;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark, #243326);
}

.user-role {
  font-size: 12px;
  color: var(--text-muted, #6b7a6d);
}
</style>
