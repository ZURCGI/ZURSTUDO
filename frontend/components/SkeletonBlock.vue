<template>
  <div class="skeleton shimmer"></div>
</template>

<script setup lang="ts">
// 無 props，單純骨架區塊
</script>

<style scoped>
.skeleton {
  width: 100%;
  height: 100%;
  background: #e0e0e0;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}
.shimmer::before {
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  width: 150%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer {
  100% {
    left: 100%;
  }
}
</style> 