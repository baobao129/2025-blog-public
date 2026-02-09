<template>
  <div class="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] mix-blend-difference" ref="cursor">
    <div class="relative w-full h-full">
      <!-- 十字准星 -->
      <div class="absolute top-1/2 left-0 w-full h-[1px] bg-[#CCFF00]"></div>
      <div class="absolute left-1/2 top-0 h-full w-[1px] bg-[#CCFF00]"></div>
      
      <!-- 点击波纹 -->
      <div 
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-[#CCFF00] rounded-full opacity-0"
        ref="ripple"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const cursor = ref(null)
const ripple = ref(null)

const moveCursor = (e) => {
  gsap.to(cursor.value, {
    x: e.clientX - 16,
    y: e.clientY - 16,
    duration: 0.1,
    ease: 'power2.out'
  })
}

const clickEffect = () => {
  gsap.fromTo(ripple.value, 
    { width: 0, height: 0, opacity: 1 },
    { width: 40, height: 40, opacity: 0, duration: 0.4 }
  )
}

onMounted(() => {
  window.addEventListener('mousemove', moveCursor)
  window.addEventListener('click', clickEffect)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', moveCursor)
  window.removeEventListener('click', clickEffect)
})
</script>