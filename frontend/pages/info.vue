<template>
  <div class="space-y-0">
    <div class="w-full" style="aspect-ratio: 16/9; min-height: 300px;">
      <GridDistortion :imageSrc="`${$config.public.cloudinaryUrl || 'https://res.cloudinary.com/dfiwsow3h/image/upload/v1749830240/ZURSTUDIO_nf1k8o.webp'}`" class="w-full h-full" />
    </div>

    <section ref="secAbout" class="max-w-4xl mx-auto py-8 px-4 opacity-0">
      <h1 class="text-3xl font-bold mb-6">About ZUR / 關於 ZUR</h1>
      <div class="mt-4 text-gray-700 text-lg md:text-xl font-medium block">
        <div class="font-semibold mb-2">Our Core Service / 我們的核心服務</div>
        <TextType
          :text="[
            'High-quality 3D static renderings and visualizations',
            '高品質 3D 靜態渲染與效果圖',
            '3D animation and immersive animated walkthroughs',
            '3D 動畫與沉浸式動畫導覽',
            'Projection mapping and content creation for light shows',
            '光雕投影與投影映射內容製作',
            'Virtual tours and interactive presentations',
            '虛擬漫遊與互動式展示',
            'Rendering process consulting and technical integration',
            '渲染流程顧問與技術整合'
          ]"
          :typingSpeed="75"
          :pauseDuration="1500"
          :showCursor="true"
          cursorCharacter="|"
          :keepAll="true"
        />
      </div>
    </section>

     <section ref="secContact" class="max-w-4xl mx-auto py-12 px-4 opacity-0">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div>
          <h2 class="text-2xl font-semibold mb-4 text-gray-800">聯絡方式</h2>
          <ul class="space-y-3 text-gray-700 text-base">
            <li>+886 4 36035345</li>
            <li>No. 112, Dadun 7th St., Nantun Dist., Taichung City, Taiwan</li>
            <li>
              <a href="mailto:zurcgistudio@gmail.com" class="text-blue-600 underline hover:text-blue-800 transition">
                zurcgistudio@gmail.com
              </a>
            </li>
          </ul>
        </div>
        <div class="flex justify-start">
          <img
            :src="`${$config.public.cloudinaryUrl || 'https://res.cloudinary.com/dfiwsow3h/image/upload/f_auto,q_auto/v1749631606/line-qr_xvdcic.png'}`"
            alt="ZUR LINE QR Code"
            class="w-48 h-48 object-contain border rounded-lg shadow hover:scale-105 transition-transform duration-300"
            loading="lazy"
            width="192"
            height="192"
          />
        </div>
      </div>
    </section>

    <!-- FAQ 區塊 -->
    <section class="max-w-4xl mx-auto py-8 px-4 mt-8">
      <h2 class="text-2xl font-semibold mb-4">常見問答 FAQ</h2>
      <div v-for="(faq, idx) in faqs" :key="idx" class="mb-4 border-b pb-2">
        <button
          class="w-full text-left flex justify-between items-center py-2 focus:outline-none transition hover:bg-gray-100 active:bg-gray-200 rounded-lg"
          @click="toggleFaq(idx)"
        >
          <span class="font-medium text-gray-800">
            {{ faq.question_en }}
            <span class="text-sm text-gray-500 ml-2">{{ faq.question }}</span>
          </span>
          <svg :class="[openFaq === idx ? 'rotate-180' : '', 'w-5 h-5 transition-transform text-gray-400 hover:text-primary hover:scale-110']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div v-show="openFaq === idx" class="text-gray-600 mt-2 pl-2">
          <div>{{ faq.answer_en }}</div>
          <div class="text-sm text-gray-500 mt-1">{{ faq.answer }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useHead } from '#app'
import { useAppSeoMeta } from '~/composables/useAppSeoMeta'
import TextType from '~/components/TextType'

useHead({
  title: '聯絡我們 | ZUR STUDIO',
  meta: [
    { name: 'description', content: 'ZUR 提供國際級 3D 效果圖、動畫、光雕投影與虛擬實境服務，專案橫跨台灣、歐美與中東，合作對象涵蓋眾多頂級品牌，助力豪宅、商辦、展覽與產品視覺化。' },
    { property: 'og:title', content: '聯絡我們 | ZUR STUDIO' },
    { property: 'og:description', content: 'ZUR delivers world-class 3D renderings, animation, projection mapping, and VR services for luxury real estate, commercial, and product visualization. Our portfolio spans Taiwan, Europe, the Middle East, and the US, serving top clients like Zaha Hadid, IKEA, BMW, and Marriott.' },
    { property: 'og:image', content: `${$config.public.cloudinaryUrl || 'https://res.cloudinary.com/dfiwsow3h/image/upload/v1749631606/line-qr_xvdcic.png'}` },
    { name: 'robots', content: 'index, follow' }
  ]
})

const secAbout = ref<HTMLElement | null>(null)
const secServices = ref<HTMLElement | null>(null)
const secContact = ref<HTMLElement | null>(null)

const heroImg = ref<HTMLImageElement | null>(null)
const enableNusetImgAnimation = ref(true)

