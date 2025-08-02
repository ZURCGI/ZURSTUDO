<!-- components/VisitorMap.vue -->
<template>
  <div class="relative w-full h-96">
    <canvas ref="canvasRef"></canvas>
    <p v-if="error" class="absolute inset-0 flex items-center justify-center text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { feature } from 'topojson-client'

// 註冊 Chart.js 核心組件
Chart.register(...registerables)

const props = defineProps<{
  countryStats: { country: string; count: number }[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const error = ref('')
let chartInstance: Chart | null = null

onMounted(async () => {
  await nextTick()
  if (!canvasRef.value) {
    error.value = 'Canvas 元素掛載失敗。'
    return
  }

  try {
    // 動態導入 chartjs-chart-geo
    const ChartGeo = await import('chartjs-chart-geo')
    
    // 檢查必要的組件是否存在
    if (!ChartGeo.ChoroplethController) {
      throw new Error('ChoroplethController 組件載入失敗')
    }
    
    // 註冊地理圖表組件
    Chart.register(ChartGeo.ChoroplethController)

    // 載入世界地圖數據
    const worldRes = await fetch('/world-110m.json')
    if (!worldRes.ok) throw new Error('載入地圖檔失敗')
    const topo = await worldRes.json()
    const world = feature(topo, topo.objects.countries)

    // 檢查數據有效性
    if (!props.countryStats || props.countryStats.length === 0) {
      error.value = '沒有國家統計數據可供顯示'
      return
    }

    const maxCount = Math.max(...props.countryStats.map(d => d.count), 1)
    const chartData = {
      label: '訪客數',
      data: world.features.map((f: any) => ({
        feature: f,
        value: props.countryStats.find(d => d.country === f.properties.iso_a3)?.count || 0
      })),
      backgroundColor: (ctx: any) => {
        const value = ctx.dataset.data[ctx.dataIndex]?.value || 0
        const alpha = 0.1 + (value / maxCount) * 0.8
        return `rgba(33, 150, 243, ${alpha})`
      },
      borderColor: 'rgba(255, 255, 255, 0.3)',
      borderWidth: 0.5,
    }

    const ctx = canvasRef.value.getContext('2d')
    if (!ctx) {
      throw new Error('無法獲取 Canvas 2D 上下文')
    }

    // 清理舊的圖表實例
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }
    
    chartInstance = new Chart(ctx, {
      type: 'choropleth',
      data: {
        labels: world.features.map((f: any) => f.properties.name),
        datasets: [chartData]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        showOutline: true,
        scales: {
          projection: {
            axis: 'x',
            projection: 'equalEarth'
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c: any) => `${c.raw.feature.properties.name}: ${c.raw.value} 次`,
            },
          },
        },
      }
    })
  } catch (e: any) {
    error.value = `圖表渲染失敗: ${e.message}`
    console.error('VisitorMap chart error:', e)
  }
})

// 清理圖表實例
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
}
</style>
