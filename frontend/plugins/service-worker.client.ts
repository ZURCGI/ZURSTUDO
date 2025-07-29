// plugins/service-worker.client.ts
export default defineNuxtPlugin(() => {
  // 暫時禁用 Service Worker 以專注於 API 問題
  if (process.client && 'serviceWorker' in navigator && false) {
    // 註冊 Service Worker
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[SW] Service Worker registered:', registration);
        }
        
        // 檢查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                if (process.env.NODE_ENV === 'development') {
                  console.log('[SW] New version available');
                }
                // 可以在這裡顯示更新提示
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[SW] Service Worker registration failed:', error);
      });
    
    // 處理 Service Worker 消息
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[SW] Message received:', event.data);
      }
    });
  }
}); 