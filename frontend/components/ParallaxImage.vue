<template>
  <div class="parallax-container" ref="parallaxContainer">
    <img :src="src" class="parallax-image" ref="parallaxImage" :alt="alt" />
    <div v-if="overlay" class="parallax-overlay"></div>
    <div v-if="title" class="parallax-title">{{ title }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, required: true },
  overlay: { type: Boolean, default: false },
  title: { type: String, default: '' },
})

const parallaxImage = ref(null)
const parallaxContainer = ref(null)

onMounted(async () => {
  const gsap = (await import('gsap')).default
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  gsap.to(parallaxImage.value, {
    y: '-30%',
    rotateX: 12, // 新增 3D 立體感
    ease: 'none',
    scrollTrigger: {
      trigger: parallaxContainer.value,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  })
})
</script>

<style scoped>
.parallax-container {
  height: 60vh;
  width: 100vw;
  max-width: 100vw;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px; /* 新增 3D 透視 */
}
.parallax-image {
  width: 100vw;
  height: 130%;
  object-fit: cover;
  position: absolute;
  top: -15%;
  left: 0;
}
.parallax-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.18);
  z-index: 1;
}
.parallax-title {
  position: relative;
  z-index: 2;
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  text-align: center;
}
</style> 