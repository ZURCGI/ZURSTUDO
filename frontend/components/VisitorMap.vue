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
import { ref, watch, nextTick } from 'vue'
import { Chart } from 'chart.js'
import { ChoroplethController } from 'chartjs-chart-geo'
import { feature } from 'topojson-client'

// 1. 註冊 Controller
Chart.register(ChoroplethController)

// 2. 定義 props，接收從父元件傳來的數據
const props = defineProps<{
  countryStats: { country: string; count: number }[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const loading = ref(true)
const error = ref('')
let chartInstance: Chart | null = null; // 用於儲存圖表實例，方便銷毀和重建

// 3. 核心渲染函數
const renderMap = async () => {
  // 如果沒有數據或 canvas 未準備好，則不執行
  if (!props.countryStats || props.countryStats.length === 0) {
    console.log('[VisitorMap] No country stats data to render.')
    loading.value = false
    return
  }

  // 確保 canvas DOM 元素已掛載
  await nextTick()

  if (!canvasRef.value) {
    console.error('[VisitorMap] Canvas element is not available.')
    error.value = '無法渲染地圖：Canvas 元素不存在。'
    loading.value = false
    return
  }

  try {
    loading.value = true

    // 銷毀舊的圖表實例，防止記憶體洩漏
    if (chartInstance) {
      chartInstance.destroy()
    }

    // 載入地圖輪廓
    const worldRes = await fetch('/world-110m.json')
    if (!worldRes.ok) throw new Error('載入地圖檔失敗')
    const topo = await worldRes.json()
    const world = feature(topo, topo.objects.countries)

    // 準備圖表數據
    const maxCount = Math.max(...props.countryStats.map(d => d.count), 1)
    const chartData = {
      label: '訪客數',
      data: world.features.map((f) => {
        const stat = props.countryStats.find(d => d.country === f.properties.iso_a3)
        return { feature: f, value: stat?.count || 0 }
      }),
      backgroundColor: (ctx: any) => {
        const value = ctx.dataset.data[ctx.dataIndex]?.value || 0
        const alpha = 0.1 + (value / maxCount) * 0.8
        return `rgba(33, 150, 243, ${alpha})`
      },
      borderColor: 'rgba(255, 255, 255, 0.3)',
      borderWidth: 0.5,
    }

    // 創建新的圖表實例
    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      chartInstance = new Chart(ctx, {
        type: 'choropleth',
        data: {
          labels: world.features.map((f: any) => f.properties.name),
          datasets: [chartData],
        },
        options: {
          showOutline: true,
          scales: { xy: { projection: 'equalEarth' } },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (c: any) => `${c.raw.feature.properties.name}: ${c.raw.value} 次`,
              },
            },
          },
        },
      })
    }
    error.value = ''
  } catch (e: any) {
    console.error('[VisitorMap] Failed to render map:', e)
    error.value = `地圖渲染失敗: ${e.message}`
  } finally {
    loading.value = false
  }
}

// 4. 使用 watch 來監聽 props 的變化
//    immediate: true 確保在元件初次掛載時，如果 props 有初始值，也會立即執行一次
watch(() => props.countryStats, (newVal) => {
  console.log('[VisitorMap] countryStats prop changed, triggering render.', newVal)
  renderMap()
}, { immediate: true, deep: true })

</script>
</script>

<style scoped>
canvas { 
  width: 100%; 
  height: 100%; 
}
</style>
