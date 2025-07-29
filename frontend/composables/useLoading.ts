import { ref, computed, readonly } from 'vue'

export interface LoadingState {
  isLoading: boolean
  progress: number | null
  message: string
  type: 'spinner' | 'skeleton' | 'progress'
}

export function useLoading() {
  const loadingStates = ref<Map<string, LoadingState>>(new Map())
  
  const isLoading = computed(() => {
    return Array.from(loadingStates.value.values()).some(state => state.isLoading)
  })
  
  const globalProgress = computed(() => {
    const states = Array.from(loadingStates.value.values()).filter(state => state.progress !== null)
    if (states.length === 0) return null
    
    const total = states.reduce((sum, state) => sum + (state.progress || 0), 0)
    return Math.round(total / states.length)
  })
  
  const globalMessage = computed(() => {
    const activeStates = Array.from(loadingStates.value.values()).filter(state => state.isLoading)
    return activeStates.length > 0 ? activeStates[0].message : ''
  })
  
  function startLoading(key: string, options: Partial<LoadingState> = {}) {
    loadingStates.value.set(key, {
      isLoading: true,
      progress: null,
      message: 'ZURCGI',
      type: 'spinner',
      ...options
    })
  }
  
  function updateProgress(key: string, progress: number, message?: string) {
    const state = loadingStates.value.get(key)
    if (state) {
      state.progress = progress
      if (message) state.message = message
    }
  }
  
  function stopLoading(key: string) {
    loadingStates.value.delete(key)
  }
  
  function setMessage(key: string, message: string) {
    const state = loadingStates.value.get(key)
    if (state) {
      state.message = message
    }
  }
  
  return {
    loadingStates: readonly(loadingStates),
    isLoading,
    globalProgress,
    globalMessage,
    startLoading,
    updateProgress,
    stopLoading,
    setMessage
  }
}

// 頁面載入狀態
export function usePageLoading() {
  const { startLoading, stopLoading, updateProgress, setMessage } = useLoading()
  
  function startPageLoad(message = 'ZURCGI') {
    startLoading('page', { message, type: 'spinner' })
  }
  
  function updatePageProgress(progress: number, message?: string) {
    updateProgress('page', progress, message)
  }
  
  function stopPageLoad() {
    stopLoading('page')
  }
  
  return {
    startPageLoad,
    updatePageProgress,
    stopPageLoad
  }
}

// API 載入狀態
export function useApiLoading() {
  const { startLoading, stopLoading, setMessage } = useLoading()
  
  function startApiCall(key: string, message = 'ZURCGI') {
    startLoading(key, { message, type: 'spinner' })
  }
  
  function stopApiCall(key: string) {
    stopLoading(key)
  }
  
  return {
    startApiCall,
    stopApiCall,
    setMessage
  }
}

// 批量操作載入狀態
export function useBatchLoading() {
  const { startLoading, stopLoading, updateProgress, setMessage } = useLoading()
  
  function startBatchOperation(message = 'ZURCGI') {
    startLoading('batch', { message, type: 'progress', progress: 0 })
  }
  
  function updateBatchProgress(progress: number, message?: string) {
    updateProgress('batch', progress, message)
  }
  
  function stopBatchOperation() {
    stopLoading('batch')
  }
  
  return {
    startBatchOperation,
    updateBatchProgress,
    stopBatchOperation
  }
} 