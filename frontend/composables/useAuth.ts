import { useRouter, useState, useCookie, useRuntimeConfig } from '#app'
import { computed } from 'vue'
import type { UserCredentials } from 'types/project'

// 1. 使用 useState 創建一個全域共享的用戶狀態。這是唯一的信任來源。
const useUser = () => useState<{ username: string; role?: string } | null>('user', () => null)

export const useAuth = () => {
  const user = useUser()
  const router = useRouter()
  const config = useRuntimeConfig()

  // 2. 繼續管理 tokenCookie，因為現有的上傳/刪除模組依賴它。
  const tokenCookie = useCookie('auth-token', {
    // 設置一個合理的過期時間，例如 7 天
    maxAge: 60 * 60 * 24 * 7,
  })

  // 3. isLoggedIn 的判斷依據是 user 狀態，而不是 token。
  const isLoggedIn = computed(() => !!user.value)

  /**
   * 4. 核心函數：從後端獲取用戶資訊來驗證和更新登入狀態。
   */
  const initUser = async () => {
    // 如果用戶狀態已存在，則無需重複獲取
    if (user.value) {
      console.log('[useAuth] User state already exists, skipping initUser')
      return
    }

    console.log('[useAuth] Initializing user state...')
    try {
      // 使用 credentials: 'include' 支援 HTTP-only cookies
      const userData = await $fetch<{ username: string; role?: string }>('/auth/me', {
        baseURL: config.public.apiBase,
        headers: tokenCookie.value ? { 'Authorization': `Bearer ${tokenCookie.value}` } : {},
        credentials: 'include',
        // 如果後端返回 401，靜默失敗即可
        ignoreResponseError: true,
      })

      if (userData && userData.username) {
        user.value = userData
        console.log('[useAuth] User state initialized successfully:', userData.username)
      } else {
        // 沒有有效的用戶會話，清理狀態
        user.value = null
        tokenCookie.value = null
        console.log('[useAuth] No valid user session found, cleared state')
      }
    } catch (err) {
      console.error('[useAuth] Failed to fetch user profile:', err)
      user.value = null
      tokenCookie.value = null
    }
  }

  /**
   * 5. 登入函數
   */
  const login = async (credentials: UserCredentials) => {
    try {
      const result = await $fetch<{ access_token?: string }>('/auth/login', {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: credentials,
        credentials: 'include',
      })

      if (result && result.access_token) {
        // 成功登入後，設置 token
        tokenCookie.value = result.access_token
      }

      // 成功設定 token 後，立即初始化用戶狀態
      await initUser()

      if (!user.value) {
        throw new Error('登入成功，但無法驗證用戶會話。')
      }
    } catch (err) {
      // 登入失敗，清理所有狀態
      user.value = null
      tokenCookie.value = null
      throw err
    }
  }

  /**
   * 6. 登出函數
   */
  const logout = async () => {
    try {
      // 嘗試調用後端登出 API
      await $fetch('/auth/logout', {
        baseURL: config.public.apiBase,
        method: 'POST',
        credentials: 'include',
        headers: tokenCookie.value ? { 'Authorization': `Bearer ${tokenCookie.value}` } : {},
        ignoreResponseError: true,
      })
    } finally {
      // 無論後端是否成功，都清理前端狀態
      user.value = null
      tokenCookie.value = null
      await router.push('/admin/login')
    }
  }

  /**
   * 7. 修改密碼函數（更安全的版本）
   *    - 接受包含當前密碼和新密碼的物件
   *    - 保持與其他 API 呼叫一致的認證方式
   */
  const changePassword = async (payload: { currentPassword: string; newPassword: string }) => {
    try {
      await $fetch('/auth/change-password', {
        baseURL: config.public.apiBase,
        method: 'PATCH', // 使用 PATCH 更符合語義
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(tokenCookie.value ? { 'Authorization': `Bearer ${tokenCookie.value}` } : {})
        },
        body: payload,
      })
    } catch (err) {
      console.error('[useAuth] Change password failed:', err)
      // 將原始錯誤拋出，以便 UI 層可以捕獲並顯示具體的錯誤訊息
      throw err
    }
  }

  return {
    user,
    isLoggedIn,
    tokenCookie, // 繼續暴露 tokenCookie 給現有模組使用
    login,
    logout,
    changePassword,
    initUser,
  }
}
