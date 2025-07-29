// composables/useMemoryOptimization.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMemoryOptimization() {
  const memoryUsage = ref(0)
  const isOptimizing = ref(false)
  
  // 記憶體使用監控
  const monitorMemory = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      memoryUsage.value = Math.round(memory.usedJSHeapSize / 1024 / 1024)
      
      // 如果記憶體使用過高，觸發優化
      if (memoryUsage.value > 80) {
        triggerMemoryOptimization()
      }
    }
  }
  
  // 觸發記憶體優化
  const triggerMemoryOptimization = () => {
    if (isOptimizing.value) return
    
    isOptimizing.value = true
    console.log('🧠 觸發記憶體優化...')
    
    // 清理圖片快取
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('image')) {
            caches.delete(name)
          }
        })
      })
    }
    
    // 強制垃圾回收（如果支援）
    if ('gc' in window) {
      (window as any).gc()
    }
    
    // 清理 DOM 節點
    const unusedElements = document.querySelectorAll('[data-unused="true"]')
    unusedElements.forEach(el => el.remove())
    
    setTimeout(() => {
      isOptimizing.value = false
      console.log('🧠 記憶體優化完成')
    }, 1000)
  }
  
  // 清理圖片資源
  const cleanupImages = () => {
    const images = document.querySelectorAll('img')
    images.forEach(img => {
      if (!img.offsetParent && !img.getBoundingClientRect().width) {
        img.src = ''
        img.remove()
      }
    })
  }
  
  // 清理事件監聽器
  const cleanupEventListeners = () => {
    // 這裡可以添加特定的事件監聽器清理邏輯
    console.log('🧹 清理事件監聽器')
  }
  
  // 定期記憶體檢查
  let memoryInterval: NodeJS.Timeout | null = null
  
  onMounted(() => {
    // 每30秒檢查一次記憶體使用
    memoryInterval = setInterval(monitorMemory, 30000)
    
    // 初始檢查
    monitorMemory()
  })
  
  onUnmounted(() => {
    if (memoryInterval) {
      clearInterval(memoryInterval)
    }
    cleanupEventListeners()
  })
  
  return {
    memoryUsage,
    isOptimizing,
    monitorMemory,
    triggerMemoryOptimization,
    cleanupImages,
    cleanupEventListeners
  }
}