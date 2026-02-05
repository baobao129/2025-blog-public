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
    <div v-else class="space-y-12">
      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <TransitionGroup name="list">
          <div v-if="displayedPosts.length === 0" class="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <p class="text-text-muted text-lg">暂无文章，请前往管理后台发布。</p>
          </div>

          <article 
            v-for="(post, index) in displayedPosts" 
            :key="post.sha"
            class="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full overflow-hidden"
            :style="{ transitionDelay: `${index * 50}ms` }"
          >
            <!-- 封面图区域 -->
            <div class="h-48 overflow-hidden relative bg-gray-100">
               <!-- 如果有封面图，显示图片 -->
               <img 
                 v-if="post.cover" 
                 :src="post.cover" 
                 class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                 alt="Article Cover"
               >
               <!-- 否则显示渐变 -->
               <div v-else :class="['w-full h-full bg-gradient-to-br transition-transform duration-700 group-hover:scale-110', getRandomGradient(index)]"></div>
               
               <div v-if="!post.cover" class="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-10 transition-opacity">
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

              <!-- 摘要 -->
              <p class="text-text-muted mb-6 flex-grow line-clamp-3 leading-relaxed text-sm text-justify">
                {{ post.summary || `点击阅读关于 ${formatTitle(post.name)} 的详细内容。` }}
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

      <!-- 分页控件 -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-4 pt-8 border-t border-gray-100">
        <button 
          @click="changePage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="px-4 py-2 text-sm font-medium text-text-main bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          上一页
        </button>
        
        <div class="flex items-center gap-2">
          <button 
            v-for="page in totalPages" 
            :key="page"
            @click="changePage(page)"
            class="w-8 h-8 flex items-center justify-center text-sm font-medium rounded-lg transition-colors"
            :class="currentPage === page ? 'bg-primary text-white' : 'text-text-muted hover:bg-gray-100'"
          >
            {{ page }}
          </button>
        </div>

        <button 
          @click="changePage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="px-4 py-2 text-sm font-medium text-text-main bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
