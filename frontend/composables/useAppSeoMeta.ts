import { useHead, useRuntimeConfig, useRoute } from '#app'
import { ref, onMounted } from 'vue'
import type { SiteSetting, JSONLDMeta, MetaItem, Project } from 'types/project'

// 中東關鍵字，避免 ReferenceError
const middleEastKeywords = [
  '中東', '沙烏地', '杜拜', '阿聯酋', '卡達', '阿曼', '科威特', '巴林', '黎巴嫩', '以色列', '伊朗', '伊拉克', '約旦', '敘利亞', '土耳其', '埃及'
]

// 國際頂級 3D/CGI 公司關鍵字
const internationalKeywords = [
  'Neoscape', 'Brick Visual', 'Mir', 'The Boundary', 'DBOX', 'Luxigon', 'Beauty and The Bit', 'Kilograph', 'Hayes Davidson', 'Binyan Studios'
]

interface SeoOptions {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  faqList?: Array<{ question: string; answer: string }>
  address?: string
  lat?: number | null
  lng?: number | null
  city?: string
  zipcode?: string
  type?: 'website' | 'article' | 'profile' | string
  extraMeta?: MetaItem[]
  articleData?: Partial<Project>
  // 新增多語支援
  siteKeywordsZh?: string
  siteKeywordsEn?: string
  siteDescriptionZh?: string
  siteDescriptionEn?: string
  faqListZh?: Array<{ question: string; answer: string }>
  faqListEn?: Array<{ question: string; answer: string }>
}

