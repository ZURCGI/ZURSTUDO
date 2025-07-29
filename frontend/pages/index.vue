<!-- frontend/pages/index.vue -->
<template>
  <div class="w-full">
    <header class="px-4 py-0 mb-0 flex justify-between items-center">
      <a
        href="https://www.instagram.com/zur_cgistudio?igsh=MW1jd3pnM3doeG1qbg=="
        target="_blank" rel="noopener"
        class="text-blue-500 hover:underline"
      ></a>
    </header>

    <ClientOnly>
      <BucharestPageLoader 
        :loading="loading" 
      />
    </ClientOnly>
    
    <!-- 瀑布流展示 -->
    <ClientOnly>
      <div v-if="!loading && items.length > 0" ref="gridContainer">
        <MasonryGrid 
          :items="items"
          :gap="6" 
          :rowGap="6"
          :loadMore="loadMore"
          :hasMore="hasMore"
          @item-mounted="handleItemMounted"
        />
      </div>
    </ClientOnly>
    
    <!-- 錯誤狀態 -->
    <div v-if="!loading && items.length === 0 && error" class="text-center py-8">
      <div class="error-container">
        <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-4">載入失敗</h2>
        <p class="text-gray-600 mb-4">
          {{ errorMessage.includes('Failed to fetch') || errorMessage.includes('no response') 
            ? '後端服務器暫時不可用，請稍後再試。' 
            : errorMessage }}
        </p>
        
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            @click="retryLoad" 
            class="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="isRetrying"
          >
            <Icon v-if="isRetrying" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
            <span>{{ isRetrying ? '重試中...' : '重新載入' }}</span>
          </button>
          
          <button 
            @click="loadMedia(1)" 
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            重新載入媒體
          </button>
        </div>
        
        <!-- 後端狀態提示 -->
        <div v-if="errorMessage.includes('Failed to fetch') || errorMessage.includes('no response')" class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p class="text-sm text-yellow-800">
            <Icon name="heroicons:information-circle" class="w-4 h-4 inline mr-1" />
            後端服務器可能正在重新啟動，請等待幾分鐘後再試。
          </p>
        </div>
      </div>
    </div>
    
    <!-- 空狀態 -->
    <div v-if="!loading && items.length === 0 && !error" class="text-center py-8">
      <p class="text-gray-500">暫無內容</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRuntimeConfig } from '#app'
import { gsap } from 'gsap'
import MasonryGrid from '~/components/MasonryGrid.vue'
import BucharestPageLoader from '~/components/BucharestPageLoader.vue'

interface MediaItem {
  type: 'image' | 'video' | 'view360'
  url: string
  publicId: string
  description?: string
}

const route = useRoute()
const { public: { apiBase } } = useRuntimeConfig()
const errorHandler = useErrorHandler()

const pageSize = 30
const items = ref<MediaItem[]>([])
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const columns = ref(3)
const page = ref(1)
const hasMore = ref(true)
const isFetching = ref(false)
const isRetrying = ref(false)
const gridContainer = ref<HTMLElement | null>(null)
const animationTriggered = ref(false) // 新增：防止動畫重複觸發
let observer: IntersectionObserver | null = null
let ctx: gsap.Context | null = null
let tl: gsap.core.Timeline | null = null

function updateColumns() {
  const w = window.innerWidth
  if (w < 640) columns.value = 1         // 手機
  else if (w < 1024) columns.value = 2   // PAD
  else columns.value = 3                 // 桌機
}

