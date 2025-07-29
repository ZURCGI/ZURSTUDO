<!-- frontend/components/MediaManager.vue -->
<template>
  <div class="media-manager">
    <!-- 搜索和過濾 -->
    <div class="mb-6 space-y-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="relative flex-1">
          <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索媒體文件..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800"
          />
        </div>
        <select
          v-model="selectedType"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
        >
          <option value="">所有類型</option>
          <option value="image">圖片</option>
          <option value="video">影片</option>
          <option value="view360">360度視圖</option>
        </select>
      </div>
    </div>

    <!-- 媒體網格 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="item in filteredMedia"
        :key="item.id"
        class="media-item group relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
        @click="selectItem(item)"
      >
        <!-- 媒體預覽 -->
        <div class="aspect-square relative overflow-hidden">
          <img
            v-if="item.type === 'image'"
            :src="item.thumbnail || item.url"
            :alt="item.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            width="100%"
            height="auto"
          />
          <div
            v-else-if="item.type === 'video'"
            class="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
          >
            <Icon name="heroicons:play-circle" class="w-12 h-12 text-gray-400" />
          </div>
          <div
            v-else
            class="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center"
          >
            <Icon name="heroicons:cube" class="w-12 h-12 text-gray-400" />
          </div>

          <!-- 類型標記 -->
          <div class="absolute top-2 right-2">
            <span
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="getTypeClass(item.type)"
            >
              {{ getTypeLabel(item.type) }}
            </span>
          </div>

          <!-- 選中狀態 -->
          <div
            v-if="selectedItems.has(item.id)"
            class="absolute inset-0 bg-blue-500 bg-opacity-50 flex items-center justify-center"
          >
            <Icon name="heroicons:check-circle" class="w-8 h-8 text-white" />
          </div>
        </div>

        <!-- 媒體資訊 -->
        <div class="p-4">
          <h3 class="font-medium text-gray-900 dark:text-white truncate flex items-center gap-2">
            <template v-if="editingId === item.id">
              <input
                v-model="editName"
                @keyup.enter="saveEdit(item)"
                @blur="saveEdit(item)"
                class="border border-primary rounded px-2 py-1 text-sm w-32"
                autofocus
              />
              <button @click="editingId = null" class="ml-1 text-gray-400 hover:text-danger transition">
                <Icon name="heroicons:x-mark" class="w-4 h-4" />
              </button>
            </template>
            <template v-else>
              {{ item.title }}
              <button @click.stop="startEdit(item)" class="ml-1 text-primary hover:text-primary/80 transition">
                <Icon name="heroicons:pencil-square" class="w-4 h-4" />
              </button>
            </template>
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ formatDate(item.createdAt) }}
          </p>
          <div class="flex items-center justify-between mt-3">
            <span class="text-xs text-gray-400">
              {{ formatFileSize(item.fileSize) }}
            </span>
            <button
              @click.stop="deleteItem(item)"
              class="text-red-500 hover:text-red-700 transition-colors"
            >
              <Icon name="heroicons:trash" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 載入更多 -->
    <div
      v-if="hasMore"
      class="flex justify-center mt-8"
    >
      <button
        @click="loadMore"
        :disabled="loading"
        class="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Icon v-if="loading" name="heroicons:arrow-path" class="w-4 h-4 animate-spin mr-2" />
        {{ loading ? '載入中...' : '載入更多' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRuntimeConfig } from '#app'

interface MediaItem {
  id: string;
  title: string;
  type: 'image' | 'video' | 'view360';
  url: string;
  thumbnail?: string;
  fileSize: number;
  createdAt: string;
  publicId: string;
}

const config = useRuntimeConfig()

const searchQuery = ref('');
const selectedType = ref('');
const selectedItems = ref(new Set<string>());
const loading = ref(false);
const media = ref<MediaItem[]>([]);
const hasMore = ref(true);
const page = ref(1);
const pageSize = 20;
const editingId = ref<string | null>(null)
const editName = ref('')

function startEdit(item: MediaItem) {
  editingId.value = item.id
  editName.value = item.title
}

async function saveEdit(item: MediaItem) {
  if (!editName.value.trim()) return
  try {
    await $fetch(`${config.public.apiBase}/media/${item.type}/${item.id}/rename`, {
      method: 'PATCH',
      body: { newName: editName.value },
      credentials: 'include'
    })
    item.title = editName.value
    editingId.value = null
  } catch (e) {
    alert('案名修改失敗')
  }
}

// 計算屬性
const filteredMedia = computed(() => {
  return media.value.filter(item => {
    const title = item.title || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesType = !selectedType.value || item.type === selectedType.value;
    return matchesSearch && matchesType;
  });
});

// 方法
const selectItem = (item: MediaItem) => {
  if (selectedItems.value.has(item.id)) {
    selectedItems.value.delete(item.id);
  } else {
    selectedItems.value.add(item.id);
  }
};

const deleteItem = async (item: MediaItem) => {
  if (confirm(`確定要刪除 "${item.title}" 嗎？`)) {
    try {
      // 只取純 publicId，不含資料夾
      const purePublicId = item.publicId.split('/').pop();
      await $fetch(`${config.public.apiBase}/media/${item.type}/${purePublicId}`, { method: 'DELETE', credentials: 'include' });
      media.value = media.value.filter(m => m.id !== item.id);
    } catch (error) {
      console.error('删除失敗:', error);
    }
  }
};

const loadMore = async () => {
  if (loading.value || !hasMore.value) return;
  loading.value = true;
  try {
    const response = await $fetch(`${config.public.apiBase}/media/list?page=${page.value}&limit=${pageSize}`, { credentials: 'include' });
    const newItems = response.items || [];
    if (page.value === 1) {
      media.value = newItems;
    } else {
      media.value = [...media.value, ...newItems];
    }
    hasMore.value = newItems.length === pageSize;
    page.value += 1;
  } catch (error) {
    console.error('載入媒體失敗:', error);
    hasMore.value = false;
  } finally {
    loading.value = false;
  }
};

const getTypeClass = (type: string) => {
  const classes = {
    image: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    video: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    view360: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };
  return classes[type] || 'bg-gray-100 text-gray-800';
};

const getTypeLabel = (type: string) => {
  const labels = {
    image: '圖片',
    video: '影片',
    view360: '360°',
  };
  return labels[type] || type;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW');
};

const formatFileSize = (bytes: number | undefined | null) => {
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes <= 0) return '-';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (!sizes[i]) return '-';
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// 初始化載入
onMounted(() => {
  loadMore();
});
</script>

<style scoped>
.media-item {
  background: rgba(0,0,0,0.18);
}
.bg-gray-100, .bg-gradient-to-br, .bg-white, .dark\:bg-gray-800 {
  background: rgba(0,0,0,0.18) !important;
}
</style>