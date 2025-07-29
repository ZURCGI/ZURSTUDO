<template>
  <div v-if="show" class="preloader">
    <span class="percentage">{{ Math.round(progress) }}%</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import gsap from 'gsap'

const isLoading = ref(true)
const progress = ref(0)
const show = ref(true)
const emit = defineEmits(['loaded'])

onMounted(() => {
  // 模擬載入進度
  gsap.to(progress, {
    value: 100,
    duration: 2, // 模擬 2 秒載入
    ease: 'power2.out',
    onComplete: () => {
      // 載入完成後，播放退場動畫
      gsap.to('.preloader', {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.8,
        onComplete: () => {
          isLoading.value = false
          show.value = false // 徹底移除
          emit('loaded')
        }
      })
    }
  })
})
</script>

<style scoped>
.preloader {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.8s;
  pointer-events: all;
}
.percentage {
  font-size: 2.5rem;
  font-weight: bold;
  color: #222;
  letter-spacing: 0.1em;
}
</style> 