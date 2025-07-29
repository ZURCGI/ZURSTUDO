<!-- frontend/components/MasonryGrid.vue -->
<template>
  <div class="w-full relative" role="main" aria-label="媒體畫廊">
    <!-- 无限滚动哨兵 -->
    <div ref="sentinel" class="h-1" aria-hidden="true"></div>

    <!-- 只顯示內容，無骨架屏 -->
    <div
      :style="{
        columnCount: columns,
        columnGap: gap + 'px',
        '--row-gap': rowGap + 'px'
      }"
      role="grid"
      aria-label="媒體項目網格"
    >
      <NuxtLink
        v-for="(item, index) in items"
        :key="item.publicId"
        :to="`/archive/${item.publicId}`"
        :data-id="item.publicId"
        class="break-inside-avoid block relative overflow-hidden group masonry-item focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        @click="onCardClick"
        @keydown.enter="onCardClick"
        @keydown.space.prevent="onCardClick"
        ref="el => handleItemMounted(el, index)"
        :aria-label="`查看 ${item.description || item.publicId} 的詳細資訊`"
        :tabindex="0"
        role="gridcell"
      >
        <!-- 圖片 -->
        <OptimizedImage
          v-if="item.type === 'image'"
          @mounted="handleImageMounted"
          :src="item.url"
          :width="400"
          :height="300"
          loading="lazy"
          :quality="85"
          :showProgress="true"
          class="w-full object-cover shadow"
          style="pointer-events: none;"
          @loaded="onImageLoaded(item.publicId)"
          :alt="item.description || item.publicId || 'ZUR Image'"
          :aria-describedby="`desc-${item.publicId}`"
        />

        <!-- 視頻 -->
        <video
          v-else-if="item.type === 'video'"
          :ref="(el) => setCardRefs(el)"
          controls 
          preload="metadata"
          class="w-full object-cover shadow"
          :style="{
            display: 'block',
            aspectRatio: '16/9',
            margin: '0',
            padding: '0',
            width: '100%',
            height: 'auto',
            minHeight: '200px',
            backgroundColor: '#000',
            borderRadius: '4px'
          }"
          :aria-label="`影片: ${item.description || item.publicId}`"
          :aria-describedby="`desc-${item.publicId}`"
          playsinline
          webkit-playsinline
          x5-playsinline
          x5-video-player-type="h5"
          x5-video-player-fullscreen="true"
          @loadedmetadata="onVideoLoaded"
          @error="onVideoError"
          @canplay="onVideoCanPlay"
          @loadstart="onVideoLoadStart"
          @click="onVideoClick"
        >
          <source :src="item.url" type="video/mp4" />
          <source :src="item.url" type="video/webm" />
          <source :src="item.url" type="video/ogg" />
          <track kind="captions" :src="`/subtitles/${item.publicId}.vtt`" srclang="zh" label="中文字幕" default />
          <div style="display: flex; align-items: center; justify-content: center; height: 200px; color: #666; font-size: 14px;">
            載入影片中...
          </div>
        </video>

        <!-- 360° 全景 -->
        <div
          v-else-if="item.type === 'view360'"
          :ref="(el) => setCardRefs(el)"
          :id="`viewer-${item.publicId}`"
          class="w-full overflow-hidden shadow"
          :style="{
            display: 'block',
            aspectRatio: '16/9',
            margin: '0',
            padding: '0',
            width: '100%',
            height: 'auto',
            minHeight: '200px',
            backgroundColor: '#000',
            borderRadius: '4px',
            position: 'relative',
            overflow: 'hidden'
          }"
          :aria-label="`360度全景: ${item.description || item.publicId}`"
          :aria-describedby="`desc-${item.publicId}`"
          role="img"
          @touchstart="onView360TouchStart"
          @touchmove="onView360TouchMove"
          @touchend="onView360TouchEnd"
        >
          <!-- 載入提示 -->
          <div 
            :id="`loading-${item.publicId}`"
            style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background: #000; color: #fff; font-size: 14px; z-index: 1;"
          >
            載入 360° 全景中...
          </div>
          
          <!-- 手機端控制提示 -->
          <div 
            v-if="isMobile"
            :id="`mobile-controls-${item.publicId}`"
            style="position: absolute; bottom: 10px; left: 10px; right: 10px; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.7); color: #fff; padding: 8px 12px; border-radius: 20px; font-size: 12px; z-index: 2;"
          >
            <span>👆 拖動查看</span>
            <span>👌 雙指縮放</span>
            <button 
              :onclick="`toggleFullscreen('${item.publicId}')`"
              style="background: rgba(255,255,255,0.2); border: none; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 10px;"
            >
              全螢幕
            </button>
          </div>
        </div>

        <!-- 懸浮說明（可選，若要完全無提示可移除） -->
        <div
          v-if="item.description"
          class="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity bg-black/50"
          :id="`desc-${item.publicId}`"
          aria-hidden="true"
        >
          <p class="text-white text-sm p-2">{{ item.description }}</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed, onBeforeUpdate } from 'vue'
