<template>
  <button
    @click="toggleDark()"
    class="relative p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-300 focus:outline-none cursor-pointer z-50"
    title="Toggle Theme"
  >
    <div class="relative w-5 h-5 overflow-hidden">
      <Sun
        class="absolute inset-0 w-full h-full text-amber-500 transition-all duration-500 transform dark:translate-y-full dark:opacity-0"
      />
      <Moon
        class="absolute inset-0 w-full h-full text-indigo-400 transition-all duration-500 transform -translate-y-full opacity-0 dark:translate-y-0 dark:opacity-100"
      />
    </div>
  </button>
</template>

<script setup>
import { useDark, useToggle } from '@vueuse/core'
import { Sun, Moon } from 'lucide-vue-next'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>