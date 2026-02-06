<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex flex-col items-center py-20 space-y-4">
      <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p class="text-text-light text-sm animate-pulse">正在加载文章...</p>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="bg-red-50 border border-red-100 text-red-700 p-6 rounded-xl text-center my-12">
      {{ error }}
      <div class="mt-4">
        <router-link to="/" class="text-primary hover:text-accent underline transition-colors">返回首页</router-link>
      </div>
    </div>

    <div v-else class="animate-fade-in-up">
      <!-- 导航栏 -->
      <nav class="mb-8 flex items-center gap-2 text-sm text-text-light">
        <router-link to="/" class="hover:text-primary transition-colors">首页</router-link>
        <span>/</span>
        <span class="text-text-muted truncate">{{ route.params.filename.replace('.md', '') }}</span>
      </nav>

      <!-- 文章头部 -->
      <header class="mb-12 text-center max-w-3xl mx-auto">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full text-xs font-medium text-text-muted mb-6 border border-gray-100">
          <Calendar class="w-3 h-3" />
          <span>{{ new Date().toLocaleDateString('zh-CN') }}</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-serif font-bold text-primary mb-6 leading-tight">
          {{ formatTitle(route.params.filename) }}
        </h1>
        <div class="flex items-center justify-center gap-4 text-sm text-text-muted">
          <div class="flex items-center gap-1">
            <User class="w-4 h-4" />
            <span>作者</span>
          </div>
          <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
          <div class="flex items-center gap-1">
            <Clock class="w-4 h-4" />
            <span>约 {{ readingTime }} 分钟阅读</span>
          </div>
        </div>
      </header>

      <div class="flex flex-col lg:flex-row gap-12 relative">
        <!-- 文章内容 -->
        <article class="prose prose-lg prose-zinc flex-1 min-w-0 max-w-none prose-headings:scroll-mt-24">
          <div v-html="contentHtml" ref="articleRef"></div>
        </article>

        <!-- 侧边目录 (Desktop) -->
        <aside class="hidden lg:block w-64 flex-shrink-0">
          <div class="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4">
            <h3 class="font-serif font-bold text-primary mb-4 text-lg">目录</h3>
            <nav v-if="toc.length > 0">
              <ul class="space-y-2 text-sm border-l border-gray-200">
                <li v-for="item in toc" :key="item.id" :class="{ 'pl-3': item.level === 2, 'pl-6': item.level === 3 }">
                  <a 
                    :href="`#${item.id}`" 
                    @click.prevent="scrollToHeading(item.id)"
                    class="block py-1 text-text-muted hover:text-accent transition-colors border-l-2 border-transparent -ml-[1px] pl-3 hover:border-accent"
                    :class="{ 'text-accent border-accent font-medium': activeId === item.id }"
                  >
                    {{ item.text }}
                  </a>
                </li>
              </ul>
            </nav>
            <p v-else class="text-text-light text-sm italic">暂无目录</p>
          </div>
        </aside>
      </div>

      <!-- 底部导航 -->
      <div class="border-t border-gray-100 pt-12 mt-12 flex justify-between max-w-3xl mx-auto lg:max-w-none">
        <router-link to="/" class="group flex items-center gap-2 text-text-muted hover:text-primary transition-colors">
          <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>返回首页</span>
        </router-link>
        <button 
          @click="scrollToTop" 
          class="text-text-muted hover:text-primary transition-colors"
        >
          回到顶部 &uarr;
        </button>
      </div>

      <!-- 代码演练场入口 -->
      <div class="fixed bottom-8 right-8 z-40">
        <button
          @click="showPlayground = true"
          class="p-4 bg-primary text-white rounded-full shadow-lg shadow-primary/30 hover:bg-primary-hover hover:-translate-y-1 transition-all flex items-center gap-2 group"
          title="打开代码演练场"
        >
          <Code2 class="w-6 h-6" />
          <span class="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">代码演练场</span>
        </button>
      </div>

      <CodePlayground 
        :show="showPlayground" 
        @close="showPlayground = false" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import { getFileContent } from '@/utils/github-client'
import { parseFrontmatter } from '@/utils/frontmatter'
import { useAuth } from '@/composables/useAuth'
import { GITHUB_CONFIG } from '@/consts'
import { Calendar, Clock, User, ArrowLeft, Code2 } from 'lucide-vue-next'
import CodePlayground from '@/components/CodePlayground.vue'

const route = useRoute()
const { getAuthToken } = useAuth()
const loading = ref(true)
const error = ref(null)
const contentHtml = ref('')
const readingTime = ref(1)
const articleRef = ref(null)
const toc = ref([])
const activeId = ref('')
const showPlayground = ref(false)

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
</style>
