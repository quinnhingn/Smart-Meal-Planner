<template>
  <div class="admin-layout">
    <Sidebar />
    <div class="main-wrapper">
      <Navbar />
      <main class="main-content">
        <!-- Dashboard Content will render here -->
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '../components/Sidebar.vue';
import Navbar from '../components/Navbar.vue';
</script>

<style>
/* Base Reset and Fonts from the original HTML */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

:root {
  --primary-green: #4a8c54;
  --primary-yellow: #f4c553;
  --yellow-hover: #e0b240;
  --bg-color: #f2f5f3;
  --sidebar-bg: #ffffff;
  --text-dark: #243326;
  --text-muted: #6b7a6d;
  --nav-active-bg: #fffce8;
  --nav-hover-bg: #f0f5f1;
  --promo-bg: #fffce8;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
}
</style>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  padding: 20px;
  gap: 20px;
  background-color: var(--bg-color, #f2f5f3);
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}

.main-content {
  flex: 1;
  background-color: #ffffff;
  border-radius: 30px;
  padding: 30px;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
  border: 1px solid var(--primary-green);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  /* Customize scrollbar if needed */
}

.main-content:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(74, 140, 84, 0.1);
}
</style>
