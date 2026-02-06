<template>
  <div class="flex flex-col h-screen w-full bg-gray-50">
    <!-- 顶部工具栏 -->
    <header class="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 flex-shrink-0">
      <div class="flex items-center gap-4">
        <button 
          @click="router.push(`/post/${route.params.filename}`)"
          class="text-text-muted hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft class="w-4 h-4" />
          返回文章
        </button>
        <div class="h-4 w-px bg-gray-200"></div>
        <div class="flex items-center gap-2 text-primary font-bold">
          <Code2 class="w-5 h-5" />
          <span>代码演练场</span>
        </div>
        <div class="h-4 w-px bg-gray-200"></div>
        <select 
          v-model="currentFramework" 
          class="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-1.5"
        >
          <option value="vanilla">原生 (Vanilla)</option>
          <option value="vue">Vue 3</option>
          <option value="react">React</option>
        </select>
        <button 
          @click="resetLayout"
          class="text-xs text-text-muted hover:text-primary flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          title="重置布局"
        >
          <LayoutTemplate class="w-3 h-3" />
          重置布局
        </button>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="isArticleVisible = !isArticleVisible"
          class="text-sm font-medium text-text-muted hover:text-primary flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          :title="isArticleVisible ? '收起文章' : '展开文章'"
        >
          <PanelLeftClose v-if="isArticleVisible" class="w-4 h-4" />
          <PanelLeftOpen v-else class="w-4 h-4" />
          <span class="hidden sm:inline">{{ isArticleVisible ? '收起文章' : '展开文章' }}</span>
        </button>
        <button 
          @click="downloadCode"
          class="text-sm font-medium text-text-muted hover:text-primary flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Download class="w-4 h-4" />
          下载源码
        </button>
      </div>
    </header>

    <!-- 主体区域 -->
    <div class="flex-1 flex overflow-hidden relative" ref="containerRef">
      <!-- 左侧：文章区域 -->
      <div 
        v-show="isArticleVisible"
        class="flex flex-col border-r border-gray-200 bg-white transition-all duration-75"
        :style="{ width: `${articleWidth}%` }"
      >
        <!-- 加载状态 -->
        <div v-if="loading" class="flex flex-col items-center justify-center flex-1 space-y-4">
          <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p class="text-text-light text-sm animate-pulse">正在加载文章...</p>
        </div>
        
        <div v-else class="flex-1 overflow-y-auto p-8 prose prose-zinc max-w-none">
          <h1 class="text-2xl font-bold text-primary mb-4">{{ formatTitle(route.params.filename) }}</h1>
          <div v-html="contentHtml"></div>
        </div>
      </div>

      <!-- 水平拖拽条 -->
      <div 
        v-show="isArticleVisible"
        class="w-1 cursor-col-resize hover:bg-primary/50 transition-colors bg-gray-200 z-10 flex flex-col justify-center relative group"
        :class="{ 'bg-primary': isResizingArticle }"
        @mousedown="startResizeArticle"
      >
        <div class="absolute inset-y-0 -left-1 -right-1 z-20"></div> <!-- 扩大点击区域 -->
        <div class="h-8 w-1 bg-gray-400 rounded-full mx-auto group-hover:bg-primary transition-colors"></div>
      </div>

      <!-- 右侧：演练区域 -->
      <div 
        class="flex flex-col h-full overflow-hidden bg-gray-50"
        :style="{ width: isArticleVisible ? `${100 - articleWidth}%` : '100%' }"
      >
        <!-- 上半部分：实时预览 -->
        <div 
          class="flex flex-col bg-white"
          :style="{ height: `${previewHeight}%` }"
        >
          <div class="px-4 py-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-shrink-0">
            <span class="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
              <Eye class="w-3 h-3" />
              实时预览
            </span>
            <span class="text-xs text-text-light flex items-center gap-1">
              <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
          <div class="flex-1 w-full h-full relative bg-white">
            <iframe 
              ref="previewFrame"
              class="absolute inset-0 w-full h-full border-none"
              sandbox="allow-scripts"
              :srcdoc="previewContent"
            ></iframe>
          </div>
        </div>

        <!-- 垂直拖拽条 -->
        <div 
          class="h-1 cursor-row-resize hover:bg-primary/50 transition-colors bg-gray-200 z-10 flex flex-row justify-center items-center relative group flex-shrink-0"
          :class="{ 'bg-primary': isResizingPreview }"
          @mousedown="startResizePreview"
        >
           <div class="absolute -inset-y-1 inset-x-0 z-20"></div> <!-- 扩大点击区域 -->
          <div class="w-8 h-1 bg-gray-400 rounded-full group-hover:bg-primary transition-colors"></div>
        </div>

        <!-- 下半部分：代码编辑 -->
        <div 
          class="flex flex-col bg-white flex-1 min-h-0"
        >
          <!-- 语言 Tab -->
          <div class="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <button 
              v-for="lang in ['HTML', 'CSS', 'JavaScript']" 
              :key="lang"
              @click="activeTab = lang"
              class="px-4 py-2 text-xs font-medium border-r border-gray-200 border-b-2 transition-colors flex items-center gap-2"
              :class="activeTab === lang ? 'border-b-primary text-primary bg-white' : 'border-b-transparent text-text-muted hover:text-gray-800 hover:bg-gray-100'"
            >
              <span 
                class="w-1.5 h-1.5 rounded-full"
                :class="{
                  'bg-orange-500': lang === 'HTML',
                  'bg-blue-500': lang === 'CSS',
                  'bg-yellow-500': lang === 'JavaScript'
                }"
              ></span>
              {{ lang }}
            </button>
          </div>

          <!-- 编辑器容器 -->
          <div class="flex-1 relative">
            <MonacoEditor 
              v-show="activeTab === 'HTML'"
              v-model="htmlCode"
              language="html"
              class="absolute inset-0"
            />
            <MonacoEditor 
              v-show="activeTab === 'CSS'"
              v-model="cssCode"
              language="css"
              class="absolute inset-0"
            />
            <MonacoEditor 
              v-show="activeTab === 'JavaScript'"
              v-model="jsCode"
              language="javascript"
              class="absolute inset-0"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import { getFileContent } from '@/utils/github-client'
