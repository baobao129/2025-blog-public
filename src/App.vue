<template>
  <div class="min-h-screen flex flex-col font-sans selection:bg-accent-light/30 selection:text-primary transition-colors duration-300">
    <!-- 动态背景管理器 (仅在非全屏布局显示) -->
    <BackgroundManager v-if="route.meta.layout !== 'fullscreen'" />

    <!-- 全屏布局 (Editor) -->
    <div v-if="route.meta.layout === 'fullscreen'" class="h-screen w-full overflow-hidden relative z-10 bg-background">
      <router-view />
    </div>

    <!-- 默认布局 (Home, Post, Admin) -->
    <template v-else>
      <!-- 顶部导航栏 (Glassmorphism) -->
      <nav class="sticky top-0 z-50 w-full transition-all duration-300">
        <GlassCard variant="nav" class="rounded-none border-t-0 border-x-0">
          <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <!-- Logo -->
            <router-link to="/" class="group flex items-center gap-3">
              <div class="w-8 h-8 bg-primary/90 text-white rounded flex items-center justify-center shadow-sm group-hover:bg-accent transition-colors backdrop-blur-sm">
                <Feather class="w-5 h-5" />
              </div>
              <span class="font-serif font-bold text-xl tracking-tight text-primary dark:text-gray-100 group-hover:text-accent transition-colors drop-shadow-sm">
                我的博客
              </span>
            </router-link>
            
            <!-- 导航链接 -->
            <div class="flex items-center gap-6 text-sm font-medium">
              <router-link 
                to="/" 
                class="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent after:transition-all hover:after:w-full"
                active-class="text-primary dark:text-white after:w-full"
              >
                首页
              </router-link>
              <router-link 
                to="/admin" 
                class="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent after:transition-all hover:after:w-full"
                active-class="text-primary dark:text-white after:w-full"
              >
                管理
              </router-link>
              <a href="https://github.com" target="_blank" class="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors" title="访问 GitHub">
                <GithubIcon class="w-5 h-5" />
              </a>
              <div class="h-4 w-px bg-gray-300/50 dark:bg-gray-600/50"></div>
              <ThemeToggle />
            </div>
          </div>
        </GlassCard>
      </nav>

      <!-- 主内容区域 -->
      <main class="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <router-view v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>

      <!-- 页脚 (Glassmorphism) -->
      <footer class="mt-auto relative z-10">
        <GlassCard variant="light" class="rounded-none border-x-0 border-b-0">
          <div class="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div class="text-gray-600 dark:text-gray-400 text-sm font-medium font-serif">
              &copy; {{ new Date().getFullYear() }} 闲情偶寄. 保留所有权利.
            </div>
            <div class="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
              <span class="hover:text-primary dark:hover:text-white cursor-pointer transition-colors">关于我</span>
              <span class="hover:text-primary dark:hover:text-white cursor-pointer transition-colors">RSS 订阅</span>
            </div>
          </div>
        </GlassCard>
      </footer>
    </template>

    <!-- 通知组件 -->
    <Toaster 
      position="top-center" 
      :toastOptions="{
        class: 'dark:bg-gray-800 dark:text-white dark:border-gray-700 !bg-white/80 !backdrop-blur-md !border-white/20',
        style: {
          fontFamily: 'Noto Sans SC, sans-serif'
        },
        className: 'z-[9999]'
      }"
    />
  </div>
</template>

<script setup>
import { Toaster } from 'vue-sonner'
import { Github as GithubIcon, Feather } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'
import BackgroundManager from '@/components/BackgroundManager.vue'
import GlassCard from '@/components/GlassCard.vue'

const route = useRoute()
</script>
