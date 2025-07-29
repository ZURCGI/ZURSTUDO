import * as THREE from 'three'

// 創建 Three.js 單例
let threeInstance: typeof THREE | null = null

export default defineNuxtPlugin(() => {
  if (!threeInstance) {
    threeInstance = THREE
    // 僅在開發環境顯示日誌
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Three.js 單例已初始化')
    }
  }

  return {
    provide: {
      three: threeInstance
    }
  }
})

// 導出單例供其他組件使用
export { threeInstance as three } 