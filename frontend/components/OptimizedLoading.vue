<template>
  <div class="loader">
    <div class="spinner"></div>
  </div>
</template>

<style scoped>
  .loader {
    width: 40px;
    height: 40px;
    position: relative;
    margin: 20px auto;
  }

  .spinner {
    width: 100%;
    height: 100%;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style> 