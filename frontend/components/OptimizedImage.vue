<template>
  <div 
    class="image-container"
    :style="containerStyle"
    :class="{ 'loading': isLoading, 'loaded': imageLoaded }"
  >
    <!-- 骨架屏 -->
    <div v-if="isLoading" class="skeleton" :style="skeletonStyle">
      <div class="skeleton-shimmer"></div>
    </div>
    
    <!-- 實際圖片 -->
    <img
      ref="mainImage"
      :src="props.src"
      :alt="alt"
      :loading="loading"
      :width="props.width"
      :height="props.height"
      @load="onImageLoad"
      @error="onImageError"
      class="optimized-image"
      :class="{ 'loaded': imageLoaded }"
      :style="imageStyle"
      :data-image-id="imageId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useComponentCleanup } from '~/composables/useComponentCleanup'

interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  placeholder?: string;
  loading?: 'lazy' | 'eager';
  showProgress?: boolean;
  quality?: number;
  aspectRatio?: number; // 新增：強制設定寬高比
}

const props = withDefaults(defineProps<Props>(), {
  loading: 'lazy',
  showProgress: false,
  quality: 85,
  aspectRatio: 0, // 0 表示自動計算
});

const emit = defineEmits(['loaded'])

const mainImage = ref<HTMLImageElement>();
const imageLoaded = ref(false);
const isLoading = ref(true);
const naturalWidth = ref(0);
const naturalHeight = ref(0);
const imageId = ref(`img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

// 使用清理工具
const { addCleanupTask } = useComponentCleanup()

// 計算容器樣式
const containerStyle = computed(() => {
  if (props.aspectRatio > 0) {
    return {
      aspectRatio: props.aspectRatio.toString(),
      width: '100%'
    }
  }
  if (naturalWidth.value && naturalHeight.value) {
    return {
      aspectRatio: (naturalWidth.value / naturalHeight.value).toString(),
      width: '100%'
    }
  }
  return {}
})

// 計算骨架屏樣式
const skeletonStyle = computed(() => {
  if (props.aspectRatio > 0) {
    return {
      aspectRatio: props.aspectRatio.toString()
    }
  }
  if (naturalWidth.value && naturalHeight.value) {
    return {
      aspectRatio: (naturalWidth.value / naturalHeight.value).toString()
    }
  }
  return {
    minHeight: '200px'
  }
})

// 圖片樣式
const imageStyle = computed(() => ({
  opacity: imageLoaded.value ? 1 : 0,
  transition: 'opacity 0.3s ease-in-out'
}))

// 圖片載入處理
const onImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement;
  naturalWidth.value = img.naturalWidth;
  naturalHeight.value = img.naturalHeight;
  
  console.log('OptimizedImage onImageLoad:', {
    src: props.src,
    width: img.naturalWidth,
    height: img.naturalHeight,
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

// 清理圖片資源
const cleanupImage = () => {
  if (mainImage.value) {
    // 清空圖片源
    mainImage.value.src = ''
    // 移除事件監聽器
    mainImage.value.onload = null
    mainImage.value.onerror = null
    // 標記為未使用
    mainImage.value.setAttribute('data-unused', 'true')
  }
}

onMounted(() => {
  console.log('OptimizedImage mounted:', {
    src: props.src,
    width: props.width,
    height: props.height
  })
  
  // 添加清理任務
  addCleanupTask(cleanupImage)
});

onUnmounted(() => {
  console.log('OptimizedImage unmounted')
  cleanupImage()
});
</script>

<style scoped>
.image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 4px;
  background-color: #f0f0f0;
}

.optimized-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  transition: opacity 0.3s ease-in-out;
}

.skeleton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-shimmer {
  width: 100%;
  height: 100%;
  background: inherit;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.loading .optimized-image {
  opacity: 0;
}

.loaded .skeleton {
  display: none;
}

/* 手機端圖片優化 */
@media (max-width: 767px) {
  .image-container {
    min-height: 200px;
  }
  
  .optimized-image {
    display: block !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    border-radius: 4px;
    /* 防止意外選擇 */
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    /* 確保觸控響應 */
    touch-action: manipulation;
  }
}
</style> 