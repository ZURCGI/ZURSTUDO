<template>
  <img :src="imageUrl" :alt="alt" class="bucharest-loader__image" />
</template>

<script setup lang="ts">
interface Props {
  imageUrl: string
  alt: string
}

defineProps<Props>()
</script>

<style scoped>
.bucharest-loader__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style> 