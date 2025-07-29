<template>
  <img
    ref="mainImage"
    :src="props.src"
    :alt="alt"
    :loading="loading"
    :width="props.width"
    :height="props.height"
    @load="onImageLoad"
    @error="onImageError"
    class="w-full h-auto block"
    style="display: block; width: 100%; height: auto; object-fit: cover; border-radius: 4px;"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  placeholder?: string;
  loading?: 'lazy' | 'eager';
  showProgress?: boolean;
  quality?: number;
}

const props = withDefaults(defineProps<Props>(), {
  loading: 'lazy',
  showProgress: false,
  quality: 85,
});

const emit = defineEmits(['loaded'])

const mainImage = ref<HTMLImageElement>();
const imageLoaded = ref(false);
const isLoading = ref(true);

// 圖片載入處理
const onImageLoad = () => {
  console.log('OptimizedImage onImageLoad:', {
    src: props.src,
    width: props.width,
    height: props.height,
    alt: props.alt,
    imageLoaded: imageLoaded.value,
    isLoading: isLoading.value
  })
  imageLoaded.value = true;
  isLoading.value = false;
  emit('loaded');
};

const onImageError = () => {
  isLoading.value = false;
  console.error(`Failed to load image: ${props.src}`);
};

onMounted(() => {
  console.log('OptimizedImage mounted:', {
    src: props.src,
    width: props.width,
    height: props.height
  })
});

onUnmounted(() => {
  console.log('OptimizedImage unmounted')
});
</script>

<style scoped>
/* 確保圖片沒有額外的間距 */
img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 4px;
  background-color: #f0f0f0;
}

/* 手機端圖片優化 */
@media (max-width: 767px) {
  img {
    display: block !important;
    width: 100% !important;
    height: auto !important;
    object-fit: cover !important;
    border-radius: 4px;
    background-color: #f0f0f0;
    min-height: 200px;
    /* 防止意外選擇 */
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    /* 確保觸控響應 */
    touch-action: manipulation;
  }
  
  /* 手機端圖片載入狀態 */
  img:not([src]) {
    background: #f0f0f0;
    display: flex !important;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }
  
  /* 手機端圖片錯誤狀態 */
  img[data-error="true"] {
    background: #ffebee;
    display: flex !important;
    align-items: center;
    justify-content: center;
    color: #c62828;
    font-size: 14px;
    text-align: center;
    padding: 20px;
  }
}
</style> 