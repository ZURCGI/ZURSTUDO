<!-- layouts/default.vue -->
<template>
  <SitePreloader v-if="route.path === '/' && !isLoaded" @loaded="onPreloaderFinish" />
  <div>
    <nav
      :class="[
        'fixed top-0 left-0 w-full z-50 transition-transform transition-colors duration-200',
        showNav ? 'translate-y-0' : '-translate-y-full',
        transparent ? 'bg-white/0' : 'bg-white'
      ]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-10">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center h-10">
            <img
              src="~/assets/ZURLOGO.png"
              alt="ZUR Studio"
              class="h-8 w-auto"
            />
          </NuxtLink>
          <!-- 桌面端导航 & Instagram（移动端隐藏） -->
          <div
            class="ml-auto hidden md:flex items-center space-x-6 uppercase text-sm"
          >
            <NuxtLink to="/info" class="hover:underline">Info</NuxtLink>
            <a
              href="https://www.instagram.com/zur_cgistudio/?igsh=MW1jd3pnM3doeG1qbg%3D%3D#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              class="text-gray-800 hover:text-gray-600"
            >
              <Icon name="simple-icons:instagram" width="24" height="24" />
            </a>
          </div>
          <!-- 移动端汉堡按钮 -->
          <button
            @click="menuOpen = !menuOpen"
            class="md:hidden ml-auto text-gray-800 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              v-if="!menuOpen"
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <!-- 移动端折叠菜单 -->
      <div v-if="menuOpen" class="md:hidden bg-white/20 backdrop-blur-lg border-t border-gray-200/50">
        <div class="px-4 pt-2 pb-4 space-y-1 uppercase text-sm">
          <NuxtLink
            to="/info"
            class="block text-gray-800 hover:text-black py-3 px-2 rounded-lg hover:bg-gray-100 transition-colors"

            @click="menuOpen = false"
          >
            Info
          </NuxtLink>
          <a
            href="https://www.instagram.com/zur_cgistudio/?igsh=MW1jd3pnM3doeG1qbg%3D%3D#"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center text-gray-800 hover:text-black py-3 px-2 rounded-lg hover:bg-gray-100 transition-colors space-x-2"
            @click="menuOpen = false"
          >
            <Icon name="simple-icons:instagram" width="20" height="20" />
            <span>Instagram</span>
          </a>
        </div>
      </div>
    </nav>
    <main class="pt-10" v-show="isLoaded">
      <slot />
    </main>
  </div>
</template>

<script setup>
import SitePreloader from '~/components/SitePreloader.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from '#imports'
const router = useRouter()
const route = useRoute()
let startTime = Date.now()

const menuOpen = ref(false)
const showNav = ref(true)
const transparent = ref(false)
let lastScrollY = 0

const isLoaded = ref(route.path !== '/')
const onPreloaderFinish = () => {
  isLoaded.value = true
  // 可在這裡觸發首頁入場動畫
}

function onScroll() {
  const y = window.scrollY
  
  // 手機端特殊處理
  if (window.innerWidth < 768) {
    // 在頂部時顯示導覽列，但保持透明
    if (y <= 10) {
      showNav.value = true
      transparent.value = true
    } else {
      // 向下滾動時隱藏，向上滾動時顯示
      showNav.value = y < lastScrollY
      transparent.value = y > 50
    }
  } else {
    // 桌面端保持原有邏輯
    showNav.value = y < lastScrollY
    transparent.value = y > 0
  }
  
  lastScrollY = y
}

function reportDuration() {
  const duration = Math.round((Date.now() - startTime) / 1000)
  // 只在 production 上報，避免本地測試污染數據
  if (duration > 1 && process.client && location.hostname !== 'localhost') {
    fetch('/analytics/visit-duration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip: '', country: '', duration })
    })
  }
}

onMounted(() => {
  lastScrollY = window.scrollY
  window.addEventListener('scroll', onScroll, { passive: true })
  // 追蹤停留時間
  startTime = Date.now()
  window.addEventListener('beforeunload', reportDuration)
  router.beforeEach((to, from, next) => {
    reportDuration()
    startTime = Date.now()
    next()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('beforeunload', reportDuration)
})
</script>

<style scoped>
nav { box-shadow: none; }
</style>