import OptimizedImage from './OptimizedImage.vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
import { useState } from '#app'
// import SkeletonBlock from './SkeletonBlock.vue'

/** Props */
const props = defineProps<{
  items: Array<{ type: string; url: string; publicId: string; description?: string }>
  gap: number
  rowGap?: number
  columns?: number
  loadMore?: () => void
  hasMore?: boolean // 新增 hasMore props
}>()

// 定義事件
const emit = defineEmits(['item-mounted']);

const { items, gap, rowGap: rowGapProp, columns: columnsProp, loadMore, hasMore: hasMoreProp } = props
const rowGap = computed(() => rowGapProp ?? gap ?? 8)
const columnsRef = ref(columnsProp ?? 3)
const columns = computed(() => columnsProp ?? columnsRef.value)

// 手機端檢測
const isMobile = computed(() => {
  if (process.client && window) {
    return window.innerWidth < 768
  }
  return false
})

// 用來初始化 360° viewer
const viewerMap = new Map<string, any>()

// 處理項目掛載事件
const handleItemMounted = (el: HTMLElement | null, index: number) => {
  if (el) {
    // 使用 nextTick 確保 DOM 已更新
    nextTick(() => {
      emit('item-mounted', { el, index });
    });
  }
};

// 觀察 items 變化，初始化新加入的 360°，並在 url 變動時重建 Viewer
watch(
  () => items.map(i => i.publicId + ':' + i.url).join(','),
  async () => {
    await nextTick()
    items
      .filter(i => i.type === 'view360')
      .forEach(async (i) => {
        const el = document.getElementById(`viewer-${i.publicId}`)
        if (el) {
          // 若已存在 Viewer，先銷毀
          if (viewerMap.has(i.publicId)) {
            viewerMap.get(i.publicId)?.destroy?.()
            viewerMap.delete(i.publicId)
          }
          // 動態導入 Viewer
          try {
            const { Viewer } = await import('@photo-sphere-viewer/core')
            
            // 檢測是否為手機端
            const isMobileDevice = isMobile.value
            
            // 確保容器沒有白邊
            el.style.margin = '0'
            el.style.padding = '0'
            el.style.border = 'none'
            el.style.outline = 'none'
            el.style.position = 'relative'
            el.style.overflow = 'hidden'
            el.style.width = '100%'
            el.style.height = '100%'
            
            // 手機端特殊設置
            if (isMobileDevice) {
              el.style.minHeight = '200px'
              el.style.backgroundColor = '#000'
              el.style.borderRadius = '4px'
            }
            
            // 移除載入提示
            const loadingEl = document.getElementById(`loading-${i.publicId}`)
            if (loadingEl) {
              loadingEl.style.display = 'none'
            }
            
            viewerMap.set(i.publicId, new Viewer({
              container: el,
              panorama: i.url,
              navbar: ['zoom', 'fullscreen'],
              defaultZoomLvl: 0,
              defaultYaw: 2.0,   // 右側（約114.6度）
              defaultPitch: 0.0,  // 水平
              moveSpeed: isMobileDevice ? 2.0 : 1.5,  // 手機端移動速度更快
              zoomSpeed: isMobileDevice ? 1.5 : 1,    // 手機端縮放速度更快
              // 手機端優化
              touchmoveTwoFingers: true,
              mousewheel: !isMobileDevice,
              mousemove: !isMobileDevice,
              // 觸控優化
              touchPan: true,
              touchZoom: true,
              // 手機端特殊設置
              ...(isMobileDevice && {
                // 手機端禁用滑鼠事件
                mousewheel: false,
                mousemove: false,
                // 增強觸控響應
                touchmoveTwoFingers: true,
                // 防止手機端意外縮放
                pinchToZoom: true,
                // 手機端性能優化
                renderParameters: {
                  antialias: false,
                  alpha: false,
                  preserveDrawingBuffer: false
                },
                // 手機端容器設置
                containerClass: 'mobile-viewer',
                // 防止手機端跳動
                defaultZoomLvl: 0,
                minZoomLvl: 0,
                maxZoomLvl: 2,
                // 手機端觸控設置
                touchPan: true,
                touchZoom: true,
                // 防止滾動衝突
                preventScroll: true,
                // 手機端控制優化
                moveSpeed: 2.5,
                zoomSpeed: 2.0,
                // 手機端觸控靈敏度
                touchmoveTwoFingers: true,
                // 手機端防止意外操作
                mousewheel: false,
                mousemove: false
              }),
              // 桌面端保持原有設置
              ...(!isMobileDevice && {
                renderParameters: {
                  antialias: false,
                  alpha: false
                }
              })
            }))
            
            console.log('[MasonryGrid] VIEW360 initialized for:', i.publicId, 'mobile:', isMobileDevice)
          } catch (error) {
            console.error('Failed to load Photo Sphere Viewer:', error)
            // 顯示錯誤信息
            const loadingEl = document.getElementById(`loading-${i.publicId}`)
            if (loadingEl) {
              loadingEl.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 200px; color: #c62828; font-size: 14px; text-align: center; padding: 20px;">
                  360° 全景載入失敗<br>
                  <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; font-size: 12px;">
                    重新載入
                  </button>
                </div>
              `
            }
          }
        }
      })
    
    // 設定 CSS 變數以統一管理間距
    await nextTick()
    const gridContainer = document.querySelector('[role="grid"]')
    if (gridContainer instanceof HTMLElement) {
      gridContainer.style.setProperty('--row-gap', rowGap.value + 'px')
    }
  },
  { immediate: true }
)

// 无限滚动 & 窗口 resize
const sentinel = ref<HTMLElement | null>(null)
const scrollObserver = ref<IntersectionObserver | null>(null)

function animateIn(el: HTMLElement) {
  import('gsap').then(gsapModule => {
    const gsap = gsapModule.default
    gsap.to(el, {
      scale: 1,
      opacity: 1,
      duration: 0.6,
      ease: 'expo.out'
    })
  })
}
function animateOut(el: HTMLElement) {
  import('gsap').then(gsapModule => {
    const gsap = gsapModule.default
    gsap.to(el, {
      scale: 0.8,
      opacity: 0.3,
      duration: 0.5,
      ease: 'expo.in'
    })
  })
}

function setupScrollAnimation() {
  if ('IntersectionObserver' in window) {
    scrollObserver.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (el instanceof HTMLElement) {
            if (entry.isIntersecting) {
              animateIn(el as HTMLElement)
            } else {
              animateOut(el as HTMLElement)
            }
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    nextTick(() => {
      const items = Array.from(document.querySelectorAll('.masonry-item')) as HTMLElement[]
      items.forEach(item => {
        if (item.querySelector('img, video, .psv-container')) {
          scrollObserver.value?.observe(item)
        }
      })
    })
  }
}

function onImageLoaded(id: string) {
  const el = document.querySelector(`[data-id='${id}']`)
  if (el) animateIn(el)
}

// 影片載入處理函數
function onVideoLoaded(event: Event) {
  const video = event.target as HTMLVideoElement
  console.log('[MasonryGrid] Video loaded:', video.src)
  
  // 手機端特殊處理
  if (isMobile.value) {
    // 確保影片在手機端正確顯示
    video.style.display = 'block'
    video.style.width = '100%'
    video.style.height = 'auto'
    video.style.minHeight = '200px'
    video.style.backgroundColor = '#000'
    video.style.borderRadius = '4px'
    
    // 手機端播放設置
    video.playsInline = true
    video.muted = false // 允許聲音
    
    // 手機端自動播放嘗試
    try {
      video.play().catch(error => {
        console.log('[MasonryGrid] Auto-play failed, user interaction required:', error)
        // 顯示播放按鈕
        showPlayButton(video)
      })
    } catch (error) {
      console.log('[MasonryGrid] Auto-play not supported:', error)
      showPlayButton(video)
    }
  }
  
  // 觸發動畫
  const container = video.closest('.masonry-item')
  if (container) animateIn(container as HTMLElement)
}

function onVideoError(event: Event) {
  const video = event.target as HTMLVideoElement
  console.error('[MasonryGrid] Video error:', video.src, event)
  
  // 手機端錯誤處理
  if (isMobile.value) {
    // 標記錯誤狀態
    video.setAttribute('data-error', 'true')
    
    // 嘗試重新載入
    setTimeout(() => {
      video.load()
    }, 1000)
    
    // 如果還是失敗，顯示錯誤信息
    setTimeout(() => {
      if (video.error) {
        video.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 200px; color: #c62828; font-size: 14px; text-align: center; padding: 20px;">
            影片載入失敗<br>
            <button onclick="this.parentElement.parentElement.load()" style="margin-top: 10px; padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; font-size: 12px;">
              重新載入
            </button>
          </div>
        `
      }
    }, 2000)
  }
}

function onVideoCanPlay(event: Event) {
  const video = event.target as HTMLVideoElement
  console.log('[MasonryGrid] Video can play:', video.src)
  
  // 手機端準備播放
  if (isMobile.value) {
    // 確保影片可見
    video.style.opacity = '1'
    video.style.visibility = 'visible'
    
    // 移除播放按鈕
    const playButton = video.querySelector('.mobile-play-button')
    if (playButton) {
      playButton.remove()
    }
  }
}

function onVideoLoadStart(event: Event) {
  const video = event.target as HTMLVideoElement
  console.log('[MasonryGrid] Video load start:', video.src)
}

function onVideoClick(event: MouseEvent) {
  const video = event.currentTarget as HTMLVideoElement;
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

// 影片/360 掛載後觸發動畫
watch(
  () => items.map(i => i.publicId + ':' + i.url).join(','),
  async () => {
    await nextTick()
    items.forEach(i => {
      if (i.type === 'video' || i.type === 'view360') {
        const el = document.querySelector(`[data-id='${i.publicId}']`)
        if (el) animateIn(el)
      }
    })
  },
  { immediate: true }
)

function updateColumns() {
  // 若有 columns prop 則不自動調整
  if (columnsProp) return
  const w = window.innerWidth
  columnsRef.value = w < 640 ? 1 : w < 1024 ? 2 : 3
}

// 修正 setCardRefs 用法，確保為 function ref 並在 onBeforeUpdate 清空
const cardRefs = ref<HTMLElement[]>([])
const setCardRefs = (el: HTMLElement | null) => {
  if (el) cardRefs.value.push(el)
}

// 處理圖片掛載事件
const handleImageMounted = (el: HTMLElement | null) => {
  if (el) cardRefs.value.push(el)
}

onBeforeUpdate(() => {
  cardRefs.value = []
})

const clickedThumbnailState = useState('clickedThumbnail')

function onCardClick(e) {
  clickedThumbnailState.value = e.currentTarget
}

onMounted(async () => {
  if (!columnsProp) {
    updateColumns()
  window.addEventListener('resize', updateColumns)
  }
  setupScrollAnimation()
  await nextTick()
  // 3D 畫廊效果
  const grid = document.querySelector('.masonry-item')?.parentElement
  if (grid) {
    grid.style.perspective = '2000px'
  }
  
  // 手機端影片初始化
  if (isMobile.value) {
    const videos = document.querySelectorAll('.masonry-item video')
    videos.forEach((video) => {
      const videoElement = video as HTMLVideoElement
      // 確保手機端影片設置
      videoElement.playsInline = true
      videoElement.preload = 'metadata'
      videoElement.muted = false // 允許聲音
      
      // 強制設置樣式
      videoElement.style.display = 'block'
      videoElement.style.width = '100%'
      videoElement.style.height = 'auto'
      videoElement.style.minHeight = '200px'
      videoElement.style.backgroundColor = '#000'
      videoElement.style.borderRadius = '4px'
      videoElement.style.position = 'relative'
      videoElement.style.transform = 'none'
      videoElement.style.transition = 'none'
      
      // 確保控制列可見
      videoElement.controls = true
      
      // 強制重新載入
      if (videoElement.src) {
        videoElement.load()
      }
      
      // 添加點擊事件
      videoElement.addEventListener('click', () => {
        if (videoElement.paused) {
          videoElement.play().catch(error => {
            console.log('[MasonryGrid] Manual play failed:', error)
            showPlayButton(videoElement)
          })
        } else {
          videoElement.pause()
        }
      })
    })
    
    // 手機端 VIEW360 初始化
    const view360Containers = document.querySelectorAll('.masonry-item div[role="img"]')
    view360Containers.forEach((container) => {
      const containerEl = container as HTMLElement
      // 確保容器穩定
      containerEl.style.position = 'relative'
      containerEl.style.overflow = 'hidden'
      containerEl.style.width = '100%'
      containerEl.style.height = 'auto'
      containerEl.style.minHeight = '200px'
      containerEl.style.backgroundColor = '#000'
      containerEl.style.borderRadius = '4px'
      containerEl.style.transform = 'none'
      containerEl.style.transition = 'none'
    })
  }
  
  // 嚴格過濾 HTMLElement，並加上除錯 log
  const validCards = cardRefs.value.filter((card): card is HTMLElement => !!card && card instanceof HTMLElement)
  if (validCards.length !== cardRefs.value.length) {
    console.warn('cardRefs contains invalid elements:', cardRefs.value)
  }
  validCards.forEach((card, idx) => {
    card.style.transformStyle = 'preserve-3d'
    card.style.transition = 'box-shadow 0.3s'
    const xTo = gsap.quickTo(card, 'rotateY', { duration: 0.8, ease: 'power3' })
    const yTo = gsap.quickTo(card, 'rotateX', { duration: 0.8, ease: 'power3' }) // 滑鼠用
    card.addEventListener('mousemove', (e) => {
      const { left, top, width, height } = card.getBoundingClientRect()
      const x = (e.clientX - left) / width - 0.5
      const y = (e.clientY - top) / height - 0.5
      xTo(x * 20)
      yTo(-y * 20)
      card.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)'
      // 輝光效果
      gsap.to(card, {
        '--glow-opacity': 0.5,
        duration: 0.4
      });
    })
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        duration: 1.5,
        ease: 'power4.out',
        onUpdate: () => {
          card.style.boxShadow = '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)'
        }
      })
      gsap.to(card, {
        '--glow-opacity': 0,
        duration: 0.6
      });
    })
    // ScrollTrigger 3D 畫廊
    const zTo = gsap.quickTo(card, 'z', { duration: 0.8, ease: 'power2.out' })
    const yToScroll = gsap.quickTo(card, 'y', { duration: 1.2, ease: 'power2.out' }) // ScrollTrigger用
    ScrollTrigger.create({
      trigger: card,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.8,
      onUpdate: self => {
        const p = self.progress
        const isOdd = idx % 2 === 1
        const z = (p - 0.5) * 150
        const y = (p - 0.5) * (isOdd ? -20 : 20)
        zTo(z)
        yToScroll(y)
        // rotTo(rot) // 不再動 rotateX
      }
    })
  })
})
onBeforeUnmount(() => {
  if (!columnsProp) {
  window.removeEventListener('resize', updateColumns)
  }
  if (scrollObserver.value) scrollObserver.value.disconnect()
  viewerMap.forEach(v => v?.destroy?.())
  viewerMap.clear()
})

