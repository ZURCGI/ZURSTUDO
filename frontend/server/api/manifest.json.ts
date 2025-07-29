// server/api/manifest.json.ts
export default defineEventHandler(async (event) => {
  // 設定正確的 Content-Type
  setHeader(event, 'Content-Type', 'application/json')
  setHeader(event, 'Cache-Control', 'public, max-age=86400')
  
  // 返回 manifest.json 的內容
  return {
    name: "ZUR CGI Studio",
    short_name: "ZUR",
    description: "ZUR 效果圖與光雕視覺化專家",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/ZURLOGO.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/ZURLOGO.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  }
})