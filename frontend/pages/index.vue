<!-- frontend/pages/index.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-900 mb-4">ZUR CGI Studio</h1>
      <p class="text-xl text-gray-600 mb-8">世界級的 3D 渲染與視覺化專家</p>
      
      <div class="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
        <h2 class="text-2xl font-semibold mb-4">測試頁面</h2>
        <p class="text-gray-600 mb-4">如果您看到這個頁面，表示靜態生成正常工作！</p>
        
        <div class="space-y-2 text-sm text-gray-500">
          <p>✅ HTML 已正確生成</p>
          <p>✅ CSS 樣式已載入</p>
          <p>✅ JavaScript 正在運行</p>
        </div>
        
        <button 
          @click="testClick" 
          class="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          點擊測試
        </button>
        
        <p v-if="clickCount > 0" class="mt-4 text-sm text-gray-600">
          已點擊 {{ clickCount }} 次
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const clickCount = ref(0)

function testClick() {
  clickCount.value++
  console.log('按鈕被點擊了！', clickCount.value)
}

// 確保頁面載入時有日誌
console.log('ZUR CGI Studio - 測試頁面已載入')
console.log('當前時間:', new Date().toLocaleString())
</script>