// FAQ 資料
const faqs = ref([
  {
    question: 'ZUR 提供哪些 3D 視覺化服務？',
    answer: '我們提供 3D 效果圖、動畫展示、光雕投影、虛擬漫遊等多元服務，涵蓋建築、室內設計、產品與商業展示。',
    question_en: 'What 3D visualization services does ZUR offer?',
    answer_en: 'We offer 3D renderings, animation presentations, projection mapping, and virtual tours for architecture, interior design, product, and commercial visualization.'
  },
  {
    question: '如何聯絡 ZUR 團隊？',
    answer: '您可透過電話 +886-4-36035345、Email zurcgistudio@gmail.com 或 LINE 聯繫我們，我們會盡快回覆您的需求。',
    question_en: 'How can I contact the ZUR team?',
    answer_en: 'You can contact us via phone +886-4-36035345, email zurcgistudio@gmail.com, or LINE. We will respond to your needs promptly.'
  },
  {
    question: 'ZUR 的服務範圍有哪些？',
    answer: '我們服務範圍包括豪宅、商辦、展覽、產品渲染等，提供客製化的視覺化解決方案。',
    question_en: 'What are ZUR\'s service areas?',
    answer_en: 'Our services include luxury real estate, commercial buildings, exhibitions, and product rendering, providing customized visualization solutions.'
  },
  {
    question: 'ZUR 的技術優勢是什麼？',
    answer: '我們採用先進的渲染技術、創新流程與光雕投影技術，確保每個專案都能達到國際頂級水準。',
    question_en: 'What are ZUR\'s technical advantages?',
    answer_en: 'We use advanced rendering technology, innovative workflows, and projection mapping techniques to ensure every project meets international top standards.'
  }
])
const openFaq = ref<number|null>(null)
const toggleFaq = (idx: number) => {
  openFaq.value = openFaq.value === idx ? null : idx
}

const aboutZUR_EN = [
  "High-quality 3D static renderings and visualizations",
  "3D animation and immersive animated walkthroughs",
  "Projection mapping and content creation for light shows",
  "Virtual tours and interactive presentations",
  "Rendering process consulting and technical integration"
]
const aboutZUR_ZH = [
  "高品質 3D 靜態渲染與效果圖",
  "3D 動畫與沉浸式動畫導覽",
  "光雕投影與投影映射內容製作",
  "虛擬漫遊與互動式展示",
  "渲染流程顧問與技術整合"
]

useAppSeoMeta({
  title: '聯絡我們 | ZUR STUDIO',
  description: 'ZUR 提供國際級 3D 效果圖、動畫、光雕投影與虛擬實境服務，專案橫跨台灣、歐美與中東，合作對象涵蓋眾多頂級品牌，助力豪宅、商辦、展覽與產品視覺化。',
siteDescriptionZh: 'ZUR 提供國際級 3D 效果圖、動畫、光雕投影與虛擬實境服務，專案橫跨台灣、歐美與中東，合作對象涵蓋眾多頂級品牌，助力豪宅、商辦、展覽與產品視覺化。',
  siteDescriptionEn: 'ZUR delivers world-class 3D renderings, animation, projection mapping, and VR services for luxury real estate, commercial, and product visualization. Our portfolio spans Taiwan, Europe, the Middle East, and the US, serving top clients like Zaha Hadid, IKEA, BMW, and Marriott.',
  siteKeywordsZh: '3D效果圖,建築渲染,動畫製作,光雕投影,虛擬實境,視覺化,台灣3D,國際渲染,豪宅視覺,商業空間,頂級設計,國際合作,Zaha Hadid,BIG,Snøhetta,頂級建築,豪宅,商辦,展覽,產品渲染,互動體驗,VR,AR,項目管理,創意設計,渲染公司,視覺顧問,國際品牌,頂級客戶,項目案例',
  siteKeywordsEn: '3D rendering,architectural visualization,animation studio,projection mapping,virtual reality,CGI,photorealistic,luxury real estate,commercial visualization,international projects,high-end design,Neoscape,Brick Visual,Mir,The Boundary,DBOX,Luxigon,Beauty and The Bit,Kilograph,Hayes Davidson,Binyan Studios,immersive experience,VR,AR,creative agency,design consulting,global clients,project showcase,interactive presentation',
  type: 'website',
  faqListZh: faqs.value.map(faq => ({ question: faq.question, answer: faq.answer })),
  faqListEn: faqs.value.map(faq => ({ question: faq.question_en, answer: faq.answer_en }))
})

onMounted(async () => {
  try {
    // 動態導入 GSAP
    const { gsap } = await import('gsap')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    
    // 確保 ScrollTrigger 已註冊
    gsap.registerPlugin(ScrollTrigger)
    
    // 等待下一個 tick 確保 DOM 完全準備好
    await nextTick()
    
    // 檢查元素是否存在再執行動畫
    const elements = [secAbout.value, secServices.value, secContact.value].filter(Boolean)
    
    elements.forEach((el) => {
      if (el && el instanceof HTMLElement) {
        gsap.fromTo(
          el,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 80%' }
          }
        )
      }
    })

    // 檢查 heroImg 是否存在再執行動畫
    if (enableNusetImgAnimation.value && heroImg.value && heroImg.value instanceof HTMLElement) {
      gsap.fromTo(
        heroImg.value,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power3.out'
        }
      )
    }
  } catch (error) {
    console.warn('GSAP 動畫初始化失敗:', error)
  }
})
</script>

<style scoped>
.nuset-hero-img {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  border-radius: 1rem;
}
.nuset-hero-img:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
}
</style>
