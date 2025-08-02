<!-- components/VisitorMap.vue -->
<template>
  <div class="relative w-full h-96">
    <canvas ref="canvasRef"></canvas>
    <p v-if="error" class="absolute inset-0 flex items-center justify-center text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { ChoroplethController } from 'chartjs-chart-geo'
import { feature } from 'topojson-client'

// 註冊所有 Chart.js 組件
Chart.register(...registerables)
// 註冊地理圖表組件
Chart.register(ChoroplethController)

const props = defineProps<{
  countryStats: { country: string; count: number }[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const error = ref('')
let chartInstance: Chart | null = null

const renderChart = async () => {
  // 因為父元件的 v-if 保證了 canvasRef 存在，這裡可以更自信地操作
  if (!canvasRef.value) {
    error.value = 'Canvas 掛載失敗。'
    return
  }

  try {
    if (chartInstance) chartInstance.destroy()

    const worldRes = await fetch('/world-110m.json')
    if (!worldRes.ok) throw new Error('載入地圖檔失敗')
    const topo = await worldRes.json()
    const world = feature(topo, topo.objects.countries)

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

    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
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
    }
  } catch (e: any) {
    error.value = `圖表渲染失敗: ${e.message}`
    console.error('VisitorMap chart error:', e)
  }
}

// onMounted 是渲染此元件的最佳時機
onMounted(async () => {
  // 使用 nextTick 確保萬無一失
  await nextTick()
  renderChart()
})
</script>

<style scoped>
canvas { 
  width: 100%; 
  height: 100%; 
}
</style>
