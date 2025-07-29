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
    style="height: 100vh; width: auto; max-width: 100vw; display: block; object-fit: contain; will-change: clip-path, transform, opacity; clip-path: inset(0% 100% 0% 0%); margin: 0 auto;"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
}

const props = withDefaults(defineProps<Props>(), {
  loading: 'eager',
});

const emit = defineEmits(['loaded']);

const onImageLoad = () => {
  emit('loaded');
};

const onImageError = () => {
  console.error(`Failed to load image: ${props.src}`);
  emit('loaded');
};
</script>

<style scoped>
/* 只保留基本圖片顯示，動畫交由父層控制 */
</style> 