<!-- app.vue -->
<template>
  <div id="app">
    <!-- 網路狀態監控 -->
    <ClientOnly>
      <NetworkStatus />
    </ClientOnly>
    
    <!-- 全域錯誤邊界 -->
    <ErrorBoundary @error="handleGlobalError" @retry="handleRetry">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </ErrorBoundary>
    
    <!-- Toast 通知 -->
    <ClientOnly>
      <Toast />
    </ClientOnly>
    
    <!-- 性能監控儀表板 (僅開發環境) -->
    <ClientOnly>
      <PerformanceDashboard v-if="isDevelopment" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'

// 檢查是否為開發環境
const isDevelopment = process.env.NODE_ENV === 'development'

// 全域錯誤處理
const handleGlobalError = (error: Error, errorInfo: any) => {
  console.error('[App] Global error caught:', error, errorInfo)
  
  // 可以在這裡添加錯誤報告邏輯
  // 例如發送到 Sentry 或其他錯誤追蹤服務
  if (process.env.NODE_ENV === 'production') {
    // reportError(error, errorInfo)
  }
}

// 重試處理
const handleRetry = () => {
  console.log('[App] Retry requested')
  // 可以在這裡添加重試邏輯
}

// 在應用程式客戶端啟動時，嘗試初始化用戶狀態
// 這會處理頁面刷新或用戶帶著有效 cookie 回來的情況
onMounted(() => {
  console.log('[App] Application mounted, initializing user state...')
  const { initUser } = useAuth();
  initUser().then(() => {
    console.log('[App] User state initialization completed')
  }).catch((error) => {
    console.error('[App] User state initialization failed:', error)
  });
})
</script>

<style>
/* 全域樣式 */
html, body {
  margin: 0;
  padding: 0;
  /* 移除固定的 height: 100%，讓佈局 class 來控制 */
}

#app {
  min-height: 100vh;
}

/* 錯誤邊界樣式 */
.error-boundary {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
}
</style>
