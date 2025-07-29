<template>
  <div class="max-w-3xl mx-auto py-10">
    <h2 class="text-2xl font-bold mb-8 flex items-center gap-2">
      <span class="inline-block bg-gray-900 text-white rounded-full w-8 h-8 flex items-center justify-center"><svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13 16h-1v-4h-1m1-4h.01M12 20.5C6.753 20.5 2 15.747 2 10.5S6.753.5 12 .5s10 4.753 10 10-4.753 10-10 10z'/></svg></span>
      全站 SEO / AEO / GEO 管理
    </h2>
    <form @submit.prevent="saveSettings" class="space-y-10">
      <!-- SEO 多語分頁 -->
      <section class="p-8 bg-white rounded-2xl shadow-xl border border-gray-200 mb-4">
        <h3 class="text-lg font-semibold mb-6 flex items-center gap-2">
          <span class="inline-block bg-gray-800 text-white rounded-full w-7 h-7 flex items-center justify-center"><svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 4v16m8-8H4'/></svg></span>
          SEO 設定
        </h3>
        <div class="flex gap-4 mb-4">
          <button type="button" :class="{'bg-gray-900 text-white': langTab==='zh', 'bg-gray-100': langTab!=='zh'}" class="px-4 py-2 rounded" @click="langTab='zh'">中文</button>
          <button type="button" :class="{'bg-gray-900 text-white': langTab==='en', 'bg-gray-100': langTab!=='en'}" class="px-4 py-2 rounded" @click="langTab='en'">English</button>
        </div>
        <div v-if="langTab==='zh'">
          <label class="block font-bold mb-1 flex items-center">網站標題（中文）
            <button type="button" @click="translateField('siteTitle', 'zh', 'en')" class="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">一鍵翻譯到英文</button>
          </label>
          <input v-model="form.siteTitle" type="text" class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 mb-2" placeholder="ZUR 官方網站 | 專業 3D 效果圖/動畫/光雕/VR" />
          <label class="block font-bold mb-1 flex items-center">網站描述（中文）
            <button type="button" @click="translateField('siteDescriptionZh', 'zh', 'en')" class="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">一鍵翻譯到英文</button>
          </label>
          <input v-model="form.siteDescriptionZh" type="text" class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 mb-2" placeholder="ZUR 提供國際級 3D 效果圖、動畫、光雕投影與虛擬實境服務，專案橫跨台灣、歐美與中東，合作對象涵蓋眾多頂級品牌，助力豪宅、商辦、展覽與產品視覺化。" />
          <label class="block font-bold mb-1 flex items-center">關鍵字（中文，逗號分隔）
            <button type="button" @click="translateField('siteKeywordsZh', 'zh', 'en')" class="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">一鍵翻譯到英文</button>
          </label>
          <input v-model="form.siteKeywordsZh" type="text" class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50" placeholder="3D效果圖,建築渲染,動畫製作,光雕投影,虛擬實境,視覺化,台灣3D,國際渲染,豪宅視覺,商業空間,頂級設計,國際合作,Zaha Hadid,BIG,Snøhetta,頂級建築,豪宅,商辦,展覽,產品渲染,互動體驗,VR,AR,項目管理,創意設計,渲染公司,視覺顧問,國際品牌,頂級客戶,項目案例" />
        </div>
        <div v-else>
          <label class="block font-bold mb-1 flex items-center">Site Title (English)
            <button type="button" @click="translateField('siteTitleEn', 'en', 'zh')" class="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">一鍵翻譯到中文</button>
          </label>
          <input v-model="form.siteTitleEn" type="text" class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 mb-2" placeholder="ZUR Official Website | 3D Rendering/Animation/Projection/VR" />
          <label class="block font-bold mb-1 flex items-center">Site Description (English)
            <button type="button" @click="translateField('siteDescriptionEn', 'en', 'zh')" class="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">一鍵翻譯到中文</button>
          </label>
          <input v-model="form.siteDescriptionEn" type="text" class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 mb-2" placeholder="ZUR delivers world-class 3D renderings, animation, projection mapping, and VR services for luxury real estate, commercial, and product visualization. Our portfolio spans Taiwan, Europe, the Middle East, and the US, serving top clients like Zaha Hadid, IKEA, BMW, and Marriott." />
          <label class="block font-bold mb-1 flex items-center">Keywords (English, comma separated)
            <button type="button" @click="translateField('siteKeywordsEn', 'en', 'zh')" class="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">一鍵翻譯到中文</button>
          </label>
          <input v-model="form.siteKeywordsEn" type="text" class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50" placeholder="3D rendering,architectural visualization,animation studio,projection mapping,virtual reality,CGI,photorealistic,luxury real estate,commercial visualization,international projects,high-end design,Neoscape,Brick Visual,Mir,The Boundary,DBOX,Luxigon,Beauty and The Bit,Kilograph,Hayes Davidson,Binyan Studios,immersive experience,VR,AR,creative agency,design consulting,global clients,project showcase,interactive presentation" />
        </div>
      </section>
      <!-- FAQ 多語分頁 -->
      <section class="p-8 bg-white rounded-2xl shadow-xl border border-gray-200 mb-4">
        <h3 class="text-lg font-semibold mb-6 flex items-center gap-2">
          <span class="inline-block bg-gray-800 text-white rounded-full w-7 h-7 flex items-center justify-center"><svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 10h.01M12 14h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z'/></svg></span>
          FAQ 設定
        </h3>
        <div class="flex gap-4 mb-4">
          <button type="button" :class="{'bg-gray-900 text-white': faqTab==='zh', 'bg-gray-100': faqTab!=='zh'}" class="px-4 py-2 rounded" @click="faqTab='zh'">中文</button>
          <button type="button" :class="{'bg-gray-900 text-white': faqTab==='en', 'bg-gray-100': faqTab!=='en'}" class="px-4 py-2 rounded" @click="faqTab='en'">English</button>
        </div>
        <div v-if="faqTab==='zh'">
          <div v-for="(faq, i) in form.faqListZh" :key="i" class="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-2 items-center shadow-sm hover:shadow-md transition-shadow">
            <input v-model="faq.question" type="text" class="flex-1 px-3 py-2 border border-gray-300 rounded bg-white" placeholder="問題（中文）" />
            <input v-model="faq.answer" type="text" class="flex-1 px-3 py-2 border border-gray-300 rounded bg-white" placeholder="答案（中文）" />
            <button type="button" @click="form.faqListZh.splice(i,1)" class="text-red-500 hover:text-red-700 font-bold">移除</button>
            <button type="button" @click="translateFaq(i, 'zh', 'en')" class="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">一鍵翻譯到英文</button>
          </div>
          <button type="button" @click="form.faqListZh.push({question:'',answer:''})" class="mt-4 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700">新增 FAQ</button>
        </div>
        <div v-else>
          <div v-for="(faq, i) in form.faqListEn" :key="i" class="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-2 items-center shadow-sm hover:shadow-md transition-shadow">
            <input v-model="faq.question" type="text" class="flex-1 px-3 py-2 border border-gray-300 rounded bg-white" placeholder="Question (English)" />
            <input v-model="faq.answer" type="text" class="flex-1 px-3 py-2 border border-gray-300 rounded bg-white" placeholder="Answer (English)" />
            <button type="button" @click="form.faqListEn.splice(i,1)" class="text-red-500 hover:text-red-700 font-bold">Remove</button>
            <button type="button" @click="translateFaq(i, 'en', 'zh')" class="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">一鍵翻譯到中文</button>
          </div>
          <button type="button" @click="form.faqListEn.push({question:'',answer:''})" class="mt-4 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700">Add FAQ</button>
        </div>
      </section>
      <!-- 其餘 GEO、OG、favicon、robots、sitemap 區塊照舊 -->
      <!-- SEO 分數與建議 -->
      <section class="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
        <div class="flex items-center gap-2">
          <span class="font-bold">SEO 分數：</span>
          <span :class="seoScoreColor" class="text-lg font-bold">{{ seoScore }}/100</span>
          <div class="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div :class="seoScoreColor + ' h-2 rounded-full transition-all duration-300'" :style="{ width: seoScore + '%' }"></div>
          </div>
          <span class="text-xs text-gray-500 ml-2">{{ seoScoreAdvice }}</span>
        </div>
        <button type="button" @click="autoOptimizeSEO" class="px-3 py-1 bg-gray-900 text-white rounded hover:bg-gray-700">自動優化</button>
        <div class="flex items-center gap-2 ml-2">
          <select v-model="selectedAiModel" class="px-3 py-1 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-gray-800 focus:border-transparent">
            <option value="llama3">Llama 3 (Meta)</option>
            <option value="qwen1.5">Qwen 1.5 (Alibaba)</option>
            <option value="gemini_pro">Gemini Pro (Google)</option>
          </select>
          <button type="button" @click="getAiSeoSuggest" :disabled="aiLoading" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-800">
            <span v-if="aiLoading">AI 產生中...</span>
            <span v-else>AI 建議</span>
          </button>
        </div>
      </section>

      <!-- Google SERP 預覽 -->
      <section class="mt-8 p-6 bg-white border border-gray-200 rounded-xl">
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <span class="inline-block bg-yellow-500 text-white rounded-full w-7 h-7 flex items-center justify-center"><svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2'></path></svg></span>
          Google SERP 預覽
        </h3>
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-2xl">
          <div class="text-blue-800 text-sm mb-1">{{ serpUrl }}</div>
          <div class="text-xl text-blue-700 font-bold leading-tight mb-1">{{ serpTitle }}</div>
          <div class="text-gray-700 text-base">{{ serpDescription }}</div>
        </div>
      </section>

      <!-- Open Graph 預覽 -->
      <section class="mt-8 p-6 bg-white border border-gray-200 rounded-xl">
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <span class="inline-block bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center"><svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M7 8h10M7 12h4m1 8a9 9 0 100-18 9 9 0 000 18z'/></svg></span>
          Open Graph 預覽（LINE/IG 分享卡）
        </h3>
        <div class="bg-gray-100 border border-gray-300 rounded-lg p-4 flex items-center max-w-xl">
          <img :src="form.ogImage || '/ZURLOGO.png'" alt="OG Image" class="w-24 h-24 object-cover rounded-lg mr-4 border border-gray-200" />
          <div>
            <div class="text-gray-900 font-bold text-lg mb-1">{{ ogTitle }}</div>
            <div class="text-gray-700 text-base mb-1">{{ ogDescription }}</div>
            <div class="text-gray-400 text-xs">zurcgi.com</div>
          </div>
        </div>
      </section>

      <!-- FAQ/GEO/Organization/Service 結構化資料可視化管理與 JSON-LD 預覽 -->
      <section class="mt-8 p-6 bg-white border border-gray-200 rounded-xl">
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <span class="inline-block bg-indigo-500 text-white rounded-full w-7 h-7 flex items-center justify-center"><svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2'></path><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M7 7a4 4 0 118 0 4 4 0 01-8 0z'></path></svg></span>
          結構化資料可視化管理 & JSON-LD 預覽
        </h3>
        <div class="mb-2">
          <label class="font-bold">FAQ JSON-LD 預覽</label>
          <pre class="bg-gray-900 text-green-200 rounded p-3 text-xs overflow-x-auto">{{ faqJsonLd }}</pre>
          <div v-if="!faqJsonLdValid" class="text-red-600 text-xs">❌ FAQ JSON-LD 結構不符 Google Rich Results 標準</div>
          <div v-else class="text-green-600 text-xs">✅ FAQ JSON-LD 結構有效</div>
        </div>
        <div class="mb-2">
          <label class="font-bold">GEO JSON-LD 預覽</label>
          <pre class="bg-gray-900 text-green-200 rounded p-3 text-xs overflow-x-auto">{{ geoJsonLd }}</pre>
          <div v-if="!geoJsonLdValid" class="text-red-600 text-xs">❌ GEO JSON-LD 結構不符 Google Rich Results 標準</div>
          <div v-else class="text-green-600 text-xs">✅ GEO JSON-LD 結構有效</div>
        </div>
        <!-- 可擴充 Organization/Service ... -->
      </section>

      

      <!-- GEO 區塊 -->
      <section class="p-8 bg-white rounded-2xl shadow-xl border border-gray-200 mb-4">
        <h3 class="text-lg font-semibold mb-6 flex items-center gap-2">
          <span class="inline-block bg-gray-800 text-white rounded-full w-7 h-7 flex items-center justify-center"><svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z'/><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'/></svg></span>
          GEO 設定
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block font-bold mb-1 flex items-center gap-1"><svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z'/><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'/></svg>地址</label>
            <input v-model="form.address" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-800 bg-gray-50" />
          </div>
          <div>
            <label class="block font-bold mb-1 flex items-center gap-1"><svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 20l-5.447-2.724A2 2 0 013 15.382V6.618a2 2 0 011.553-1.894L9 2m6 0l5.447 2.724A2 2 0 0121 6.618v8.764a2 2 0 01-1.553 1.894L15 20m-6 0v-8m6 8v-8m-6 0h6' /></svg>城市</label>
            <input v-model="form.city" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-800 bg-gray-50" />
          </div>
          <div>
            <label class="block font-bold mb-1 flex items-center gap-1"><svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 10h1m2 0h1m2 0h1m2 0h1m2 0h1m2 0h1M5 6h14M5 14h14M7 18h10' /></svg>郵遞區號</label>
            <input v-model="form.zipcode" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-800 bg-gray-50" />
          </div>
          <div class="flex gap-2 items-end">
            <div class="flex-1">
              <label class="block font-bold mb-1 flex items-center gap-1"><svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 3v1m0 16v1m8.485-8.485l-.707.707M4.222 19.778l-.707.707M21 12h1M3 12H2m16.485-7.071l-.707-.707M4.222 4.222l-.707-.707' /></svg>緯度</label>
              <input v-model.number="form.lat" type="number" step="0.000001" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-800 bg-gray-50" @blur="validateLat" />
            </div>
            <div class="flex-1">
              <label class="block font-bold mb-1 flex items-center gap-1"><svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 3v1m0 16v1m8.485-8.485l-.707.707M4.222 19.778l-.707.707M21 12h1M3 12H2m16.485-7.071l-.707-.707M4.222 4.222l-.707-.707' /></svg>經度</label>
              <input v-model.number="form.lng" type="number" step="0.000001" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-800 bg-gray-50" @blur="validateLng" />
            </div>
            <button type="button" @click="detectGeo" class="ml-2 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700">自動偵測</button>
          </div>
        </div>
        <!-- 可擴充：地圖選點、Google Map 嵌入 -->
      </section>

      <!-- 浮動儲存按鈕 -->
      <div class="fixed bottom-8 right-8 z-50">
        <button type="submit" class="px-8 py-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-700 text-lg font-bold transition-all">儲存設定</button>
      </div>
    </form>
    <!-- Toast -->
    <transition name="fade">
      <div v-if="toast" class="fixed bottom-24 right-8 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg z-50">
        {{ toast }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})
