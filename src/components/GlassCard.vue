<template>
  <div 
    class="glass-card relative overflow-hidden transition-all duration-300"
    :class="[
      variantClasses[variant],
      hover ? 'hover:shadow-xl hover:-translate-y-1 hover:border-white/30 dark:hover:border-white/20' : '',
      customClass
    ]"
  >
    <!-- 噪点纹理 -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none bg-noise z-0"></div>
    
    <!-- 光效层 -->
    <div v-if="shine" class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"></div>
    
    <!-- 内容层 -->
    <div class="relative z-20 h-full">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'heavy', 'light', 'interactive', 'nav'].includes(value)
  },
  hover: {
    type: Boolean,
    default: false
  },
  shine: {
    type: Boolean,
    default: false
  },
  customClass: {
    type: String,
    default: ''
  }
})

const variantClasses = {
  default: 'bg-white/40 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg',
  heavy: 'bg-white/60 dark:bg-black/50 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-xl',
  light: 'bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/10 dark:border-white/5 shadow-sm',
  interactive: 'bg-white/30 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-md cursor-pointer',
  nav: 'bg-white/70 dark:bg-black/70 backdrop-blur-lg border-b border-white/20 dark:border-white/10'
}
</script>

<style scoped>
.bg-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}
</style>