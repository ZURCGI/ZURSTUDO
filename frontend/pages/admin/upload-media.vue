<template>
  <div class="min-h-screen w-full flex items-start justify-center bg-gray-50">
    <div class="w-full max-w-7xl py-8">
      <h2 class="text-2xl font-semibold mb-6">Media 管理</h2>
      
      <!-- 錯誤顯示 -->
      <div v-if="pageError" class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p class="font-bold">頁面載入錯誤：</p>
        <p>{{ pageError }}</p>
        <button @click="retryLoad" class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          重試
        </button>
      </div>
      
      <!-- 載入狀態 -->
      <div v-if="isLoading" class="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
        <p>正在載入媒體管理系統...</p>
      </div>
      
      <div v-else class="flex flex-col md:flex-row gap-8 w-full">
        <div class="md:w-1/2 w-full">
          <MediaUploader />
        </div>
        <div class="md:w-1/2 w-full">
          <MediaManager />
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted, onActivated, onDeactivated, onErrorCaptured } from 'vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  requiresAuth: true,
  layout: 'admin',
})

// 改成你實際放元件的路徑
import MediaUploader from '~/components/MediaUploader.vue'
import MediaManager  from '~/components/MediaManager.vue'

// 頁面狀態管理
const pageError = ref('')
const isLoading = ref(true)
const { initUser, isLoggedIn } = useAuth()

const retryLoad = async () => {
  pageError.value = ''
  isLoading.value = true
  try {
    await initUser()
    isLoading.value = false
  } catch (error) {
    console.error('[Upload Media Page] Retry failed:', error)
    pageError.value = `重試失敗：${error.message || error}`
    isLoading.value = false
  }
}

onMounted(async () => {
  console.log('[Upload Media Page] Component mounted')
  try {
    // 只在用戶未登入時初始化
    if (!isLoggedIn.value) {
      await initUser()
    }
    console.log('[Upload Media Page] User state initialized')
  } catch (error) {
    console.error('[Upload Media Page] Failed to initialize user state:', error)
    pageError.value = `用戶狀態初始化失敗：${error.message || error}`
  } finally {
    isLoading.value = false
  }
})

// 簡化生命週期鉤子，減少不必要的操作
onActivated(() => {
  console.log('[Upload Media Page] Component activated')
})

onDeactivated(() => {
  console.log('[Upload Media Page] Component deactivated')
})

onUnmounted(() => {
  console.log('[Upload Media Page] Component unmounted, cleaning up...')
})

onErrorCaptured((error, instance, info) => {
  console.error('[Upload Media Page] Error captured:', error)
  console.error('[Upload Media Page] Error info:', info)
  pageError.value = `組件錯誤：${error.message || error}`
  return false
})
</script>