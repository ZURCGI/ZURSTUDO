// composables/useAuth.ts
import { ref, computed, readonly } from 'vue'
import { useCookie, useRouter, useRuntimeConfig } from '#app'

export const useAuth = () => {
  const token = useCookie('auth-token', {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  const user = ref<{ username: string; isAdmin: boolean; role?: string } | null>(null)
  const router = useRouter()
  const config = useRuntimeConfig()
  const errorHandler = useErrorHandler()

  const isLoggedIn = () => !!token.value

  const initUser = async () => {
    if (token.value) {
      try {
        const userData = await errorHandler.withRetry(
          () => $fetch<{ username: string; isAdmin: boolean; role?: string }>('/auth/me', {
            baseURL: config.public.apiBase,
            credentials: 'include',
          })
        )
        user.value = userData
      } catch (err: unknown) {
        console.error('Failed to init user:', err)
        token.value = ''
        user.value = null
      }
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const result = await errorHandler.withRetry(
        () => $fetch<{ access_token: string }>('/auth/login', {
          baseURL: config.public.apiBase,
          method: 'POST',
          body: { username, password },
        })
      )

      if (result.access_token) {
        token.value = result.access_token
        await initUser()
      } else {
        throw new Error('Missing access token in login response')
      }
    } catch (err: any) {
      console.error('[useAuth] Login failed:', err)
      
      let errorMessage = '登入失敗'
      if (err.status === 401) {
        errorMessage = '使用者名稱或密碼錯誤'
      } else if (err.status === 429) {
        errorMessage = '登入嘗試過於頻繁，請稍後再試'
      } else if (err.message?.includes('fetch')) {
        errorMessage = '網路連線失敗，請檢查網路連線'
      }
      
      throw new Error(errorMessage)
    }
  }

  const logout = async () => {
    try {
      await errorHandler.withRetry(
        () => $fetch('/auth/logout', {
          baseURL: config.public.apiBase,
          method: 'POST',
          credentials: 'include',
        })
      )
    } catch (err: unknown) {
      console.error('Logout API failed:', err)
    }
    
    token.value = ''
    user.value = null
    router.push('/admin/login')
  }

  const changePassword = async (newPassword: string) => {
    try {
      await errorHandler.withRetry(
        () => $fetch('/auth/change-password', {
          baseURL: config.public.apiBase,
          method: 'POST',
          credentials: 'include',
          body: { newPassword },
        })
      )
    } catch (err: any) {
      let errorMessage = '修改密碼失敗'
      if (err.status === 400) {
        errorMessage = '新密碼格式不正確'
      } else if (err.status === 401) {
        errorMessage = '請重新登入'
      } else if (err.message?.includes('fetch')) {
        errorMessage = '網路連線失敗，請檢查網路連線'
      }
      
      throw new Error(errorMessage)
    }
  }

  return { token, user, isLoggedIn, login, logout, changePassword, initUser }
}
