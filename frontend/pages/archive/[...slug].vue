<template>
  <!-- 媒體動畫容器 -->
  <div
    ref="mediaContainer"
    class="relative w-full"
    style="perspective: 1200px; min-height: 50vh;"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <div
      v-if="media"
      :key="media.publicId"
      class="media-item-wrapper absolute inset-0"
    >
      <div class="media-item-wrapper flex items-center justify-center mt-16">
        <div class="relative" style="display: inline-block;">
          <!-- 上一頁按鈕（圖片上方左側，浮在圖片外） -->
          <NuxtLink
            v-if="prevId"
            :to="`/archive/${prevId}`"
            class="hidden md:flex absolute left-0 z-10 bg-black/90 text-white items-center justify-center rounded-full hover:bg-black transition"
            style="top: -20px; width: 14px; height: 14px; pointer-events: auto; font-size: 0.7rem; border-radius: 50%;"
            aria-label="上一張"
          >‹</NuxtLink>
          <!-- 下一頁按鈕（圖片上方右側，浮在圖片外） -->
          <NuxtLink
            v-if="nextId"
            :to="`/archive/${nextId}`"
            class="hidden md:flex absolute right-0 z-10 bg-black/90 text-white items-center justify-center rounded-full hover:bg-black transition"
            style="top: -20px; width: 14px; height: 14px; pointer-events: auto; font-size: 0.7rem; border-radius: 50%;"
            aria-label="下一張"
          >›</NuxtLink>
          <!-- 360° 全景 -->
          <div v-if="media.type === 'view360'" class="block mx-auto" style="width:1000px; height:562px;">
            <div ref="viewerContainer" style="width:100%; height:100%;"></div>
          </div>
          <!-- 圖片 -->
          <div v-else-if="media.type === 'image'" class="relative w-fit mx-auto">
            <DetailPageImage
              :src="media.url"
              :alt="media.description || 'ZUR Media'"
              :width="1280"
              :height="720"
              class="block"
              @loaded="onMediaReady"
              style="max-width: 100vw; max-height: 80vh; width: auto; height: auto; object-fit: contain; margin: 0 auto;"
            />
            <!-- 上一頁/下一頁按鈕 ... -->
          </div>
          <!-- 影片 -->
          <div v-else-if="media.type === 'video'" class="relative w-fit mx-auto">
            <video
              ref="videoPlayer"
              preload="metadata"
              loop
              class="block"
              @canplay="onMediaReady"
              @mouseenter="playVideo"
              @mouseleave="pauseVideo"
              style="max-width: 100vw; max-height: 80vh; width: auto; height: auto; object-fit: contain; margin: 0 auto;"
            >
              <source :src="media.url" type="video/mp4" />
              <track kind="captions" :src="`/subtitles/${publicId}.vtt`" srclang="zh" label="中文字幕" default />
              您的瀏覽器不支援影片播放
            </video>
            <!-- 上一頁/下一頁按鈕 ... -->
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 描述文字容器 -->
  <div ref="descriptionWrapper" class="mt-4 text-center text-gray-600">
    <p v-if="media">{{ media.description }}</p>
  </div>
  <!-- 404 提示（只有完全載入完成且 media 為 null 才顯示） -->
  <div v-if="itemsLoaded && !media && !hasMore" class="text-center text-gray-500">
    <h1 class="text-2xl font-bold">404</h1>
    找不到此媒體：<code>{{ publicId }}</code>
  </div>
  
  <!-- 載入中提示 -->
  <div v-if="loading && !media" class="text-center text-gray-500 py-8">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
    <p>載入中...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRuntimeConfig } from '#app'
import { useAppSeoMeta } from '~/composables/useAppSeoMeta'
import { useAuth } from '~/composables/useAuth'
import { gsap } from 'gsap'
import DetailPageImage from '@/components/DetailPageImage.vue'
import { useErrorHandler } from '~/composables/useErrorHandler'

interface MediaItem {
  publicId: string
  url: string
  description?: string
  type: 'image' | 'video' | 'view360'
}

const route = useRoute()
const { public: { apiBase } } = useRuntimeConfig()
const { token } = useAuth()

