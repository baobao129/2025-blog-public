<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <ReadingProgress />
    <!-- 加载状态 -->
    <div v-if="loading" class="flex flex-col items-center py-20 space-y-4">
      <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p class="text-gray-500 dark:text-gray-400 text-sm animate-pulse">正在加载文章...</p>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 p-6 rounded-xl text-center my-12">
      {{ error }}
      <div class="mt-4">
        <router-link to="/" class="text-primary hover:text-accent dark:hover:text-white underline transition-colors">返回首页</router-link>
      </div>
    </div>

    <div v-else class="animate-fade-in-up relative z-10">
      <!-- 导航栏 -->
      <nav class="mb-8 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <router-link to="/" class="hover:text-primary dark:hover:text-white transition-colors">首页</router-link>
        <span>/</span>
        <span class="text-gray-400 dark:text-gray-500 truncate">{{ route.params.filename.replace('.md', '') }}</span>
      </nav>

      <!-- 文章头部 (Glassmorphism) -->
      <header class="mb-12 text-center max-w-4xl mx-auto">
        <GlassCard variant="default" class="p-8 md:p-12 rounded-3xl relative overflow-hidden">
          <!-- 装饰 -->
          <div class="absolute -top-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>

          <div class="relative z-10">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-full text-xs font-bold text-gray-500 dark:text-gray-400 mb-6 border border-white/20 uppercase tracking-widest">
              <Calendar class="w-3 h-3" />
              <span>{{ new Date().toLocaleDateString('zh-CN') }}</span>
            </div>
            <h1 class="text-4xl md:text-6xl font-serif font-bold text-gray-900 dark:text-white mb-8 leading-tight drop-shadow-sm">
              {{ formatTitle(route.params.filename) }}
            </h1>
            <div class="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-300">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-gray-700 flex items-center justify-center text-white shadow-sm">
                  <User class="w-4 h-4" />
                </div>
                <span class="font-medium">作者</span>
              </div>
              <div class="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div class="flex items-center gap-2">
                <Clock class="w-4 h-4 text-accent" />
                <span>约 {{ readingTime }} 分钟阅读</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </header>

      <div class="flex flex-col lg:flex-row gap-8 relative">
        <!-- 文章内容 (Glassmorphism) -->
        <div class="flex-1 min-w-0">
          <GlassCard variant="heavy" class="p-8 md:p-12 rounded-3xl">
            <article class="prose prose-lg prose-zinc dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-img:rounded-2xl prose-img:shadow-lg prose-pre:bg-gray-900/90 prose-pre:backdrop-blur-sm">
              <div v-html="contentHtml" ref="articleRef"></div>
            </article>
          </GlassCard>
        </div>

        <!-- 侧边目录 (Desktop) -->
        <aside class="hidden lg:block w-72 flex-shrink-0">
          <div class="sticky top-24">
            <GlassCard variant="default" class="p-6 rounded-2xl max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-hide">
              <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <h3 class="font-serif font-bold text-gray-900 dark:text-white text-lg">目录</h3>
                <button 
                  @click="router.push(`/playground/${route.params.filename}`)"
                  class="text-xs flex items-center gap-1 px-2.5 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-300 rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-all font-medium"
                  title="开启沉浸式代码演练"
                >
                  <Code2 class="w-3.5 h-3.5" />
                  演练
                </button>
              </div>
              <nav v-if="toc.length > 0">
                  <ul class="space-y-1 text-sm">
                    <li v-for="item in toc" :key="item.id" :class="{ 'pl-3': item.level === 2, 'pl-6': item.level === 3 }">
                      <a 
                        :href="`#${item.id}`" 
                        @click.prevent="scrollToHeading(item.id)"
                        class="block py-1.5 px-3 rounded-lg transition-all duration-300 border-l-2"
                        :class="activeId === item.id 
                          ? 'bg-primary/5 dark:bg-white/10 text-primary dark:text-white border-primary font-medium translate-x-1' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border-transparent hover:bg-black/5 dark:hover:bg-white/5'"
                      >
                        {{ item.text }}
                      </a>
                    </li>
                  </ul>
              </nav>
              <p v-else class="text-gray-400 dark:text-gray-500 text-sm italic text-center py-4">暂无目录</p>
            </GlassCard>
          </div>
        </aside>
      </div>

      <!-- 底部导航 -->
      <div class="mt-12 flex justify-between max-w-4xl mx-auto lg:max-w-none">
        <button @click="router.push('/')" class="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/40 dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-sm transition-all text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white">
          <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>返回首页</span>
        </button>
        <button 
          @click="scrollToTop" 
          class="px-4 py-2 rounded-full bg-white/20 hover:bg-white/40 dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-sm transition-all text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white"
        >
          回到顶部 &uarr;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'
import { getFileContent } from '@/utils/github-client'
import { parseFrontmatter } from '@/utils/frontmatter'
import { useAuth } from '@/composables/useAuth'
import { GITHUB_CONFIG } from '@/consts'
import { Calendar, Clock, User, ArrowLeft, Code2 } from 'lucide-vue-next'
import ReadingProgress from '@/components/ReadingProgress.vue'
import GlassCard from '@/components/GlassCard.vue'

const route = useRoute()
const router = useRouter()
const { getAuthToken } = useAuth()
const loading = ref(true)
const error = ref(null)
const contentHtml = ref('')
const readingTime = ref(1)
const articleRef = ref(null)
const toc = ref([])
const activeId = ref('')

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 配置 marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  langPrefix: 'hljs language-',
  breaks: true,
  gfm: true
})

const formatTitle = (filename) => {
  if (!filename) return ''
  return filename.replace(/\.md$/, '').replace(/-/g, ' ')
}

const calculateReadingTime = (text) => {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// 生成 TOC 并处理 ID
const processContent = (html) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const headings = doc.querySelectorAll('h2, h3')
  const newToc = []
  
  headings.forEach((heading, index) => {
    const id = `heading-${index}`
    heading.id = id
    newToc.push({
      id,
      text: heading.textContent,
      level: parseInt(heading.tagName.charAt(1))
    })
  })
  
  toc.value = newToc
  return doc.body.innerHTML
}

const scrollToHeading = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    activeId.value = id
  }
}

// 滚动监听
const handleScroll = () => {
  const headings = document.querySelectorAll('h2, h3')
  if (headings.length === 0) return

  let currentId = ''
  for (const heading of headings) {
    const rect = heading.getBoundingClientRect()
    if (rect.top >= 0 && rect.top <= 200) {
      currentId = heading.id
      break
    } else if (rect.top < 0) {
      currentId = heading.id
    }
  }
  
  if (currentId) {
    activeId.value = currentId
  }
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

    const rawContent = await getFileContent(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, `posts/${filename}`)
    const { content } = parseFrontmatter(rawContent)
    readingTime.value = calculateReadingTime(content)
    
    const rawHtml = marked.parse(content)
    contentHtml.value = processContent(rawHtml)
    
    // 等待 DOM 更新后绑定事件
    nextTick(() => {
      window.addEventListener('scroll', handleScroll)
      handleScroll() // 初始化高亮
    })

  } catch (e) {
    console.error(e)
    error.value = '无法加载文章: ' + e.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPost()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
