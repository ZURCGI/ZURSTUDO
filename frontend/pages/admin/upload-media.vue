<template>
  <div class="min-h-screen w-full flex items-start justify-center bg-gray-50">
    <div class="w-full max-w-7xl py-8">
      <h2 class="text-2xl font-semibold mb-6">Media 管理</h2>
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
import { onMounted, onUnmounted, onErrorCaptured } from 'vue'
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

onMounted(async () => {
  console.log('[Upload Media Page] Component mounted')
  try {
    await initUser()
    console.log('[Upload Media Page] User state initialized')
  } catch (error) {
    console.error('[Upload Media Page] Failed to initialize user state:', error)
  }
})

// 添加頁面卸載時的清理邏輯
onUnmounted(() => {
  console.log('[Upload Media Page] Component unmounted, cleaning up...')
})

onErrorCaptured((error, instance, info) => {
  console.error('[Upload Media Page] Error captured:', error)
  console.error('[Upload Media Page] Error info:', info)
  return false // 防止錯誤繼續傳播
})
</script>