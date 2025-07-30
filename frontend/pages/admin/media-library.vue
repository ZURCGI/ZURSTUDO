<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-800">媒體庫</h1>
      <div class="flex gap-4">
        <NuxtLink to="/admin/upload-media" class="px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
          <Icon name="heroicons:arrow-up-tray-solid" class="w-5 h-5" />
          <span>上傳新媒體</span>
        </NuxtLink>
      </div>
    </div>

    <!-- 搜尋和篩選 -->
    <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div class="md:col-span-2 lg:col-span-3 relative">
          <Icon name="heroicons:magnifying-glass-solid" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜尋標題、描述..."
            class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <select v-model="selectedType" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500">
          <option value="">所有類型</option>
          <option value="image">圖片</option>
          <option value="video">影片</option>
          <option value="view360">360度視圖</option>
        </select>
        <select v-model="selectedCategory" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500">
          <option value="">所有分類</option>
          <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
        </select>
        <button @click="selectAll" class="w-full px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition">
          {{ isAllSelected ? '取消全選' : '全選本頁' }}
        </button>
      </div>
    </div>

    <!-- 批次操作欄 -->
    <div v-if="selectedItems.size > 0" class="bg-blue-600 text-white rounded-xl shadow-lg p-4 flex justify-between items-center sticky top-4 z-20">
      <span class="font-semibold">已選取 {{ selectedItems.size }} 個項目</span>
      <div class="flex gap-2">
        <button @click="showBatchActions = true" class="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition">
          批次操作
        </button>
        <button @click="selectedItems.clear()" class="px-4 py-2 bg-blue-500 hover:bg-blue-400 font-semibold rounded-lg transition">
          取消選取
        </button>
      </div>
    </div>

    <!-- 媒體網格 -->
    <div v-if="loading && media.length === 0" class="text-center py-20">
      <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-500">正在載入媒體庫...</p>
    </div>
    <div v-else-if="filteredMedia.length === 0" class="text-center py-20 bg-white rounded-xl shadow-md border">
      <Icon name="heroicons:photo-solid" class="w-20 h-20 mx-auto text-gray-300" />
      <p class="mt-4 text-lg text-gray-500">沒有找到符合條件的媒體檔案</p>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <div
        v-for="item in filteredMedia"
        :key="item.id"
        class="media-item group bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
        :class="{ 'ring-4 ring-blue-500 ring-offset-2': selectedItems.has(item.id) }"
        @click="selectItem(item)"
      >
        <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden">
          <img
            v-if="item.type === 'image'"
            :src="item.thumbnail || item.url"
            :alt="item.description || item.title"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
          <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center">
            <Icon v-if="item.type === 'video'" name="heroicons:play-circle-solid" class="w-16 h-16 text-gray-300" />
            <Icon v-else name="heroicons:cube-transparent-solid" class="w-16 h-16 text-gray-300" />
          </div>
          <div class="absolute top-3 left-3">
            <span class="px-2.5 py-1 text-xs font-bold rounded-full text-white shadow-md" :class="getTypeClass(item.type)">
              {{ getTypeLabel(item.type) }}
            </span>
          </div>
          <div class="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button @click.stop="editItem(item)" class="p-2 bg-white/80 rounded-full hover:bg-white backdrop-blur-sm shadow-md">
              <Icon name="heroicons:pencil-solid" class="w-5 h-5 text-gray-700" />
            </button>
            <button @click.stop="deleteItem(item)" class="p-2 bg-red-500/80 rounded-full hover:bg-red-500 backdrop-blur-sm shadow-md">
              <Icon name="heroicons:trash-solid" class="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        <div class="p-4">
          <h3 class="font-bold text-gray-800 truncate h-6">
            {{ item.description || item.title || '未命名' }}
          </h3>
          <div class="flex items-center justify-between text-sm text-gray-500 mt-2">
            <span>{{ formatDate(item.createdAt) }}</span>
            <span>{{ formatFileSize(item.fileSize) }}</span>
          </div>
          <div v-if="item.category" class="mt-2">
            <span class="text-xs bg-gray-100 px-2 py-1 rounded-full font-medium text-gray-600">
              {{ item.category }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 載入更多 -->
    <div v-if="hasMore && !loading" class="text-center py-8">
      <button @click="loadMore" class="px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-all shadow-lg">
        載入更多
      </button>
    </div>

    <!-- 模態框 -->
    <Transition name="fade">
      <div v-if="showBatchActions || showEditModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <!-- 批次操作 -->
        <div v-if="showBatchActions" class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg space-y-6">
          <h3 class="text-2xl font-bold text-gray-800">批次操作 ({{ selectedItems.size }} 個項目)</h3>
          <div class="space-y-4">
            <button @click="batchDelete" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition">
              <Icon name="heroicons:trash-solid" class="w-5 h-5" />
              <span>批次刪除</span>
            </button>
            <!-- 其他批次操作 -->
          </div>
          <button @click="showBatchActions = false" class="mt-6 w-full px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition">
            關閉
          </button>
        </div>

        <!-- 編輯媒體 -->
        <div v-if="showEditModal && editingItem" class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg space-y-6">
          <h3 class="text-2xl font-bold text-gray-800">編輯媒體</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <input v-model="editingItem.description" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">分類</label>
              <input v-model="editingItem.category" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div class="flex gap-4 mt-6">
            <button @click="saveEdit" class="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
              儲存變更
            </button>
            <button @click="showEditModal = false" class="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition">
              取消
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRuntimeConfig } from '#app'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  requiresAuth: true,
  layout: 'admin',
})

interface MediaItem {
  id: string
  title: string
  description?: string
  type: 'image' | 'video' | 'view360'
  url: string
  thumbnail?: string
  fileSize: number
  createdAt: string
  category?: string
  publicId: string
}

