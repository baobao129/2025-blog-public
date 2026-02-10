<template>
  <aside class="h-screen sticky top-0 flex flex-col justify-between py-12 px-8 overflow-y-auto scrollbar-hide border-r border-white/10 dark:border-white/5 bg-white/30 dark:bg-black/20 backdrop-blur-xl">
    <!-- Logo & Brand -->
    <div class="space-y-8">
      <router-link to="/" class="group flex items-center gap-4">
        <div class="w-12 h-12 bg-primary/90 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:bg-accent transition-all duration-500 backdrop-blur-sm group-hover:scale-110 group-hover:rotate-6">
          <Feather class="w-6 h-6" />
        </div>
        <div>
          <h1 class="font-serif font-bold text-2xl tracking-tight text-primary dark:text-white group-hover:text-accent transition-colors">
            我的博客
          </h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wider uppercase mt-1">Insights & Thoughts</p>
        </div>
      </router-link>

      <!-- Navigation -->
      <nav class="space-y-2 mt-12">
        <router-link 
          v-for="item in navItems" 
          :key="item.path" 
          :to="item.path"
          class="flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden"
          active-class="bg-white/40 dark:bg-white/10 shadow-sm text-primary dark:text-white font-bold"
          :class="$route.path === item.path ? '' : 'text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-white/5 hover:text-primary dark:hover:text-white'"
        >
          <component :is="item.icon" class="w-5 h-5 relative z-10" />
          <span class="relative z-10">{{ item.name }}</span>
          <div v-if="$route.path === item.path" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full"></div>
        </router-link>
      </nav>
    </div>

    <!-- Bottom Actions -->
    <div class="space-y-6">
      <div class="flex items-center gap-4 px-6">
        <a 
          href="https://github.com" 
          target="_blank" 
          class="p-2 rounded-lg text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10 transition-all"
          title="GitHub"
        >
          <GithubIcon class="w-5 h-5" />
        </a>
        <div class="h-4 w-px bg-gray-300/50 dark:bg-gray-600/50"></div>
        <ThemeToggle />
      </div>
      
      <div class="text-xs text-gray-400 dark:text-gray-600 px-6 font-mono">
        &copy; {{ new Date().getFullYear() }} Blog.
      </div>
    </div>
  </aside>
</template>

<script setup>
import { Home, LayoutGrid, Feather, Github as GithubIcon } from 'lucide-vue-next'
import ThemeToggle from './ThemeToggle.vue'

const navItems = [
  { name: '首页', path: '/', icon: Home },
  { name: '管理', path: '/admin', icon: LayoutGrid }
]
</script>