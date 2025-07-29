<template>
  <div 
    class="layout-shift-prevention"
    :style="containerStyle"
    :class="containerClass"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  aspectRatio?: number;
  minHeight?: string;
  maxHeight?: string;
  width?: string;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  aspectRatio: 0,
  minHeight: '200px',
  maxHeight: 'none',
  width: '100%',
  className: ''
})

const containerStyle = computed(() => {
  const style: Record<string, string> = {
    width: props.width,
    minHeight: props.minHeight,
    maxHeight: props.maxHeight
  }
  
  if (props.aspectRatio > 0) {
    style.aspectRatio = props.aspectRatio.toString()
  }
  
  return style
})

const containerClass = computed(() => {
  return {
    'aspect-ratio-container': props.aspectRatio > 0,
    [props.className]: !!props.className
  }
})
</script>

<style scoped>
.layout-shift-prevention {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  background-color: #f0f0f0;
}

.aspect-ratio-container {
  /* 確保寬高比容器不會造成佈局偏移 */
  contain: layout style paint;
}

/* 手機端優化 */
@media (max-width: 767px) {
  .layout-shift-prevention {
    min-height: 200px;
  }
}
</style>