// 使用錯誤處理器的安全 API 調用
async function loadMedia(pageNum = 1) {
  if (isFetching.value) return;
  isFetching.value = true
  error.value = false
  errorMessage.value = ''
  
  // 如果是第一頁，則顯示載入動畫
  if (pageNum === 1) {
    loading.value = true;
  }
  
  try {
    const result = await errorHandler.withRetry(
      () => $fetch(`${apiBase}/media/list?page=${pageNum}&limit=${pageSize}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
    )
    
    const newItems = result.items || []
    
    // 更新數據，這將會被上面的 watch 捕捉到
    if (pageNum === 1) {
      items.value = newItems
    } else {
      items.value = [...items.value, ...newItems]
    }
    
    hasMore.value = result.pagination?.hasMore ?? (newItems.length === pageSize)
    page.value = pageNum
    
  } catch (err: any) {
    error.value = true
    errorMessage.value = err.message || '載入失敗，請檢查網路連線'
  } finally {
    loading.value = false
    isFetching.value = false
  }
}

// 重試載入
async function retryLoad() {
  if (isRetrying.value) return
  
  isRetrying.value = true
  error.value = false
  errorMessage.value = ''
  
  try {
    await loadMedia(1)
  } catch (err) {
    console.error('Retry failed:', err)
  } finally {
    isRetrying.value = false
  }
}

// 載入更多
async function loadMore() {
  if (isFetching.value || !hasMore.value) return
  await loadMedia(page.value + 1)
}

// 處理項目掛載
function handleItemMounted({ el, index }: { el: HTMLElement, index: number }) {
  // 可以在這裡添加項目掛載後的邏輯
}

// 無限滾動設置
onMounted(() => {
  updateColumns()
  window.addEventListener('resize', updateColumns)
  
  // 初始載入數據
  loadMedia(1)
  
  // 無限滾動觀察器 (保持不變)
  const sentinel = document.querySelector('.sentinel')
  if (sentinel) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore.value && !isFetching.value) {
            loadMore()
          }
        })
      },
      { rootMargin: '100px' }
    )
    observer.observe(sentinel)
  }
})

onBeforeUnmount(() => {
  // 在組件卸載時，安全地清理所有 GSAP 實例，防止內存洩漏
  if (ctx) {
    ctx.revert();
  }
  
  window.removeEventListener('resize', updateColumns)
  if (observer) {
    observer.disconnect()
  }
})

// --- 核心優化：使用 watch 監聽數據，聲明式地觸發動畫 ---
watch(items, (newItems) => {
  // 確保只在首次載入數據 (page 1) 且有數據時觸發，且只觸發一次
  if (newItems.length > 0 && page.value === 1 && !animationTriggered.value) {
    animationTriggered.value = true // 標記已觸發
    
    // 確保 GSAP context 和時間軸已準備好
    if (!ctx || !tl) {
      console.warn('[Animation] GSAP context or timeline not ready, creating...');
      initializeAnimation();
    }
    
    // 確保時間軸不在活動狀態
    if (tl && !tl.isActive()) {
      console.log('[Animation] Triggering grid animation for', newItems.length, 'items');
      tl.restart();
    }
  }
}, {
  // 關鍵：確保回調在 Vue DOM 更新後執行，完美替代 nextTick + setTimeout
  flush: 'post'
})

// 初始化動畫系統
function initializeAnimation() {
  if (!gridContainer.value) {
    console.warn('[Animation] Grid container not ready');
    return;
  }
  
  // 創建 GSAP context，確保動畫在組件卸載時自動清理
  ctx = gsap.context((self) => {
    // 創建時間軸，用於網格入場動畫
    tl = gsap.timeline({
      paused: true,
      onComplete: () => {
        // 動畫結束後，清除 GSAP 添加的所有內聯樣式，將控制權交還給 CSS
        gsap.set(self.selector('.masonry-item'), { clearProps: 'all' });
        console.log('[Animation] Grid animation completed');
      }
    });

    // 定義網格入場動畫
    tl.from(self.selector('.masonry-item'), {
      opacity: 0,
      scale: 0.95,
      yPercent: 20,
      duration: 0.8,
      ease: 'expo.out',
      stagger: {
        amount: 0.5,
        from: 'start',
        grid: 'auto'
      }
    });
    
    console.log('[Animation] GSAP context and timeline initialized');
  }, gridContainer.value);
}
</script>

<style scoped>
.error-container {
  max-width: 28rem;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  text-align: center;
}
</style>
