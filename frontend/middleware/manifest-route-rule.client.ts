// 自定義 manifest-route-rule 中間件
// 解決 Nuxt 3 中間件重複註冊警告

export default defineNuxtRouteMiddleware((to) => {
  // 只在客戶端執行
  if (process.client) {
    // 處理 manifest 相關路由規則
    if (to.path === '/manifest.json') {
      // 確保 manifest 檔案正確載入
      return
    }
  }
}) 