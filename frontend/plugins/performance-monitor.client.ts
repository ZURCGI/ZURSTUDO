// plugins/performance-monitor.client.ts
export default defineNuxtPlugin(() => {
  if (process.client) {
    // 檢查是否在 INFO 頁面，如果是則跳過性能監控
    const isInfoPage = () => {
      return window.location.pathname === '/info' || 
             window.location.pathname.includes('/info');
    };

    // 在 INFO 頁面跳過所有性能監控
    if (isInfoPage()) {
      console.log('[Performance Monitor] Skipping all monitoring on INFO page');
      return;
    }

    let clsValue = 0;
    let clsEntries: any[] = [];
    let isFirstInput = true;
    let longTaskCount = 0;
    let lastLongTaskTime = 0;
    
    // 監控 Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      try {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime)
            // 可發送到分析服務
          }
          if (entry.entryType === 'first-input' && isFirstInput) {
            console.log('FID:', entry.processingStart - entry.startTime)
            isFirstInput = false;
          }
          if (entry.entryType === 'layout-shift') {
            clsValue += (entry as any).value;
            clsEntries.push(entry);
            
            // 只在 CLS 值較高時記錄，避免過多日誌
            if ((entry as any).value > 0.01) {
              console.log('CLS:', (entry as any).value)
            }
            
            // 每10個 entries 或 CLS 總值超過 0.5 時報告（提高閾值減少誤報）
            if (clsEntries.length >= 10 || clsValue > 0.5) {
              console.warn('CLS 累積值過高:', clsValue.toFixed(6), 'entries:', clsEntries.length)
              clsValue = 0;
              clsEntries = [];
            }
          }
        }
      } catch (error) {
        console.warn('[Performance Monitor] Observer error:', error);
      }
    })

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
    } catch (error) {
      console.warn('[Performance Monitor] Failed to observe performance entries:', error);
    }

    // 監控資源載入時間
    const resourceObserver = new PerformanceObserver((list) => {
      try {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.initiatorType === 'img' && entry.duration > 3000) {
            console.warn('慢速圖片載入:', entry.name, entry.duration)
          }
        }
      } catch (error) {
        console.warn('[Performance Monitor] Resource observer error:', error);
      }
    })

    try {
      resourceObserver.observe({ entryTypes: ['resource'] })
    } catch (error) {
      console.warn('[Performance Monitor] Failed to observe resources:', error);
    }

    // 監控記憶體使用 - 提高閾值
    if ('memory' in performance) {
      setInterval(() => {
        try {
          const memory = (performance as any).memory
          if (memory.usedJSHeapSize > 150 * 1024 * 1024) { // 提高到150MB
            console.warn('記憶體使用過高:', memory.usedJSHeapSize / 1024 / 1024, 'MB')
          }
        } catch (error) {
          console.warn('[Performance Monitor] Memory monitoring error:', error);
        }
      }, 60000) // 每60秒檢查一次，減少頻率
    }
    
    // 監控長任務 - 更嚴格的條件
    const longTaskObserver = new PerformanceObserver((list) => {
      try {
        const entries = list.getEntries();
        for (const entry of entries) {
          const now = Date.now()
          
          // 只報告真正長的任務，且避免重複報告
          if (entry.duration > 300 && (now - lastLongTaskTime) > 10000) { // 300ms以上且10秒內不重複
            longTaskCount++;
            lastLongTaskTime = now;
            
            // 只在連續多次長任務時報告
            if (longTaskCount >= 3) {
              console.warn('連續長任務檢測:', {
                duration: Math.round(entry.duration),
                name: entry.name,
                count: longTaskCount
              })
              longTaskCount = 0; // 重置計數器
            }
          }
        }
      } catch (error) {
        console.warn('[Performance Monitor] Long task observer error:', error);
      }
    })
    
    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] })
    } catch (error) {
      console.warn('[Performance Monitor] Failed to observe long tasks:', error);
    }
    
    // 定期重置長任務計數器
    setInterval(() => {
      longTaskCount = 0;
    }, 30000) // 每30秒重置
  }
}) 