// 狀態
const items = ref<MediaItem[]>([])
const page = ref(1)
const limit = 20
const hasMore = ref(true)
const loading = ref(false)
const loadMoreTrigger = ref<HTMLElement | null>(null)
const itemsLoaded = ref(false)
const viewerInstance = ref<any>(null)
const mediaContainer = ref<HTMLElement | null>(null)
const descriptionWrapper = ref<HTMLElement | null>(null)
const isAnimating = ref(false)

// 取得 publicId
const slugParam = route.params.slug as string | string[]
const publicId = Array.isArray(slugParam) ? slugParam.join('/') : slugParam

// 載入更多
async function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const res = await $fetch(`${apiBase}/media/list?page=${page.value}&limit=${limit}`)
    const newItems = res.items || []
    // 避免重複
    const existingIds = new Set(items.value.map(i => i.publicId))
    const filtered = newItems.filter(i => !existingIds.has(i.publicId))
    items.value = [...items.value, ...filtered]
    hasMore.value = res.pagination?.hasMore ?? (filtered.length === limit)
    page.value += 1
    
    // 檢查是否找到了目標媒體
    const foundMedia = items.value.find(i => i.publicId === publicId)
    if (foundMedia || !hasMore.value) {
      itemsLoaded.value = true
    }
  } catch (e) {
    hasMore.value = false
    itemsLoaded.value = true
  }
  loading.value = false
}

// 單筆媒體
const media = computed<MediaItem | null>(() => {
  return items.value.find(i => i.publicId === publicId) ?? null
})

// SEO 設定
      useAppSeoMeta({
  title: media.value?.description ? `${media.value.description} | ZUR Archive` : 'ZUR Archive',
  description: media.value?.description || 'ZUR Archive 詳細媒體',
        type: 'article',
  ogImage: media.value?.url
      })

// 導航
const slugs = computed(() => items.value.map(i => i.publicId))
const idx = computed(() => slugs.value.findIndex(s => s === publicId))
const prevId = computed(() => (idx.value > 0 ? slugs.value[idx.value - 1] : null))
const nextId = computed(() =>
  idx.value < slugs.value.length - 1 ? slugs.value[idx.value + 1] : null
)

// IntersectionObserver 載入更多
const viewerContainer = ref<HTMLElement | null>(null)
const videoPlayer = ref<HTMLVideoElement | null>(null)

// 監聽 media 變化，動態初始化動畫與 360° Viewer
watch(media, async (newMedia) => {
  if (newMedia) {
    if (descriptionWrapper.value) {
      gsap.set(descriptionWrapper.value, { opacity: 1 });
      const text = descriptionWrapper.value.querySelector('p');
      if (text) {
        text.innerHTML = newMedia.description || '';
      }
    }
    
    // 360° Viewer 處理
    if (viewerInstance.value) {
      viewerInstance.value.destroy?.();
      viewerInstance.value = null;
    }
    
    if (newMedia.type === 'view360') {
      await nextTick();
      
      // 使用統一的錯誤處理器
      const errorHandler = useErrorHandler()
      
      const initViewer = async () => {
        if (!viewerContainer.value) return;
        
        if (viewerContainer.value.offsetWidth > 0) {
          const { Viewer } = await import('@photo-sphere-viewer/core');
          viewerInstance.value = new Viewer({
            container: viewerContainer.value,
            panorama: newMedia.url,
            navbar: ['zoom', 'fullscreen'],
            size: {
              width: viewerContainer.value.offsetWidth,
              height: viewerContainer.value.offsetHeight
            }
          });
          animateEntrance();
        } else {
          // 使用統一的延遲重試
          await errorHandler.retryWithDelay(
            () => {
              if (viewerContainer.value?.offsetWidth > 0) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('Container not ready'))
            },
            10, // 最多重試 10 次
            100 // 每次延遲 100ms
          )
        }
      };
      
      try {
        await initViewer()
      } catch (error) {
        console.error('Failed to initialize viewer:', error)
      }
    }
  }
}, { immediate: true });

