<template>
  <div class="space-y-16">
    <!-- Hero 区域 -->
    <header class="py-20 md:py-32 text-center space-y-8 animate-fade-in-up relative overflow-hidden rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
      <!-- 装饰背景 -->
      <div class="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-60 dark:opacity-20"></div>
      <div class="absolute -top-24 -left-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-normal animate-blob"></div>
      <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-normal animate-blob animation-delay-2000"></div>
      
      <div class="relative z-10 px-4">
        <span class="inline-block py-1 px-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold tracking-wider text-primary mb-6 shadow-sm">
          INSIGHTS & THOUGHTS
        </span>
        <h1 class="text-5xl md:text-7xl font-serif font-bold text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
          思绪 <span class="text-accent italic font-light px-2">&</span> 随笔
        </h1>
        <p class="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-sans tracking-wide">
          探索技术的边界，记录设计的灵感，分享生活的<span class="text-primary font-medium border-b-2 border-primary/20 dark:border-primary/40 pb-0.5">点滴瞬间</span>。
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
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 p-6 rounded-xl text-center">
      <p class="font-medium">{{ error }}</p>
      <button @click="fetchPosts" class="mt-4 text-sm underline hover:text-red-800 dark:hover:text-red-300">重试</button>
    </div>

    <!-- 文章列表 -->
    <div v-else class="space-y-12">
      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <TransitionGroup name="list">
          <div v-if="displayedPosts.length === 0" class="col-span-full text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            <p class="text-gray-500 dark:text-gray-400 text-lg">暂无文章，请前往管理后台发布。</p>
          </div>

          <article 
            v-for="(post, index) in displayedPosts" 
            :key="post.sha"
            class="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-gray-900/50 flex flex-col h-full"
            :style="{ transitionDelay: `${index * 50}ms` }"
          >
            <!-- 封面图区域 -->
            <div class="aspect-[16/10] overflow-hidden relative bg-gray-100 dark:bg-gray-800">
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
               
               <!-- 悬浮遮罩 -->
               <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
            </div>

            <div class="p-6 md:p-8 flex flex-col flex-grow relative">
              <!-- 日期标签 -->
              <div class="flex items-center gap-2 mb-4 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                <Calendar class="w-3.5 h-3.5" />
                <span>{{ new Date().toLocaleDateString('zh-CN') }}</span>
              </div>

              <!-- 标题 -->
              <h2 class="text-xl md:text-2xl font-serif font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                <router-link :to="'/post/' + post.name" class="block focus:outline-none">
                  <span class="absolute inset-0 z-10"></span>
                  {{ formatTitle(post.name) }}
                </router-link>
              </h2>

              <!-- 摘要 -->
              <p class="text-gray-600 dark:text-gray-400 mb-6 flex-grow line-clamp-3 leading-relaxed text-sm">
                {{ post.summary || `点击阅读关于 ${formatTitle(post.name)} 的详细内容。` }}
              </p>

              <!-- 底部链接 -->
              <div class="flex items-center text-primary font-semibold text-sm group/link mt-auto">
                <span class="relative z-20">阅读全文</span>
                <ArrowRight class="w-4 h-4 ml-1 transition-transform duration-300 group-hover/link:translate-x-1" />
              </div>
            </div>
          </article>
        </TransitionGroup>
      </div>

      <!-- 分页控件 -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-4 pt-12 border-t border-gray-100 dark:border-gray-800">
        <button 
          @click="changePage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
        >
          上一页
        </button>
        
        <div class="flex items-center gap-2">
          <button 
            v-for="page in totalPages" 
            :key="page"
            @click="changePage(page)"
            class="w-9 h-9 flex items-center justify-center text-sm font-medium rounded-full transition-all"
            :class="currentPage === page 
              ? 'bg-primary text-white shadow-md shadow-primary/30 scale-110' 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'"
          >
            {{ page }}
          </button>
        </div>

        <button 
          @click="changePage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { getDirectoryContents, getFileContent } from '@/utils/github-client'
import { parseFrontmatter } from '@/utils/frontmatter'
import { useAuth } from '@/composables/useAuth'
import { GITHUB_CONFIG } from '@/consts'
import { Calendar, ArrowRight } from 'lucide-vue-next'

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
