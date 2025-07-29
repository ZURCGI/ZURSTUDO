import * as THREE from 'three'

// 創建 Three.js 單例
let threeInstance: typeof THREE | null = null
let isInitialized = false

export default defineNuxtPlugin(() => {
  if (!isInitialized) {
    // 檢查是否已經有 Three.js 實例存在
    if (typeof window !== 'undefined' && (window as any).__THREE_INSTANCE__) {
      threeInstance = (window as any).__THREE_INSTANCE__
      console.warn('🔧 Three.js 實例已存在，使用現有實例')
    } else {
      threeInstance = THREE
      // 在 window 上標記 Three.js 實例
      if (typeof window !== 'undefined') {
        (window as any).__THREE_INSTANCE__ = threeInstance
      }
      // 僅在開發環境顯示日誌
      if (process.env.NODE_ENV === 'development') {
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