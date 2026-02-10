<template>
  <div class="space-y-16">
    <!-- Hero 区域 -->
    <header class="py-24 md:py-40 text-center space-y-8 animate-fade-in-up relative overflow-hidden rounded-3xl">
      <GlassCard variant="default" class="absolute inset-0 -z-10 rounded-3xl" :hover="false"></GlassCard>
      
      <div class="relative z-10 px-4">
        <span class="inline-block py-1.5 px-4 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/20 text-xs font-bold tracking-widest text-primary/80 dark:text-white/80 mb-8 shadow-sm uppercase">
          Insights & Thoughts
        </span>
        <h1 class="text-5xl md:text-8xl font-serif font-bold text-primary dark:text-white tracking-tight mb-8 leading-tight drop-shadow-sm">
          思绪 <span class="text-accent italic font-light px-2 relative inline-block">
            &
            <span class="absolute -top-2 -right-4 text-3xl animate-bounce delay-700">✨</span>
          </span> 随笔
        </h1>
        <p class="text-lg md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-sans tracking-wide font-light">
          探索技术的边界，记录设计的灵感，分享生活的<span class="text-primary dark:text-white font-medium border-b-2 border-accent/40 pb-0.5">点滴瞬间</span>。
        </p>
      </div>
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
    <div v-else-if="error" class="bg-red-50/50 dark:bg-red-900/20 backdrop-blur-md border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 p-6 rounded-xl text-center">
      <p class="font-medium">{{ error }}</p>
      <button @click="fetchPosts" class="mt-4 text-sm underline hover:text-red-800 dark:hover:text-red-300">重试</button>
    </div>

    <!-- 文章列表 -->
    <div v-else class="space-y-12">
      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <TransitionGroup name="list">
          <div v-if="displayedPosts.length === 0" class="col-span-full text-center py-20">
            <GlassCard variant="light" class="p-10">
              <p class="text-gray-500 dark:text-gray-400 text-lg">暂无文章，请前往管理后台发布。</p>
            </GlassCard>
          </div>

          <GlassCard 
            v-for="(post, index) in displayedPosts" 
            :key="post.sha"
            variant="default"
            :hover="true"
            :shine="true"
            class="rounded-2xl h-full flex flex-col group cursor-pointer"
            :style="{ transitionDelay: `${index * 50}ms` }"
            @click="router.push('/post/' + post.name)"
          >
            <!-- 封面图区域 -->
            <div class="aspect-[16/10] overflow-hidden relative border-b border-white/10">
               <!-- 图片 -->
               <img 
                 v-if="post.cover" 
                 :src="post.cover" 
                 class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                 alt="Article Cover"
                 loading="lazy"
               >
               <!-- 渐变占位 -->
               <div v-else :class="['w-full h-full bg-gradient-to-br transition-transform duration-700 group-hover:scale-105 opacity-80 dark:opacity-60', getRandomGradient(index)]"></div>
               
               <div v-if="!post.cover" class="absolute inset-0 flex items-center justify-center">
                 <span class="text-6xl font-serif text-white/40 font-bold select-none">{{ post.name.charAt(0).toUpperCase() }}</span>
               </div>
            </div>

            <div class="p-6 md:p-8 flex flex-col flex-grow relative">
              <!-- 日期标签 -->
              <div class="flex items-center gap-2 mb-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                <Calendar class="w-3.5 h-3.5" />
                <span>{{ new Date().toLocaleDateString('zh-CN') }}</span>
              </div>

              <!-- 标题 -->
              <h2 class="text-xl md:text-2xl font-serif font-bold text-gray-900 dark:text-white mb-3 group-hover:text-accent transition-colors line-clamp-2 leading-tight">
                {{ formatTitle(post.name) }}
              </h2>

              <!-- 摘要 -->
              <p class="text-gray-600 dark:text-gray-300 mb-6 flex-grow line-clamp-3 leading-relaxed text-sm font-light">
                {{ post.summary || `点击阅读关于 ${formatTitle(post.name)} 的详细内容。` }}
              </p>

              <!-- 底部链接 -->
              <div class="flex items-center text-primary dark:text-white font-semibold text-sm group/link mt-auto">
                <span class="relative z-20 border-b-2 border-transparent group-hover/link:border-accent transition-all pb-0.5">阅读全文</span>
                <ArrowRight class="w-4 h-4 ml-2 transition-transform duration-300 group-hover/link:translate-x-1 text-accent" />
              </div>
            </div>
          </GlassCard>
        </TransitionGroup>
      </div>

      <!-- 分页控件 -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-4 pt-12">
        <GlassCard 
          variant="interactive"
          class="px-5 py-2.5 text-sm font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          @click="changePage(currentPage - 1)" 
          :class="{ 'opacity-50 pointer-events-none': currentPage === 1 }"
        >
          上一页
        </GlassCard>
        
        <div class="flex items-center gap-2">
          <button 
            v-for="page in totalPages" 
            :key="page"
            @click="changePage(page)"
            class="w-10 h-10 flex items-center justify-center text-sm font-bold rounded-full transition-all duration-300 backdrop-blur-sm"
            :class="currentPage === page 
              ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' 
              : 'bg-white/20 dark:bg-black/20 text-gray-600 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/10'"
          >
            {{ page }}
          </button>
        </div>

        <GlassCard 
          variant="interactive"
          class="px-5 py-2.5 text-sm font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          @click="changePage(currentPage + 1)" 
          :class="{ 'opacity-50 pointer-events-none': currentPage === totalPages }"
        >
          下一页
        </GlassCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getDirectoryContents, getFileContent } from '@/utils/github-client'
