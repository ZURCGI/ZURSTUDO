<!-- pages/admin/dashboard.vue -->
<template>
  <div class="space-y-8">
    <h1 class="text-3xl font-bold text-gray-800">儀表板</h1>
    
    <!-- 統計卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <div class="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4 border border-gray-200 hover:shadow-xl transition-shadow">
        <div class="p-3 bg-blue-100 rounded-full">
          <Icon name="heroicons:users-solid" class="w-7 h-7 text-blue-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">總訪問量</p>
          <p class="text-3xl font-bold text-gray-900">{{ stats.totalVisits || 0 }}</p>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4 border border-gray-200 hover:shadow-xl transition-shadow">
        <div class="p-3 bg-green-100 rounded-full">
          <Icon name="heroicons:calendar-days-solid" class="w-7 h-7 text-green-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">今日訪問</p>
          <p class="text-3xl font-bold text-gray-900">{{ stats.todayVisits || 0 }}</p>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4 border border-gray-200 hover:shadow-xl transition-shadow">
        <div class="p-3 bg-purple-100 rounded-full">
          <Icon name="heroicons:chart-bar-square-solid" class="w-7 h-7 text-purple-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">本週訪問</p>
          <p class="text-3xl font-bold text-gray-900">{{ stats.weeklyVisits || 0 }}</p>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4 border border-gray-200 hover:shadow-xl transition-shadow">
        <div class="p-3 bg-orange-100 rounded-full">
          <Icon name="heroicons:globe-alt-solid" class="w-7 h-7 text-orange-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">國家數量</p>
          <p class="text-3xl font-bold text-gray-900">{{ stats.countryStats?.length || 0 }}</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4 border border-gray-200 hover:shadow-xl transition-shadow">
        <div class="p-3 bg-yellow-100 rounded-full">
          <Icon name="heroicons:clock-solid" class="w-7 h-7 text-yellow-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">平均停留</p>
          <p class="text-3xl font-bold text-gray-900">{{ stats.avgDuration || 0 }} <span class="text-lg">秒</span></p>
        </div>
      </div>
    </div>

    <!-- 訪客地圖和趨勢圖 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 class="text-xl font-semibold mb-4 text-gray-800">訪問趨勢 (近30日)</h3>
        <div v-if="loading" class="flex justify-center items-center h-80">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <div v-else-if="!stats.visitTrend || stats.visitTrend.length === 0" class="text-center py-12">
          <Icon name="heroicons:chart-bar-solid" class="w-16 h-16 mx-auto text-gray-300" />
          <p class="mt-4 text-gray-500">沒有足夠的訪問數據來繪製圖表</p>
        </div>
        <div v-else class="h-80">
          <canvas ref="trendChart"></canvas>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 class="text-xl font-semibold mb-4 text-gray-800">熱門國家</h3>
        <div v-if="loading" class="flex justify-center items-center h-80">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <div v-else-if="!stats.topCountries || stats.topCountries.length === 0" class="text-center py-12">
          <Icon name="heroicons:globe-alt-solid" class="w-16 h-16 mx-auto text-gray-300" />
          <p class="mt-4 text-gray-500">沒有國家數據</p>
        </div>
        <ul v-else class="space-y-4">
          <li 
            v-for="(country, index) in stats.topCountries.slice(0, 10)" 
            :key="country.country"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center gap-4">
              <span class="text-lg font-bold text-gray-400 w-6">#{{ index + 1 }}</span>
              <img
                v-if="country.countryCode"
                :src="`https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png`"
                :alt="country.country || ''"
                class="w-7 h-auto rounded-sm shadow-sm"
              />
              <span v-else class="w-7 h-7 inline-block bg-gray-200 rounded-sm"></span>
              <div>
                <p class="font-semibold text-gray-800">{{ country.country }}</p>
                <p class="text-sm text-gray-500">{{ country.count }} 次訪問</p>
              </div>
            </div>
            <span class="text-lg font-bold text-gray-700">{{ ((country.count / stats.totalVisits) * 100).toFixed(1) }}%</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 訪客地圖 -->
    <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 class="text-xl font-semibold mb-4 text-gray-800">訪客地理分佈</h3>
      <VisitorMap :countryStats="stats.countryStats" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef, watch, onUnmounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRuntimeConfig } from '#app'
import VisitorMap from '~/components/VisitorMap.vue'
import { Chart, registerables } from 'chart.js'

definePageMeta({
  requiresAuth: true,
  layout: 'admin',
})

Chart.register(...registerables)

const { initUser } = useAuth()
const config = useRuntimeConfig()
const loading = ref(false)
const stats = ref({
  totalVisits: 0,
  todayVisits: 0,
  weeklyVisits: 0,
  visitTrend: [],
  topCountries: [],
  countryStats: [],
  avgDuration: 0
})

const trendChart = shallowRef<Chart | null>(null)
const chartCanvas = ref<HTMLCanvasElement | null>(null)

const renderTrendChart = () => {
  // 安全地銷毀現有圖表
  if (trendChart.value && typeof trendChart.value.destroy === 'function') {
    trendChart.value.destroy()
    trendChart.value = null
  }
  
  if (chartCanvas.value && stats.value.visitTrend.length > 0) {
    const ctx = chartCanvas.value.getContext('2d')
    if (ctx) {
      trendChart.value = new Chart(ctx, {
        type: 'line',
        data: {
          labels: stats.value.visitTrend.map(d => formatDate(d.date)),
          datasets: [{
            label: '訪問量',
            data: stats.value.visitTrend.map(d => d.count),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3B82F6',
            pointBorderColor: '#FFFFFF',
            pointHoverBackgroundColor: '#FFFFFF',
            pointHoverBorderColor: '#3B82F6',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#E5E7EB',
              }
            },
            x: {
              grid: {
                display: false,
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
    }
  }
}

const loadStats = async () => {
  try {
    loading.value = true
    const { user, tokenCookie } = useAuth()
    
    // 檢查用戶是否已登入
    if (!user.value) {
      console.log('[Dashboard] User not logged in, skipping stats load')
      return
    }
    
    const response = await $fetch(`${config.public.apiBase}/analytics/dashboard`, {
      credentials: 'include', // 發送 cookie 進行認證
      headers: {
        ...(tokenCookie.value ? { 'Authorization': `Bearer ${tokenCookie.value}` } : {})
      }
    })
    stats.value = response
  } catch (error) {
    console.error('載入統計數據失敗:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })
}

onMounted(async () => {
  await initUser()
  await loadStats()
  renderTrendChart()
})

watch(stats, () => {
  renderTrendChart()
}, { deep: true })

onUnmounted(() => {
  // 組件卸載時清理圖表
  if (trendChart.value && typeof trendChart.value.destroy === 'function') {
    trendChart.value.destroy()
    trendChart.value = null
  }
})

</script>

<style scoped>
.bucharest-loader__overlay {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: rgba(0,0,0,0.8);
  display: inline-block;
}
</style>
