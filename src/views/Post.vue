<template>
  <div class="max-w-3xl mx-auto">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex flex-col items-center py-20 space-y-4">
      <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p class="text-text-light text-sm animate-pulse">Loading story...</p>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="bg-red-50 border border-red-100 text-red-700 p-6 rounded-xl text-center my-12">
      {{ error }}
      <div class="mt-4">
        <router-link to="/" class="text-primary hover:text-accent underline transition-colors">Return home</router-link>
      </div>
    </div>

    <div v-else class="animate-fade-in-up">
      <!-- 导航栏 -->
      <nav class="mb-12 flex items-center gap-2 text-sm text-text-light">
        <router-link to="/" class="hover:text-primary transition-colors">Home</router-link>
        <span>/</span>
        <span class="text-text-muted truncate">{{ route.params.filename.replace('.md', '') }}</span>
      </nav>

      <!-- 文章头部 -->
      <header class="mb-12 text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-text-muted mb-6">
          <Calendar class="w-3 h-3" />
          <span>{{ new Date().toLocaleDateString() }}</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-serif font-bold text-primary mb-6 leading-tight">
          {{ formatTitle(route.params.filename) }}
        </h1>
        <div class="flex items-center justify-center gap-4 text-sm text-text-muted">
          <div class="flex items-center gap-1">
            <User class="w-4 h-4" />
            <span>Author</span>
          </div>
          <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
          <div class="flex items-center gap-1">
            <Clock class="w-4 h-4" />
            <span>{{ readingTime }} min read</span>
          </div>
        </div>
      </header>

      <!-- 文章内容 -->
      <article class="prose prose-lg prose-zinc mx-auto pb-20">
        <div v-html="contentHtml"></div>
      </article>

      <!-- 底部导航 -->
      <div class="border-t border-gray-100 pt-12 mt-12 flex justify-between">
        <router-link to="/" class="group flex items-center gap-2 text-text-muted hover:text-primary transition-colors">
          <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </router-link>
        <button 
          @click="window.scrollTo({ top: 0, behavior: 'smooth' })" 
          class="text-text-muted hover:text-primary transition-colors"
        >
          Top &uarr;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import { getFileContent } from '@/utils/github-client'
import { useAuth } from '@/composables/useAuth'
import { GITHUB_CONFIG } from '@/consts'
import { Calendar, Clock, User, ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const { getAuthToken } = useAuth()
const loading = ref(true)
const error = ref(null)
const contentHtml = ref('')
const readingTime = ref(1)

const formatTitle = (filename) => {
  if (!filename) return ''
  return filename.replace(/\.md$/, '').replace(/-/g, ' ')
}

const calculateReadingTime = (text) => {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

const fetchPost = async () => {
  const filename = route.params.filename
  if (!filename) return

  try {
    loading.value = true
    
    let token = null
    try {
      token = await getAuthToken()
    } catch (e) {
      console.log('未登录，尝试以访客模式访问')
    }

    const content = await getFileContent(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, `posts/${filename}`)
    readingTime.value = calculateReadingTime(content)
    contentHtml.value = marked.parse(content)
  } catch (e) {
    console.error(e)
    error.value = 'Unable to load article. ' + e.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPost()
})
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
