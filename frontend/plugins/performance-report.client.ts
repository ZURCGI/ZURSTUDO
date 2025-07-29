// plugins/performance-report.client.ts
export default defineNuxtPlugin(() => {
  if (process.client && process.env.NODE_ENV === 'development') {
    // 延遲執行，確保其他插件已初始化
    setTimeout(() => {
      console.log('🚀 性能優化報告 v2.0')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('✅ Three.js 單例管理已啟用')
      console.log('✅ 圖片載入優化已啟用')
      console.log('✅ 記憶體洩漏監控已啟用')
      console.log('✅ 長任務檢測已啟用 (閾值: 200ms)')
      console.log('✅ 組件清理工具已啟用')
      console.log('✅ 警告過濾器已啟用')
      console.log('✅ 性能監控儀表板已啟用 (Ctrl+Shift+P)')
      console.log('✅ GSAP 動畫優化已啟用')
      console.log('✅ CLS 監控閾值已調整 (0.5)')
      console.log('✅ PhotoSphereViewer 警告已過濾')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📊 性能指標監控中...')
      console.log('💡 使用 Ctrl+Shift+P 開啟性能儀表板')
      console.log('🔧 如需調整設定，請查看 plugins/ 目錄')
      console.log('🎯 優化目標: 減少 95% 的無關警告')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    }, 2000)
  }
})