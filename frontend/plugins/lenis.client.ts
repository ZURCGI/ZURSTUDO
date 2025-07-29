import Lenis from 'lenis';

export default defineNuxtPlugin(() => {
  // 🔍 檢查是否在後台頁面
  const isAdminPage = () => {
    if (process.client) {
      return window.location.pathname.startsWith('/admin');
    }
    return false;
  };

  // 只在非後台頁面啟用 Lenis
  if (!isAdminPage()) {
    const lenis = new Lenis({
      lerp: 0.1, // 數值越小越平滑，但延遲感也越強
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 將 lenis 實例注入，方便在其他地方使用
    return {
      provide: { lenis },
    };
      } else {
      return {
        provide: { lenis: null },
      };
    }
}); 