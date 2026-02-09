<template>
  <div class="min-h-screen flex flex-col font-['JetBrains_Mono'] bg-[#050505] text-[#E0E0E0] cursor-none relative overflow-x-hidden">
    <CustomCursor />
    
    <!-- 全屏布局 (Editor) -->
    <div v-if="route.meta.layout === 'fullscreen'" class="h-screen w-full overflow-hidden relative z-10">
      <router-view />
    </div>

    <!-- 默认布局 (Home, Post, Admin) -->
    <template v-else>
      <!-- 顶部导航栏 -->
      <nav class="fixed top-0 z-50 w-full border-b border-[#222] bg-[#050505]/80 backdrop-blur-sm">
        <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <!-- Logo -->
          <router-link to="/" class="group flex items-center gap-4">
            <div class="w-10 h-10 border border-[#CCFF00] flex items-center justify-center bg-transparent group-hover:bg-[#CCFF00] transition-colors duration-0">
              <span class="font-['Space_Mono'] font-bold text-xl text-[#CCFF00] group-hover:text-black">_</span>
            </div>
            <span class="font-['Space_Mono'] font-bold text-xl tracking-tighter text-white group-hover:text-[#CCFF00] transition-colors">
              CYBER_LOG
            </span>
          </router-link>
          
          <!-- 导航链接 -->
          <div class="flex items-center gap-8 font-mono text-xs">
            <router-link 
              to="/" 
              class="relative py-1 text-[#888] hover:text-[#CCFF00] transition-colors uppercase tracking-widest group"
              active-class="text-[#CCFF00]"
            >
              <span class="group-hover:hidden">root</span>
              <span class="hidden group-hover:inline glitch-text">root</span>
              <span class="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#CCFF00] group-hover:w-full transition-all duration-300"></span>
            </router-link>
            
            <router-link 
              to="/admin" 
              class="relative py-1 text-[#888] hover:text-[#CCFF00] transition-colors uppercase tracking-widest group"
              active-class="text-[#CCFF00]"
            >
              <span class="group-hover:hidden">admin</span>
              <span class="hidden group-hover:inline glitch-text">admin</span>
              <span class="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#CCFF00] group-hover:w-full transition-all duration-300"></span>
            </router-link>

            <a href="https://github.com" target="_blank" class="text-[#888] hover:text-[#CCFF00] transition-colors" title="GITHUB_REPO">
              <GithubIcon class="w-5 h-5" />
            </a>
          </div>
        </div>
      </nav>

      <!-- 主内容区域 -->
      <main class="flex-grow w-full pt-20">
        <router-view v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>

      <!-- 页脚 -->
      <footer class="border-t border-[#222] bg-[#050505] py-12 relative z-10">
        <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="text-[#444] text-xs font-mono uppercase tracking-widest">
            // SYSTEM_STATUS: ONLINE<br>
            &copy; {{ new Date().getFullYear() }} CYBER_LOG. ALL_RIGHTS_RESERVED.
          </div>
          <div class="flex gap-8 text-xs font-mono text-[#888]">
            <span class="hover:text-[#CCFF00] cursor-pointer transition-colors uppercase">[ ABOUT_ME ]</span>
            <span class="hover:text-[#CCFF00] cursor-pointer transition-colors uppercase">[ RSS_FEED ]</span>
          </div>
        </div>
      </footer>
    </template>

    <!-- 通知组件 -->
    <Toaster 
      position="bottom-right" 
      :toastOptions="{
        class: 'bg-[#111] text-[#CCFF00] border border-[#333] font-mono rounded-none',
        descriptionClass: 'text-[#888]',
        actionButtonStyle: { background: '#CCFF00', color: '#000', borderRadius: '0' },
        cancelButtonStyle: { background: '#333', color: '#fff', borderRadius: '0' },
      }"
    />
  </div>
</template>

<script setup>
import { Toaster } from 'vue-sonner'
import { Github as GithubIcon } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import CustomCursor from '@/components/CustomCursor.vue'

const route = useRoute()
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, filter 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(10px);
}
</style>
