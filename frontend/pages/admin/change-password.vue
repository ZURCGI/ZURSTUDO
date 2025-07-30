<!-- pages/admin/change-password.vue -->
<template>
  <div class="max-w-md mx-auto">
    <div class="bg-white rounded-lg shadow-md p-8">
      <h1 class="text-2xl font-bold mb-6 text-gray-900">修改密碼</h1>
      <form @submit.prevent="handleChangePassword" class="space-y-6">

        <!-- 當前密碼 -->
        <div>
          <label for="current-password" class="block text-sm font-medium text-gray-700 mb-2">當前密碼</label>
          <input
            id="current-password"
            v-model="passwords.current"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="請輸入當前密碼"
          />
        </div>

        <!-- 新密碼 -->
        <div>
          <label for="new-password" class="block text-sm font-medium text-gray-700 mb-2">新密碼</label>
          <input
            id="new-password"
            v-model="passwords.new"
            type="password"
            required
            minlength="8"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="請輸入新密碼（至少8個字元）"
          />
          <!-- 密碼強度提示 -->
          <p v-if="passwords.new" class="mt-1 text-xs text-gray-500">
            密碼長度：{{ passwords.new.length }}/8 {{ passwords.new.length >= 8 ? '✅' : '❌' }}
          </p>
        </div>

        <!-- 確認新密碼 -->
        <div>
          <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-2">確認新密碼</label>
          <input
            id="confirm-password"
            v-model="passwords.confirm"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="請再次輸入新密碼"
          />
          <p v-if="passwords.new && passwords.confirm && passwords.new !== passwords.confirm" class="mt-2 text-sm text-red-600">
            兩次輸入的新密碼不一致。
          </p>
        </div>

        <!-- 提交按鈕 -->
        <div>
          <button
            type="submit"
            :disabled="loading || passwords.new !== passwords.confirm || passwords.new.length < 8"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ loading ? '處理中...' : '更新密碼' }}</span>
          </button>
        </div>

        <!-- 訊息提示 -->
        <div v-if="message" :class="messageType === 'success' ? 'text-green-600 bg-green-50 border border-green-200' : 'text-red-600 bg-red-50 border border-red-200'" class="text-sm text-center p-3 rounded-md">
          {{ message }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuth } from '~/composables/useAuth'

// 定義頁面元數據，使用 admin 佈局
definePageMeta({
  requiresAuth: true,
  layout: 'admin'
})

// 使用 reactive 來組織表單數據
const passwords = reactive({
  current: '',
  new: '',
  confirm: '',
})

const loading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('error')

// 從 useAuth 獲取 changePassword 函數
const { changePassword, logout } = useAuth()

const handleChangePassword = async () => {
  // 前端基礎驗證
  if (passwords.new !== passwords.confirm) {
    message.value = '新密碼與確認密碼不符，請重新輸入。'
    messageType.value = 'error'
    return
  }
  if (passwords.new.length < 8) {
    message.value = '新密碼長度不能少於 8 個字元。'
    messageType.value = 'error'
    return
  }
  if (!passwords.current) {
    message.value = '請輸入當前密碼。'
    messageType.value = 'error'
    return
  }

  loading.value = true
  message.value = ''

  try {
    // 呼叫 API
    await changePassword({
      currentPassword: passwords.current,
      newPassword: passwords.new,
    })

    message.value = '密碼更新成功！為了安全，將為您自動登出，請使用新密碼重新登入。'
    messageType.value = 'success'

    // 密碼修改成功後，強制用戶在幾秒後登出，這是一個安全最佳實踐
    setTimeout(() => {
      logout()
    }, 3000)

  } catch (err: any) {
    // 處理後端返回的錯誤
    message.value = err?.data?.message || '密碼修改失敗，請檢查您輸入的當前密碼是否正確。'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>