import { parseFrontmatter } from '@/utils/frontmatter'
import { useAuth } from '@/composables/useAuth'
import { GITHUB_CONFIG } from '@/consts'
import { Code2, Download, PanelLeftClose, PanelLeftOpen, Eye, LayoutTemplate, ArrowLeft } from 'lucide-vue-next'
import MonacoEditor from '@/components/MonacoEditor.vue'

const route = useRoute()
const router = useRouter()
const { getAuthToken } = useAuth()

// 状态
const loading = ref(true)
const contentHtml = ref('')
const activeTab = ref('HTML')
const currentFramework = ref('vanilla')

// 布局状态
const containerRef = ref(null)
const isArticleVisible = ref(true)
const articleWidth = ref(30)
const previewHeight = ref(50)
const isResizingArticle = ref(false)
const isResizingPreview = ref(false)

// 加载文章
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
    
    contentHtml.value = marked.parse(content)
  } catch (e) {
    console.error(e)
    contentHtml.value = `<p class="text-red-500">无法加载文章: ${e.message}</p>`
  } finally {
    loading.value = false
  }
}

const formatTitle = (filename) => {
  if (!filename) return ''
  return filename.replace(/\.md$/, '').replace(/-/g, ' ')
}

// 布局重置与拖拽逻辑
const resetLayout = () => {
  articleWidth.value = 30
  previewHeight.value = 50
  isArticleVisible.value = true
}

const startResizeArticle = () => {
  isResizingArticle.value = true
  document.addEventListener('mousemove', handleResizeArticle)
  document.addEventListener('mouseup', stopResizeArticle)
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'
}

const stopResizeArticle = () => {
  isResizingArticle.value = false
  document.removeEventListener('mousemove', handleResizeArticle)
  document.removeEventListener('mouseup', stopResizeArticle)
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}

