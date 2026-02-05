<template>
  <div class="space-y-16">
    <!-- Hero 区域 -->
    <header class="py-20 text-center space-y-8 animate-fade-in-up relative">
      <!-- 装饰背景 -->
      <div class="absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-white/50 pointer-events-none"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 opacity-60"></div>
      
      <h1 class="text-6xl md:text-7xl font-serif font-bold text-primary tracking-tight relative inline-block">
        思绪 <span class="text-accent italic font-light">&</span> 随笔
        <span class="absolute -top-4 -right-8 text-2xl animate-bounce delay-700">✨</span>
      </h1>
      <p class="text-xl md:text-2xl text-text-muted max-w-2xl mx-auto leading-relaxed font-serif tracking-wide">
        记录技术、设计与生活中的<span class="text-primary font-medium border-b-2 border-accent/30">点滴灵感</span>。
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
          class="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full overflow-hidden"
          :style="{ transitionDelay: `${index * 50}ms` }"
        >
          <!-- 封面图区域 (如果没有图片则显示渐变) -->
          <div class="h-48 overflow-hidden relative bg-gray-100">
             <div :class="['w-full h-full bg-gradient-to-br transition-transform duration-700 group-hover:scale-110', getRandomGradient(index)]"></div>
             <div class="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-10 transition-opacity">
               <span class="text-6xl font-serif text-white font-bold select-none">{{ post.name.charAt(0).toUpperCase() }}</span>
             </div>
             <!-- 类型标签 -->
             <div class="absolute top-4 left-4">
                <span class="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold text-primary rounded-full shadow-sm tracking-wider">
                  ARTICLE
                </span>
             </div>
          </div>

          <div class="p-8 flex flex-col flex-grow">
            <!-- 标题 -->
            <h2 class="text-2xl font-serif font-bold text-primary mb-4 group-hover:text-accent transition-colors line-clamp-2 leading-tight">
              <router-link :to="'/post/' + post.name" class="block">
                {{ formatTitle(post.name) }}
              </router-link>
            </h2>

            <!-- 摘要 (模拟) -->
            <p class="text-text-muted mb-6 flex-grow line-clamp-3 leading-relaxed text-sm text-justify">
              点击阅读关于 {{ formatTitle(post.name) }} 的详细内容。这里是文章摘要占位符，未来可以从 Markdown 文件中提取前言作为摘要。
            </p>

            <!-- 底部元数据 -->
            <div class="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
              <div class="flex items-center gap-2 text-xs font-medium text-text-light uppercase tracking-wider">
                <Calendar class="w-3 h-3" />
                <span>{{ new Date().toLocaleDateString('zh-CN') }}</span>
              </div>
              <router-link 
                :to="'/post/' + post.name" 
                class="inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:gap-2 transition-all"
              >
                阅读全文 <ArrowRight class="w-4 h-4" />
              </router-link>
            </div>
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

// 随机渐变色生成
const gradients = [
  'from-rose-100 to-teal-100',
  'from-blue-100 to-indigo-100',
  'from-orange-100 to-rose-100',
  'from-green-100 to-emerald-100',
  'from-violet-100 to-fuchsia-100',
  'from-yellow-100 to-amber-100',
]

const getRandomGradient = (index) => {
  return gradients[index % gradients.length]
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
