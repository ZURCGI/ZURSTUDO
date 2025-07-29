// plugins/global-error-handler.client.ts
export default defineNuxtPlugin(() => {
  const { $fetch } = useNuxtApp()
  const errorHandler = useErrorHandler()
  const originalFetch = globalThis.$fetch

  // 統一的 $fetch 錯誤處理
  globalThis.$fetch = async (request: any, options?: any) => {
    try {
      return await originalFetch(request, options)
    } catch (error: any) {
      // 特殊處理 404 API 錯誤
      if (error.status === 404 && typeof request === 'string' && request.includes('/api/')) {
        console.warn(`[GlobalErrorHandler] API 端點不存在: ${request}`)
      } else {
        console.error('[GlobalErrorHandler]', error)
      }
      throw error
    }
  }

  // 全域錯誤處理
  const handleGlobalError = (event: ErrorEvent) => {
    console.error('[GlobalErrorHandler] Uncaught error:', event.error)
  }

  // 未處理的 Promise 拒絕
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('[GlobalErrorHandler] Unhandled promise rejection:', event.reason)
  }

  // 註冊事件監聽器
  if (process.client) {
    window.addEventListener('error', handleGlobalError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
  }

  return {
    provide: {
      errorHandler
    }
  }
}) 