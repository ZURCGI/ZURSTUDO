<template>
  <div v-if="error" class="error-boundary">
    <div class="error-container">
      <div class="error-icon">
        <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-red-500" />
      </div>
      
      <h2 class="error-title">發生錯誤</h2>
      
      <div class="error-message">
        <p class="text-gray-600 mb-4">{{ errorMessage }}</p>
        
        <details v-if="showDetails" class="error-details">
          <summary class="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            查看技術詳情
          </summary>
          <pre class="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">{{ errorStack }}</pre>
        </details>
      </div>
      
      <div class="error-actions">
        <button 
          @click="retry" 
          class="retry-button"
          :disabled="retrying"
        >
          <Icon v-if="retrying" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
          <span>{{ retrying ? '重試中...' : '重試' }}</span>
        </button>
        
        <button 
          @click="reset" 
          class="reset-button"
        >
          重新載入頁面
        </button>
      </div>
    </div>
  </div>
  
  <div v-else>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, nextTick, computed } from 'vue'

interface Props {
  fallback?: (error: Error, reset: () => void) => any
  onError?: (error: Error, errorInfo: any) => void
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDetails: false
})

const emit = defineEmits<{
  'error': [error: Error, errorInfo: any]
  'retry': []
}>()

const error = ref<Error | null>(null)
const errorInfo = ref<any>(null)
const retrying = ref(false)

const errorMessage = computed(() => {
  if (!error.value) return ''
  
  // 根據錯誤類型提供友好的錯誤訊息
  if (error.value.message.includes('NetworkError') || error.value.message.includes('fetch')) {
    return '網路連線失敗，請檢查您的網路連線'
  }
  
  if (error.value.message.includes('timeout')) {
    return '請求超時，請稍後再試'
  }
  
  if (error.value.message.includes('404')) {
    return '找不到請求的資源'
  }
  
  if (error.value.message.includes('403')) {
    return '沒有權限訪問此資源'
  }
  
  if (error.value.message.includes('500')) {
    return '伺服器發生錯誤，請稍後再試'
  }
  
  return error.value.message || '發生未知錯誤'
})

const errorStack = computed(() => {
  if (!error.value) return ''
  return `${error.value.name}: ${error.value.message}\n${error.value.stack}`
})

const retry = async () => {
  if (retrying.value) return
  
  retrying.value = true
  error.value = null
  errorInfo.value = null
  
  try {
    emit('retry')
    await nextTick()
  } catch (e) {
    console.error('Retry failed:', e)
  } finally {
    retrying.value = false
  }
}

const reset = () => {
  error.value = null
  errorInfo.value = null
  window.location.reload()
}

onErrorCaptured((err: Error, instance, info) => {
  console.error('ErrorBoundary caught error:', err, info)
  
  error.value = err
  errorInfo.value = info
  
  // 觸發錯誤事件
  emit('error', err, info)
  
  // 調用自定義錯誤處理函數
  if (props.onError) {
    props.onError(err, info)
  }
  
  // 阻止錯誤繼續傳播
  return false
})
</script>

<style scoped>
.error-boundary {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
}

.error-container {
  max-width: 28rem;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.error-icon {
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.error-message {
  margin-bottom: 1.5rem;
}

.error-details {
  margin-top: 1rem;
  text-align: left;
}

.error-details summary {
  margin-bottom: 0.5rem;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  justify-content: center;
}

@media (min-width: 640px) {
  .error-actions {
    flex-direction: row;
  }
}

.retry-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #2563eb;
  color: white;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #1d4ed8;
}

.retry-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-button {
  padding: 0.5rem 1rem;
  background-color: #4b5563;
  color: white;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.reset-button:hover {
  background-color: #374151;
}
</style> 