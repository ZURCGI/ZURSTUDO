<!-- pages/admin/login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 font-sans">
    <div class="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-800">ZUR Admin</h1>
        <p class="text-gray-500 mt-2">歡迎回來，請登入您的帳戶</p>
      </div>
      <form @submit.prevent="onSubmit" class="space-y-6">
        <div class="relative">
          <label class="sr-only">帳號</label>
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </span>
          <input
            v-model="username"
            type="text"
            class="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="請輸入帳號"
            required
          />
        </div>
        <div class="relative">
          <label class="sr-only">密碼</label>
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </span>
          <input
            v-model="password"
            type="password"
            class="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="請輸入密碼"
            required
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg v-if="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ loading ? '登入中...' : '安全登入' }}</span>
        </button>
      </form>
      <p v-if="errorMsg" class="mt-4 text-red-500 text-center font-medium">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onErrorCaptured } from 'vue';
import { useAuth } from '~/composables/useAuth';

definePageMeta({
  layout: false, // 使用獨立佈局
});

const { login } = useAuth();
const username = ref('');
const password = ref('');
const errorMsg = ref('');
const loading = ref(false);

onMounted(() => {
  console.log('[Login Page] Component mounted');
  console.log('[Login Page] Current route:', window.location.pathname);
  console.log('[Login Page] Layout disabled:', true);
  console.log('[Login Page] Window location:', window.location.href);
  console.log('[Login Page] Document ready state:', document.readyState);
});

onErrorCaptured((error, instance, info) => {
  console.error('[Login Page] Error captured:', error);
  console.error('[Login Page] Error info:', info);
  console.error('[Login Page] Component instance:', instance);
  return false; // 防止錯誤繼續傳播
});

const onSubmit = async () => {
  console.log('[Login Page] Form submitted');
  loading.value = true;
  errorMsg.value = '';
  try {
    await login(username.value, password.value);
    console.log('[Login Page] Login successful, redirecting...');
    // 登入成功後，導向到後台主頁
    await navigateTo('/admin/dashboard');
  } catch (err: any) {
    console.error('[Login Page] Login failed:', err);
    errorMsg.value = err?.message || err?.data?.message || '登入失敗，請檢查您的帳號或密碼。'
  } finally {
    loading.value = false;
  }
};
</script>