import { ref, computed, onMounted } from 'vue'
import { useRuntimeConfig } from '#app'

const { public: { apiBase } } = useRuntimeConfig()
const form = ref({
  siteTitle: '',
  siteTitleEn: '',
  ogImage: '',
  favicon: '',
  robots: '',
  sitemap: '',
  // 新增多語欄位
  siteKeywordsZh: '',
  siteKeywordsEn: '',
  siteDescriptionZh: '',
  siteDescriptionEn: '',
  faqListZh: [],
  faqListEn: [],
  address: '',
  lat: null,
  lng: null,
  city: '',
  zipcode: ''
})
const toast = ref('')
const aiLoading = ref(false)
const aiSuggest = ref<{
  title?: string,
  description?: string,
  keywords?: string,
  faqList?: any[],
  error?: string,
  fallback?: boolean,
  details?: string
}>({})
const aiSuggestLoading = ref(false)
const selectedAiModel = ref('llama3') // llama3 or qwen1.5
const langTab = ref('zh')
const faqTab = ref('zh')

// 取得現有設定
onMounted(async () => {
  const data = await $fetch(`${apiBase}/settings`, { credentials: 'include' })
  Object.assign(form.value, data)
  if (!Array.isArray(form.value.faqListZh)) {
    form.value.faqListZh = []
  }
  if (!Array.isArray(form.value.faqListEn)) {
    form.value.faqListEn = []
  }
  fetchAiSuggest()
})

