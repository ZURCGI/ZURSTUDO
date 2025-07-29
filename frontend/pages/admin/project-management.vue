<!-- pages/admin/project-management.vue -->
<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-800">專案管理</h1>
      <button
        @click="showCreateModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <Icon name="heroicons:plus-solid" class="w-5 h-5" />
        新增專案
      </button>
    </div>

    <!-- 專案列表 -->
    <div class="bg-white rounded-xl shadow-lg border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-800">專案列表</h2>
      </div>
      
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-500">載入中...</p>
      </div>
      
      <div v-else-if="projects.length === 0" class="p-8 text-center">
        <Icon name="heroicons:folder-solid" class="w-16 h-16 mx-auto text-gray-300" />
        <p class="mt-4 text-gray-500">尚無專案</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">專案名稱</th>
              <!-- 暫時註釋掉，等數據庫欄位添加後再啟用
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">SEO 標題</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">地址</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">FAQ 數量</th>
              -->
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">建立時間</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="project in projects" :key="project.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ project.name }}</div>
              </td>
              <!-- 暫時註釋掉，等數據庫欄位添加後再啟用
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ project.seoTitle || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ project.address || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ project.faqList?.length || 0 }}</div>
              </td>
              -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(project.createdAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center gap-2">
                  <button
                    @click="editProject(project)"
                    class="text-blue-600 hover:text-blue-900 transition-colors"
                  >
                    <Icon name="heroicons:pencil-solid" class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteProject(project)"
                    class="text-red-600 hover:text-red-900 transition-colors"
                  >
                    <Icon name="heroicons:trash-solid" class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 新增/編輯專案 Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-semibold text-gray-800">
            {{ showEditModal ? '編輯專案' : '新增專案' }}
          </h3>
        </div>
        
        <form @submit.prevent="saveProject" class="p-6 space-y-6">
          <!-- 專案資訊 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">專案名稱 *</label>
            <input
              v-model="form.name"
              type="text"
              required
              :class="[
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                nameError ? 'border-red-500' : 'border-gray-300'
              ]"
              placeholder="輸入專案名稱"
              @blur="validateName"
              @input="clearNameError"
            />
            <p v-if="nameError" class="mt-1 text-sm text-red-600">{{ nameError }}</p>
          </div>

          <!-- 操作按鈕 -->
          <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="closeModal"
              class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <div v-if="saving" class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              {{ saving ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  
  <!-- Toast 通知 -->
  <div v-if="toast" class="fixed top-4 right-4 z-50">
    <div 
      :class="[
        'px-4 py-3 rounded-lg shadow-lg max-w-sm',
        toastType === 'success' ? 'bg-green-500 text-white' : '',
        toastType === 'error' ? 'bg-red-500 text-white' : '',
        toastType === 'warning' ? 'bg-yellow-500 text-white' : ''
      ]"
    >
      <div class="flex items-center gap-2">
        <Icon 
          :name="toastType === 'success' ? 'heroicons:check-circle' : toastType === 'error' ? 'heroicons:x-circle' : 'heroicons:exclamation-triangle'"
          class="w-5 h-5"
        />
        <span>{{ toast }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRuntimeConfig } from '#app'
import type { Project, CreateProjectDto, UpdateProjectDto } from '~/types/project'

definePageMeta({
  requiresAuth: true,
  layout: 'admin',
})

const { initUser } = useAuth()
const config = useRuntimeConfig()

const loading = ref(false)
const saving = ref(false)
const projects = ref<Project[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingProject = ref<Project | null>(null)

// Toast 通知
const toast = ref('')
const toastType = ref<'success' | 'error' | 'warning'>('success')
const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
  toast.value = message
  toastType.value = type
  setTimeout(() => {
    toast.value = ''
  }, 3000)
}

const form = ref<CreateProjectDto>({
  name: '',
})

const nameError = ref('')

const loadProjects = async () => {
  try {
    loading.value = true
    const response = await $fetch<Project[]>(`${config.public.apiBase}/projects`, {
      credentials: 'include'
    })
    projects.value = response
  } catch (error: any) {
    console.error('載入專案失敗:', error)
    
    if (error.status === 401) {
      showToast('登入已過期，請重新登入', 'error')
    } else if (error.status === 403) {
      showToast('權限不足，無法載入專案', 'error')
    } else {
      showToast('載入專案失敗，請稍後再試', 'error')
    }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    name: '',
  }
  nameError.value = ''
}

// 驗證專案名稱
const validateName = () => {
  const name = form.value.name.trim()
  
  if (!name) {
    nameError.value = '專案名稱為必填'
    return false
  }
  
  if (name.length < 1) {
    nameError.value = '專案名稱至少需要1個字元'
    return false
  }
  
  if (name.length > 100) {
    nameError.value = '專案名稱不能超過100個字元'
    return false
  }
  
  // 檢查是否與現有專案重複（排除當前編輯的專案）
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

const editProject = (project: Project) => {
  editingProject.value = project
  form.value = {
    name: project.name,
  }
  showEditModal.value = true
}



const saveProject = async () => {
  // 前端驗證
  if (!validateName()) {
    return
  }
  
  try {
    saving.value = true
    
    if (showEditModal.value && editingProject.value) {
      // Update existing project
      const updateData: UpdateProjectDto = { ...form.value }
      await $fetch(`${config.public.apiBase}/projects/${editingProject.value.id}`, {
        method: 'PUT',
        body: updateData,
        credentials: 'include'
      })
    } else {
      // Create new project
      await $fetch(`${config.public.apiBase}/projects`, {
        method: 'POST',
        body: form.value,
        credentials: 'include'
      })
    }
    
    await loadProjects()
    closeModal()
    showToast(showEditModal.value ? '專案更新成功' : '專案建立成功', 'success')
  } catch (error: any) {
    console.error('儲存專案失敗:', error)
    
    // 處理後端錯誤
    if (error.status === 409) {
      nameError.value = '專案名稱已存在'
      showToast('專案名稱已存在', 'error')
    } else if (error.status === 401) {
      showToast('登入已過期，請重新登入', 'error')
      // 可以重定向到登入頁面
    } else if (error.status === 403) {
      showToast('權限不足，無法執行此操作', 'error')
    } else {
      showToast('儲存失敗，請稍後再試', 'error')
    }
  } finally {
    saving.value = false
  }
}

const deleteProject = async (project: Project) => {
  if (!confirm(`確定要刪除專案「${project.name}」嗎？`)) {
    return
  }
  
  try {
    await $fetch(`${config.public.apiBase}/projects/${encodeURIComponent(project.name)}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    await loadProjects()
    showToast('專案刪除成功', 'success')
  } catch (error: any) {
    console.error('刪除專案失敗:', error)
    
    // 處理後端錯誤
    if (error.status === 400) {
      showToast('請先刪除所有相關媒體後再刪除專案', 'warning')
    } else if (error.status === 404) {
      showToast('找不到此專案', 'error')
    } else if (error.status === 401) {
      showToast('登入已過期，請重新登入', 'error')
    } else if (error.status === 403) {
      showToast('權限不足，無法刪除專案', 'error')
    } else {
      showToast('刪除失敗，請稍後再試', 'error')
    }
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingProject.value = null
  resetForm()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW')
}

onMounted(async () => {
  await initUser()
  await loadProjects()
})
</script> 