function animateEntrance() {
  if (isAnimating.value) return;
  const target = mediaContainer.value?.querySelector('.media-item-wrapper');
  const description = descriptionWrapper.value;
  if (!target || !description) return;
  isAnimating.value = true;
  
  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating.value = false;
    }
  });
  
  // 根據媒體類型選擇動畫目標
  if (media.value?.type === 'image') {
    const imageElement = target.querySelector('img');
    if (imageElement) {
      gsap.set(imageElement, {
        transformOrigin: 'left center',
        clipPath: 'inset(0% 100% 0% 0%)',
        opacity: 0.7
      });
      tl.to(imageElement, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.2,
        ease: 'expo.inOut'
      })
      .fromTo(imageElement, {
        scale: 1.1,
        rotateY: -5
      }, {
        scale: 1,
        rotateY: 0,
        opacity: 1,
        duration: 1.4,
        ease: 'expo.out'
      }, '<');
    }
  } else if (media.value?.type === 'view360') {
    // 360° viewer 動畫
    const viewerContainer = target.querySelector('[ref="viewerContainer"]');
    if (viewerContainer) {
      gsap.fromTo(viewerContainer, {
        scale: 0.9,
        opacity: 0
      }, {
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: 'expo.out'
      });
    }
  }
  
  // 文字動畫
  const text = description.querySelector('p');
  if (text) {
    const chars = text.innerText.split('');
    text.innerHTML = chars.map(c => `<span class=\"char\" style=\"display: inline-block;\">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    tl.from(text.querySelectorAll('.char'), {
      yPercent: 100,
      opacity: 0,
      stagger: 0.02,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=1.0');
  }
}
function onMediaReady() {
  animateEntrance();
}

// 影片播放控制
async function playVideo() {
  if (videoPlayer.value && videoPlayer.value.paused) {
    try {
      await videoPlayer.value.play();
    } catch (error) {
      console.error("Video play was prevented.", error);
    }
  }
}

function pauseVideo() {
  if (videoPlayer.value) {
    videoPlayer.value.pause();
  }
}

// 鍵盤左右鍵切換所有媒體（圖片、影片、360°，循環切換）
function handleKeydown(e: KeyboardEvent) {
  // 只在有媒體時作用
  if (!media.value || items.value.length === 0) return
  const currentIdx = items.value.findIndex(i => i.publicId === publicId)
  if (currentIdx === -1) return
  if (e.key === 'ArrowLeft') {
    // 循環切換上一個
    const prevIdx = (currentIdx - 1 + items.value.length) % items.value.length
    const prevId = items.value[prevIdx].publicId
    if (prevId !== publicId) router.push(`/archive/${prevId}`)
  }
  if (e.key === 'ArrowRight') {
    // 循環切換下一個
    const nextIdx = (currentIdx + 1) % items.value.length
    const nextId = items.value[nextIdx].publicId
    if (nextId !== publicId) router.push(`/archive/${nextId}`)
  }
}

onMounted(async () => {
  // 先載入第一頁
  await loadMore()
  
  // 如果找不到目標媒體，繼續載入更多頁面直到找到
  let attempts = 0
  const maxAttempts = 10 // 最多嘗試 10 頁
  
  while (!media.value && attempts < maxAttempts && hasMore.value) {
    console.log(`[Archive] Attempt ${attempts + 1}: Loading more to find media ${publicId}`)
    await loadMore()
    attempts++
  }
  
  if (!media.value) {
    console.error(`[Archive] Could not find media with publicId: ${publicId}`)
  }
  
  // 設置無限滾動觀察器
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) loadMore()
  })
  await nextTick(() => {
    if (loadMoreTrigger.value) observer.observe(loadMoreTrigger.value)
  })
  
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// 7. 手勢滑動切換
const router = useRouter()
const touchStartX = ref(0)
function onTouchStart(e: TouchEvent) {
  touchStartX.value = e.changedTouches[0].clientX
}
function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX.value
  if (dx > 50 && prevId.value) router.push(`/archive/${prevId.value}`)
  else if (dx < -50 && nextId.value) router.push(`/archive/${nextId.value}`)
}
</script>

<style scoped>
a { text-decoration: none; color: inherit; }
</style> 