// SEO 分數與建議
const seoScore = computed(() => {
  let score = 0
  // 中文 SEO (30分)
  if (form.value.siteTitle && form.value.siteTitle.length >= 10 && form.value.siteTitle.length <= 60) score += 10
  if (form.value.siteDescriptionZh && form.value.siteDescriptionZh.length >= 50 && form.value.siteDescriptionZh.length <= 160) score += 10
  if (form.value.siteKeywordsZh && form.value.siteKeywordsZh.split(',').filter(k => k.trim()).length >= 5) score += 10
  
  // 英文 SEO (30分)
  if (form.value.siteTitleEn && form.value.siteTitleEn.length >= 10 && form.value.siteTitleEn.length <= 70) score += 10
  if (form.value.siteDescriptionEn && form.value.siteDescriptionEn.length >= 50 && form.value.siteDescriptionEn.length <= 160) score += 10
  if (form.value.siteKeywordsEn && form.value.siteKeywordsEn.split(',').filter(k => k.trim()).length >= 5) score += 10

  // 技術 SEO (20分)
  if (form.value.ogImage && form.value.ogImage.match(/^https?:\/\//)) score += 10
  if (form.value.favicon) score += 5
  if (form.value.robots && form.value.sitemap) score += 5
  
  // 結構化資料 (20分)
  if (form.value.faqListZh && form.value.faqListZh.length >= 3) score += 5
  if (form.value.faqListEn && form.value.faqListEn.length >= 3) score += 5
  if (form.value.address && form.value.city && form.value.lat && form.value.lng) score += 10
  
  return Math.min(score, 100)
})

const seoScoreAdvice = computed(() => {
  if (seoScore.value >= 90) return 'SEO 已達國際頂級標準！'
  if (seoScore.value >= 80) return 'SEO 表現優秀，建議完善多語內容'
  if (seoScore.value >= 60) return 'SEO 表現良好，建議增加國際關鍵字'
  // 中文
  if (!form.value.siteTitle || form.value.siteTitle.length < 10) return '中文網站標題太短'
  if (form.value.siteTitle.length > 60) return '中文網站標題太長'
  if (!form.value.siteDescriptionZh || form.value.siteDescriptionZh.length < 50) return '中文網站描述太短'
  if (form.value.siteDescriptionZh.length > 160) return '中文網站描述太長'
  if (!form.value.siteKeywordsZh || form.value.siteKeywordsZh.split(',').filter(k=>k.trim()).length < 5) return '建議填寫 5 個以上中文關鍵字'
  // 英文
  if (!form.value.siteTitleEn || form.value.siteTitleEn.length < 10) return '英文網站標題太短'
  if (form.value.siteTitleEn.length > 70) return '英文網站標題太長'
  if (!form.value.siteDescriptionEn || form.value.siteDescriptionEn.length < 50) return '英文網站描述太短'
  if (form.value.siteDescriptionEn.length > 160) return '英文網站描述太長'
  if (!form.value.siteKeywordsEn || form.value.siteKeywordsEn.split(',').filter(k=>k.trim()).length < 5) return '建議填寫 5 個以上英文關鍵字'
  // 技術
  if (!form.value.ogImage || !form.value.ogImage.match(/^https?:\/\//)) return '建議填寫正確的 OG Image 網址'
  if (!form.value.favicon) return '建議設置 Favicon'
  if (!form.value.robots || !form.value.sitemap) return '建議設置 robots/sitemap'
  // 結構化
  if (!form.value.faqListZh || form.value.faqListZh.length < 3) return '建議填寫 3 個以上中文 FAQ'
  if (!form.value.faqListEn || form.value.faqListEn.length < 3) return '建議填寫 3 個以上英文 FAQ'
  if (!form.value.address || !form.value.city || !form.value.lat || !form.value.lng) return '建議填寫完整的 GEO 地理資訊'
  return '請完善 SEO 欄位'
})

const seoScoreColor = computed(() => seoScore.value >= 80 ? 'text-green-600' : (seoScore.value >= 60 ? 'text-yellow-600' : 'text-red-600'))

// 自動優化
function autoOptimizeSEO() {
  // 基本 SEO
  if (!form.value.siteTitle) form.value.siteTitle = 'ZUR 官方網站 | 專業 3D 效果圖/動畫/光雕/VR'
  if (!form.value.ogImage) form.value.ogImage = $config.public.cloudinaryUrl || 'https://res.cloudinary.com/dfiwsow3h/image/upload/v1749830240/ZURSTUDIO_nf1k8o.webp'
  if (!form.value.favicon) form.value.favicon = '/favicon.ico'
  if (!form.value.robots) form.value.robots = 'User-agent: *\nAllow: /'
  if (!form.value.sitemap) form.value.sitemap = '/sitemap.xml'
  
  // 多語 SEO
  if (!form.value.siteTitleEn) form.value.siteTitleEn = 'ZUR Official Website | 3D Rendering/Animation/Projection/VR'
  if (!form.value.siteKeywordsZh) form.value.siteKeywordsZh = '3D效果圖,建築渲染,動畫製作,光雕投影,虛擬實境,視覺化,台灣3D,國際渲染,豪宅視覺,商業空間,頂級設計,國際合作,Zaha Hadid,BIG,Snøhetta,頂級建築,豪宅,商辦,展覽,產品渲染,互動體驗,VR,AR,項目管理,創意設計,渲染公司,視覺顧問,國際品牌,頂級客戶,項目案例'
  if (!form.value.siteKeywordsEn) form.value.siteKeywordsEn = '3D rendering,architectural visualization,animation studio,projection mapping,virtual reality,CGI,photorealistic,luxury real estate,commercial visualization,international projects,high-end design,Neoscape,Brick Visual,Mir,The Boundary,DBOX,Luxigon,Beauty and The Bit,Kilograph,Hayes Davidson,Binyan Studios,immersive experience,VR,AR,creative agency,design consulting,global clients,project showcase,interactive presentation'
  if (!form.value.siteDescriptionZh) form.value.siteDescriptionZh = 'ZUR 提供國際級 3D 效果圖、動畫、光雕投影與虛擬實境服務，專案橫跨台灣、歐美與中東，合作對象涵蓋眾多頂級品牌，助力豪宅、商辦、展覽與產品視覺化。'
  if (!form.value.siteDescriptionEn) form.value.siteDescriptionEn = 'ZUR delivers world-class 3D renderings, animation, projection mapping, and VR services for luxury real estate, commercial, and product visualization. Our portfolio spans Taiwan, Europe, the Middle East, and the US, serving top clients like Zaha Hadid, IKEA, BMW, and Marriott.'
  
  // FAQ 多語
  if (!form.value.faqListZh || form.value.faqListZh.length === 0) {
    form.value.faqListZh = [
      { question: 'ZUR 提供哪些 3D 視覺化服務？', answer: '我們提供 3D 效果圖、動畫展示、光雕投影、虛擬漫遊等多元服務，涵蓋建築、室內設計、產品與商業展示。' },
      { question: '如何聯絡 ZUR 團隊？', answer: '您可透過電話 +886-4-36035345、Email zurcgistudio@gmail.com 或 LINE 聯繫我們，我們會盡快回覆您的需求。' },
      { question: 'ZUR 的服務範圍有哪些？', answer: '我們服務範圍包括豪宅、商辦、展覽、產品渲染等，提供客製化的視覺化解決方案。' },
      { question: 'ZUR 的技術優勢是什麼？', answer: '我們採用先進的渲染技術、創新流程與光雕投影技術，確保每個專案都能達到國際頂級水準。' }
    ]
  }
  
  if (!form.value.faqListEn || form.value.faqListEn.length === 0) {
    form.value.faqListEn = [
      { question: 'What 3D visualization services does ZUR offer?', answer: 'We offer 3D renderings, animation presentations, projection mapping, and virtual tours for architecture, interior design, product, and commercial visualization.' },
      { question: 'How can I contact the ZUR team?', answer: 'You can contact us via phone +886-4-36035345, email zurcgistudio@gmail.com, or LINE. We will respond to your needs promptly.' },
      { question: 'What are ZUR\'s service areas?', answer: 'Our services include luxury real estate, commercial buildings, exhibitions, and product rendering, providing customized visualization solutions.' },
      { question: 'What are ZUR\'s technical advantages?', answer: 'We use advanced rendering technology, innovative workflows, and projection mapping techniques to ensure every project meets international top standards.' }
    ]
  }
  
  // GEO 資訊
  if (!form.value.address) form.value.address = 'No. 112, Dadun 7th St., Nantun Dist., Taichung City, Taiwan'
  if (!form.value.city) form.value.city = 'Taichung City'
  if (!form.value.zipcode) form.value.zipcode = '408'
  if (!form.value.lat) form.value.lat = 24.1477
  if (!form.value.lng) form.value.lng = 120.6736
  
  toast.value = '已套用國際頂級 SEO 內容！'
  setTimeout(() => (toast.value = ''), 2000)
}

// 儲存設定
async function saveSettings() {
  await $fetch(`${apiBase}/settings`, {
    method: 'PUT',
    body: form.value,
    credentials: 'include',
  })
  toast.value = '設定已儲存！'
  setTimeout(() => toast.value = '', 2000)
}

function detectGeo() {
  if (!navigator.geolocation) {
    toast.value = '此瀏覽器不支援定位功能';
    setTimeout(() => toast.value = '', 2000);
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      form.value.lat = pos.coords.latitude;
      form.value.lng = pos.coords.longitude;
      toast.value = `已自動填入經緯度`;
      setTimeout(() => toast.value = '', 2000);
    },
    err => {
      toast.value = '定位失敗，請檢查權限';
      setTimeout(() => toast.value = '', 2000);
    }
  );
}

async function getCoordsFromAddress() {
  if (!form.value.address) {
    toast.value = '請先填寫地址';
    setTimeout(() => toast.value = '', 2000);
    return;
  }
  toast.value = '正在從地址獲取經緯度...';
  // 在實際應用中，這裡應該呼叫地理編碼 API (例如 Google Geocoding API)
  // 為了演示，我們使用一個模擬的延遲和固定的返回值
  await new Promise(resolve => setTimeout(resolve, 1000));
  form.value.lat = 25.0330; // 模擬值
  form.value.lng = 121.5654; // 模擬值
  toast.value = '經緯度已成功更新！';
  setTimeout(() => toast.value = '', 2000);
}

// GEO 經緯度 UX 優化
function validateLat() {
  if (typeof form.value.lat !== 'number' || isNaN(form.value.lat)) {
    form.value.lat = null;
  }
}
function validateLng() {
  if (typeof form.value.lng !== 'number' || isNaN(form.value.lng)) {
    form.value.lng = null;
  }
}

const getAiPayload = () => ({
  model: selectedAiModel.value,
  siteTitle: langTab.value === 'zh' ? form.value.siteTitle : form.value.siteTitleEn,
  siteDescription: langTab.value === 'zh' ? form.value.siteDescriptionZh : form.value.siteDescriptionEn,
  siteKeywords: langTab.value === 'zh' ? form.value.siteKeywordsZh : form.value.siteKeywordsEn,
  faqList: langTab.value === 'zh' ? form.value.faqListZh : form.value.faqListEn,
  address: form.value.address,
  city: form.value.city,
  zipcode: form.value.zipcode,
});

const getAiSeoSuggest = async () => {
  aiLoading.value = true
  try {
    const res = await $fetch('/api/seo-ai-suggest', {
      method: 'POST',
      body: getAiPayload()
    })
    
    // 檢查是否有錯誤
    if (res.error) {
      console.error('[AI建議] API 錯誤:', res.error)
      if (res.fallback) {
        // 使用 fallback 內容
        aiSuggest.value = {
          title: 'ZUR 官方網站 | 專業 3D 效果圖/動畫/光雕/VR',
          description: 'ZUR 提供高品質 3D 效果圖、動畫、光雕投影、VR 等視覺化服務，專業團隊助您實現創意。',
          keywords: '效果圖,3D渲染,動畫,光雕,VR,設計,rendering,visualization,CGI,architecture,product',
          faqList: [
            { question: 'ZUR 提供哪些服務？', answer: '我們提供 3D 效果圖、動畫製作、光雕投影、VR 虛擬實境等視覺化服務。' },
            { question: '如何聯繫 ZUR？', answer: '您可以透過網站表單、電話或 email 聯繫我們，我們會盡快回覆您的需求。' }
          ]
        }
        toast.value = 'AI 服務暫時無法使用，已套用預設內容'
        setTimeout(() => (toast.value = ''), 3000)
      } else {
        aiSuggest.value = { title: '', description: '', keywords: '', faqList: [] }
        toast.value = res.error
        setTimeout(() => (toast.value = ''), 3000)
      }
    } else {
    aiSuggest.value = res
    }
  } catch (err) {
    console.error('[AI建議] 網路錯誤:', err)
    aiSuggest.value = { title: '', description: '', keywords: '', faqList: [] }
    toast.value = 'AI 服務連線失敗，請稍後再試'
    setTimeout(() => (toast.value = ''), 3000)
  } finally {
    aiLoading.value = false
  }
}

async function fetchAiSuggest() {
  aiSuggestLoading.value = true
  try {
    const res = await $fetch('/api/seo-ai-suggest', {
      method: 'POST',
      body: getAiPayload()
    })
    console.log('[AI建議] fetchAiSuggest 回傳:', res)
    
    // 檢查是否有錯誤
    if (res.error) {
      console.error('[AI建議] API 錯誤:', res.error)
      if (res.fallback) {
        // 使用 fallback 內容
        aiSuggest.value = {
          title: 'ZUR 官方網站 | 專業 3D 效果圖/動畫/光雕/VR',
          description: 'ZUR 提供高品質 3D 效果圖、動畫、光雕投影、VR 等視覺化服務，專業團隊助您實現創意。',
          keywords: '效果圖,3D渲染,動畫,光雕,VR,設計,rendering,visualization,CGI,architecture,product',
          faqList: [
            { question: 'ZUR 提供哪些服務？', answer: '我們提供 3D 效果圖、動畫製作、光雕投影、VR 虛擬實境等視覺化服務。' },
            { question: '如何聯繫 ZUR？', answer: '您可以透過網站表單、電話或 email 聯繫我們，我們會盡快回覆您的需求。' }
          ]
        }
      } else {
        aiSuggest.value = {}
      }
    } else {
    aiSuggest.value = res
    }
  } catch (e) {
    console.error('[AI建議] fetchAiSuggest 錯誤:', e)
    aiSuggest.value = {}
  } finally {
    aiSuggestLoading.value = false
  }
}

const applyAiSuggest = () => {
  if (langTab.value === 'zh') {
    if (aiSuggest.value.title) form.value.siteTitle = aiSuggest.value.title
    if (aiSuggest.value.description) form.value.siteDescriptionZh = aiSuggest.value.description
    if (aiSuggest.value.keywords) form.value.siteKeywordsZh = aiSuggest.value.keywords
    if (aiSuggest.value.faqList) form.value.faqListZh = aiSuggest.value.faqList
  } else {
    if (aiSuggest.value.title) form.value.siteTitleEn = aiSuggest.value.title
    if (aiSuggest.value.description) form.value.siteDescriptionEn = aiSuggest.value.description
    if (aiSuggest.value.keywords) form.value.siteKeywordsEn = aiSuggest.value.keywords
    if (aiSuggest.value.faqList) form.value.faqListEn = aiSuggest.value.faqList
  }
  toast.value = 'AI 建議已套用！'
  setTimeout(() => (toast.value = ''), 2000)
}

// mock 翻譯 function，預留串接 Google/DeepL/OpenAI API
async function translateText(text: string, from: string, to: string): Promise<string> {
  // TODO: 串接第三方翻譯 API
  // 目前僅做 mock，實際應用請改為 API 呼叫
  if (!text) return '';
  return `[${to} translation of] ` + text;
}

// 一鍵翻譯 SEO 欄位
async function translateField(field: string, from: string, to: string) {
  let source = '';
  if (from === 'zh' && to === 'en') {
    if (field === 'siteTitle') source = form.value.siteTitle;
    if (field === 'siteDescriptionZh') source = form.value.siteDescriptionZh;
    if (field === 'siteKeywordsZh') source = form.value.siteKeywordsZh;
    if (!source) return;
    if (field === 'siteTitle') form.value.siteTitleEn = await translateText(source, from, to);
    if (field === 'siteDescriptionZh') form.value.siteDescriptionEn = await translateText(source, from, to);
    if (field === 'siteKeywordsZh') form.value.siteKeywordsEn = await translateText(source, from, to);
  } else if (from === 'en' && to === 'zh') {
    if (field === 'siteTitleEn') source = form.value.siteTitleEn;
    if (field === 'siteDescriptionEn') source = form.value.siteDescriptionEn;
    if (field === 'siteKeywordsEn') source = form.value.siteKeywordsEn;
    if (!source) return;
    if (field === 'siteTitleEn') form.value.siteTitle = await translateText(source, from, to);
    if (field === 'siteDescriptionEn') form.value.siteDescriptionZh = await translateText(source, from, to);
    if (field === 'siteKeywordsEn') form.value.siteKeywordsZh = await translateText(source, from, to);
  }
}
// 一鍵翻譯 FAQ
async function translateFaq(i: number, from: string, to: string) {
  if (from === 'zh' && to === 'en') {
    const q = form.value.faqListZh[i]?.question;
    const a = form.value.faqListZh[i]?.answer;
    if (!q && !a) return;
    if (!form.value.faqListEn[i]) form.value.faqListEn[i] = { question: '', answer: '' };
    form.value.faqListEn[i].question = await translateText(q, from, to);
    form.value.faqListEn[i].answer = await translateText(a, from, to);
  } else if (from === 'en' && to === 'zh') {
    const q = form.value.faqListEn[i]?.question;
    const a = form.value.faqListEn[i]?.answer;
    if (!q && !a) return;
    if (!form.value.faqListZh[i]) form.value.faqListZh[i] = { question: '', answer: '' };
    form.value.faqListZh[i].question = await translateText(q, from, to);
    form.value.faqListZh[i].answer = await translateText(a, from, to);
  }
}

// Google SERP 預覽資料
const serpUrl = computed(() => 'https://zurcgi.com/')
const serpTitle = computed(() => langTab.value === 'zh' ? form.value.siteTitle : form.value.siteTitleEn)
const serpDescription = computed(() => langTab.value === 'zh' ? form.value.siteDescriptionZh : form.value.siteDescriptionEn)
// Open Graph 預覽資料
const ogTitle = computed(() => langTab.value === 'zh' ? form.value.siteTitle : form.value.siteTitleEn)
const ogDescription = computed(() => langTab.value === 'zh' ? form.value.siteDescriptionZh : form.value.siteDescriptionEn)
// FAQ JSON-LD 產生
const faqJsonLd = computed(() => {
  const list = langTab.value === 'zh' ? form.value.faqListZh : form.value.faqListEn
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': list.filter(f => f.question && f.answer).map(f => ({
      '@type': 'Question',
      'name': f.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.answer
      }
    }))
  }, null, 2)
})
// FAQ JSON-LD 驗證（基本結構）
const faqJsonLdValid = computed(() => {
  try {
    const obj = JSON.parse(faqJsonLd.value)
    return obj['@type'] === 'FAQPage' && Array.isArray(obj.mainEntity) && obj.mainEntity.every(e => e['@type']==='Question' && e.name && e.acceptedAnswer && e.acceptedAnswer['@type']==='Answer' && e.acceptedAnswer.text)
  } catch { return false }
})
// GEO JSON-LD 產生
const geoJsonLd = computed(() => {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Place',
    'address': form.value.address,
    'addressLocality': form.value.city,
    'postalCode': form.value.zipcode,
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': form.value.lat,
      'longitude': form.value.lng
    }
  }, null, 2)
})
// GEO JSON-LD 驗證（基本結構）
const geoJsonLdValid = computed(() => {
  try {
    const obj = JSON.parse(geoJsonLd.value)
    return obj['@type'] === 'Place' && obj.geo && obj.geo['@type'] === 'GeoCoordinates' && typeof obj.geo.latitude === 'number' && typeof obj.geo.longitude === 'number'
  } catch { return false }
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style> 