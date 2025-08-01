import { defineNuxtRouteMiddleware, navigateTo, useCookie } from '#app'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to) => {
  // 只保護 /admin 路徑，並排除登入頁
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    const { isLoggedIn, initUser } = useAuth()

    // 如果用戶狀態已存在，不需要重新檢查
    if (isLoggedIn.value) {
      return
    }

    // 嘗試初始化用戶狀態，但限制重試次數
    try {
      await initUser()
      
      if (!isLoggedIn.value) {
        return navigateTo('/admin/login')
      }
    } catch (error) {
      // 只有在明確的認證錯誤時才重定向
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        return navigateTo('/admin/login')
      }
      // 對於其他錯誤，不重定向，讓用戶繼續使用
      console.warn('[AuthMiddleware] Non-401 error, allowing access:', error)
    }
  }
})