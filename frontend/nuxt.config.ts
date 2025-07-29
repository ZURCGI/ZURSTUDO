// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // ── 相容性日期 ───────────────────────────────────────
  compatibilityDate: '2025-06-29',

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
    optimizeDeps: {
      include: ['three'],
    },
    ssr: {
      noExternal: ['three'],
    },
    define: {
      // 解決 Three.js 多重實例警告
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    // 抑制開發時的警告
    logLevel: 'warn',
    resolve: {
      alias: {
        'three': require.resolve('three')
      }
    },
    // 解決中間件重複註冊警告
    // 使用 suppress-warnings.client.ts 插件來處理警告
    // 優化 build 配置
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // 核心框架
            'vendor': ['vue', 'vue-router'],
            // 動畫庫
            'animation': ['gsap'],
            // 3D 相關
            'three': ['three'],
            'photo-sphere': ['@photo-sphere-viewer/core'],
            // 圖表庫
            'charts': ['chart.js', 'vue-chartjs', 'chartjs-chart-geo'],
            // 影片播放
            'video': ['video.js'],
            // 地圖資料
            'maps': ['topojson-client'],
            // Cloudinary
            'cloudinary': ['cloudinary'],
          },
          // 設置 chunk 大小警告閾值
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
      // 設置 chunk 大小警告閾值為 1MB
      chunkSizeWarningLimit: 1000,
      // 啟用 terser 壓縮
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
          drop_debugger: true,
        },
      },
    },
    // 靜態資源處理
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp'],
    publicDir: 'public',
  },

  // ── 快取優化 ─────────────────────────────────────────
  nitro: {
    storage: {
      redis: {
        driver: 'redis',
        /* redis 配置 */
      }
    },
    // 靜態資源快取
    routeRules: {
      '/assets/**': { 
        headers: { 
          'cache-control': 'public, max-age=31536000, immutable' 
        } 
      },
      '/_nuxt/**': { 
        headers: { 
          'cache-control': 'public, max-age=31536000, immutable' 
        } 
      },
      'https://res.cloudinary.com/**': { 
        headers: { 
          'cache-control': 'public, max-age=2592000' 
        } 
      },
    },
    // 解決中間件重複註冊問題
    experimental: {
      wasm: true
    }
  },

  // ── 開發時配置 ───────────────────────────────────────
  devtools: false,

  // ── 中間件配置 ───────────────────────────────────────
  routeRules: {
    '/manifest.json': { 
      headers: { 
        'cache-control': 'public, max-age=86400' 
      } 
    },
    '/.well-known/appspecific/com.chrome.devtools.json': {
      statusCode: 200,
      body: '{}',
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=86400'
      }
    },
  },

  // ── 全局 Runtime Config ─────────────────────────────────
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000',
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      siteUrl: 'https://zurcgi.com/',
    },
    // 伺服器端環境變數
    huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
  },

  // ── 頁面 Head 設定 ─────────────────────────────────────
  app: {
    head: {
      titleTemplate: '%s | ZUR STUDIO',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        // SEO 相關內容將由 useAppSeoMeta 動態注入
        { name: 'robots', content: 'index, follow' },
        {
          'http-equiv': 'Content-Security-Policy',
          content: `default-src 'self'; img-src 'self' https://res.cloudinary.com data: blob:; media-src 'self' https://res.cloudinary.com data: blob:; connect-src 'self' ${process.env.NUXT_PUBLIC_API_BASE || 'https://zur-backend.onrender.com'} https://res.cloudinary.com https://api.cloudinary.com https://api.iconify.design data: blob:; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline'; worker-src 'self' blob:; frame-src https://www.instagram.com;`
        },
        // GEO
        { name: 'geo.region', content: 'TW-TPE' },
        { name: 'geo.placename', content: 'Taipei, Taiwan' },
        { name: 'geo.position', content: '25.0330;121.5654' },
        { name: 'ICBM', content: '25.0330,121.5654' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // Canonical and hreflang are now dynamically generated by useAppSeoMeta
        { rel: 'preconnect', href: 'https://res.cloudinary.com', crossorigin: 'anonymous' },
        { rel: 'preconnect', href: 'https://api.iconify.design', crossorigin: 'anonymous' },
        { rel: 'preload', as: 'image', href: process.env.CLOUDINARY_DEFAULT_IMAGE || 'https://res.cloudinary.com/dfiwsow3h/image/upload/w_800/v1749830240/ZURSTUDIO_nf1k8o.webp' },
        { rel: 'manifest', href: '/manifest.json' },
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ZUR CGI STUDIO",
            "url": "https://zurcgi.com/",
            "logo": process.env.CLOUDINARY_DEFAULT_IMAGE || "https://res.cloudinary.com/dfiwsow3h/image/upload/w_800/v1749830240/ZURSTUDIO_nf1k8o.webp",
            "description": "ZUR delivers world-class 3D renderings, animation, projection mapping, and VR services for luxury real estate, commercial, and product visualization. Our portfolio spans Taiwan, Europe, the Middle East, and the US, serving top clients worldwide.",
            "foundingDate": "2020",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "No. 112, Dadun 7th St., Nantun Dist.",
              "addressLocality": "Taichung City",
              "addressRegion": "Taiwan",
              "postalCode": "408",
              "addressCountry": "TW"
            },
            "contactPoint": [{
              "@type": "ContactPoint",
              "telephone": "+886-4-36035345",
              "contactType": "customer service",
              "areaServed": ["TW", "US", "EU", "AE"],
              "availableLanguage": ["Chinese", "English"],
              "email": "zurcgistudio@gmail.com"
            }],
            "sameAs": [
              "https://www.instagram.com/zurcgi",
              "https://www.facebook.com/zurcgi"
            ]
          })
        },
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "ZUR CGI STUDIO",
            "image": process.env.CLOUDINARY_DEFAULT_IMAGE || "https://res.cloudinary.com/dfiwsow3h/image/upload/w_800/v1749830240/ZURSTUDIO_nf1k8o.webp",
            "description": "ZUR delivers world-class 3D renderings, animation, projection mapping, and VR services for luxury real estate, commercial, and product visualization. Our portfolio spans Taiwan, Europe, the Middle East, and the US, serving top clients worldwide.",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "No. 112, Dadun 7th St., Nantun Dist.",
              "addressLocality": "Taichung City",
              "addressRegion": "Taiwan",
              "postalCode": "408",
              "addressCountry": "TW"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 24.1477,
              "longitude": 120.6736
            },
            "telephone": "+886-4-36035345",
            "email": "zurcgistudio@gmail.com",
            "url": "https://zurcgi.com/",
            "openingHours": "Mo-Fr 09:00-18:00",
            "priceRange": "$$",
            "serviceArea": {
              "@type": "GeoCircle",
              "geoMidpoint": {
                "@type": "GeoCoordinates",
                "latitude": 24.1477,
                "longitude": 120.6736
              },
              "geoRadius": "50000"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "3D Visualization Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "3D Rendering",
                    "description": "High-quality 3D architectural visualization"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Animation",
                    "description": "3D animation and walkthrough services"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Projection Mapping",
                    "description": "Light show and projection mapping"
                  }
                }
              ]
            }
          })
        }
      ]
    }
  },

  security: {
    headers: {
      contentSecurityPolicy: {
        'connect-src': [
          "'self'",
          'http://localhost:3000',
          'https://res.cloudinary.com',
          'https://api.cloudinary.com',
          'https://api.iconify.design',
          'data:',
          'blob:'
        ]
      }
    }
  },
})
