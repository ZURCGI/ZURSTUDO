import { defineNuxtRouteMiddleware, navigateTo, useCookie } from '#app'

export default defineNuxtRouteMiddleware((to) => {
  // 只攔截 /admin 下的頁面，排除 /admin/login
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    const token = useCookie('auth-token').value || ''
    if (!token) {
      return navigateTo('/admin/login')
    }
  }
})