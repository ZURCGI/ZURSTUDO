// server/api/sitemap.xml.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.siteUrl || 'https://zurcgi.com'
  
  try {
    // 從 API 獲取媒體列表
    const mediaResponse = await $fetch(`${config.public.apiBase}/media/list?page=1&limit=1000`)
    const mediaItems = mediaResponse.items || []
    
    // 生成 sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 靜態頁面 -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/info</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- 動態媒體頁面 -->
  ${mediaItems.map(item => `
  <url>
    <loc>${baseUrl}/archive/${item.publicId}</loc>
    <lastmod>${new Date(item.createdAt || Date.now()).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`
    
    // 設置正確的 Content-Type
    setHeader(event, 'Content-Type', 'application/xml')
    setHeader(event, 'Cache-Control', 'public, max-age=3600') // 1小時快取
    
    return sitemap
  } catch (error) {
    console.error('生成 sitemap 失敗:', error)
    
    // 返回基本的 sitemap
    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/info</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`
    
    setHeader(event, 'Content-Type', 'application/xml')
    return basicSitemap
  }
}) 