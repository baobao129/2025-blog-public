<template>
  <div class="relative min-h-screen">
    <!-- 进度指示器 (右侧像素条) -->
    <div class="fixed top-0 right-0 h-full w-1 z-50 bg-[#111]">
      <div 
        class="bg-[#CCFF00] w-full transition-all duration-100 ease-out"
        :style="{ height: `${scrollProgress}%` }"
      ></div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-screen">
      <TypewriterText text="LOADING_DATA_STREAM..." :speed="50" class="text-[#CCFF00] font-mono" />
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="min-h-screen flex items-center justify-center">
      <div class="border border-red-500 p-8 text-red-500 font-mono text-center max-w-lg">
        <p class="mb-4">FATAL_ERROR: {{ error }}</p>
        <router-link to="/" class="cb-btn inline-block">RETURN_HOME</router-link>
      </div>
    </div>

    <div v-else class="flex flex-col lg:flex-row min-h-screen">
      <!-- 左侧：元数据栏 (IDE 风格) -->
      <aside class="hidden lg:flex flex-col w-64 border-r border-[#222] fixed h-screen overflow-y-auto bg-[#050505] z-40">
        <div class="p-6 border-b border-[#222]">
          <router-link to="/" class="text-[#CCFF00] font-mono text-sm hover:underline">&lt; CD ..</router-link>
        </div>
        
        <div class="p-6 space-y-8 font-mono text-xs text-[#888]">
          <div>
            <h3 class="text-white mb-2 uppercase">Meta_Data</h3>
            <ul class="space-y-2">
              <li class="flex justify-between">
                <span>DATE:</span>
                <span class="text-white">{{ new Date().toLocaleDateString() }}</span>
              </li>
              <li class="flex justify-between">
                <span>AUTHOR:</span>
                <span class="text-white">SYS_ADMIN</span>
              </li>
              <li class="flex justify-between">
                <span>READ_TIME:</span>
                <span class="text-white">{{ readingTime }} MIN</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-white mb-2 uppercase">Table_Of_Contents</h3>
            <ul class="space-y-1 relative border-l border-[#222] ml-1">
              <li v-for="item in toc" :key="item.id" class="pl-4 relative">
                <!-- 连接线 -->
                <div 
                  class="absolute left-0 top-1/2 w-3 h-px bg-[#222] transition-colors duration-200"
                  :class="{ 'bg-[#CCFF00]': activeId === item.id }"
                ></div>
                <a 
                  :href="`#${item.id}`" 
                  @click.prevent="scrollToHeading(item.id)"
                  class="block py-1 hover:text-[#CCFF00] transition-colors truncate"
                  :class="{ 'text-[#CCFF00] font-bold': activeId === item.id }"
                >
                  {{ item.text }}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-auto p-6 border-t border-[#222]">
          <button 
            @click="router.push(`/playground/${route.params.filename}`)"
            class="w-full py-2 border border-[#CCFF00] text-[#CCFF00] text-xs font-bold hover:bg-[#CCFF00] hover:text-black transition-colors"
          >
            OPEN_TERMINAL_MODE
          </button>
        </div>
      </aside>

      <!-- 中间：正文区域 -->
      <main class="lg:ml-64 flex-1 w-full min-w-0 bg-[#050505] relative">
        <!-- 移动端导航 -->
        <nav class="lg:hidden sticky top-0 z-40 bg-[#050505]/90 backdrop-blur border-b border-[#222] p-4 flex justify-between items-center">
          <router-link to="/" class="text-[#CCFF00] font-mono text-sm">&lt; HOME</router-link>
          <span class="font-mono text-xs text-[#888] truncate max-w-[150px]">{{ formatTitle(route.params.filename) }}</span>
        </nav>

        <div class="max-w-4xl mx-auto px-6 py-12 lg:py-20">
          <header class="mb-16 border-b border-[#222] pb-8">
            <h1 class="text-4xl md:text-6xl font-['Space_Mono'] font-bold text-white mb-6 leading-tight uppercase">
              {{ formatTitle(route.params.filename) }}
            </h1>
            <div class="flex flex-wrap gap-4 font-mono text-xs text-[#CCFF00]">
              <span class="border border-[#222] px-2 py-1">ID: {{ route.params.filename }}</span>
              <span class="border border-[#222] px-2 py-1">STATUS: PUBLISHED</span>
            </div>
          </header>

          <article class="prose prose-invert prose-lg max-w-none prose-p:font-mono prose-headings:font-['Space_Mono'] prose-headings:uppercase prose-pre:bg-[#111] prose-pre:border prose-pre:border-[#222] prose-a:text-[#CCFF00] prose-blockquote:border-l-[#CCFF00] prose-img:border prose-img:border-[#222]">
            <div v-html="contentHtml" ref="articleRef"></div>
          </article>

          <!-- 底部导航 -->
          <div class="mt-20 pt-8 border-t border-[#222] flex justify-between items-center font-mono text-sm">
            <router-link to="/" class="hover:text-[#CCFF00] transition-colors">
              &lt; RETURN_TO_ROOT
            </router-link>
            <button @click="scrollToTop" class="hover:text-[#CCFF00] transition-colors">
              SCROLL_TO_TOP ^
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css' // 可以考虑换一个更极客的主题
import { getFileContent } from '@/utils/github-client'
import { parseFrontmatter } from '@/utils/frontmatter'
import { useAuth } from '@/composables/useAuth'
import { GITHUB_CONFIG } from '@/consts'
import { useWindowScroll } from '@vueuse/core'
import TypewriterText from '@/components/TypewriterText.vue'

const route = useRoute()
const router = useRouter()
const { getAuthToken } = useAuth()
const { y } = useWindowScroll()

const loading = ref(true)
const error = ref(null)
const contentHtml = ref('')
const readingTime = ref(1)
const articleRef = ref(null)
const toc = ref([])
const activeId = ref('')
const scrollProgress = ref(0)

// 滚动进度监听
import { watch } from 'vue'
watch(y, () => {
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
  if (docHeight > 0) {
    scrollProgress.value = Math.min(100, Math.max(0, (y.value / docHeight) * 100))
  }
  handleScroll()
})

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

// 滚动监听 (Active TOC)
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
      console.log('GUEST_MODE')
    }

    const rawContent = await getFileContent(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, `posts/${filename}`)
    const { content } = parseFrontmatter(rawContent)
    readingTime.value = calculateReadingTime(content)
    
    const rawHtml = marked.parse(content)
    contentHtml.value = processContent(rawHtml)
    
  } catch (e) {
    console.error(e)
    error.value = 'DATA_CORRUPTED: ' + e.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPost()
})
</script>
