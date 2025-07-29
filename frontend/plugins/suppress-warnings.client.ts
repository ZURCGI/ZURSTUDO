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
      
      // 顯示其他警告
      originalWarn.apply(console, args);
    };
  }
}); 