<template>
  <div class="flex justify-center items-center min-h-[120vh]">
    <div class="w-full max-w-2xl aspect-[16/18] bg-white rounded shadow flex flex-col justify-center p-6">
      <h3 class="text-lg font-semibold mb-4">上傳媒體</h3>
      <div class="space-y-4 overflow-y-auto max-h-[110vh]">
        <!-- 選擇媒體類型 -->
        <div>
          <label class="block text-gray-700 font-bold">選擇媒體類型</label>
          <select v-model="mediaType" class="px-3 py-2 border rounded w-full">
            <option value="image">圖片</option>
            <option value="video">影片</option>
            <option value="view360">360 全景圖</option>
          </select>
        </div>

        <!-- 檔案上傳 -->
        <div>
          <label class="block text-gray-700 font-bold">檔案 ({{ acceptedExts }})</label>
          <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
            :class="{ 'border-blue-500 bg-blue-50': isDragOver }"
            @drop="onDrop"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @dragenter.prevent
          >
            <input
              ref="fileInput"
              type="file"
              @change="onFileChange"
              :accept="acceptedExts"
              class="hidden"
            />
            <div v-if="!file">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <p class="mt-2 text-sm text-gray-600">
                拖拽檔案到這裡，或
                <button
                  type="button"
                  @click="triggerFileInput"
                  class="text-blue-600 hover:text-blue-500 font-medium"
                >
                  點擊選擇檔案
                </button>
              </p>
              <p class="mt-1 text-xs text-gray-500">
                最大檔案大小：{{ formatFileSize(fileSizeLimits) }}
              </p>
            </div>
          </div>
          <!-- 檔案資訊顯示 -->
          <div v-if="file" class="mt-2 p-3 bg-gray-50 rounded border">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">{{ file.name }}</p>
                <p class="text-xs text-gray-500">
                  {{ formatFileSize(file.size) }} • 
                  {{ file.type || '未知類型' }}
                </p>
              </div>
              <button
                @click="clearFile"
                class="ml-2 text-red-500 hover:text-red-700"
                title="移除檔案"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 描述文字 -->
        <div>
          <label class="block text-gray-700 font-bold">描述 (選填)</label>
          <input
            v-model="description"
            type="text"
            class="w-full px-3 py-2 border rounded"
            placeholder="可輸入說明文字"
          />
        </div>

        <!-- 分類欄位 -->
        <div>
          <label class="block text-gray-700 font-bold">分類 (可自訂)</label>
          <select v-model="category" class="px-3 py-2 border rounded w-full mb-1">
            <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
            <option value="__custom">自訂...</option>
          </select>
          <input v-if="category==='__custom'" v-model="customCategory" type="text" class="w-full px-3 py-2 border rounded mt-1" placeholder="自訂分類" />
        </div>

        <!-- 案名欄位 -->
        <div>
          <label class="block text-gray-700 font-bold">案名 (可自訂)</label>
          <div class="flex items-center gap-2">
            <select v-model="project" class="px-3 py-2 border rounded w-full mb-1">
              <option v-for="p in projectOptions" :key="p" :value="p">{{ p }}</option>
              <option value="__custom">自訂...</option>
            </select>
            <button
              v-if="project && projectOptions.includes(project)"
              @click="confirmDeleteProject(project)"
              class="ml-1 p-1 rounded-full text-red-500 hover:bg-red-100 hover:text-white transition"
              title="刪除此案名"
              type="button"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
              </svg>
            </button>
          </div>
          <input v-if="project==='__custom'" v-model="customProject" type="text" class="w-full px-3 py-2 border rounded mt-1" placeholder="自訂案名" />
        </div>

        <!-- SEO 欄位 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-gray-700 font-bold">SEO Title</label>
            <input v-model="seoTitle" type="text" class="w-full px-3 py-2 border rounded" placeholder="SEO 標題" />
          </div>
          <div>
            <label class="block text-gray-700 font-bold">SEO Description</label>
            <input v-model="seoDescription" type="text" class="w-full px-3 py-2 border rounded" placeholder="SEO 描述" />
          </div>
          <div>
            <label class="block text-gray-700 font-bold">SEO Keywords</label>
            <div class="flex gap-2">
              <input v-model="seoKeywords" type="text" class="w-full px-3 py-2 border rounded" placeholder="SEO 關鍵字（逗號分隔）" />
              <button type="button" @click="showKeywordModal = true" class="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">搜尋熱門關鍵字</button>
            </div>
          </div>
          <div>
            <label class="block text-gray-700 font-bold">OG Image（網址）</label>
            <input v-model="ogImage" type="text" class="w-full px-3 py-2 border rounded" placeholder="Open Graph 圖片網址" />
          </div>
          <div>
            <label class="block text-gray-700 font-bold">圖片替代文字（alt）</label>
            <input v-model="alt" type="text" class="w-full px-3 py-2 border rounded" placeholder="圖片說明/替代文字" />
          </div>
        </div>
        <!-- SEO 分數與自動優化 -->
        <div class="mt-4 flex flex-col md:flex-row md:items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="font-bold">SEO 分數：</span>
            <span :class="seoScoreColor">{{ seoScore }}/100</span>
            <span class="text-xs text-gray-500">{{ seoScoreAdvice }}</span>
          </div>
          <button type="button" @click="autoOptimizeSEO" class="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">自動優化</button>
        </div>
        <!-- 熱門關鍵字 Modal -->
        <div v-if="showKeywordModal" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h3 class="text-lg font-semibold mb-2">熱門關鍵字（中英文）</h3>
            <div class="flex flex-wrap gap-2 mb-4">
              <span v-for="kw in hotKeywords" :key="kw" class="px-2 py-1 bg-gray-100 rounded cursor-pointer hover:bg-blue-200" @click="addKeyword(kw)">{{ kw }}</span>
            </div>
            <div class="flex gap-2 mb-2">
              <button @click="updateHotKeywords" class="px-4 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">更新熱門關鍵字</button>
              <button @click="showKeywordModal = false" class="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300">關閉</button>
            </div>
          </div>
        </div>

        <!-- 上傳按鈕 -->
        <button
          @click="upload"
          :disabled="!file || uploading"
          class="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {{ uploading ? '上傳中…' : '上傳' }}
        </button>
        
        <!-- 上傳進度 -->
        <div v-if="uploading" class="mt-4">
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>{{ uploadStage }}</span>
            <span>{{ uploadProgress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <p v-if="message" class="mt-3 text-sm" :class="messageClass">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance, watch } from 'vue'
import { useRuntimeConfig } from '#app'
import { useAuth } from '~/composables/useAuth'
import type { SignatureData, CloudinaryUploadResult } from 'types/project'

// 定義事件
const emit = defineEmits<{
  'upload-success': []
}>()

// 上傳狀態與表單欄位
const mediaType = ref<'image'|'video'|'view360'>('image')
const file = ref<File|null>(null)
const description = ref('')
const uploading = ref(false)
const message = ref('')
const messageClass = ref('')
const uploadProgress = ref(0)
const uploadStage = ref<'準備中' | '上傳中' | '儲存中' | ''>('')
const isDragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// 動態 accept 格式
const acceptedExts = computed(() => {
  switch (mediaType.value) {
    case 'image':   return '.jpg,.jpeg,.png,.webp'
    case 'video':   return '.mp4,.mov,.avi'
    case 'view360': return '.jpg,.jpeg,.png'
    default:        return ''
  }
})

// 檔案大小限制 (與後端一致)
const fileSizeLimits = computed(() => {
  switch (mediaType.value) {
    case 'image':   return 20 * 1024 * 1024  // 20MB
    case 'video':   return 100 * 1024 * 1024 // 100MB
    case 'view360': return 30 * 1024 * 1024  // 30MB
    default:        return 20 * 1024 * 1024
  }
})

// 檔案大小格式化
const formatFileSize = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

// 認證與 API base
const { token } = useAuth()
const { public: { apiBase } } = useRuntimeConfig()

// 使用者選檔
function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const selectedFile = input.files?.[0] ?? null
  
  if (selectedFile) {
    // 檢查檔案大小
    if (selectedFile.size > fileSizeLimits.value) {
      message.value = `檔案太大！最大允許 ${formatFileSize(fileSizeLimits.value)}`
      messageClass.value = 'text-red-600'
      input.value = '' // 清空選擇
      file.value = null
      return
    }
    
    // 檢查檔案類型
    const fileExtension = selectedFile.name.toLowerCase().split('.').pop()
    const acceptedTypes = acceptedExts.value.split(',').map(ext => ext.replace('.', ''))
    
    if (!acceptedTypes.includes(fileExtension || '')) {
      message.value = `不支援的檔案類型！請選擇 ${acceptedExts.value} 格式`
      messageClass.value = 'text-red-600'
      input.value = '' // 清空選擇
      file.value = null
      return
    }
    
    message.value = '' // 清除錯誤訊息
    messageClass.value = ''
  }
  
  file.value = selectedFile
  isDragOver.value = false // 清除拖拽狀態
}

