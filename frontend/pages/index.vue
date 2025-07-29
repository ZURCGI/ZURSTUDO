<!-- frontend/pages/index.vue -->
<template>
  <div class="w-full min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">ZUR CGI Studio</h1>
        <p class="text-xl text-gray-600">世界級的 3D 渲染與視覺化專家</p>
      </header>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold mb-2">3D 渲染</h3>
          <p class="text-gray-600">高品質的建築視覺化服務</p>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold mb-2">動畫製作</h3>
          <p class="text-gray-600">專業的 3D 動畫與漫遊服務</p>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold mb-2">投影映射</h3>
          <p class="text-gray-600">創新的光雕與投影技術</p>
        </div>
      </div>
      
      <div class="text-center mt-8">
        <p class="text-gray-500">網站正在載入中...</p>
        <p class="text-sm text-gray-400 mt-2">如果頁面沒有正常顯示，請檢查控制台錯誤</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 簡化的測試版本
console.log('ZUR CGI Studio - 測試頁面已載入')
</script>
