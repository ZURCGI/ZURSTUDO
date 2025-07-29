// 抑制特定警告訊息的插件
export default defineNuxtPlugin(() => {
  if (process.client) {
    // 保存原始的 console.warn
    const originalWarn = console.warn;
    
    // 重寫 console.warn 來過濾特定警告
    console.warn = (...args) => {
      const message = args[0];
      
      // 過濾 manifest-route-rule 警告
      if (typeof message === 'string' && 
          message.includes('manifest-route-rule') && 
          message.includes('middleware already exists')) {
        return; // 不顯示這個警告
      }
      
      // 過濾其他常見的 Nuxt 警告
      if (typeof message === 'string' && 
          (message.includes('middleware already exists') ||
           message.includes('duplicate middleware'))) {
        return; // 不顯示重複中間件警告
      }
      
      // 過濾 Cloudinary 模組外部化警告
      if (typeof message === 'string' && 
          message.includes('Module') && 
          message.includes('has been externalized for browser compatibility') &&
          message.includes('cloudinary')) {
        return; // 不顯示 Cloudinary 外部化警告
      }
      
      // 過濾 Three.js 多重實例警告
      if (typeof message === 'string' && 
          message.includes('Multiple instances of Three.js being imported')) {
        return; // 不顯示 Three.js 多重實例警告
      }
      
      // 過濾 Suspense 實驗性功能警告
      if (typeof message === 'string' && 
          message.includes('<Suspense> is an experimental feature')) {
        return; // 不顯示 Suspense 警告
      }
      
      // 過濾 Vue 3 常見警告
      if (typeof message === 'string' && 
          (message.includes('Vue received a Component') ||
           message.includes('Failed to resolve component'))) {
        return; // 不顯示組件解析警告
      }
      
      // 過濾 Hydration 不匹配警告
      if (typeof message === 'string' && 
          message.includes('Hydration node mismatch')) {
        return; // 不顯示 Hydration 不匹配警告
      }
      
      // 過濾 Transition 動畫警告
      if (typeof message === 'string' && 
          message.includes('Component inside <Transition> renders non-element root node')) {
        return; // 不顯示 Transition 警告
      }
      
      // 過濾 Nuxt 路由警告
      if (typeof message === 'string' && 
          message.includes('does not have a single root node')) {
        return; // 不顯示路由根節點警告
      }
      
      // 過濾長任務警告（除非真的很長）
      if (typeof message === 'string' && 
          message.includes('長任務檢測') && 
          args.length > 1 && 
          typeof args[1] === 'number' && 
          args[1] < 200) {
        return; // 不顯示較短的長任務警告
      }
      
      // 過濾記憶體洩漏警告（除非真的很嚴重）
      if (typeof message === 'string' && 
          message.includes('DOM 節點數量急劇增加')) {
        return; // 不顯示記憶體洩漏警告
      }
      
      // 過濾記憶體使用警告（除非真的很嚴重）
      if (typeof message === 'string' && 
          message.includes('記憶體使用過高') && 
          args.length > 1 && 
          typeof args[1] === 'number' && 
          args[1] < 100) {
        return; // 不顯示較低的記憶體使用警告
      }
      
      // 過濾連續長任務警告（除非真的很嚴重）
      if (typeof message === 'string' && 
          message.includes('連續長任務檢測') && 
          args.length > 1 && 
          typeof args[1] === 'object' && 
          args[1].duration < 500) {
        return; // 不顯示較短的連續長任務警告
      }
      
      // 過濾 GSAP 動畫警告
      if (typeof message === 'string' && 
          message.includes('[Animation] GSAP context or timeline not ready')) {
        return; // 不顯示 GSAP 動畫警告
      }
      
      // 過濾組件清理警告
      if (typeof message === 'string' && 
          message.includes('🧹 清理組件資源')) {
        return; // 不顯示組件清理警告
      }
      
      // 過濾 PhotoSphereViewer 警告
      if (typeof message === 'string' && 
          message.includes('PhotoSphereViewer: Unknown button')) {
        return; // 不顯示 PhotoSphereViewer 按鈕警告
      }
      
      // 過濾 Hydration 不匹配警告
      if (typeof message === 'string' && 
          message.includes('Hydration completed but contains mismatches')) {
        return; // 不顯示 Hydration 不匹配警告
      }
      
      // 顯示其他警告
      originalWarn.apply(console, args);
    };
  }
}); 