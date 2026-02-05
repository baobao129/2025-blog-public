<template>
  <div class="space-y-16">
    <!-- Hero 区域 -->
    <header class="py-16 text-center space-y-6 animate-fade-in-up">
      <h1 class="text-5xl md:text-6xl font-serif font-bold text-primary tracking-tight">
        Thoughts & <span class="text-accent italic">Ideas</span>
      </h1>
      <p class="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
        Exploring technology, design, and the spaces in between. A collection of notes on building better software.
      </p>
    </header>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="flex gap-2">
        <div class="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
        <div class="w-3 h-3 bg-primary rounded-full animate-bounce delay-100"></div>
        <div class="w-3 h-3 bg-primary rounded-full animate-bounce delay-200"></div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="bg-red-50 border border-red-100 text-red-700 p-6 rounded-xl text-center">
      <p class="font-medium">{{ error }}</p>
      <button @click="fetchPosts" class="mt-4 text-sm underline hover:text-red-800">重试</button>
    </div>

    <!-- 文章列表 -->
    <div v-else class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <TransitionGroup name="list">
        <div v-if="posts.length === 0" class="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <p class="text-text-muted text-lg">暂无文章，请前往管理后台发布。</p>
        </div>

        <article 
          v-for="(post, index) in posts" 
          :key="post.sha"
          class="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
          :style="{ transitionDelay: `${index * 50}ms` }"
        >
          <!-- 装饰性图标/标签 -->
          <div class="mb-6 flex items-center justify-between">
            <span class="px-3 py-1 bg-gray-100 text-xs font-medium text-text-muted rounded-full uppercase tracking-wider">
              Article
            </span>
            <span class="text-xs text-text-light font-mono">{{ post.size }} bytes</span>
          </div>

          <!-- 标题 -->
          <h2 class="text-2xl font-serif font-bold text-primary mb-3 group-hover:text-accent transition-colors line-clamp-2">
            <router-link :to="'/post/' + post.name">
              {{ formatTitle(post.name) }}
            </router-link>
          </h2>

          <!-- 摘要 (模拟) -->
          <p class="text-text-muted mb-6 flex-grow line-clamp-3 leading-relaxed">
            Click to read more about {{ formatTitle(post.name) }}. This is a placeholder for the article summary.
          </p>

          <!-- 底部元数据 -->
          <div class="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
            <div class="flex items-center gap-2 text-sm text-text-light">
              <Calendar class="w-4 h-4" />
              <span>Today</span>
            </div>
            <router-link 
              :to="'/post/' + post.name" 
              class="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:translate-x-1 transition-transform"
            >
              Read more <ArrowRight class="w-4 h-4" />
            </router-link>
          </div>
        </article>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDirectoryContents } from '@/utils/github-client'
import { useAuth } from '@/composables/useAuth'
import { GITHUB_CONFIG } from '@/consts'
import { Calendar, ArrowRight } from 'lucide-vue-next'

const { getAuthToken } = useAuth()
const posts = ref([])
const loading = ref(true)
const error = ref(null)

const formatTitle = (filename) => {
  return filename.replace(/\.md$/, '').replace(/-/g, ' ')
}

const fetchPosts = async () => {
  try {
    loading.value = true
    error.value = null
    
    let token = null
    try {
      token = await getAuthToken()
    } catch (e) {
      console.log('未登录，尝试以访客模式访问', e)
    }

    const files = await getDirectoryContents(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, 'posts')
    posts.value = files.filter(f => f.name.endsWith('.md'))
  } catch (e) {
    console.error(e)
    error.value = '获取文章列表失败: ' + e.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPosts()
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
