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
  const { maxRetries = 3, retryDelay = 1000 } = options
  const errors = ref<ApiError[]>([])
  const isRetrying = ref(false)
  const retryCount = ref(0)

  // 簡化的錯誤分類
  const categorizeError = (error: any): ApiError => ({
    message: error.status ? ERROR_MESSAGES[error.status] || `HTTP ${error.status} 錯誤` : 
            error.message || '發生未知錯誤',
    status: error.status,
    code: error.status ? `HTTP_${error.status}` : 'UNKNOWN_ERROR',
    timestamp: Date.now()
  })

  // 簡化的重試機制
  const withRetry = async <T>(fn: () => Promise<T>): Promise<T> => {
    let lastError: any

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          isRetrying.value = true
          retryCount.value = attempt
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
        }
        
        const result = await fn()
        isRetrying.value = false
        retryCount.value = 0
        return result
      } catch (error: any) {
        lastError = error
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

  const clearErrors = () => errors.value = []
  const getLatestError = () => errors.value[errors.value.length - 1] || null
  const hasErrors = () => errors.value.length > 0

  return {
    errors: readonly(errors),
    isRetrying: readonly(isRetrying),
    retryCount: readonly(retryCount),
    withRetry,
    categorizeError,
    clearErrors,
    getLatestError,
    hasErrors,
    retryWithDelay
  }
} 