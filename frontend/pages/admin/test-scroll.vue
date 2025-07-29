<!-- pages/admin/test-scroll.vue -->
<template>
  <div class="space-y-8">
    <h1 class="text-3xl font-bold text-gray-800">滾動測試頁面</h1>
    
    <!-- 測試內容 -->
    <div class="space-y-4">
      <div v-for="i in 50" :key="i" class="bg-white p-6 rounded-lg shadow border">
        <h3 class="text-lg font-semibold mb-2">測試區塊 {{ i }}</h3>
        <p class="text-gray-600">
          這是一個測試滾動功能的區塊。請嘗試使用滑鼠滾輪或觸控板來滾動頁面。
          如果滾動正常工作，您應該能夠看到所有的測試區塊。
        </p>
        <div class="mt-4 p-4 bg-gray-100 rounded">
          <p class="text-sm text-gray-500">
            區塊 {{ i }} 的額外內容：Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </div>
    </div>
    
    <!-- 滾動狀態指示器 -->
    <div class="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg">
      <h4 class="font-semibold mb-2">滾動狀態</h4>
      <p>滾動位置: {{ scrollPosition }}</p>
      <p>頁面高度: {{ pageHeight }}</p>
      <p>視窗高度: {{ windowHeight }}</p>
      <p>滾動百分比: {{ scrollPercentage }}%</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

definePageMeta({
  requiresAuth: true,
  layout: 'admin',
})

const scrollPosition = ref(0)
const pageHeight = ref(0)
const windowHeight = ref(0)
const scrollPercentage = ref(0)

const updateScrollInfo = () => {
  if (process.client) {
    const mainElement = document.querySelector('main')
    if (mainElement) {
      scrollPosition.value = mainElement.scrollTop
      pageHeight.value = mainElement.scrollHeight
      windowHeight.value = mainElement.clientHeight
      scrollPercentage.value = Math.round((scrollPosition.value / (pageHeight.value - windowHeight.value)) * 100)
    }
  }
}

onMounted(() => {
  if (process.client) {
    const mainElement = document.querySelector('main')
    if (mainElement) {
      mainElement.addEventListener('scroll', updateScrollInfo)
      updateScrollInfo()
    }
  }
})

onBeforeUnmount(() => {
  if (process.client) {
    const mainElement = document.querySelector('main')
    if (mainElement) {
      mainElement.removeEventListener('scroll', updateScrollInfo)
    }
  }
})
</script> 