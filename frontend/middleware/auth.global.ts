import { defineNuxtRouteMiddleware, navigateTo } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
  console.log('[Auth Middleware] Route:', to.path);
  
  // 只攔截 /admin 下的頁面，排除 /admin/login
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    console.log('[Auth Middleware] Checking auth for:', to.path);
    
    // 嘗試獲取用戶狀態來檢查認證
    try {
      const { $fetch } = await import('#app')
      const config = useRuntimeConfig()
      
      // 調用 /auth/me 來檢查認證狀態
      const userData = await $fetch('/auth/me', {
        baseURL: config.public.apiBase,
        credentials: 'include',
        onResponseError: (error) => {
          if (error.response?.status === 401) {
            console.log('[Auth Middleware] 401 error, redirecting to login');
            return navigateTo('/admin/login')
          }
          throw error
        }
      })
      
      console.log('[Auth Middleware] User authenticated:', userData.username);
    } catch (error) {
      console.log('[Auth Middleware] Auth check failed, redirecting to login');
      return navigateTo('/admin/login')
    }
  } else {
    console.log('[Auth Middleware] Skipping auth check for:', to.path);
  }
})