// 清除檔案
function clearFile() {
  file.value = null
  message.value = ''
  messageClass.value = ''
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }
}

// 拖拽處理
function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  
  const dataTransfer = e.dataTransfer
  if (dataTransfer && dataTransfer.files.length > 0) {
    const selectedFile = dataTransfer.files[0]
    
    // 檢查檔案大小
    if (selectedFile.size > fileSizeLimits.value) {
      message.value = `檔案太大！最大允許 ${formatFileSize(fileSizeLimits.value)}`
      messageClass.value = 'text-red-600'
      return
    }
    
    // 檢查檔案類型
    const fileExtension = selectedFile.name.toLowerCase().split('.').pop()
    const acceptedTypes = acceptedExts.value.split(',').map(ext => ext.replace('.', ''))
    
    if (!acceptedTypes.includes(fileExtension || '')) {
      message.value = `不支援的檔案類型！請選擇 ${acceptedExts.value} 格式`
      messageClass.value = 'text-red-600'
      return
    }
    
    message.value = '' // 清除錯誤訊息
    messageClass.value = ''
    file.value = selectedFile
  }
}

// 取得上傳簽名
async function getUploadSignature(): Promise<SignatureData> {
  const folderMap = {
    image: 'zur_images',
    video: 'zur_videos',
    view360: 'zur_view360'
  }
  
  const resourceTypeMap = {
    image: 'image',
    video: 'video',
    view360: 'image'
  }

  const response: SignatureData = await $fetch('/upload/signature', {
    baseURL: apiBase,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {})
    },
    body: {
      folder: folderMap[mediaType.value],
      resource_type: resourceTypeMap[mediaType.value],
      file_size: file.value?.size,
    }
  })

  if (!response.success) {
    throw new Error('取得上傳簽名失敗')
  }

  return response
}

