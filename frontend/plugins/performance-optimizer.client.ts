// plugins/performance-optimizer.client.ts
export default defineNuxtPlugin(() => {
  if (process.client) {
    // 防止重複的資源載入
    const loadedResources = new Set<string>();
    
    // 優化圖片載入
    const optimizeImageLoading = () => {
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach((img) => {
        if (img instanceof HTMLImageElement) {
          // 確保圖片有適當的尺寸
          if (!img.width && !img.height) {
            img.style.minHeight = '200px';
          }
          
          // 添加載入錯誤處理
          img.addEventListener('error', () => {
            img.style.display = 'none';
            console.warn('圖片載入失敗:', img.src);
          });
        }
      });
    };
    
    // 優化動畫性能
    const optimizeAnimations = () => {
      // 使用 requestAnimationFrame 來優化動畫
      const originalSetTimeout = window.setTimeout;
      window.setTimeout = function(fn: Function, delay: number, ...args: any[]) {
        if (delay < 16) { // 60fps = 16.67ms
          return requestAnimationFrame(() => fn(...args));
        }
        return originalSetTimeout(fn, delay, ...args);
      };
    };
    
    // 防止記憶體洩漏
    const preventMemoryLeaks = () => {
      // 監控 DOM 節點數量，但更寬容一些
      let lastNodeCount = document.querySelectorAll('*').length;
      let consecutiveWarnings = 0;
      
      setInterval(() => {
        const currentNodeCount = document.querySelectorAll('*').length;
        const increaseRatio = currentNodeCount / lastNodeCount;
        
        // 只有在節點數量急劇增加且連續多次警告時才報告
        if (increaseRatio > 2.0 && currentNodeCount > 1000) {
          consecutiveWarnings++;
          if (consecutiveWarnings >= 3) {
            console.warn('DOM 節點數量急劇增加，可能存在記憶體洩漏:', {
              current: currentNodeCount,
              previous: lastNodeCount,
              ratio: increaseRatio.toFixed(2)
            });
            consecutiveWarnings = 0; // 重置計數器
          }
        } else {
          consecutiveWarnings = 0; // 重置計數器
        }
        
        lastNodeCount = currentNodeCount;
      }, 30000); // 每30秒檢查一次，減少頻率
    };
    
    // 優化滾動性能
    const optimizeScrollPerformance = () => {
      let ticking = false;
      
      const updateScroll = () => {
        // 在這裡可以添加滾動優化邏輯
        ticking = false;
      };
      
      const requestTick = () => {
        if (!ticking) {
          requestAnimationFrame(updateScroll);
          ticking = true;
        }
      };
      
      window.addEventListener('scroll', requestTick, { passive: true });
    };
    
    // 清理函數
    const cleanup = () => {
      // 清理事件監聽器和其他資源
      window.removeEventListener('scroll', requestTick);
    };
    
    // 初始化所有優化
    const initializeOptimizations = () => {
      optimizeImageLoading();
      optimizeAnimations();
      preventMemoryLeaks();
      optimizeScrollPerformance();
      
      console.log('🚀 性能優化已啟用');
    };
    
    // 在 DOM 載入完成後初始化
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeOptimizations);
    } else {
      initializeOptimizations();
    }
    
    // 在頁面卸載時清理
    window.addEventListener('beforeunload', cleanup);
    
    // 提供優化工具給其他組件使用
    return {
      provide: {
        performanceOptimizer: {
          optimizeImageLoading,
          optimizeAnimations,
          preventMemoryLeaks,
          optimizeScrollPerformance,
          cleanup
        }
      }
    };
  }
});