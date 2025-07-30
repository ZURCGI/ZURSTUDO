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
      
      <div class="flex flex-col md:flex-row gap-8 w-full">
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
  requiresAuth: true,  // ← 打开保护
  layout: 'admin',     // ← 使用 admin 布局（可选）
})

// 改成你實際放元件的路徑
import MediaUploader from '~/components/MediaUploader.vue'
import MediaManager  from '~/components/MediaManager.vue'

// 確保用戶狀態已初始化
const { initUser } = useAuth()

// 頁面錯誤狀態
const pageError = ref('')
const retryLoad = () => {
  pageError.value = ''
  // 重新初始化頁面
  initUser()
}

onMounted(async () => {
  console.log('[Upload Media Page] Component mounted')
  try {
    await initUser()
    console.log('[Upload Media Page] User state initialized')
  } catch (error) {
    console.error('[Upload Media Page] Failed to initialize user state:', error)
    pageError.value = `用戶狀態初始化失敗：${error.message || error}`
  }
})

// 添加頁面激活時的重新初始化邏輯
onActivated(() => {
  console.log('[Upload Media Page] Component activated')
})

// 添加頁面停用時的清理邏輯
onDeactivated(() => {
  console.log('[Upload Media Page] Component deactivated')
})

// 添加頁面卸載時的清理邏輯
onUnmounted(() => {
  console.log('[Upload Media Page] Component unmounted, cleaning up...')
})

onErrorCaptured((error, instance, info) => {
  console.error('[Upload Media Page] Error captured:', error)
  console.error('[Upload Media Page] Error info:', info)
  pageError.value = `組件錯誤：${error.message || error}`
  return false // 防止錯誤繼續傳播
})
</script>