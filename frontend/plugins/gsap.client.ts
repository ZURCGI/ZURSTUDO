// plugins/gsap.client.ts
import { defineNuxtPlugin } from '#app';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    gsap.registerPlugin(ScrollTrigger, Flip);

    // --- 核心優化：使用 matchMedia ---
    const mm = gsap.matchMedia();

    // 只在使用者未要求減少動態效果時，才執行動畫相關的設定
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // 您可以在這裡放置需要全域初始化的動畫邏輯
      // console.log("Animations are enabled for this user.");

      // 返回一個清理函數，當使用者切換設定時，GSAP 會自動清理
      return () => {
        // console.log("Cleaning up animations for reduced motion.");
        ScrollTrigger.getAll().forEach(t => t.kill());
      };
    });
    // --------------------------------

    nuxtApp.provide('gsap', gsap);
    nuxtApp.provide('ScrollTrigger', ScrollTrigger);
    nuxtApp.provide('Flip', Flip);
  }
});
