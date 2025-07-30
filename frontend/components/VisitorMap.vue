<!-- components/VisitorMap.vue -->
<template>
  <div class="bg-white rounded shadow p-4">
    <h3 class="text-lg font-semibold mb-4">訪客國別統計</h3>
    <ClientOnly>
      <template #default>
        <div v-if="loading" class="text-center py-8">載入中...</div>
        <div v-else-if="error" class="text-center py-8 text-red-500">{{ error }}</div>
        <div v-else class="w-full h-96">
          <canvas ref="canvasRef" class="w-full h-full"></canvas>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Chart } from 'chart.js'
import { ChoroplethController } from 'chartjs-chart-geo'
import { feature } from 'topojson-client'
import { useRuntimeConfig } from '#app'
import { useAuth }        from '~/composables/useAuth'

// 只註冊 Controller
Chart.register(ChoroplethController)

interface VisitStat {
  country: string
  count: number
}

const canvasRef = ref<HTMLCanvasElement|null>(null)
const loading = ref(true)
const error = ref('')
const { user, initUser, tokenCookie } = useAuth()
const config = useRuntimeConfig()

// 使用配置中的 API 基礎 URL
const apiBase = config.public.apiBase

onMounted(async () => {
  try {
    console.log('[VisitorMap] onMounted, initial user:', !!user.value)
    
    // 等待 useAuth 初始化完成
    await initUser()
    
    console.log('[VisitorMap] after initUser, user:', !!user.value)
    
    // 檢查用戶是否已登入
    if (!user.value) {
      console.log('[VisitorMap] User not found after initUser')
      error.value = '未登入，無法取得訪客統計'
      loading.value = false
      return
    }
    
    console.log('[VisitorMap] Making request with user:', user.value.username)
    
    console.log('[VisitorMap] Using API base:', apiBase)
    
    // 發送 API 請求，使用 credentials: 'include' 發送 cookie
    const res = await fetch(
      `${apiBase}/analytics/visit-stats`,
      { 
        credentials: 'include', // 發送 cookie 進行認證
        headers: {
          ...(tokenCookie.value ? { 'Authorization': `Bearer ${tokenCookie.value}` } : {})
        }
      }
    )

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[VisitorMap] API response error:', res.status, errorText);
      throw new Error(`訪客統計錯誤：${res.status} - ${errorText}`);
    }
    
    const data: VisitStat[] = await res.json()

    // 從 public 目錄讀 topojson
    const worldRes = await fetch('/world-110m.json')
    if (!worldRes.ok) throw new Error('載入地圖檔失敗')
    const topo = await worldRes.json()

    // 轉成 geojson features
    const world = feature(topo as any, (topo as any).objects.countries) as any

    // 準備 choropleth 資料
    const maxCount = Math.max(...data.map(d => d.count), 1)
    const ds = {
      label: '訪客數',
      data: world.features.map((f: any) => {
        // ISO3 範例，請依後端回傳調整
        const iso3 = f.properties.iso_a3
        const stat = data.find(d => d.country === iso3)
        return { feature: f, value: stat?.count || 0 }
      }),
      backgroundColor: (ctx: any) => {
        const v = ctx.dataset.data[ctx.dataIndex].value
        const a = 0.1 + (v / maxCount) * 0.7
        return `rgba(33,150,243,${a})`
      },
      borderWidth: 0.5,
      borderColor: 'rgba(255,255,255,0.3)',
    }

    const ctx = canvasRef.value?.getContext('2d')
    if (ctx) {
      new Chart(ctx, {
        type: 'choropleth',
        data: {
          labels: world.features.map((f: any) => f.properties.name),
          datasets: [ds],
        },
        options: {
          showOutline: true,
          scales: { xy: { projection: 'equalEarth' } },
          plugins: {
            tooltip: {
              callbacks: {
                label: (c: any) => {
                  const feat = c.dataset.data[c.dataIndex].feature
                  const name = feat.properties.name
                  const val  = c.dataset.data[c.dataIndex].value
                  return `${name}：${val} 次`
                }
              }
            },
            legend: { display: false }
          }
        }
      })
    }
    
    loading.value = false
  } catch (e) {
    // 新增詳細 log
    console.error('[VisitorMap] API 請求失敗:', {
      user: user.value,
      api: `${apiBase}/analytics/visit-stats`,
      error: e,
    })
    error.value = `訪客統計載入失敗：${e?.message || e}`
    loading.value = false
  }
})
</script>

<style scoped>
canvas { 
  width: 100%; 
  height: 100%; 
}
</style>