const handleResizeArticle = (e) => {
  if (!containerRef.value) return
  const containerRect = containerRef.value.getBoundingClientRect()
  const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
  if (newWidth > 15 && newWidth < 60) {
    articleWidth.value = newWidth
  }
}

const startResizePreview = () => {
  isResizingPreview.value = true
  document.addEventListener('mousemove', handleResizePreview)
  document.addEventListener('mouseup', stopResizePreview)
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'row-resize'
}

const stopResizePreview = () => {
  isResizingPreview.value = false
  document.removeEventListener('mousemove', handleResizePreview)
  document.removeEventListener('mouseup', stopResizePreview)
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}

const handleResizePreview = (e) => {
  if (!containerRef.value) return
  const containerRect = containerRef.value.getBoundingClientRect()
  const newHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100
  if (newHeight > 20 && newHeight < 80) {
    previewHeight.value = newHeight
  }
}

// 预设模板
const templates = {
  vanilla: {
    html: `<!-- 在这里编写 HTML -->
<div class="card">
  <h1>Hello World</h1>
  <p>编辑下方代码，上方实时更新。</p>
  <button id="btn">点击我</button>
</div>`,
    css: `/* 在这里编写 CSS */
body {
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  background-color: #f0f2f5;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  text-align: center;
}

h1 {
  color: #2563eb;
  margin-top: 0;
}

button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #1d4ed8;
}`,
    js: `// 在这里编写 JavaScript
const btn = document.getElementById('btn');

btn.addEventListener('click', () => {
  const h1 = document.querySelector('h1');
  h1.textContent = '你好，世界！';
  h1.style.color = '#dc2626';
  btn.textContent = '已点击';
});`
  },
  vue: {
    html: `<div id="app">
  <div class="card">
    <h1>{{ message }}</h1>
    <p>编辑下方代码，上方实时更新。</p>
    <button @click="count++">点击次数: {{ count }}</button>
  </div>
</div>`,
    css: `/* Vue 样式 */
body {
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  background-color: #f0f2f5;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  text-align: center;
}

h1 { color: #42b883; margin-top: 0; }
button {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}
button:hover { background: #3aa876; }`,
    js: `const { createApp, ref } = Vue

createApp({
  setup() {
    const message = ref('Hello Vue 3!')
    const count = ref(0)
    return {
      message,
      count
    }
  }
}).mount('#app')`
  },
  react: {
    html: `<div id="root"></div>`,
    css: `/* React 样式 */
body {
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  background-color: #f0f2f5;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  text-align: center;
}

h1 { color: #61dafb; margin-top: 0; text-shadow: 0 1px 2px rgba(0,0,0,0.1); }
button {
  background: #61dafb;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
button:hover { background: #4fa8d1; }`,
    js: `const { useState } = React;

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="card">
      <h1>Hello React!</h1>
      <p>编辑下方代码，上方实时更新。</p>
      <button onClick={() => setCount(count + 1)}>
        点击次数: {count}
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`
  }
}

// 默认代码
const htmlCode = ref(templates.vanilla.html)
const cssCode = ref(templates.vanilla.css)
const jsCode = ref(templates.vanilla.js)

// 切换框架时更新代码
watch(currentFramework, (newFramework) => {
  const t = templates[newFramework]
  htmlCode.value = t.html
  cssCode.value = t.css
  jsCode.value = t.js
})

// 生成预览内容
const previewContent = computed(() => {
  const frameworkScripts = {
    vanilla: '',
    vue: '<script src="https://unpkg.com/vue@3/dist/vue.global.js"><\/script>',
    react: `
      <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
      <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
    `
  }

  const userScript = currentFramework.value === 'react' 
    ? `<script type="text/babel">${jsCode.value}<\/script>`
    : `<script>${jsCode.value}<\/script>`

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>${cssCode.value}</style>
        ${frameworkScripts[currentFramework.value]}
      </head>
      <body>
        ${htmlCode.value}
        ${userScript}
      </body>
    </html>
  `
})

// 下载代码
const downloadCode = () => {
  const blob = new Blob([previewContent.value], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'playground-export.html'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  fetchPost()
})

onUnmounted(() => {
  stopResizeArticle()
  stopResizePreview()
})
</script>