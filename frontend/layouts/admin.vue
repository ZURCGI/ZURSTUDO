<!-- layouts/admin.vue -->
<template>
  <div class="flex h-screen bg-gray-50 font-sans">
    <!-- 側邊選單 -->
    <aside class="w-64 bg-gray-900 text-white flex-shrink-0">
      <div class="flex items-center justify-center h-20 border-b border-gray-800">
        <h1 class="text-2xl font-bold text-gray-100">ZUR Admin</h1>
      </div>
      <nav class="mt-6 px-4">
        <ul class="space-y-2">
          <li>
            <NuxtLink to="/admin/dashboard" class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-800 hover:text-white" active-class="bg-blue-600 text-white shadow-lg">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 6h18M3 14h18M3 18h18"/></svg>
              <span>Dashboard</span>
            </NuxtLink>
          </li>
          <li v-if="['admin', 'media_editor'].includes(user?.role)">
            <NuxtLink to="/admin/media-library" class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-800 hover:text-white" active-class="bg-blue-600 text-white shadow-lg">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14"/></svg>
              <span>媒體庫</span>
            </NuxtLink>
          </li>
          <li v-if="['admin', 'media_editor'].includes(user?.role)">
            <NuxtLink to="/admin/upload-media" class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-800 hover:text-white" active-class="bg-blue-600 text-white shadow-lg">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v-2a2 2 0 012-2h12a2 2 0 012 2v2m-6-4l-4 4m0 0l4 4m-4-4h12"/></svg>
              <span>上傳媒體</span>
            </NuxtLink>
          </li>
          <li v-if="user?.role === 'admin'">
            <NuxtLink to="/admin/project-management" class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-800 hover:text-white" active-class="bg-blue-600 text-white shadow-lg">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              <span>專案管理</span>
            </NuxtLink>
          </li>
          <li v-if="user?.role === 'admin'">
            <NuxtLink to="/admin/seo-settings" class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-800 hover:text-white" active-class="bg-blue-600 text-white shadow-lg">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 16v-2m8-6h2m-18 0h2M4.93 4.93l1.414 1.414M17.657 17.657l1.414 1.414m-14.142 0l1.414-1.414M19.07 4.93l-1.414 1.414"/></svg>
              <span>SEO 管理</span>
            </NuxtLink>
          </li>
          <li v-if="user?.role === 'admin'">
            <NuxtLink to="/admin/user-management" class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-800 hover:text-white" active-class="bg-blue-600 text-white shadow-lg">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/></svg>
              <span>用戶管理</span>
            </NuxtLink>
          </li>
          
        </ul>
        <div class="mt-auto p-4">
          <NuxtLink to="/admin/change-password" class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-800 hover:text-white" active-class="bg-blue-600 text-white shadow-lg">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2h6zM12 12h.01"/></svg>
            <span>修改密碼</span>
          </NuxtLink>
        </div>
      </nav>
    </aside>

    <!-- 主內容區域 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 頁首 -->
      <header class="bg-white border-b border-gray-200 flex justify-end items-center h-20 px-8">
        <button @click="logout()" class="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H3"/></svg>
          <span>登出</span>
        </button>
      </header>
      <!-- 內容 -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
        <div class="w-full max-w-7xl mx-auto">
          <NuxtPage />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
import { ref, onMounted, onUnmounted } from 'vue'; // ✅ 引入 onUnmounted

const { logout, user, initUser } = useAuth();



onMounted(async () => {
  await initUser();

  // ✅ 當 admin 佈局掛載時，為 html 和 body 添加標記
  if (process.client) {
    document.documentElement.classList.add('admin-layout-active');
    document.body.classList.add('admin-layout-active');
  }
});

// ✅ 新增：當 admin 佈局被銷毀時，清理標記
onUnmounted(() => {
  if (process.client) {
    document.documentElement.classList.remove('admin-layout-active');
    document.body.classList.remove('admin-layout-active');
  }
});
</script>

<style scoped>
/* 可根據需求微調細節 */
</style>
