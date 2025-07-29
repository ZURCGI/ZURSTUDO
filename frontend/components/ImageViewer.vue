<template>
  <Transition name="image-viewer" appear>
    <div v-if="visible" class="image-viewer">
      <div class="image-viewer__overlay" @click="close"></div>
      <div class="image-viewer__content">
        <button @click="close" class="image-viewer__close">
          <Icon name="heroicons:x-mark" class="w-6 h-6" />
        </button>
        
        <div class="image-viewer__image-container">
          <img
            :src="imageUrl"
            :alt="imageAlt"
            :key="imageUrl"
            class="image-viewer__image"
            @load="onImageLoad"
            @error="onImageError"
          />
          
          <div v-if="loading" class="image-viewer__loading">
            <div class="bucharest-loader__overlay"></div>
          </div>
          
          <div v-if="error" class="image-viewer__error">
            <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500" />
            <p class="text-red-500 mt-2">圖片載入失敗</p>
          </div>
        </div>
        
        <div v-if="imageInfo" class="image-viewer__info">
          <h3 class="image-viewer__title">{{ imageInfo.description || 'ZUR Media' }}</h3>
          <p class="image-viewer__meta">{{ imageInfo.type }} • {{ formatDate(imageInfo.createdAt) }}</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useNuxtApp } from '#app'
import { gsap } from 'gsap'

interface Props {
  visible: boolean
  imageUrl: string
  imageAlt: string
  imageInfo?: {
    description?: string
    type: string
    createdAt: string
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'close': []
}>()

const loading = ref(true)
const error = ref(false)

const close = () => {
  emit('close')
}

const onImageLoad = () => {
  console.log('onImageLoad triggered');
  loading.value = false
  error.value = false
  const imageEl = document.querySelector('.image-viewer__image')
  if (imageEl) {
    imageEl.style.transformOrigin = 'left center';
    imageEl.style.opacity = '0.7';
    imageEl.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
    nextTick(() => {
      gsap.fromTo(
        imageEl,
        {
          rotateY: -90,
          opacity: 0.2,
          boxShadow: '0 0 0 rgba(0,0,0,0)'
        },
        {
          rotateY: 0,
          opacity: 1,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          duration: 1.5,
          ease: 'power4.out',
          clearProps: 'transform,opacity,boxShadow'
        }
      )
    })
  }
}

const onImageError = () => {
  loading.value = false
  error.value = true
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW')
}

// 監聽圖片 URL 變化，重置載入狀態
watch(() => props.imageUrl, () => {
  loading.value = true
  error.value = false
})

// 監聽可見性變化，重置載入狀態
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    loading.value = true
    error.value = false
  }
})

// 全域縮圖 DOM 狀態（假設用 useState）
const clickedThumbnailState = useState('clickedThumbnail')

onMounted(() => {
  const { $gsap } = useNuxtApp()
  if (!props.visible) return
  $gsap.from('.image-viewer__overlay', {
    opacity: 0,
    duration: 0.5,
  })
})
</script>

<style scoped>
.image-viewer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-viewer__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(4px);
}

.image-viewer__content {
  position: relative;
  z-index: 1;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-viewer__close {
  position: absolute;
  top: -3rem;
  right: 0;
  width: 3rem;
  height: 3rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.image-viewer__close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.image-viewer__image-container {
  position: relative;
  max-width: 100%;
  max-height: 80vh;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  perspective: 1200px;
}

.image-viewer__image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  display: block;
  backface-visibility: hidden;
  will-change: transform, clip-path, opacity;
  clip-path: inset(0 100% 0 0); /* 初始遮罩，確保動畫可見 */
  transform-origin: left center;
}

.image-viewer__loading,
.image-viewer__error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: white;
}

.image-viewer__info {
  margin-top: 1rem;
  text-align: center;
  color: white;
}

.image-viewer__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.image-viewer__meta {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

/* 動畫 */
.image-viewer-enter-active,
.image-viewer-leave-active {
  transition: all 0.3s ease;
}

.image-viewer-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.image-viewer-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* 響應式 */
@media (max-width: 640px) {
  .image-viewer__content {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .image-viewer__close {
    top: -2.5rem;
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .image-viewer__title {
    font-size: 1rem;
  }
}

.bucharest-loader__overlay {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: rgba(0,0,0,0.8);
  /* 可加動畫或僅為純黑圓形 */
}

.fixed-position {
  position: fixed !important;
  z-index: 10000 !important;
  left: 0; top: 0;
  will-change: transform;
}
</style> 