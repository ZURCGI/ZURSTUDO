// composables/useErrorHandler.ts
import { ref, readonly } from 'vue'

interface ApiError {
  message: string
  status?: number
  code?: string
  timestamp: number
}

interface ErrorOptions {
  maxRetries?: number
  retryDelay?: number
}

const ERROR_MESSAGES: Record<number, string> = {
  400: '請求格式錯誤',
  401: '未授權，請重新登入',
  403: '沒有權限訪問此資源',
  404: '找不到請求的資源',
  408: '請求超時',
  429: '請求過於頻繁，請稍後再試',
  500: '伺服器發生錯誤',
  502: '閘道錯誤',
  503: '服務暫時不可用',
  504: '閘道超時'
}

// 通用的重試工具函數
export const retryWithDelay = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  retryDelay = 1000
): Promise<T> => {
  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
      }
      return await fn()
    } catch (error: any) {
      lastError = error
      if (attempt === maxRetries) {
        throw error
      }
    }
  }
  
  throw lastError
}

export const useErrorHandler = (options: ErrorOptions = {}) => {
  const { maxRetries = 1, retryDelay = 2000 } = options // 減少重試次數，增加延遲
  const errors = ref<ApiError[]>([])
  const isRetrying = ref(false)
  const retryCount = ref(0)

  const categorizeError = (error: any): ApiError => {
    // 檢查是否為網路錯誤
    if (error.message?.includes('Failed to fetch') || error.message?.includes('no response')) {
      return {
        message: '後端服務器暫時不可用，請稍後再試',
        status: 503,
        code: 'BACKEND_UNAVAILABLE',
        timestamp: Date.now()
      }
    }
    
    // 檢查是否為 429 錯誤（請求過於頻繁）
    if (error.status === 429 || error.message?.includes('429')) {
      return {
        message: '請求過於頻繁，請稍後再試',
        status: 429,
        code: 'TOO_MANY_REQUESTS',
        timestamp: Date.now()
      }
    }

    // 檢查是否為認證錯誤
    if (error.status === 401) {
      return {
        message: '認證失敗，請重新登入',
        status: 401,
        code: 'UNAUTHORIZED',
        timestamp: Date.now()
      }
    }

    // 檢查是否為權限錯誤
    if (error.status === 403) {
      return {
        message: '權限不足',
        status: 403,
        code: 'FORBIDDEN',
        timestamp: Date.now()
      }
    }

    // 檢查是否為伺服器錯誤
    if (error.status >= 500) {
      return {
        message: '伺服器錯誤，請稍後再試',
        status: error.status,
        code: 'SERVER_ERROR',
        timestamp: Date.now()
      }
    }

    // 檢查是否為客戶端錯誤
    if (error.status >= 400) {
      return {
        message: error.message || '請求錯誤',
        status: error.status,
        code: 'CLIENT_ERROR',
        timestamp: Date.now()
      }
    }

    // 預設錯誤
    return {
      message: error.message || '未知錯誤',
      status: error.status || 0,
      code: 'UNKNOWN_ERROR',
      timestamp: Date.now()
    }
  }

  const withRetry = async <T>(fn: () => Promise<T>): Promise<T> => {
    let lastError: any
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`[useErrorHandler] Retry attempt ${attempt}/${maxRetries}`)
          isRetrying.value = true
          retryCount.value = attempt
          
          // 對於 429 錯誤，使用更長的延遲
          const delay = lastError?.status === 429 ? retryDelay * 2 : retryDelay
          await new Promise(resolve => setTimeout(resolve, delay))
        }
        
        return await fn()
      } catch (error: any) {
        lastError = error
        console.error(`[useErrorHandler] Attempt ${attempt + 1} failed:`, error)
        
        // 如果是網路錯誤，立即停止重試
        if (error.message?.includes('Failed to fetch') || error.message?.includes('no response')) {
          const apiError = categorizeError(error)
          errors.value.push(apiError)
          isRetrying.value = false
          retryCount.value = 0
          throw new Error(apiError.message)
        }
        
        // 如果是 429 錯誤，使用更長的延遲
        if (error.status === 429 || error.message?.includes('429')) {
          console.log('[useErrorHandler] Rate limited, using longer delay')
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * 3))
            continue
          }
        }
        
        // 如果是認證錯誤，立即停止重試
        if (error.status === 401) {
          const apiError = categorizeError(error)
          errors.value.push(apiError)
          isRetrying.value = false
          retryCount.value = 0
          throw new Error(apiError.message)
        }
        
        // 最後一次嘗試失敗
        if (attempt === maxRetries) {
          const apiError = categorizeError(error)
          errors.value.push(apiError)
          isRetrying.value = false
          retryCount.value = 0
          throw new Error(apiError.message)
        }
      }
    }
    throw lastError
  }

  const clearErrors = () => {
    errors.value = []
    isRetrying.value = false
    retryCount.value = 0
  }

  const getLatestError = () => errors.value[errors.value.length - 1] || null
  const hasErrors = () => errors.value.length > 0

  return {
    errors: readonly(errors),
    isRetrying: readonly(isRetrying),
    retryCount: readonly(retryCount),
    withRetry,
    clearErrors,
    categorizeError,
    getLatestError,
    hasErrors
  }
} 
} 