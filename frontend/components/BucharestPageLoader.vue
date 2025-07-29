<template>
  <!-- 完全不顯示任何 loading 標記 -->
  <div v-if="false"></div>
</template>

<script setup lang="ts">
// 保留 props 但不做任何事
interface Props { loading: boolean }
defineProps<Props>()
</script>

<style scoped>
/* 保留空樣式 */
</style> 