function observeSentinel() {
  if ('IntersectionObserver' in window && sentinel.value && loadMore) {
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && loadMore && hasMore()) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(sentinel.value)
  }
}

function hasMore() {
  return hasMoreProp !== false
}

// VIEW360 觸控事件處理
function onView360TouchStart(event: TouchEvent) {
  // 只在手機端處理
  if (isMobile.value) {
    event.preventDefault();
    event.stopPropagation();
    
    // 標記正在操作 VIEW360
    const target = event.currentTarget as HTMLElement;
    target.setAttribute('data-view360-active', 'true');
  }
}

function onView360TouchMove(event: TouchEvent) {
  // 只在手機端處理
  if (isMobile.value) {
    event.preventDefault();
    event.stopPropagation();
    
    // 防止頁面滾動
    const target = event.currentTarget as HTMLElement;
    if (target.getAttribute('data-view360-active') === 'true') {
      event.preventDefault();
    }
  }
}

function onView360TouchEnd(event: TouchEvent) {
  // 只在手機端處理
  if (isMobile.value) {
    event.preventDefault();
    event.stopPropagation();
    
    // 清除標記
    const target = event.currentTarget as HTMLElement;
    target.removeAttribute('data-view360-active');
  }
}

// 手機端 VIEW360 全螢幕切換
function toggleFullscreen(viewerId: string) {
  if (isMobile.value) {
    const viewer = viewerMap.get(viewerId);
    if (viewer) {
      try {
        viewer.toggleFullscreen();
      } catch (error) {
        console.error('Failed to toggle fullscreen:', error);
      }
    }
  }
}

