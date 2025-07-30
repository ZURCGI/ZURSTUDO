<!-- pages/admin/user-management.vue -->
<template>
  <div class="flex justify-center items-start w-full">
    <div class="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-200 p-8 my-8">
      <div class="space-y-8">
        <h2 class="text-2xl font-semibold mb-6">用戶管理</h2>
        
        <!-- 創建媒體編輯者帳號 -->
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 class="text-lg font-semibold mb-4 flex items-center">
            <Icon name="heroicons:user-plus" class="w-5 h-5 mr-2 text-blue-600" />
            創建媒體編輯者帳號
          </h3>
          <form @submit.prevent="createMediaEditor" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">用戶名</label>
                <input 
                  v-model="mediaEditorForm.username" 
                  type="text" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：media_editor_001"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">密碼</label>
                <input 
                  v-model="mediaEditorForm.password" 
                  type="password" 
                  required
                  minlength="8"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="至少8個字符"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">電子郵件（可選）</label>
              <input 
                v-model="mediaEditorForm.email" 
                type="email" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="editor@zurcgi.com"
              />
            </div>
            <div class="flex items-center justify-between">
              <button 
                type="submit" 
                :disabled="creating"
                class="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Icon v-if="creating" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
                {{ creating ? '創建中...' : '創建媒體編輯者帳號' }}
              </button>
              <div class="text-sm text-gray-500">
                <Icon name="heroicons:information-circle" class="w-4 h-4 inline mr-1" />
                媒體編輯者只能上傳和編輯媒體，無法修改密碼
              </div>
            </div>
          </form>
        </div>

        <!-- 修改密碼 -->
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 class="text-lg font-semibold mb-4 flex items-center">
            <Icon name="heroicons:key" class="w-5 h-5 mr-2 text-green-600" />
            修改密碼
          </h3>
          <form @submit.prevent="changePassword" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">新密碼</label>
                <input 
                  v-model="passwordForm.newPassword" 
                  type="password" 
                  required
                  minlength="8"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="至少8個字符"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">確認新密碼</label>
                <input 
                  v-model="passwordForm.confirmPassword" 
                  type="password" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="再次輸入新密碼"
                />
              </div>
            </div>
            <div class="flex items-center justify-between">
              <button 
                type="submit" 
                :disabled="changingPassword || !passwordsMatch"
                class="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Icon v-if="changingPassword" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
                {{ changingPassword ? '修改中...' : '修改密碼' }}
              </button>
              <div v-if="!passwordsMatch && passwordForm.confirmPassword" class="text-sm text-red-500">
                <Icon name="heroicons:exclamation-triangle" class="w-4 h-4 inline mr-1" />
                密碼不匹配
              </div>
            </div>
          </form>
        </div>

        <!-- 創建管理員帳號 -->
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 class="text-lg font-semibold mb-4 flex items-center">
            <Icon name="heroicons:shield-check" class="w-5 h-5 mr-2 text-purple-600" />
            創建管理員帳號
          </h3>
          <form @submit.prevent="createAdmin" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">用戶名</label>
                <input 
                  v-model="adminForm.username" 
                  type="text" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="例如：admin_001"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">密碼</label>
                <input 
                  v-model="adminForm.password" 
                  type="password" 
                  required
                  minlength="8"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="至少8個字符"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">電子郵件（可選）</label>
              <input 
                v-model="adminForm.email" 
                type="email" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="admin@zurcgi.com"
              />
            </div>
            <div class="flex items-center justify-between">
              <button 
                type="submit" 
                :disabled="creatingAdmin"
                class="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Icon v-if="creatingAdmin" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
                {{ creatingAdmin ? '創建中...' : '創建管理員帳號' }}
              </button>
              <div class="text-sm text-gray-500">
                <Icon name="heroicons:information-circle" class="w-4 h-4 inline mr-1" />
                管理員擁有所有權限，包括創建其他帳號
              </div>
            </div>
          </form>
        </div>

        <!-- 操作結果提示 -->
        <div v-if="message" class="fixed top-4 right-4 z-50">
          <div :class="[
            'px-4 py-3 rounded-md shadow-lg max-w-sm',
            messageType === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
          ]">
            <div class="flex items-center">
              <Icon 
                :name="messageType === 'success' ? 'heroicons:check-circle' : 'heroicons:exclamation-triangle'" 
                class="w-5 h-5 mr-2" 
              />
              <span>{{ message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRuntimeConfig } from '#app'

definePageMeta({
  requiresAuth: true,
  layout: 'admin',
})

const { initUser } = useAuth()
const config = useRuntimeConfig()

// 表單數據
const mediaEditorForm = ref({
  username: '',
  password: '',
  email: ''
})

const passwordForm = ref({
  newPassword: '',
  confirmPassword: ''
})

const adminForm = ref({
  username: '',
  password: '',
  email: ''
})

// 狀態
const creating = ref(false)
const changingPassword = ref(false)
const creatingAdmin = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

// 計算屬性
const passwordsMatch = computed(() => {
  return passwordForm.value.newPassword === passwordForm.value.confirmPassword
})

// 創建媒體編輯者帳號
const createMediaEditor = async () => {
  try {
    creating.value = true
    const { user } = useAuth()
    
    const response = await $fetch(`${config.public.apiBase}/users/create-media-editor`, {
      method: 'POST',
      body: mediaEditorForm.value,
      credentials: 'include'
    })
    
    showMessage('媒體編輯者帳號創建成功！', 'success')
    mediaEditorForm.value = { username: '', password: '', email: '' }
  } catch (error: any) {
    const errorMsg = error.data?.message || error.message || '創建失敗'
    showMessage(errorMsg, 'error')
  } finally {
    creating.value = false
  }
}

// 修改密碼
const changePassword = async () => {
  if (!passwordsMatch.value) {
    showMessage('密碼不匹配', 'error')
    return
  }

  try {
    changingPassword.value = true
    const { user } = useAuth()
    
    await $fetch(`${config.public.apiBase}/users/change-password`, {
      method: 'PATCH',
      body: { newPassword: passwordForm.value.newPassword },
      credentials: 'include'
    })
    
    showMessage('密碼修改成功！', 'success')
    passwordForm.value = { newPassword: '', confirmPassword: '' }
  } catch (error: any) {
    const errorMsg = error.data?.message || error.message || '修改失敗'
    showMessage(errorMsg, 'error')
  } finally {
    changingPassword.value = false
  }
}

// 創建管理員帳號
const createAdmin = async () => {
  try {
    creatingAdmin.value = true
    const { user } = useAuth()
    
    const response = await $fetch(`${config.public.apiBase}/users/create-admin`, {
      method: 'POST',
      body: adminForm.value,
      credentials: 'include'
    })
    
    showMessage('管理員帳號創建成功！', 'success')
    adminForm.value = { username: '', password: '', email: '' }
  } catch (error: any) {
    const errorMsg = error.data?.message || error.message || '創建失敗'
    showMessage(errorMsg, 'error')
  } finally {
    creatingAdmin.value = false
  }
}

// 顯示消息
const showMessage = (msg: string, type: 'success' | 'error') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

// 初始化
onMounted(async () => {
  await initUser()
})
</script> 