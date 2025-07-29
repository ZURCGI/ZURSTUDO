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
    style="width: 100%; height: auto; display: block;"
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
  margin: 0;
  padding: 0;
  display: block;
}
</style> 