// 直接上傳到 Cloudinary
async function uploadToCloudinary(signatureData: SignatureData): Promise<CloudinaryUploadResult> {
  const formData = new FormData()
  formData.append('file', file.value!)
  formData.append('api_key', signatureData.api_key)
  formData.append('timestamp', signatureData.timestamp.toString())
  formData.append('signature', signatureData.signature)
  formData.append('folder', signatureData.folder)
  
  // 對於影片上傳，需要包含 resource_type 參數
  if (signatureData.resource_type) {
    formData.append('resource_type', signatureData.resource_type)
  }

  const response = await fetch(signatureData.upload_url, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Cloudinary 上傳失敗: ${errorText}`)
  }

  return await response.json() as CloudinaryUploadResult
}

// 通知後端上傳完成
async function notifyBackend(uploadResult: CloudinaryUploadResult, signatureData: SignatureData) {
  const finalCategory = category.value === '__custom' ? customCategory.value : category.value
  const finalProject = project.value === '__custom' ? customProject.value : project.value

  const payload = {
    public_id: uploadResult.public_id,
    secure_url: uploadResult.secure_url,
    folder: signatureData.folder,
    description: description.value,
    category: finalCategory || '',
    project: finalProject || '',
    seoTitle: seoTitle.value,
    seoDescription: seoDescription.value,
    seoKeywords: seoKeywords.value,
    ogImage: ogImage.value,
    alt: alt.value,
  }
  console.log('[MediaUploader] notifyBackend payload:', payload)

  const response = await $fetch('/upload/callback', {
    baseURL: apiBase,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {})
    },
    body: payload
  })

  console.log('[MediaUploader] notifyBackend response:', response)

  if (!response.success) {
    throw new Error('儲存媒體記錄失敗')
  }

  return response
}

// 發送上傳請求
async function upload() {
  if (!file.value) {
    message.value = '請先選擇檔案'
    messageClass.value = 'text-red-600'
    return
  }

  uploading.value = true
  message.value = ''
  uploadProgress.value = 0
  uploadStage.value = '準備中'
  
  try {
    console.log('[MediaUploader] 開始簽名上傳，apiBase:', apiBase)
    console.log('[MediaUploader] 檔案:', file.value?.name, '大小:', file.value?.size)
    console.log('[MediaUploader] 媒體類型:', mediaType.value)
    
    // 1. 取得上傳簽名
    uploadStage.value = '準備中'
    uploadProgress.value = 10
    const signatureData = await getUploadSignature()
    console.log('[MediaUploader] 簽名取得成功:', signatureData)
    
    // 2. 直接上傳到 Cloudinary
    uploadStage.value = '上傳中'
    uploadProgress.value = 30
    
    // 模擬上傳進度（實際進度需要 XMLHttpRequest 或 fetch with progress）
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 80) {
        uploadProgress.value += 5
      }
    }, 200)
    
    const uploadResult = await uploadToCloudinary(signatureData)
    clearInterval(progressInterval)
    uploadProgress.value = 80
    console.log('[MediaUploader] Cloudinary 上傳成功:', uploadResult)
    
    // 3. 通知後端儲存資料庫記錄
    uploadStage.value = '儲存中'
    uploadProgress.value = 90
    const backendResult = await notifyBackend(uploadResult, signatureData)
    uploadProgress.value = 100
    console.log('[MediaUploader] 後端儲存成功:', backendResult)
    
    message.value = '上傳成功'
    messageClass.value = 'text-green-600'
    
    // 清空表單
    file.value = null
    description.value = ''
    category.value = '效果圖'
    customCategory.value = ''
    project.value = '鉅虹'
    customProject.value = ''
    seoTitle.value = ''
    seoDescription.value = ''
    seoKeywords.value = ''
    ogImage.value = ''
    alt.value = ''
    
    // 清空檔案輸入
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
    
    // 觸發上傳成功事件
    emit('upload-success')
    
    // 3秒後清除成功訊息
    setTimeout(() => {
      message.value = ''
      uploadProgress.value = 0
      uploadStage.value = ''
    }, 3000)
    
  } catch (err: unknown) {
    console.error('[MediaUploader] 上傳失敗:', err)
    if (err instanceof Error) {
      message.value = err.message || '上傳失敗'
    } else {
      message.value = '上傳失敗'
    }
    messageClass.value = 'text-red-600'
    uploadProgress.value = 0
    uploadStage.value = ''
  } finally {
    uploading.value = false
  }
}

const categoryOptions = ref(['效果圖','VR','動畫'])
const projectOptions = ref<string[]>([])
const project = ref('')
const customProject = ref('')

// 自動載入專案名稱
onMounted(async () => {
  try {
    const config = useRuntimeConfig()
    const res = await $fetch(`${config.public.apiBase}/projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {})
      }
    })
    projectOptions.value = res.map((p: { name: string }) => p.name)
    if (projectOptions.value.length > 0) project.value = projectOptions.value[0]
  } catch (e) {
    console.warn('[MediaUploader] 無法載入專案列表，使用預設值:', e)
    projectOptions.value = ['鉅虹','精銳'] // fallback
    project.value = '鉅虹'
  }
})

