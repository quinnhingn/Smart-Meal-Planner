<template>
  <div class="toast-container">
    <TransitionGroup name="toast-list">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="toast-item" 
        :class="toast.type"
      >
        <div class="toast-icon">
          <i v-if="toast.type === 'success'" class="fa-solid fa-circle-check"></i>
          <i v-else-if="toast.type === 'error'" class="fa-solid fa-circle-xmark"></i>
          <i v-else-if="toast.type === 'warning'" class="fa-solid fa-triangle-exclamation"></i>
          <i v-else class="fa-solid fa-circle-info"></i>
        </div>
        <div class="toast-content">
          {{ toast.message }}
        </div>
        <button class="toast-close" @click="removeToast(toast.id)">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast';

const { toasts, removeToast } = useToast();
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  min-width: 300px;
  max-width: 450px;
  background: white;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  border-left: 6px solid #ccc;
  animation: slideIn 0.3s ease-out;
}

.toast-item.success { border-left-color: #10b981; }
.toast-item.error { border-left-color: #ef4444; }
.toast-item.warning { border-left-color: #f59e0b; }
.toast-item.info { border-left-color: #3b82f6; }

.toast-icon { font-size: 20px; }
.success .toast-icon { color: #10b981; }
.error .toast-icon { color: #ef4444; }
.warning .toast-icon { color: #f59e0b; }
.info .toast-icon { color: #3b82f6; }

.toast-content {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.toast-close {
  background: none;
  border: none;
  color: #cbd5e1;
  cursor: pointer;
  padding: 4px;
  transition: 0.2s;
}

.toast-close:hover { color: #64748b; }

/* Animations */
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s ease;
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>
