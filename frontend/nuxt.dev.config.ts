// nuxt.dev.config.ts - 開發環境專用配置
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // 基本配置
  typescript: { strict: true },
  
  // 開發伺服器
  devServer: {
    port: 5173,
    host: 'localhost',
  },

  // 模組
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@nuxt/image-edge',
    '@nuxtjs/google-fonts',
  ],

  // Google Fonts
  googleFonts: {
    families: {
      'Noto+Sans+TC': [400, 700],
    },
    display: 'swap',
    preload: true,
  },

  // CSS
  css: [
    '@photo-sphere-viewer/core/index.css',
    '~/assets/styles/view360-cursor.css',
  ],

  // Vite 配置
  vite: {
    server: {
      hmr: {
        port: 24678,
      },
    },
    optimizeDeps: {
      include: ['three'],
    },
    ssr: {
      noExternal: ['three'],
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    logLevel: 'warn',
    resolve: {
      alias: {
        'three': require.resolve('three')
      }
    },
  },

  // 開發工具
  devtools: {
    enabled: true,
  },

  // 實驗性功能
  experimental: {
    componentIslands: true,
    payloadExtraction: false,
    inlineSSRStyles: false,
    renderJsonPayloads: true,
    bundle: {
      optimizeTranslationDirective: false
    },
    viteNode: {
      experimental: {
        hmr: {
          port: 24678
        }
      }
    }
  },

  // Runtime Config
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000',
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      siteUrl: 'https://zurcgi.com/',
    },
    geminiApiKey: process.env.GEMINI_API_KEY,
    huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
  },

  // 應用配置
  app: {
    head: {
      titleTemplate: '%s | ZUR STUDIO',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'robots', content: 'index, follow' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    }
  },
}) 