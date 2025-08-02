<!-- pages/admin/project-management.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">專案管理</h1>
      <button
        @click="showCreateModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        新增專案
      </button>
    </div>

    <!-- 載入狀態 -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">載入中...</p>
    </div>

    <!-- 專案列表 -->
    <div v-else-if="projects.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              專案名稱
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              建立時間
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="project in projects" :key="project.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ project.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(project.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="editProject(project)"
                class="text-blue-600 hover:text-blue-900 mr-4"
              >
                編輯
              </button>
              <button
                @click="deleteProject(project)"
                class="text-red-600 hover:text-red-900"
              >
                刪除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 空狀態 -->
    <div v-else class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">尚無專案</h3>
      <p class="text-gray-500 mb-4">開始建立您的第一個專案</p>
      <button
        @click="showCreateModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        新增專案
      </button>
    </div>

    <!-- 新增專案 Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 class="text-xl font-semibold mb-4">新增專案</h2>
        <form @submit.prevent="saveProject">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">專案名稱</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': nameError }"
              @input="clearNameError"
              placeholder="請輸入專案名稱"
            />
            <p v-if="nameError" class="text-red-500 text-sm mt-1">{{ nameError }}</p>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
            >
              {{ saving ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 編輯專案 Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 class="text-xl font-semibold mb-4">編輯專案</h2>
        <form @submit.prevent="saveProject">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">專案名稱</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': nameError }"
              @input="clearNameError"
              placeholder="請輸入專案名稱"
            />
            <p v-if="nameError" class="text-red-500 text-sm mt-1">{{ nameError }}</p>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
            >
              {{ saving ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast 提示 -->
    <div
      v-if="toast.show"
      :class="[
        'fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300',
        toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      ]"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRuntimeConfig } from '#app'
import { useAuth } from '@/composables/useAuth'

const config = useRuntimeConfig()
const { initUser } = useAuth()

// 狀態管理
const projects = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingProject = ref<any>(null)
const form = ref({ name: '' })
const nameError = ref('')
const toast = ref({ show: false, message: '', type: 'success' })

// AbortController 用於取消正在進行的請求
let abortController: AbortController | null = null

// 顯示 Toast 提示
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// 載入專案列表
const loadProjects = async () => {
  // 中止之前的請求
  if (abortController) {
    abortController.abort()
  }
  
  // 建立新的 AbortController
  abortController = new AbortController()
  
  loading.value = true
  
  try {
    const response = await $fetch(`${config.public.apiBase}/projects`, {
      signal: abortController.signal,
      credentials: 'include'
    })
    
    if (response && Array.isArray(response)) {
      projects.value = response
    } else {
      projects.value = []
    }
  } catch (error: any) {
    // 如果錯誤是我們自己中止的，就安靜地忽略它
    if (error.name === 'AbortError') {
      console.log('Fetch request was aborted as the component unmounted.')
    } else {
      // 對於其他真實的錯誤，則顯示提示
      console.error('載入專案失敗:', error)
      showToast('載入專案失敗，請稍後再試', 'error')
    }
  } finally {
    // 無論成功、失敗或中止，最終都確保 loading 狀態被重置
    loading.value = false
  }
}

// 重置表單
const resetForm = () => {
  form.value = { name: '' }
  nameError.value = ''
}

// 驗證專案名稱
const validateName = () => {
  const name = form.value.name.trim()
  if (!name) {
    nameError.value = '專案名稱為必填'
    return false
  }
  
  const existingProject = projects.value.find(p =>
    p.name.toLowerCase() === name.toLowerCase() &&
    (!editingProject.value || p.id !== editingProject.value.id)
  )
  
  if (existingProject) {
    nameError.value = '專案名稱已存在'
    return false
  }
  
  nameError.value = ''
  return true
}

// 清除名稱錯誤
const clearNameError = () => {
  if (nameError.value) {
    nameError.value = ''
  }
}

// 編輯專案
const editProject = (project: any) => {
  editingProject.value = project
  form.value = { name: project.name }
  showEditModal.value = true
}

// 儲存專案
const saveProject = async () => {
  if (!validateName()) return
  
  saving.value = true
  
  const url = showEditModal.value && editingProject.value
    ? `${config.public.apiBase}/projects/${editingProject.value.id}`
    : `${config.public.apiBase}/projects`
  
  const method = showEditModal.value ? 'PUT' : 'POST'
  
  try {
    await $fetch(url, {
      method: method,
      body: form.value,
      credentials: 'include'
    })
    
    await loadProjects() // 重新載入列表
    closeModal()
    showToast(showEditModal.value ? '專案更新成功' : '專案建立成功', 'success')
  } catch (error: any) {
    console.error('儲存專案失敗:', error)
    showToast(error.data?.message || '儲存失敗，請稍後再試', 'error')
  } finally {
    saving.value = false
  }
}

// 刪除專案
const deleteProject = async (project: any) => {
  if (!confirm(`確定要刪除專案「${project.name}」嗎？`)) return
  
  try {
    await $fetch(`${config.public.apiBase}/projects/${encodeURIComponent(project.name)}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    
    await loadProjects() // 重新載入列表
    showToast('專案刪除成功', 'success')
  } catch (error: any) {
    console.error('刪除專案失敗:', error)
    showToast(error.data?.message || '刪除失敗', 'error')
  }
}

// 關閉 Modal
const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingProject.value = null
  resetForm()
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW')
}

// 生命週期
onMounted(async () => {
  await initUser()
  await loadProjects()
})

onUnmounted(() => {
  // ==================================================================
  // 核心修改：在元件卸載時，呼叫 abort() 來取消所有正在進行的 fetch
  // ==================================================================
  if (abortController) {
    abortController.abort()
  }
  console.log('[Project Management] Component unmounted, any ongoing fetch has been aborted.')
})
</script> 