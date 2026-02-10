<template>
  <div class="h-full flex flex-col">
    <!-- Header: 标题 & 搜索 -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 animate-fade-in-up">
      <div>
        <h1 class="text-3xl md:text-4xl font-serif font-bold text-primary dark:text-white tracking-tight mb-2">
          文章列表
        </h1>
        <p class="text-gray-500 dark:text-gray-400 font-sans text-sm">
          共 {{ filteredPosts.length }} 篇文章
        </p>
      </div>

      <!-- 搜索框 (Glassmorphism) -->
      <div class="relative w-full md:w-80 group">
        <div class="rounded-full overflow-hidden flex items-center px-4 py-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/20 bg-white/40 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg">
          <Search class="w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors flex-shrink-0" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="搜索标题、内容或标签..." 
            class="w-full bg-transparent border-none outline-none text-sm ml-2 text-gray-700 dark:text-gray-200 placeholder-gray-400 min-w-0"
          >
          <button v-if="searchQuery" @click="searchQuery = ''" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0">
            <X class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex-grow flex justify-center items-center">
      <div class="flex gap-2">
        <div class="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        <div class="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
        <div class="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="bg-red-50/50 dark:bg-red-900/20 backdrop-blur-md border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 p-6 rounded-xl text-center">
      <p class="font-medium">{{ error }}</p>
      <button @click="fetchPosts" class="mt-4 text-sm underline hover:text-red-800 dark:hover:text-red-300">重试</button>
    </div>

    <!-- 文章列表 (List View) -->
    <div v-else class="flex-grow flex flex-col min-h-0">
      <div class="flex-grow overflow-y-auto scrollbar-hide -mx-4 px-4 pb-20">
        <TransitionGroup name="list">
          <div v-if="paginatedPosts.length === 0" class="text-center py-20">
            <p class="text-gray-400 dark:text-gray-500">没有找到相关文章。</p>
          </div>

          <GlassCard 
            v-for="(post, index) in paginatedPosts" 
            :key="post.sha"
            variant="interactive"
            :hover="true"
            class="mb-4 rounded-xl group transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary"
            :style="{ transitionDelay: `${index * 30}ms` }"
            @click="router.push('/post/' + post.name)"
          >
            <div class="p-5 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <!-- 左侧信息: 日期 & 标签 -->
              <div class="w-full md:w-48 flex-shrink-0 flex md:flex-col items-center md:items-start justify-between gap-2 text-xs">
                <div class="flex items-center gap-2 text-gray-400 font-medium">
                  <Calendar class="w-3.5 h-3.5" />
                  <span>{{ new Date().toLocaleDateString('zh-CN') }}</span>
                </div>
                
                <div class="flex flex-wrap gap-1 mt-1">
                  <span 
                    v-for="tag in (post.tags || [])" 
                    :key="tag"
                    class="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    #{{ tag }}
                  </span>
                </div>
              </div>

              <!-- 中间: 标题 & 摘要 -->
              <div class="flex-grow min-w-0">
                <h2 class="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-primary transition-colors truncate">
                  {{ formatTitle(post.name) }}
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                  {{ post.summary }}
                </p>
              </div>

              <!-- 右侧: 箭头 -->
              <div class="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-2">
                <ArrowRight class="w-4 h-4" />
              </div>
            </div>
          </GlassCard>
        </TransitionGroup>
      </div>

      <!-- 分页控件 (底部固定) -->
      <div v-if="totalPages > 1" class="pt-6 border-t border-white/10 dark:border-white/5 flex justify-between items-center">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="text-sm font-medium text-gray-500 hover:text-primary disabled:opacity-30 disabled:hover:text-gray-500 transition-colors flex items-center gap-1"
        >
          <ChevronLeft class="w-4 h-4" /> 上一页
        </button>
        
        <span class="text-xs font-mono text-gray-400">
          {{ currentPage }} / {{ totalPages }}
        </span>

        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="text-sm font-medium text-gray-500 hover:text-primary disabled:opacity-30 disabled:hover:text-gray-500 transition-colors flex items-center gap-1"
        >
          下一页 <ChevronRight class="w-4 h-4" />
        </button>
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
import { Calendar, ArrowRight, Search, X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'

const router = useRouter()
const { getAuthToken } = useAuth()

// 状态
const allPosts = ref([]) 
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 10

// 过滤后的文章 (搜索)
const filteredPosts = computed(() => {
  if (!searchQuery.value) return allPosts.value
  
  const query = searchQuery.value.toLowerCase()
  return allPosts.value.filter(post => {
    const titleMatch = post.name.toLowerCase().includes(query)
    const summaryMatch = post.summary?.toLowerCase().includes(query)
    const tagMatch = post.tags?.some(tag => tag.toLowerCase().includes(query))
    return titleMatch || summaryMatch || tagMatch
  })
})

// 分页
const totalPages = computed(() => Math.ceil(filteredPosts.value.length / pageSize))
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredPosts.value.slice(start, start + pageSize)
})

// 监听搜索重置分页
watch(searchQuery, () => {
  currentPage.value = 1
})

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
      // ignore
    }

    const files = await getDirectoryContents(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, 'posts')
    const mdFiles = files.filter(f => f.name.endsWith('.md'))

    // 并行获取详情
    const postsWithDetails = await Promise.all(mdFiles.map(async (file) => {
      try {
        const rawContent = await getFileContent(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, file.path)
        const { data, content } = parseFrontmatter(rawContent)
        
        return {
          ...file,
          summary: content.slice(0, 100).replace(/[#*`]/g, '') + '...',
          tags: data.tags || [], // 自动提取 tags
          date: data.date // 如果有 date 字段
        }
      } catch (err) {
        return { ...file, summary: '暂无预览', tags: [] }
      }
    }))
    
    allPosts.value = postsWithDetails
    
  } catch (e) {
    console.error(e)
    error.value = '获取文章列表失败'
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
  animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 列表过渡动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
