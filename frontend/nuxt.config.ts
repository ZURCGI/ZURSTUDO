// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // ── 相容性日期 ───────────────────────────────────────
  compatibilityDate: '2025-06-29',

  // ── 目錄配置 ─────────────────────────────────────────
  dir: {
    public: 'public'
  },

  // ── 靜態生成配置 ─────────────────────────────────────
  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: false,
      routes: ['/', '/admin/login', '/manifest.json'],
      ignore: ['/admin/dashboard', '/admin/media-library', '/admin/project-management', '/admin/seo-settings', '/admin/upload-media', '/admin/user-management', '/admin/change-password']
    }
  },

  // ── SSR 配置 ─────────────────────────────────────────
  ssr: false,

  // ── TypeScript 嚴格模式 ──────────────────────────────────
  typescript: { strict: true },

  // ── 實驗性功能 ───────────────────────────────────────
  experimental: {
    // 啟用 Suspense 功能
    componentIslands: true,
    // 其他實驗性功能
    payloadExtraction: false,
    inlineSSRStyles: false,
    renderJsonPayloads: true,
    bundle: {
      optimizeTranslationDirective: false
    },
    // 解決 manifest 問題
    viteNode: {
      experimental: {
        hmr: {
          port: 24678
        }
      }
    },
    // 解決中間件重複註冊警告
    asyncContext: true,
    crossOriginPrefetch: false,
    // 禁用內建的中間件自動註冊
    middleware: {
      global: false
    }
  },

  // ── 模組 ───────────────────────────────────────────────
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@nuxt/image-edge',
    '@nuxtjs/google-fonts',
  ],

  // ── Tailwind CSS 配置 ──────────────────────────────────
  tailwindcss: {
    cssPath: '~/assets/styles/tailwind.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    injectPosition: 0,
    viewer: true,
  },

  // ── Google Fonts ───────────────────────────────────────
  googleFonts: {
    families: {
      'Noto+Sans+TC': [400, 700],
    },
    display: 'swap',
    preload: true,
  },

  // ── 全域 CSS ──────────────────────────────────────────
  css: [
    '@photo-sphere-viewer/core/index.css',
  ],

  // ── 開發伺服器 ─────────────────────────────────────────
  devServer: {
    port: 5173,
    host: 'localhost',
  },

  // ── Vite 配置 ─────────────────────────────────────────
  vite: {
    server: {
      hmr: {
        port: 24678,
      },
    },
    // 性能優化配置
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'three': ['three'],
            'gsap': ['gsap'],
            'photo-sphere': ['@photo-sphere-viewer/core']
          }
        }
      }
    },
    // 優化依賴項
    optimizeDeps: {
      include: ['three', 'gsap', '@photo-sphere-viewer/core']
    }
  },

  // ── 應用配置 ─────────────────────────────────────────
  app: {
    // 性能優化
    head: {
      // 預載入關鍵資源
      link: [
        { rel: 'preload', as: 'style', href: '/css/tailwind.css' }
      ],
      // 防止佈局偏移
      htmlAttrs: {
        style: 'scroll-behavior: smooth;'
      }
    },
    // 頁面轉場優化
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    }
  },

  // ── 運行時配置 ───────────────────────────────────────
  runtimeConfig: {
    // 公開配置
    public: {
      // 性能監控配置
      performanceMonitoring: {
        enabled: process.env.NODE_ENV === 'development',
        logLevel: 'warn'
      }
    }
  },

  // ── 插件配置 ─────────────────────────────────────────
  plugins: [
    // 確保插件按正確順序載入
    '~/plugins/performance-optimizer.client.ts',
    '~/plugins/three-singleton.client.ts',
    '~/plugins/performance-monitor.client.ts',
    '~/plugins/suppress-warnings.client.ts',
    '~/plugins/performance-report.client.ts'
  ],

  // ── 構建優化 ─────────────────────────────────────────
  build: {
    // 啟用現代化構建
    modern: true,
    // 優化包大小
    analyze: process.env.NODE_ENV === 'development',
    // 分離 CSS
    extractCSS: true
  },

  // ── 圖片優化 ─────────────────────────────────────────
  image: {
    // 圖片優化配置
    quality: 85,
    format: ['webp', 'avif'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    }
  }
})