// 新增自訂案名時自動同步到資料庫
watch(customProject, async (val, oldVal) => {
  if (project.value === '__custom' && val && val !== oldVal) {
    try {
      const config = useRuntimeConfig()
      // 呼叫 API 新增專案名稱
      await $fetch(`${config.public.apiBase}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token.value ? { Authorization: `Bearer ${token.value}` } : {})
        },
        body: { name: val }
      })
      // 重新載入專案名稱
      const res = await $fetch(`${config.public.apiBase}/projects`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token.value ? { Authorization: `Bearer ${token.value}` } : {})
        }
      })
      projectOptions.value = res.map((p: { name: string }) => p.name)
      project.value = val
    } catch (e) {
      console.warn('[MediaUploader] 新增專案失敗:', e)
      // 可加錯誤提示
    }
  }
})

const category = ref('效果圖')
const customCategory = ref('')
const seoTitle = ref('')
const seoDescription = ref('')
const seoKeywords = ref('')
const ogImage = ref('')
const alt = ref('')

// SEO 分數與建議
const seoScore = computed(() => {
  let score = 0
  if (seoTitle.value.length >= 10 && seoTitle.value.length <= 60) score += 20
  if (seoDescription.value.length >= 30 && seoDescription.value.length <= 160) score += 20
  if (seoKeywords.value.split(',').filter(k=>k.trim()).length >= 3) score += 20
  if (ogImage.value.match(/^https?:\/\//)) score += 20
  if (alt.value.length >= 5) score += 20
  return score
})
const seoScoreAdvice = computed(() => {
  if (seoScore.value === 100) return '已達最佳 SEO 標準'
  if (seoTitle.value.length < 10) return 'SEO Title 太短'
  if (seoTitle.value.length > 60) return 'SEO Title 太長'
  if (seoDescription.value.length < 30) return 'SEO Description 太短'
  if (seoDescription.value.length > 160) return 'SEO Description 太長'
  if (seoKeywords.value.split(',').filter(k=>k.trim()).length < 3) return '建議填寫 3 個以上關鍵字'
  if (!ogImage.value.match(/^https?:\/\//)) return '建議填寫正確的 OG Image 網址'
  if (alt.value.length < 5) return '建議填寫圖片替代文字'
  return '請完善 SEO 欄位'
})
const seoScoreColor = computed(() => seoScore.value >= 80 ? 'text-green-600' : (seoScore.value >= 50 ? 'text-yellow-600' : 'text-red-600'))

// 中東熱門 SEO 關鍵字（英文與阿拉伯文）
const middleEastKeywords = [
  // English
  '3D Architectural Visualization', '3D Rendering Services', 'Architectural Animation', 'Projection Mapping', 'Photorealistic Renderings', 'Interior Visualization', 'Exterior Visualization', 'Virtual Reality Tours', 'Real Estate 3D Rendering', 'Dubai 3D Rendering', 'Saudi Arabia 3D Visualization', 'UAE Architectural Visualization', 'CGI Studio Middle East', 'Interactive 3D Presentation', 'BIM Visualization', 'Walkthrough Animation', '360 VR Architectural Tour', 'Urban Planning Visualization', 'Hospitality Rendering', 'Commercial Project Visualization',
  // Arabic
  'التصوير المعماري ثلاثي الأبعاد', 'خدمات التصيير ثلاثي الأبعاد', 'الرسوم المتحركة المعمارية', 'عرض الإسقاط الضوئي', 'التصيير الواقعي', 'جولات الواقع الافتراضي', 'تصيير العقارات', 'استوديو CGI في الشرق الأوسط', 'جولات ثلاثية الأبعاد', 'مشاريع معمارية في دبي', 'مشاريع معمارية في السعودية'
]

// 自動優化
function autoOptimizeSEO() {
  if (!seoTitle.value) seoTitle.value = `${description.value || '效果圖'} | ${project.value || 'ZUR'}`
  if (!seoDescription.value) seoDescription.value = `專業 3D 效果圖、動畫、光雕投影服務，${project.value || 'ZUR'} 提供高品質視覺化解決方案。`
  // 合併現有關鍵字與中東關鍵字
  if (!seoKeywords.value) {
    seoKeywords.value = [
      '效果圖','3D渲染','建築視覺化','動畫','光雕','VR','設計','rendering','visualization','CGI','architecture','animation','projection','interior','product',
      ...middleEastKeywords
    ].join(', ')
  }
  if (!alt.value) alt.value = `${description.value || 'ZUR 效果圖'} | 3D Rendering, Visualization, ${middleEastKeywords[0]}`
}

// 熱門關鍵字
const showKeywordModal = ref(false)
const hotKeywords = ref([
  '效果圖','3D渲染','建築視覺化','動畫','光雕','VR','設計','rendering','visualization','CGI','architecture','animation','projection','interior','product','高質感','專案','案例','台中','台北','Taiwan','Taipei','Taichung','project','portfolio','art','creative','digital','studio','image','photo','render','model','scene','lighting','material','texture','realistic','modern','minimal','luxury','commercial','residential','exhibition','展覽','住宅','商業','現代','極簡','豪宅'
])
function addKeyword(kw: string) {
  const kws = seoKeywords.value.split(',').map(k=>k.trim()).filter(Boolean)
  if (!kws.includes(kw)) {
    kws.push(kw)
    seoKeywords.value = kws.join(',')
  }
  showKeywordModal.value = false
}

// 新增更新熱門關鍵字功能（模擬靜態更新）
function updateHotKeywords() {
  // 這裡可改為串接 API 取得最新熱門關鍵字
  hotKeywords.value = [
    '效果圖','3D渲染','建築視覺化','動畫','光雕','VR','設計','rendering','visualization','CGI','architecture','animation','projection','interior','product','高質感','專案','案例','台中','台北','Taiwan','Taipei','Taichung','project','portfolio','art','creative','digital','studio','image','photo','render','model','scene','lighting','material','texture','realistic','modern','minimal','luxury','commercial','residential','exhibition','展覽','住宅','商業','現代','極簡','豪宅','新關鍵字1','新關鍵字2'
  ]
}

async function confirmDeleteProject(name: string) {
  if (!name) return
  if (!confirm(`確定要刪除案名「${name}」？僅當此案名下沒有任何媒體時才可刪除。`)) return
  try {
    const config = useRuntimeConfig()
    await $fetch(`${config.public.apiBase}/projects/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {})
      }
    })
    // 刪除成功後移除本地 options
    projectOptions.value = projectOptions.value.filter(p => p !== name)
    if (project.value === name) project.value = projectOptions.value[0] || ''
    alert('刪除成功')
  } catch (e: any) {
    alert(e?.data?.message || '刪除失敗，請確認此案名下無任何媒體')
  }
}

const triggerFileInput = () => {
  if (fileInput.value && typeof fileInput.value.click === 'function') {
    fileInput.value.click()
  } else {
    console.error('fileInput.value is not a valid input element:', fileInput.value)
  }
}
</script>

<style scoped>
/* 如有需要再自行調整 */
</style>