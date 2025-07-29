// composables/useAuth.ts
import { ref } from 'vue'
import { useCookie, useRouter, useRuntimeConfig } from '#app'
import type { UserCredentials, AuthError } from 'types/project'

export const useAuth = () => {
  // 使用 ref 來存儲 token，而不是 cookie（因為後端使用 httpOnly cookie）
  const token = ref<string>('')
  const user = ref<{ username: string; isAdmin: boolean; role?: string } | null>(null)
  const router = useRouter()
  const config = useRuntimeConfig()

  const isLoggedIn = () => !!user.value // 改為檢查用戶狀態而不是 token

  // 初始化用戶資訊 - 添加更好的錯誤處理
  const initUser = async () => {
    try {
      console.log('[useAuth] Attempting to init user');
      const userData = await $fetch<{ username: string; isAdmin: boolean; role?: string }>('/auth/me', {
        baseURL: config.public.apiBase,
        credentials: 'include', // 發送 cookie
        // 添加超時和錯誤處理
        onResponseError: (error) => {
          if (error.response?.status === 401) {
            console.log('[useAuth] 401 error during initUser');
            user.value = null
            return
          }
          throw error
        }
      })
      user.value = userData
      console.log('[useAuth] User initialized successfully');
    } catch (err: unknown) {
      console.error('[useAuth] Failed to init user:', err)
      user.value = null
    }
  }

  // 2. 使用 $fetch 并加 credentials
  const login = async (username: string, password: string) => {
    try {
      console.log('[useAuth] Attempting login for user:', username);
      console.log('[useAuth] API Base URL:', config.public.apiBase);
      
      const result = await $fetch<{ success?: boolean; access_token?: string; message?: string }>('/auth/login', {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: { username, password },
        credentials: 'include', // 添加這行來接收 httpOnly cookie
        // 添加更好的錯誤處理
        onResponseError: (error) => {
          console.error('[useAuth] Response error:', error);
          if (error.response?.status === 401) {
            console.log('[useAuth] 401 Unauthorized - Invalid credentials');
            throw new Error('使用者或密碼錯誤');
          }
          throw error;
        }
      });

      console.log('[useAuth] Login response:', result);
      console.log('[useAuth] Response type:', typeof result);
      console.log('[useAuth] Response keys:', Object.keys(result));

      // 檢查登入是否成功
      if (result && typeof result === 'object' && 'success' in result && result.success) {
        console.log('[useAuth] Login successful, checking user status');
        // 登入成功後，立即獲取用戶信息
        await initUser();
        console.log('[useAuth] User status updated after login');
      } else {
        console.error('[useAuth] Unexpected response format:', result);
        throw new Error('登入響應格式不正確');
      }
    } catch (err: unknown) {
      console.error('[useAuth] Login failed:', err);
      // 提供更具體的錯誤訊息
      if (err instanceof Error) {
        throw new Error(`登入失敗：${err.message}`);
      } else {
        throw new Error(`登入失敗：${(err as AuthError)?.message || '未知錯誤'}`);
      }
    }
  };

  const logout = async () => {
    try {
      await $fetch('/auth/logout', {
        baseURL: config.public.apiBase,
        method: 'POST',
        credentials: 'include', // 發送 cookie
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
        credentials: 'include', // 發送 cookie
        body: { newPassword },
      })
    } catch (err: unknown) {
      throw new Error(`修改密碼失敗：${(err as AuthError)?.status || (err as AuthError)?.message || '未知錯誤'}`)
    }
  }

  return { token, user, isLoggedIn, login, logout, changePassword, initUser }
}
