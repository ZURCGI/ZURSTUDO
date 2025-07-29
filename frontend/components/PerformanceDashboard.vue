<template>
  <div v-if="showDashboard" class="performance-dashboard">
    <div class="dashboard-header">
      <h3>性能監控儀表板</h3>
      <button @click="toggleDashboard" class="close-btn">×</button>
    </div>
    
    <div class="dashboard-content">
      <div class="metric-group">
        <h4>Core Web Vitals</h4>
        <div class="metric">
          <span>LCP:</span>
          <span :class="getLCPClass()">{{ lcp }}ms</span>
        </div>
        <div class="metric">
          <span>FID:</span>
          <span :class="getFIDClass()">{{ fid }}ms</span>
        </div>
        <div class="metric">
          <span>CLS:</span>
          <span :class="getCLSClass()">{{ cls.toFixed(4) }}</span>
        </div>
      </div>
      
      <div class="metric-group">
        <h4>記憶體使用</h4>
        <div class="metric">
          <span>已使用:</span>
          <span>{{ memoryUsed }}MB</span>
        </div>
        <div class="metric">
          <span>總計:</span>
          <span>{{ memoryTotal }}MB</span>
        </div>
      </div>
      
      <div class="metric-group">
        <h4>DOM 節點</h4>
        <div class="metric">
          <span>當前:</span>
          <span>{{ domNodes }}</span>
        </div>
      </div>
      
      <div class="metric-group">
        <h4>長任務</h4>
        <div class="metric">
          <span>最近:</span>
          <span>{{ lastLongTask }}ms</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const showDashboard = ref(false)
const lcp = ref(0)
const fid = ref(0)
const cls = ref(0)
const memoryUsed = ref(0)
const memoryTotal = ref(0)
const domNodes = ref(0)
const lastLongTask = ref(0)

// 切換儀表板顯示
const toggleDashboard = () => {
  showDashboard.value = !showDashboard.value
}

// 獲取 LCP 等級
const getLCPClass = () => {
  if (lcp.value < 2500) return 'good'
  if (lcp.value < 4000) return 'needs-improvement'
  return 'poor'
}

// 獲取 FID 等級
const getFIDClass = () => {
  if (fid.value < 100) return 'good'
  if (fid.value < 300) return 'needs-improvement'
  return 'poor'
}

// 獲取 CLS 等級
const getCLSClass = () => {
  if (cls.value < 0.1) return 'good'
  if (cls.value < 0.25) return 'needs-improvement'
  return 'poor'
}

// 更新性能指標
const updateMetrics = () => {
  // 更新 DOM 節點數量
  domNodes.value = document.querySelectorAll('*').length
  
  // 更新記憶體使用
  if ('memory' in performance) {
    const memory = (performance as any).memory
    memoryUsed.value = Math.round(memory.usedJSHeapSize / 1024 / 1024)
    memoryTotal.value = Math.round(memory.totalJSHeapSize / 1024 / 1024)
  }
}

// 監控性能指標
const setupPerformanceMonitoring = () => {
  // 監控 Core Web Vitals
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        lcp.value = Math.round(entry.startTime)
      }
      if (entry.entryType === 'first-input') {
        fid.value = Math.round(entry.processingStart - entry.startTime)
      }
      if (entry.entryType === 'layout-shift') {
        cls.value += (entry as any).value
      }
    }
  })

  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })

  // 監控長任務
  const longTaskObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration > 50) {
        lastLongTask.value = Math.round(entry.duration)
      }
    }
  })

  longTaskObserver.observe({ entryTypes: ['longtask'] })

  // 定期更新指標
  const interval = setInterval(updateMetrics, 5000)

  // 清理函數
  return () => {
    observer.disconnect()
    longTaskObserver.disconnect()
    clearInterval(interval)
  }
}

// 鍵盤快捷鍵
const handleKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.shiftKey && event.key === 'P') {
    event.preventDefault()
    toggleDashboard()
  }
}

onMounted(() => {
  // 設置性能監控
  const cleanup = setupPerformanceMonitoring()
  
  // 添加鍵盤監聽
  document.addEventListener('keydown', handleKeydown)
  
  // 初始更新
  updateMetrics()
  
  // 清理函數
  onUnmounted(() => {
    cleanup()
    document.removeEventListener('keydown', handleKeydown)
  })
})
</script>

<style scoped>
.performance-dashboard {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  padding: 16px;
  font-family: monospace;
  font-size: 12px;
  z-index: 9999;
  backdrop-filter: blur(10px);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 8px;
}

.dashboard-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric-group {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 8px;
}

.metric-group h4 {
  margin: 0 0 8px 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.metric {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.metric:last-child {
  margin-bottom: 0;
}

.good {
  color: #4ade80;
}

.needs-improvement {
  color: #fbbf24;
}

.poor {
  color: #f87171;
}
</style>