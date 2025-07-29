// composables/useAuth.ts
import { ref } from 'vue'
import { useCookie, useRouter, useRuntimeConfig } from '#app'
import type { UserCredentials, AuthError } from 'types/project'

export const useAuth = () => {
  // 1. 前端可讀取的 Cookie 選項（不是 httpOnly）
  const token = useCookie('auth-token', {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  const user = ref<{ username: string; isAdmin: boolean; role?: string } | null>(null)
  const router = useRouter()
  const config = useRuntimeConfig()

  const isLoggedIn = () => !!token.value

  // 初始化用戶資訊
  const initUser = async () => {
    // 只有在有 token 時才調用 API
    if (token.value && token.value.trim() !== '') {
      try {
        const userData = await $fetch<{ username: string; isAdmin: boolean; role?: string }>('/auth/me', {
          baseURL: config.public.apiBase,
          credentials: 'include',
        })
        user.value = userData
      } catch (err: unknown) {
        console.error('Failed to init user:', err)
        // 如果 API 調用失敗，清除無效的 token
        token.value = ''
        user.value = null
      }
    } else {
      // 沒有 token 時，確保用戶狀態為 null
      user.value = null
    }
  }

  // 2. 使用 $fetch 并加 credentials
  const login = async (username: string, password: string) => {
    try {
      const result = await $fetch<{ access_token: string }>('/auth/login', {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: { username, password },
      });

      if (result.access_token) {
        token.value = result.access_token;
        await initUser(); // Set user state after getting token
      } else {
        throw new Error('Missing access token in login response');
      }
    } catch (err: unknown) {
      console.error('[useAuth] Login failed:', err);
      throw new Error(`登入失敗：${(err as AuthError)?.message || '未知錯誤'}`);
    }
  };

  const logout = async () => {
    try {
      await $fetch('/auth/logout', {
        baseURL: config.public.apiBase,
        method: 'POST',
        credentials: 'include',
      })
    } catch (err: unknown) {
      console.error('Logout API failed:', err)
    }
    
    // 清除前端狀態
    token.value = ''
    user.value = null
    router.push('/admin/login')
  }

  const changePassword = async (newPassword: string) => {
    try {
      await $fetch('/auth/change-password', {
        baseURL: config.public.apiBase,
        method: 'POST',
        credentials: 'include',
        body: { newPassword },
      })
    } catch (err: unknown) {
      throw new Error(`修改密碼失敗：${(err as AuthError)?.status || (err as AuthError)?.message || '未知錯誤'}`)
    }
  }

  return { token, user, isLoggedIn, login, logout, changePassword, initUser }
}
