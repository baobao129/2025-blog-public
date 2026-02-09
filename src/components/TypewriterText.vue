<template>
  <span class="inline-block relative">
    {{ displayedText }}<span class="animate-pulse bg-[#CCFF00] text-black px-1 ml-1" v-if="showCursor">_</span>
  </span>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  speed: {
    type: Number,
    default: 100
  },
  delay: {
    type: Number,
    default: 0
  }
})

const displayedText = ref('')
const showCursor = ref(true)

const typeText = async () => {
  displayedText.value = ''
  await new Promise(resolve => setTimeout(resolve, props.delay))
  
  for (let i = 0; i < props.text.length; i++) {
    displayedText.value += props.text[i]
    await new Promise(resolve => setTimeout(resolve, props.speed))
  }
}

watch(() => props.text, typeText)

onMounted(typeText)
</script>