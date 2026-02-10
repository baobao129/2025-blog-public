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
      <div class="flex min-h-screen">
        <!-- 左侧导航栏 (Sidebar) -->
        <Sidebar class="hidden md:flex w-72 flex-shrink-0 z-20" />

        <!-- 主内容区域 -->
        <main class="flex-grow w-full relative z-10 flex flex-col min-w-0">
          <div class="flex-grow px-6 py-12 md:px-12">
            <router-view v-slot="{ Component }">
              <Transition name="fade" mode="out-in">
                <component :is="Component" />
              </Transition>
            </router-view>
          </div>

          <!-- 页脚 -->
          <footer class="mt-auto px-6 py-8 md:px-12 border-t border-white/10 dark:border-white/5">
            <div class="text-gray-500 dark:text-gray-400 text-sm font-medium font-serif text-center md:text-left">
              &copy; {{ new Date().getFullYear() }} 闲情偶寄. 保留所有权利.
            </div>
          </footer>
        </main>
      </div>
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
import { useRoute } from 'vue-router'
import BackgroundManager from '@/components/BackgroundManager.vue'
import Sidebar from '@/components/Sidebar.vue'

const route = useRoute()
</script>
