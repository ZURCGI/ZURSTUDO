<template>
  <div v-if="showBanner" class="network-status">
    <div :class="bannerClass">
      <Icon :name="iconName" class="w-4 h-4" />
      <span>{{ message }}</span>
      <button v-if="canClear" @click="clearErrors" class="clear-btn">
        <Icon name="heroicons:x-mark" class="w-3 h-3" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const errorHandler = useErrorHandler()
const isOnline = ref(navigator.onLine)

// 簡化的計算屬性
const showBanner = computed(() => !isOnline.value || errorHandler.hasErrors() || errorHandler.isRetrying.value)
const message = computed(() => {
  if (!isOnline.value) return '網路連線已中斷'
  if (errorHandler.isRetrying.value) return `正在重試... (${errorHandler.retryCount.value}/${3})`
  return errorHandler.getLatestError()?.message || '發生錯誤'
})
const iconName = computed(() => {
  if (!isOnline.value) return 'heroicons:wifi'
  if (errorHandler.isRetrying.value) return 'heroicons:arrow-path'
  return 'heroicons:exclamation-triangle'
})
const bannerClass = computed(() => {
  if (!isOnline.value) return 'offline-banner'
  if (errorHandler.isRetrying.value) return 'retry-banner'
  return 'error-banner'
})
const canClear = computed(() => errorHandler.hasErrors() && !errorHandler.isRetrying.value)

const clearErrors = () => errorHandler.clearErrors()

onMounted(() => {
  window.addEventListener('online', () => isOnline.value = true)
  window.addEventListener('offline', () => isOnline.value = false)
})

onUnmounted(() => {
  window.removeEventListener('online', () => isOnline.value = true)
  window.removeEventListener('offline', () => isOnline.value = false)
})
</script>

<style scoped>
.network-status {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
}

.offline-banner {
  background-color: #dc2626;
  color: white;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.error-banner {
  background-color: #ea580c;
  color: white;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.retry-banner {
  background-color: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.clear-btn {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.clear-btn:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 0.25rem;
  padding: 0.25rem;
}
</style> 