import { useRouter, useState, useCookie, useRuntimeConfig } from '#app'
import { computed } from 'vue'
import type { UserCredentials } from 'types/project'

// 1. 使用 useState 創建一個全域共享的用戶狀態。這是唯一的信任來源。
const useUser = () => useState<{ username: string; role?: string } | null>('user', () => null)

export const useAuth = () => {
  const user = useUser()
  const router = useRouter()
  const config = useRuntimeConfig()



  // 3. isLoggedIn 的判斷依據是 user 狀態，而不是 token。
  const isLoggedIn = computed(() => !!user.value)

  /**
   * 4. 核心函數：從後端獲取用戶資訊來驗證和更新登入狀態。
   */
  const initUser = async () => {
    // 如果用戶狀態已存在，則無需重複獲取
    if (user.value) {
      return
    }

    try {
      // 調用後端 API 獲取用戶信息
      const userData = await $fetch<{ username: string; role?: string }>('/auth/me', {
        baseURL: config.public.apiBase,
        credentials: 'include',
        ignoreResponseError: true,
        timeout: 10000
      })

      if (userData && userData.username) {
        user.value = userData
        return
      } else {
        user.value = null
        return
      }
    } catch (err) {
      // 如果是 401 錯誤，清除用戶狀態
      if (err && typeof err === 'object' && 'status' in err && err.status === 401) {
        user.value = null
        return
      }
      
      // 對於其他錯誤，保持當前狀態，不重試
      console.warn('[useAuth] initUser error:', err)
      return
    }
  }

  /**
   * 5. 登入函數
   */
  const login = async (credentials: UserCredentials) => {
    try {
      const result = await $fetch<{ success: boolean }>('/auth/login', {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: credentials,
        credentials: 'include',
      })

      if (result && result.success) {
        // 等待一下讓 cookie 設置完成
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // 初始化用戶狀態（依賴後端設置的 HTTP-only cookie）
        await initUser()

        if (!user.value) {
          throw new Error('登入成功，但無法驗證用戶會話。')
        }
      } else {
        throw new Error('登入失敗')
      }
    } catch (err) {
      // 登入失敗，清理所有狀態
      user.value = null
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
        ignoreResponseError: true,
      })
    } finally {
      // 無論後端是否成功，都清理前端狀態
      user.value = null
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
          'Content-Type': 'application/json'
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
    login,
    logout,
    changePassword,
    initUser,
  }
}
