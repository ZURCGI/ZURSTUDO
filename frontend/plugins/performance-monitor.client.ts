// plugins/performance-monitor.client.ts
export default defineNuxtPlugin(() => {
  if (process.client) {
    // 監控 Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime)
          // 可發送到分析服務
        }
        if (entry.entryType === 'first-input') {
          console.log('FID:', entry.processingStart - entry.startTime)
        }
        if (entry.entryType === 'layout-shift') {
          console.log('CLS:', entry.value)
        }
      }
    })

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })

    // 監控資源載入時間
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.initiatorType === 'img' && entry.duration > 3000) {
          console.warn('慢速圖片載入:', entry.name, entry.duration)
        }
      }
    })

    resourceObserver.observe({ entryTypes: ['resource'] })

    // 監控記憶體使用
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
          console.warn('記憶體使用過高:', memory.usedJSHeapSize / 1024 / 1024, 'MB')
        }
      }, 30000) // 每30秒檢查一次
    }
  }
}) 