export function useAppSeoMeta(options: SeoOptions) {
  const config = useRuntimeConfig()
  const route = useRoute()
  const siteSetting = ref<SiteSetting|null>(null)

  onMounted(async () => {
    // 取得全站 SEO 設定
    try {
      siteSetting.value = await $fetch(`${config.public.apiBase}/settings`, { credentials: 'include' })
    } catch (e) {
      siteSetting.value = {}
    }
    injectHead()
  })

  function injectHead() {
    const s = siteSetting.value || {}
    const title = options.title || s.siteTitle || 'ZUR STUDIO'
    const description = options.description || s.siteDescription || ''
    
    // 合併多語關鍵字
    const keywordsZh = options.siteKeywordsZh || s.siteKeywordsZh || ''
    const keywordsEn = options.siteKeywordsEn || s.siteKeywordsEn || ''
    const keywords = [
      ...(options.keywords ? options.keywords.split(',').map(k=>k.trim()) : []),
      ...(s.siteKeywords ? s.siteKeywords.split(',').map(k=>k.trim()) : []),
      ...keywordsZh.split(',').map(k=>k.trim()),
      ...keywordsEn.split(',').map(k=>k.trim()),
      ...middleEastKeywords,
      ...internationalKeywords
    ].filter(Boolean).join(', ')
    
    const ogImage = options.ogImage || s.ogImage || ''
    const type = options.type || 'website'
    
    // 增強 meta 標籤
    const meta = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: s.siteTitle || 'ZUR STUDIO' },
      { name: 'robots', content: s.robots || 'index, follow' },
      { name: 'sitemap', content: s.sitemap || '/sitemap.xml' },
      // 新增多語 meta
      { name: 'description', content: options.siteDescriptionZh || s.siteDescriptionZh || description },
      { name: 'keywords', content: keywordsZh },
      { property: 'og:description', content: options.siteDescriptionEn || s.siteDescriptionEn || description },
      // 新增國際化 meta
      { name: 'geo.region', content: 'TW-TPE' },
      { name: 'geo.placename', content: 'Taichung, Taiwan' },
      { name: 'geo.position', content: '24.1477;120.6736' },
      { name: 'ICBM', content: '24.1477,120.6736' },
      // 新增作者與版權
      { name: 'author', content: 'ZUR CGI STUDIO' },
      { name: 'copyright', content: 'ZUR CGI STUDIO' },
      // 新增 viewport 優化
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5' },
      // 新增語言標籤
      { name: 'language', content: 'zh-TW,en' },
      { name: 'content-language', content: 'zh-TW,en' },
      ...(options.extraMeta || [])
    ]
    
    // 增強 JSON-LD 結構化資料
    let jsonLd: JSONLDMeta[] = []
    
    // 1. Organization 結構化資料
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'ZUR CGI STUDIO',
      'url': 'https://zurcgi.com/',
      'logo': process.env.CLOUDINARY_DEFAULT_IMAGE || 'https://res.cloudinary.com/dfiwsow3h/image/upload/w_800/v1749830240/ZURSTUDIO_nf1k8o.webp',
      'description': description,
      'foundingDate': '2020',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'No. 112, Dadun 7th St., Nantun Dist.',
        'addressLocality': 'Taichung City',
        'addressRegion': 'Taiwan',
        'postalCode': '408',
        'addressCountry': 'TW'
      },
      'contactPoint': [{
        '@type': 'ContactPoint',
        'telephone': '+886-4-36035345',
        'contactType': 'customer service',
        'areaServed': ['TW', 'US', 'EU', 'AE'],
        'availableLanguage': ['Chinese', 'English'],
        'email': 'zurcgistudio@gmail.com'
      }],
      'sameAs': [
        'https://www.instagram.com/zurcgi',
        'https://www.facebook.com/zurcgi'
      ]
    })
    
    // 2. LocalBusiness 結構化資料
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      'name': 'ZUR CGI STUDIO',
      'image': process.env.CLOUDINARY_DEFAULT_IMAGE || 'https://res.cloudinary.com/dfiwsow3h/image/upload/w_800/v1749830240/ZURSTUDIO_nf1k8o.webp',
      'description': description,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'No. 112, Dadun 7th St., Nantun Dist.',
        'addressLocality': 'Taichung City',
        'addressRegion': 'Taiwan',
        'postalCode': '408',
        'addressCountry': 'TW'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': 24.1477,
        'longitude': 120.6736
      },
      'telephone': '+886-4-36035345',
      'email': 'zurcgistudio@gmail.com',
      'url': s.ogImage || process.env.CLOUDINARY_DEFAULT_IMAGE || 'https://res.cloudinary.com/dfiwsow3h/image/upload/w_800/v1749830240/ZURSTUDIO_nf1k8o.webp',
      'openingHours': 'Mo-Fr 09:00-18:00',
      'priceRange': '$$',
      'serviceArea': {
        '@type': 'GeoCircle',
        'geoMidpoint': {
          '@type': 'GeoCoordinates',
          'latitude': 24.1477,
          'longitude': 120.6736
        },
        'geoRadius': '50000'
      },
      'hasOfferCatalog': {
        '@type': 'OfferCatalog',
        'name': '3D Visualization Services',
        'itemListElement': [
          {
            '@type': 'Offer',
            'itemOffered': {
              '@type': 'Service',
              'name': '3D Rendering',
              'description': 'High-quality 3D architectural visualization'
            }
          },
          {
            '@type': 'Offer',
            'itemOffered': {
              '@type': 'Service',
              'name': 'Animation',
              'description': '3D animation and walkthrough services'
            }
          },
          {
            '@type': 'Offer',
            'itemOffered': {
              '@type': 'Service',
              'name': 'Projection Mapping',
              'description': 'Light show and projection mapping'
            }
          }
        ]
      }
    })
    
    // 3. FAQ JSON-LD（多語支援）
    const faqListZh = options.faqListZh || s.faqListZh || []
    const faqListEn = options.faqListEn || s.faqListEn || []
    const faqList = options.faqList || s.faqList || []
    
    if (faqListZh.length > 0 || faqListEn.length > 0 || faqList.length > 0) {
      const allFaqs = [...faqListZh, ...faqListEn, ...faqList]
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': allFaqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': { '@type': 'Answer', 'text': faq.answer }
        }))
      })
    }
    
    // 4. Service 結構化資料
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': 'ZUR CGI Studio Services',
      'description': 'Professional 3D visualization, animation, and projection mapping services',
      'provider': {
        '@type': 'Organization',
        'name': 'ZUR CGI STUDIO'
      },
      'serviceType': '3D Visualization',
      'areaServed': ['TW', 'US', 'EU', 'AE'],
      'hasOfferCatalog': {
        '@type': 'OfferCatalog',
        'name': 'Visualization Services',
        'itemListElement': [
          {
            '@type': 'Offer',
            'itemOffered': {
              '@type': 'Service',
              'name': '3D Architectural Rendering',
              'description': 'Photorealistic 3D renderings for architecture and interior design'
            }
          },
          {
            '@type': 'Offer',
            'itemOffered': {
              '@type': 'Service',
              'name': '3D Animation',
              'description': 'Dynamic 3D animations and walkthroughs'
            }
          },
          {
            '@type': 'Offer',
            'itemOffered': {
              '@type': 'Service',
              'name': 'Projection Mapping',
              'description': 'Light shows and projection mapping for events and exhibitions'
            }
          }
        ]
      }
    })

    // 5. Article JSON-LD (for project pages)
    if (type === 'article' && options.articleData) {
      const article = options.articleData
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': article.title,
        'image': article.coverImage,
        'datePublished': article.createdAt || new Date().toISOString(),
        'dateModified': article.updatedAt || new Date().toISOString(),
        'author': [{
          '@type': 'Organization',
          'name': s.siteAuthor || 'ZUR CGI STUDIO',
          'url': siteUrl
        }],
        'publisher': {
          '@type': 'Organization',
          'name': s.sitePublisher || 'ZUR CGI STUDIO',
          'logo': {
            '@type': 'ImageObject',
            'url': s.ogImage || 'https://res.cloudinary.com/dfiwsow3h/image/upload/w_800/v1749830240/ZURSTUDIO_nf1k8o.webp'
          }
        },
        'description': article.excerpt || description,
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': canonicalUrl
        }
      })
    }
    
    // 動態產生 Canonical 與 Hreflang
    const siteUrl = (config.public.siteUrl || 'https://zurcgi.com/').replace(/\/$/, '')
    const path = route.path
    let neutralPath: string

    if (path.startsWith('/en')) {
      neutralPath = path.substring(3) || '/'
    } else {
      neutralPath = path
    }

    const canonicalUrl = `${siteUrl}${path}`
    const zhUrl = `${siteUrl}${neutralPath}`
    const enUrl = `${siteUrl}/en${neutralPath === '/' ? '' : neutralPath}`

    const links = [
      { rel: 'canonical', href: canonicalUrl },
      { rel: 'alternate', hreflang: 'zh-TW', href: zhUrl },
      { rel: 'alternate', hreflang: 'en', href: enUrl },
      { rel: 'alternate', hreflang: 'x-default', href: zhUrl }
    ]

    useHead({
      title,
      meta,
      link: links,
      script: jsonLd.length > 0 ? jsonLd.map(j => ({ type: 'application/ld+json', innerHTML: JSON.stringify(j) })) : []
    })
  }
}
