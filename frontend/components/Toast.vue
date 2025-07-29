<template>
  <Teleport to="body">
    <TransitionGroup
      name="toast"
      tag="div"
      class="toast-container"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'toast',
          `toast-${toast.type}`,
          { 'toast-with-icon': toast.icon }
        ]"
      >
        <Icon 
          v-if="toast.icon" 
          :name="toast.icon" 
          class="w-5 h-5" 
        />
        <span class="toast-message">{{ toast.message }}</span>
        <button 
          @click="removeToast(toast.id)" 
          class="toast-close"
        >
          <Icon name="heroicons:x-mark" class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  icon?: string
  duration?: number
}

const toasts = ref<Toast[]>([])

// 添加 Toast
const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = Date.now().toString()
  const newToast: Toast = {
    id,
    duration: 5000,
    ...toast
  }
  
  toasts.value.push(newToast)
  
  // 自動移除
  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }
  
  return id
}

// 移除 Toast
const removeToast = (id: string) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// 清除所有 Toast
const clearToasts = () => {
  toasts.value = []
}

// 提供給全域使用
const toast = {
  success: (message: string, options?: Partial<Toast>) => 
    addToast({ message, type: 'success', icon: 'heroicons:check-circle', ...options }),
  
  error: (message: string, options?: Partial<Toast>) => 
    addToast({ message, type: 'error', icon: 'heroicons:exclamation-triangle', ...options }),
  
  warning: (message: string, options?: Partial<Toast>) => 
    addToast({ message, type: 'warning', icon: 'heroicons:exclamation-triangle', ...options }),
  
  info: (message: string, options?: Partial<Toast>) => 
    addToast({ message, type: 'info', icon: 'heroicons:information-circle', ...options }),
  
  add: addToast,
  remove: removeToast,
  clear: clearToasts
}

// 提供給全域使用
provide('toast', toast)

onMounted(() => {
  // 確保在客戶端運行
  if (process.client) {
    // 可以添加全域快捷鍵等
  }
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  min-width: 20rem;
  max-width: 28rem;
  transform: translateX(0);
  transition: all 0.3s ease-out;
}

.toast-success {
  background-color: #22c55e;
  color: white;
}

.toast-error {
  background-color: #ef4444;
  color: white;
}

.toast-warning {
  background-color: #f59e0b;
  color: white;
}

.toast-info {
  background-color: #3b82f6;
  color: white;
}

.toast-with-icon {
  padding-left: 0.75rem;
}

.toast-message {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

.toast-close {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

/* 動畫 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease-out;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-move {
  transition: transform 0.3s;
}
</style> 