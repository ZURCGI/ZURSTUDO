// composables/useComponentCleanup.ts
import { onUnmounted, ref } from 'vue'

export function useComponentCleanup() {
  const cleanupTasks = ref<Array<() => void>>([])
  const isCleanedUp = ref(false)

  // 添加清理任務
  const addCleanupTask = (task: () => void) => {
    if (!isCleanedUp.value) {
      cleanupTasks.value.push(task)
    }
  }

  // 清理所有任務
  const cleanup = () => {
    if (isCleanedUp.value) return

    // 只有在有清理任務時才顯示日誌
    if (cleanupTasks.value.length > 0) {
      console.log('🧹 清理組件資源...')
    }
    
    cleanupTasks.value.forEach(task => {
      try {
        task()
      } catch (error) {
        console.warn('清理任務執行失敗:', error)
      }
    })
    
    cleanupTasks.value = []
    isCleanedUp.value = true
  }

  // 在組件卸載時自動清理
  onUnmounted(() => {
    cleanup()
  })

  return {
    addCleanupTask,
    cleanup,
    isCleanedUp: isCleanedUp.value
  }
}