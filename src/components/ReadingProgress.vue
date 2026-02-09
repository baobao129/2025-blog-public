<template>
  <div class="fixed top-0 left-0 w-full h-1 z-50 pointer-events-none">
    <div
      class="h-full bg-primary transition-all duration-100 ease-out"
      :style="{ width: `${progress}%`, opacity: progress > 0 ? 1 : 0 }"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useWindowScroll } from '@vueuse/core'

const { y } = useWindowScroll()
const progress = ref(0)

const updateProgress = () => {
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
  if (docHeight > 0) {
    progress.value = Math.min(100, Math.max(0, (y.value / docHeight) * 100))
  }
}

// 监听滚动
import { watch } from 'vue'
watch(y, updateProgress)

onMounted(() => {
  updateProgress()
})
</script>