const config = useRuntimeConfig()
const { user } = useAuth()
const searchQuery = ref('')
const selectedType = ref('')
const selectedCategory = ref('')
const selectedItems = ref(new Set<string>())
const loading = ref(false)
const media = ref<MediaItem[]>([])
const hasMore = ref(true)
const page = ref(1)
const showEditModal = ref(false)
const editingItem = ref<MediaItem | null>(null)
const showBatchActions = ref(false)
const batchCategory = ref('')
const batchDescription = ref('')
const batchFolder = ref('')
const batchTags = ref('')

// 計算屬性
const filteredMedia = computed(() => {
  return media.value.filter(item => {
    const matchesSearch = !searchQuery.value || 
      (item.description || item.title || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesType = !selectedType.value || item.type === selectedType.value
    const matchesCategory = !selectedCategory.value || item.category === selectedCategory.value
    return matchesSearch && matchesType && matchesCategory
  })
})

const categories = computed(() => {
  const cats = new Set(media.value.map(item => item.category).filter(Boolean))
  return Array.from(cats)
})

const isAllSelected = computed(() => {
  return filteredMedia.value.length > 0 && 
         filteredMedia.value.every(item => selectedItems.value.has(item.id))
})

// 方法
const selectItem = (item: MediaItem) => {
  if (selectedItems.value.has(item.id)) {
    selectedItems.value.delete(item.id)
  } else {
    selectedItems.value.add(item.id)
  }
}

const selectAll = () => {
  if (isAllSelected.value) {
    selectedItems.value.clear()
  } else {
    filteredMedia.value.forEach(item => selectedItems.value.add(item.id))
  }
}

const loadMedia = async () => {
  try {
    loading.value = true
    const { user } = useAuth()
    
    const response = await $fetch(`${config.public.apiBase}/media/list`, {
      credentials: 'include'
    })
    media.value = response.items || []
  } catch (error) {
    console.error('載入媒體失敗:', error)
  } finally {
    loading.value = false
  }
}

const deleteItem = async (item: MediaItem) => {
  if (!confirm(`確定要刪除 "${item.description || item.title}" 嗎？`)) return
  
  try {
    const { user } = useAuth()
    
    console.log(`[MediaLibrary] 開始刪除媒體: ${item.description || item.title} (${item.type})`)
    
    const response = await $fetch(`${config.public.apiBase}/media/${item.type}/${encodeURIComponent(item.publicId)}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    
    // 從列表中移除
    media.value = media.value.filter(m => m.id !== item.id)
    
    // 成功提示
    console.log(`[MediaLibrary] 刪除成功: ${item.description || item.title}`)
    alert(`刪除成功：${item.description || item.title}`)
    
  } catch (error) {
    console.error('[MediaLibrary] 刪除失敗:', error)
    alert(`刪除失敗：${error.message || '未知錯誤'}`)
  }
}

const batchDelete = async () => {
  if (!confirm(`確定要刪除選中的 ${selectedItems.value.size} 個檔案嗎？`)) return
  
  try {
    const { user } = useAuth()
    
    const items = Array.from(selectedItems.value).map(id => {
      const item = media.value.find(m => m.id === id)
      return {
        type: item!.type,
        publicId: item!.publicId
      }
    })
    
    const response = await $fetch(`${config.public.apiBase}/media/batch/delete`, {
      method: 'POST',
      credentials: 'include',
      body: { items }
    })
    
    if (response.success) {
      media.value = media.value.filter(m => !selectedItems.value.has(m.id))
      selectedItems.value.clear()
      showBatchActions.value = false
      alert(`批次刪除完成：成功 ${response.results.success.length} 個，失敗 ${response.results.failed.length} 個`)
    }
  } catch (error) {
    console.error('批次刪除失敗:', error)
    alert('批次刪除失敗')
  }
}

const editItem = (item: MediaItem) => {
  editingItem.value = { ...item }
  showEditModal.value = true
}

const saveEdit = async () => {
  if (!editingItem.value) return
  
  try {
    const { user } = useAuth()
    
    await $fetch(`${config.public.apiBase}/media/update/${editingItem.value.type}/${encodeURIComponent(editingItem.value.publicId)}`, {
      method: 'PATCH',
      credentials: 'include',
      body: {
        description: editingItem.value.description,
        category: editingItem.value.category
      }
    })
    
    const index = media.value.findIndex(m => m.id === editingItem.value!.id)
    if (index !== -1) {
      media.value[index] = { ...editingItem.value }
    }
    
    showEditModal.value = false
    editingItem.value = null
  } catch (error) {
    console.error('更新失敗:', error)
    alert('更新失敗')
  }
}

const loadMore = async () => {
  page.value++
  loading.value = true
  try {
    const { user } = useAuth()
    
    const response = await $fetch(`${config.public.apiBase}/media/list?page=${page.value}`, {
      credentials: 'include'
    })
    if (response.items && response.items.length > 0) {
      media.value = media.value.concat(response.items)
      hasMore.value = response.items.length >= 20 // 依照每頁數量調整
    } else {
      hasMore.value = false
    }
  } catch (error) {
    console.error('載入更多失敗:', error)
  } finally {
    loading.value = false
  }
}

const getTypeClass = (type: string) => {
  const classes = {
    image: 'bg-green-500',
    video: 'bg-blue-500',
    view360: 'bg-purple-500',
  }
  return classes[type] || 'bg-gray-500'
}

const getTypeLabel = (type: string) => {
  const labels = {
    image: '圖片',
    video: '影片',
    view360: '360°',
  }
  return labels[type] || type
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW')
}

const formatFileSize = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

// 初始化
onMounted(() => {
  loadMedia()
})
</script> 

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 