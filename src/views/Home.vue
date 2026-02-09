<template>
  <div class="relative min-h-screen">
    <!-- 背景网格 -->
    <div class="fixed inset-0 z-0 opacity-20 pointer-events-none" 
         style="background-image: linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px); background-size: 40px 40px;">
    </div>

    <!-- Hero 区域 -->
    <header class="relative z-10 py-20 px-6 md:px-12 border-b border-[#222]">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div class="space-y-4">
            <h1 class="text-6xl md:text-9xl font-['Space_Mono'] font-bold text-transparent text-stroke tracking-tighter leading-none select-none">
              DIGITAL<br>
              <span class="text-[#CCFF00] text-stroke-0 glitch-text" data-text="GARDEN">GARDEN</span>
            </h1>
            <TypewriterText text="/// SYSTEM_READY: LOADING_THOUGHTS..." :speed="50" class="text-[#888] font-mono text-sm" />
          </div>
          
          <div class="max-w-sm text-[#888] font-mono text-xs md:text-sm leading-relaxed border-l-2 border-[#CCFF00] pl-4">
            <p>探索技术的边界，记录设计的灵感。</p>
            <p>EXPLORING THE BOUNDARIES OF TECHNOLOGY.</p>
            <p class="mt-4 text-[#CCFF00]">>_ INITIALIZING...</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Marquee -->
    <Marquee text="LATEST_ARTICLES /// CREATIVE_CODING /// VUE_JS /// DESIGN_SYSTEMS" />

    <!-- 文章列表 (Bento Grid) -->
    <div class="relative z-10 max-w-7xl mx-auto px-6 py-20">
      <!-- 加载状态 -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
        <div v-for="i in 6" :key="i" class="aspect-square bg-[#111] animate-pulse border border-[#222]"></div>
      </div>

      <!-- 错误提示 -->
      <div v-else-if="error" class="border border-red-500 p-8 text-red-500 font-mono text-center">
        <p>ERROR: {{ error }}</p>
        <button @click="fetchPosts" class="mt-4 cb-btn">RETRY_CONNECTION</button>
      </div>

      <!-- 网格布局 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#222] border border-[#222]">
        <article 
          v-for="(post, index) in displayedPosts" 
          :key="post.sha"
          class="group relative bg-[#050505] aspect-square overflow-hidden hover:z-10 transition-all duration-0"
          :class="{ 'md:col-span-2 md:aspect-[2/1]': index === 0 }"
        >
          <!-- 图片层 -->
          <div class="absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-0">
            <GlitchImage 
              v-if="post.cover" 
              :src="post.cover" 
              :alt="post.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-[#111] flex items-center justify-center">
              <span class="text-9xl font-['Space_Mono'] font-bold text-[#222] group-hover:text-[#CCFF00] transition-colors">
                {{ post.name.charAt(0) }}
              </span>
            </div>
          </div>

          <!-- 内容层 -->
          <div class="absolute inset-0 p-6 flex flex-col justify-between z-20 mix-blend-difference pointer-events-none">
            <div class="flex justify-between items-start">
              <span class="font-mono text-xs text-[#CCFF00]">0{{ index + 1 }}</span>
              <span class="font-mono text-xs border border-[#CCFF00] px-2 py-0.5 rounded-full">{{ new Date().toLocaleDateString() }}</span>
            </div>
            
            <div>
              <h2 class="text-2xl md:text-4xl font-bold uppercase leading-none mb-2 group-hover:translate-x-2 transition-transform duration-0">
                {{ formatTitle(post.name) }}
              </h2>
              <div class="h-px w-0 group-hover:w-full bg-[#CCFF00] transition-all duration-300"></div>
            </div>
          </div>

          <!-- 交互遮罩 -->
          <router-link 
            :to="'/post/' + post.name" 
            class="absolute inset-0 z-30 bg-transparent hover:bg-[#CCFF00]/10 transition-colors duration-0 cursor-none"
          ></router-link>
        </article>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="flex justify-between items-center mt-12 border-t border-[#222] pt-8 font-mono">
        <button 
          @click="changePage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="hover:text-[#CCFF00] disabled:opacity-30 disabled:hover:text-current"
        >
          &lt; PREV
        </button>
        <span class="text-[#CCFF00]">PAGE {{ currentPage }} / {{ totalPages }}</span>
        <button 
          @click="changePage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="hover:text-[#CCFF00] disabled:opacity-30 disabled:hover:text-current"
        >
          NEXT &gt;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getDirectoryContents, getFileContent } from '@/utils/github-client'
import { parseFrontmatter } from '@/utils/frontmatter'
import { useAuth } from '@/composables/useAuth'
import { GITHUB_CONFIG } from '@/consts'
import GlitchImage from '@/components/GlitchImage.vue'
import TypewriterText from '@/components/TypewriterText.vue'
import Marquee from '@/components/Marquee.vue'

const { getAuthToken } = useAuth()

// 状态
const allPosts = ref([])
const displayedPosts = ref([])
const loading = ref(true)
const error = ref(null)

// 分页
const currentPage = ref(1)
const pageSize = 7 // Bento grid layout works best with 7 items (1 large + 6 small)
const totalPages = computed(() => Math.ceil(allPosts.value.length / pageSize))

const formatTitle = (filename) => {
  return filename.replace(/\.md$/, '').replace(/-/g, ' ')
}

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

    const postsWithContent = await Promise.all(pageFiles.map(async (file) => {
      try {
        const rawContent = await getFileContent(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, file.path)
        const { data } = parseFrontmatter(rawContent)
        return {
          ...file,
          cover: data.cover
        }
      } catch (err) {
        return file
      }
    }))
    
    displayedPosts.value = postsWithContent
  } catch (err) {
    error.value = 'SYSTEM_FAILURE'
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadPageContent()
  window.scrollTo({ top: 0, behavior: 'auto' })
}

const fetchPosts = async () => {
  try {
    loading.value = true
    error.value = null
    
    let token = null
    try {
      token = await getAuthToken()
    } catch (e) {
      console.log('GUEST_MODE_ACTIVE')
    }

    const files = await getDirectoryContents(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, 'posts')
    allPosts.value = files.filter(f => f.name.endsWith('.md'))
    await loadPageContent()
    
  } catch (e) {
    error.value = e.message
    loading.value = false
  }
}

onMounted(() => {
  fetchPosts()
})
</script>

<style scoped>
.text-stroke {
  -webkit-text-stroke: 2px #fff;
  color: transparent;
}
.text-stroke-0 {
  -webkit-text-stroke: 0;
  color: #CCFF00;
}
</style>
