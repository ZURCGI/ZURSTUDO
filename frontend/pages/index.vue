<!-- frontend/pages/index.vue -->
<template>
  <div class="min-h-screen bg-blue-50 flex items-center justify-center">
    <div class="text-center p-8">
      <h1 class="text-4xl font-bold text-blue-900 mb-4">ZUR CGI Studio</h1>
      <p class="text-lg text-blue-700 mb-6">測試頁面 - 靜態生成</p>
      
      <div class="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto">
        <h2 class="text-xl font-semibold mb-4 text-gray-800">狀態檢查</h2>
        
        <div class="space-y-2 text-sm text-gray-600">
          <p>✅ HTML 已載入</p>
          <p>✅ Vue.js 正在運行</p>
          <p>✅ 響應式數據: {{ message }}</p>
        </div>
        
        <button 
          @click="incrementCount" 
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          點擊測試 ({{ count }})
        </button>
        
        <p class="mt-4 text-xs text-gray-500">
          如果這個頁面正常顯示，表示靜態生成工作正常
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
const message = ref('Hello from Vue!')

function incrementCount() {
  count.value++
  console.log('Count:', count.value)
}

// 確保頁面載入時有日誌
console.log('ZUR CGI Studio - 簡化測試頁面已載入')
</script>