// 暴露函數到全域
if (process.client) {
  (window as any).toggleFullscreen = toggleFullscreen;
}

// 顯示手機端播放按鈕
function showPlayButton(video: HTMLVideoElement) {
  if (isMobile.value) {
    const playButton = document.createElement('div')
    playButton.className = 'mobile-play-button'
    playButton.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.8);
      color: white;
      border: none;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      cursor: pointer;
      z-index: 10;
    `
    playButton.innerHTML = '▶'
    playButton.onclick = () => {
      video.play()
      playButton.remove()
    }
    video.parentElement?.appendChild(playButton)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700&display=swap');

.masonry-item, .masonry-item * {
  font-family: 'Noto Sans TC', sans-serif !important;
}

/* Masonry Grid Styles */
.masonry-item {
  break-inside: avoid;
  page-break-inside: avoid;
  -webkit-column-break-inside: avoid;
}

/* Smooth transitions for hover effects */
.group:hover .opacity-0 {
  transition: opacity 0.3s ease-in-out;
}

/* Ensure proper image display */
.object-cover {
  object-fit: cover;
}

/* Shadow effects */
.shadow {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

/* 確保間距正確 */
.masonry-item {
  margin: 0;
  padding: 0;
  margin-bottom: var(--row-gap, 6px) !important;
  --glow-opacity: 0;
  box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06), 0 0 40px -10px rgba(255,255,255,var(--glow-opacity));
  transition: box-shadow 0.3s;
}

/* 確保 NuxtLink 沒有額外的間距 */
.masonry-item a {
  margin: 0;
  padding: 0;
  display: block;
}

/* 移除所有媒體元素的白邊 */
.masonry-item img,
.masonry-item video,
.masonry-item div[role="img"],
.masonry-item .psv-container {
  display: block;
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
  vertical-align: top;
  line-height: 0;
}

/* 設定影片和 VIEW360 的 16:9 比例 */
.masonry-item video,
.masonry-item div[role="img"] {
  aspect-ratio: 16/9;
}

/* 移除影片控制列的白邊 */
.masonry-item video::-webkit-media-controls {
  margin: 0;
  padding: 0;
}

.masonry-item video::-webkit-media-controls-panel {
  background: transparent;
}

/* 確保所有元素使用 border-box */
.masonry-item * {
  box-sizing: border-box;
}

/* Responsive adjustments - 移除固定 margin-bottom，使用動態設定 */

/* 手機端特殊樣式 */
@media (max-width: 767px) {
  /* 手機端影片控制優化 */
  .masonry-item video {
    /* 確保影片在手機端可以正常控制 */
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    /* 防止手機端意外縮放 */
    touch-action: manipulation;
    /* 確保控制列可見 */
    -webkit-media-controls: auto;
    -webkit-media-controls-panel: auto;
    /* 確保影片可見 */
    opacity: 1 !important;
    visibility: visible !important;
    display: block !important;
    width: 100% !important;
    height: auto !important;
    /* 手機端影片容器 */
    background: #000;
    border-radius: 4px;
    /* 確保影片載入 */
    object-fit: cover;
    min-height: 200px;
    /* 防止跳動 */
    position: relative;
    transform: none !important;
    transition: none !important;
    /* 確保控制列樣式 */
    -webkit-media-controls-panel: auto !important;
    -webkit-media-controls-play-button: auto !important;
    -webkit-media-controls-timeline: auto !important;
    -webkit-media-controls-current-time-display: auto !important;
    -webkit-media-controls-time-remaining-display: auto !important;
    -webkit-media-controls-mute-button: auto !important;
    -webkit-media-controls-volume-slider: auto !important;
    -webkit-media-controls-fullscreen-button: auto !important;
  }
  
  /* 手機端影片播放按鈕 */
  .masonry-item .mobile-play-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: white;
    border: none;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    cursor: pointer;
    z-index: 10;
    transition: all 0.3s ease;
  }
  
  .masonry-item .mobile-play-button:hover {
    background: rgba(0,0,0,0.9);
    transform: translate(-50%, -50%) scale(1.1);
  }
  
  /* 手機端 VIEW360 容器優化 */
  .masonry-item div[role="img"] {
    /* 確保觸控事件正常工作 */
    touch-action: pan-x pan-y pinch-zoom;
    /* 防止意外選擇 */
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    /* 防止跳動 */
    position: relative !important;
    transform: none !important;
    transition: none !important;
    /* 確保容器穩定 */
    overflow: hidden !important;
    width: 100% !important;
    height: auto !important;
    min-height: 200px !important;
    background: #000 !important;
    border-radius: 4px !important;
    /* 防止滾動衝突 */
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }
  
  /* 手機端 VIEW360 內部容器 */
  .masonry-item .psv-container {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100% !important;
    transform: none !important;
    transition: none !important;
    /* 防止滾動衝突 */
    touch-action: pan-x pan-y pinch-zoom !important;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }
  
  /* 手機端 VIEW360 畫布 */
  .masonry-item .psv-canvas {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    /* 防止滾動衝突 */
    touch-action: pan-x pan-y pinch-zoom !important;
  }
  
  /* 手機端 VIEW360 操作時防止頁面滾動 */
  .masonry-item div[role="img"][data-view360-active="true"] {
    touch-action: none !important;
  }
  
  .masonry-item div[role="img"][data-view360-active="true"] .psv-container {
    touch-action: pan-x pan-y pinch-zoom !important;
  }
  
  /* 手機端影片載入狀態 */
  .masonry-item video:not([src]) {
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }
  
  /* 手機端影片錯誤狀態 */
  .masonry-item video[data-error="true"] {
    background: #ffebee;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #c62828;
    font-size: 14px;
    text-align: center;
    padding: 20px;
  }
  
  /* 手機端圖片觸控優化 */
  .masonry-item img {
    /* 防止意外選擇 */
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    /* 確保觸控響應 */
    touch-action: manipulation;
  }
  
  /* 手機端連結觸控優化 */
  .masonry-item a {
    /* 確保觸控響應 */
    touch-action: manipulation;
    /* 防止意外選擇 */
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
}
</style>

