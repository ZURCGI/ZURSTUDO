<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { gsap } from 'gsap'

const props = defineProps<{
  text: string[] | string
  typingSpeed?: number
  pauseDuration?: number
  showCursor?: boolean
  cursorCharacter?: string
  className?: string
  keepAll?: boolean
}>()

const textArray = Array.isArray(props.text) ? props.text : [props.text]
const typingSpeed = props.typingSpeed ?? 75
const pauseDuration = props.pauseDuration ?? 1500
const showCursor = props.showCursor ?? true
const cursorCharacter = props.cursorCharacter ?? '|'
const keepAll = props.keepAll ?? false

const displayedText = ref('')
const currentCharIndex = ref(0)
const isDeleting = ref(false)
const currentTextIndex = ref(0)
const cursorRef = ref<HTMLElement | null>(null)

// 新增：累積顯示的行
const lines = ref<string[]>([])

function typeLoop() {
  const current = textArray[currentTextIndex.value]
  if (!isDeleting.value) {
    if (currentCharIndex.value < current.length) {
      displayedText.value += current[currentCharIndex.value]
      currentCharIndex.value++
      setTimeout(typeLoop, typingSpeed)
    } else if (textArray.length > 1) {
      if (keepAll) {
        // 累積顯示
        lines.value.push(displayedText.value)
        displayedText.value = ''
        currentCharIndex.value = 0
        currentTextIndex.value++
        if (currentTextIndex.value < textArray.length) {
          setTimeout(typeLoop, pauseDuration)
        }
      } else {
        setTimeout(() => {
          isDeleting.value = true
          typeLoop()
        }, pauseDuration)
      }
    }
  } else {
    if (displayedText.value.length > 0) {
      displayedText.value = displayedText.value.slice(0, -1)
      setTimeout(typeLoop, typingSpeed / 2)
    } else {
      isDeleting.value = false
      currentTextIndex.value = (currentTextIndex.value + 1) % textArray.length
      currentCharIndex.value = 0
      setTimeout(typeLoop, typingSpeed)
    }
  }
}

onMounted(() => {
  if (keepAll) {
    lines.value = []
    displayedText.value = ''
    currentCharIndex.value = 0
    currentTextIndex.value = 0
  }
  typeLoop()
  if (showCursor && cursorRef.value) {
    gsap.to(cursorRef.value, {
      opacity: 0,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
    })
  }
})

watch(() => props.text, () => {
  // 若 text prop 變動，重置
  if (keepAll) {
    lines.value = []
    displayedText.value = ''
    currentCharIndex.value = 0
    currentTextIndex.value = 0
  }
  typeLoop()
})
</script>

<template>
  <span :class="className">
    <template v-if="keepAll">
      <span v-for="(line, idx) in lines" :key="idx">{{ line }}<br /></span>
      <span v-if="currentTextIndex < textArray.length">{{ displayedText }}<span v-if="showCursor" ref="cursorRef">{{ cursorCharacter }}</span></span>
    </template>
    <template v-else>
      <span>{{ displayedText }}</span>
      <span v-if="showCursor" ref="cursorRef">{{ cursorCharacter }}</span>
    </template>
  </span>
</template> 