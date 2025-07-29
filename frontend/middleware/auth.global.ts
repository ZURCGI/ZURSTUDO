import { defineNuxtRouteMiddleware, navigateTo, useCookie } from '#app'

export default defineNuxtRouteMiddleware((to) => {
  console.log('[Auth Middleware] Route:', to.path);
  
  // 只攔截 /admin 下的頁面，排除 /admin/login
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    console.log('[Auth Middleware] Checking auth for:', to.path);
    const token = useCookie('auth-token').value || ''
    console.log('[Auth Middleware] Token exists:', !!token);
    if (!token) {
      console.log('[Auth Middleware] No token, redirecting to login');
      return navigateTo('/admin/login')
    }
  } else {
    console.log('[Auth Middleware] Skipping auth check for:', to.path);
  }
})