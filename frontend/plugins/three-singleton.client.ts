import * as THREE from 'three'

// 創建 Three.js 單例
let threeInstance: typeof THREE | null = null
let isInitialized = false

export default defineNuxtPlugin(() => {
  if (!isInitialized) {
    // 檢查是否在 INFO 頁面
    const isInfoPage = () => {
      return typeof window !== 'undefined' && 
             (window.location.pathname === '/info' || 
              window.location.pathname.includes('/info'));
    };

    // 檢查是否已經有 Three.js 實例存在
    if (typeof window !== 'undefined' && (window as any).__THREE_INSTANCE__) {
      threeInstance = (window as any).__THREE_INSTANCE__
      
      // 在 INFO 頁面時不顯示警告
      if (!isInfoPage()) {
        console.warn('🔧 Three.js 實例已存在，使用現有實例')
      }
    } else {
      threeInstance = THREE
      // 在 window 上標記 Three.js 實例
      if (typeof window !== 'undefined') {
        (window as any).__THREE_INSTANCE__ = threeInstance
      }
      // 僅在開發環境且非 INFO 頁面時顯示日誌
      if (process.env.NODE_ENV === 'development' && !isInfoPage()) {
        console.log('🔧 Three.js 單例已初始化')
      }
    }
    isInitialized = true
  }

  return {
    provide: {
      three: threeInstance
    }
  }
})

// 導出單例供其他組件使用
export { threeInstance as three }

// 清理函數
export const cleanupThreeJS = () => {
  if (typeof window !== 'undefined') {
    delete (window as any).__THREE_INSTANCE__
  }
  threeInstance = null
  isInitialized = false
} 