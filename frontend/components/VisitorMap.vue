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
import { ref, onMounted, watch, nextTick } from 'vue'
import { Chart } from 'chart.js'
import { ChoroplethController } from 'chartjs-chart-geo'
import { feature } from 'topojson-client'

// 註冊 Controller
Chart.register(ChoroplethController)

// 1. 定義 props
const props = defineProps<{
  countryStats: { country: string; count: number }[]
}>()

// 2. 設置 refs
const canvasRef = ref<HTMLCanvasElement | null>(null)
const loading = ref(true)
const error = ref('')
let chartInstance: Chart | null = null

// 3. 核心渲染函數 (現在它只負責繪圖)
const renderChart = async (stats: { country: string; count: number }[]) => {
  console.log('[VisitorMap] renderChart called with stats:', stats)
  console.log('[VisitorMap] canvasRef.value:', canvasRef.value)
  
  if (!canvasRef.value) {
    console.error('[VisitorMap] Render attempt failed: Canvas element not ready.')
    error.value = 'Canvas 元素尚未準備好。'
    return
  }

  if (!stats || stats.length === 0) {
    console.log('[VisitorMap] No data to render.')
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = ''
    if (chartInstance) {
      chartInstance.destroy()
    }

    const worldRes = await fetch('/world-110m.json')
    if (!worldRes.ok) throw new Error('載入地圖檔失敗')
    const topo = await worldRes.json()
    const world = feature(topo, topo.objects.countries)

    const maxCount = Math.max(...stats.map(d => d.count), 1)
    const chartData = {
      label: '訪客數',
      data: world.features.map((f) => {
        const stat = stats.find(d => d.country === f.properties.iso_a3)
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

    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      chartInstance = new Chart(ctx, {
        type: 'choropleth',
        data: {
          labels: world.features.map((f: any) => f.properties.name),
          datasets: [chartData],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
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
    loading.value = false
  } catch (e: any) {
    console.error('[VisitorMap] Failed to render chart:', e)
    error.value = `圖表渲染失敗: ${e.message}`
    loading.value = false
  }
}

// 4. onMounted: 當元件掛載後，我們才開始監聽數據
onMounted(() => {
  console.log('[VisitorMap] onMounted triggered')
  console.log('[VisitorMap] canvasRef.value on mount:', canvasRef.value)
  
  // 使用 nextTick 確保 DOM 完全更新
  nextTick(() => {
    console.log('[VisitorMap] after nextTick, canvasRef.value:', canvasRef.value)
    
    if (canvasRef.value) {
      console.log('[VisitorMap] Canvas found, setting up watch')
      // 使用 watch 來監聽從父元件傳來的 props
      // immediate: true 確保如果初始 props 有數據，就立刻渲染一次
      watch(() => props.countryStats, (newStats) => {
        console.log('[VisitorMap] countryStats updated, calling renderChart.', newStats)
        renderChart(newStats)
      }, { immediate: true, deep: true })
    } else {
      // 這是一個備用的錯誤處理，正常情況下不應該觸發
      console.error('[VisitorMap] Canvas element not found on mount!')
      error.value = '無法找到地圖的掛載點。'
      loading.value = false
    }
  })
})
</script>

<style scoped>
canvas { 
  width: 100%; 
  height: 100%; 
}
</style>
