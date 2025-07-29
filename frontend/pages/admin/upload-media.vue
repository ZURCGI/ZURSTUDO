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
definePageMeta({
  requiresAuth: true,  // ← 打开保护
  layout: 'admin',     // ← 使用 admin 布局（可选）
})

// 改成你實際放元件的路徑
import MediaUploader from '~/components/MediaUploader.vue'
import MediaManager  from '~/components/MediaManager.vue'
</script>