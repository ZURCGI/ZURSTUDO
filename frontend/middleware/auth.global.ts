import { defineNuxtRouteMiddleware, navigateTo, useCookie } from '#app'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to) => {
  // 只保護 /admin 路徑，並排除登入頁
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    const { isLoggedIn, initUser } = useAuth()

    // 每次導航到受保護頁面時，都確保用戶狀態是最新的
    await initUser()

    if (!isLoggedIn.value) {
      return navigateTo('/admin/login')
    }
  }
})