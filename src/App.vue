<template>
  <div class="min-h-screen flex flex-col font-sans selection:bg-accent-light/30 selection:text-primary">
    <!-- 顶部导航栏 -->
    <nav class="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-background/80 backdrop-blur-md transition-all">
      <div class="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="group flex items-center gap-3">
          <div class="w-8 h-8 bg-primary text-white rounded flex items-center justify-center shadow-sm group-hover:bg-accent transition-colors">
            <Feather class="w-5 h-5" />
          </div>
          <span class="font-serif font-bold text-xl tracking-tight text-primary group-hover:text-accent transition-colors">
            我的博客
          </span>
        </router-link>
        
        <!-- 导航链接 -->
        <div class="flex items-center gap-8 text-sm font-medium">
          <router-link 
            to="/" 
            class="text-text-muted hover:text-primary transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent after:transition-all hover:after:w-full"
            active-class="text-primary after:w-full"
          >
            首页
          </router-link>
          <router-link 
            to="/admin" 
            class="text-text-muted hover:text-primary transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent after:transition-all hover:after:w-full"
            active-class="text-primary after:w-full"
          >
            管理
          </router-link>
          <a href="https://github.com" target="_blank" class="text-text-muted hover:text-primary transition-colors" title="访问 GitHub">
            <GithubIcon class="w-5 h-5" />
          </a>
        </div>
      </div>
    </nav>

    <!-- 主内容区域 -->
    <main class="flex-grow w-full max-w-5xl mx-auto px-6 py-12">
      <router-view v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>

    <!-- 页脚 -->
    <footer class="border-t border-gray-200/50 bg-white/50 py-12 mt-auto">
      <div class="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="text-text-muted text-sm font-medium font-serif">
          &copy; {{ new Date().getFullYear() }} 闲情偶寄. 保留所有权利.
        </div>
        <div class="flex gap-6 text-sm text-text-light">
          <span class="hover:text-primary cursor-pointer transition-colors">关于我</span>
          <span class="hover:text-primary cursor-pointer transition-colors">RSS 订阅</span>
        </div>
      </div>
    </footer>

    <!-- 通知组件 -->
    <Toaster 
      position="top-center" 
      :toastOptions="{
        style: {
          background: '#2c2c2c',
          color: '#fdfbf7',
          border: 'none',
          fontFamily: 'Noto Sans SC, sans-serif'
        }
      }"
    />
  </div>
</template>

<script setup>
import { Toaster } from 'vue-sonner'
import { Github as GithubIcon, Feather } from 'lucide-vue-next'
</script>