import { parseFrontmatter } from '@/utils/frontmatter'
import { useAuth } from '@/composables/useAuth'
import { GITHUB_CONFIG } from '@/consts'
import { Calendar, ArrowRight } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'

const router = useRouter()
const { getAuthToken } = useAuth()

// 状态
const allPosts = ref([]) // 所有文章文件列表
const displayedPosts = ref([]) // 当前页显示的文章（包含详情）
const loading = ref(true)
const error = ref(null)

// 分页
const currentPage = ref(1)
const pageSize = 6
const totalPages = computed(() => Math.ceil(allPosts.value.length / pageSize))

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

// 获取当前页的详细内容（封面图等）
const loadPageContent = async () => {
  loading.value = true
  try {
    const start = (currentPage.value - 1) * pageSize
    const end = start + pageSize
    const pageFiles = allPosts.value.slice(start, end)
    
    let token = null
    try {
      token = await getAuthToken()
    } catch (e) {
      // ignore
    }

    // 并行获取当前页所有文章的内容以提取 Frontmatter
    const postsWithContent = await Promise.all(pageFiles.map(async (file) => {
      try {
        const rawContent = await getFileContent(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, file.path)
        const { data, content } = parseFrontmatter(rawContent)
        
        // 提取摘要 (取前 100 个字符)
        const summary = content.slice(0, 150).replace(/[#*`]/g, '') + '...'
        
        return {
          ...file,
          cover: data.cover,
          summary: summary
        }
      } catch (err) {
        console.error(`Failed to load content for ${file.name}`, err)
        return file
      }
    }))
    
    displayedPosts.value = postsWithContent
  } catch (err) {
    console.error(err)
    error.value = '加载文章详情失败'
  } finally {
    loading.value = false
  }
}

// 切换分页
const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadPageContent()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
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
    // 过滤并按名称排序（或者按时间，如果 API 提供的话，但 GitHub Contents API 不提供修改时间，需要 Commit API，这里简单按文件名）
    allPosts.value = files.filter(f => f.name.endsWith('.md'))
    
    // 加载第一页
    await loadPageContent()
    
  } catch (e) {
    console.error(e)
    error.value = '获取文章列表失败: ' + e.message
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
