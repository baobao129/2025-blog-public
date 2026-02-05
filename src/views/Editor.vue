<template>
  <div class="h-screen flex flex-col bg-background">
    <!-- 编辑器头部 -->
    <header class="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 flex-shrink-0 z-10">
      <div class="flex items-center gap-4">
        <button 
          @click="router.push('/admin')" 
          class="text-text-muted hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft class="w-4 h-4" />
          返回列表
        </button>
        <div class="h-4 w-px bg-gray-300"></div>
        <span class="font-serif font-bold text-lg text-primary">
          {{ isNewPost ? '新建文章' : '编辑文章' }}
        </span>
        <span v-if="hasLocalChanges" class="text-xs text-accent font-medium px-2 py-0.5 bg-accent/10 rounded-full">
          有未保存的本地草稿
        </span>
      </div>

      <div class="flex items-center gap-4">
        <button
          @click="showTips = !showTips"
          class="text-text-muted hover:text-accent transition-colors flex items-center gap-2 text-sm"
          :class="{ 'text-accent': showTips }"
        >
          <HelpCircle class="w-4 h-4" />
          语法助手
        </button>
        <span v-if="saving" class="text-sm text-text-light flex items-center gap-2">
          <Loader2 class="w-3 h-3 animate-spin" />
          保存中...
        </span>
        <button 
          @click="handleSavePost"
          :disabled="saving"
          class="px-6 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-black disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Save class="w-4 h-4" />
          发布文章
        </button>
      </div>
    </header>

    <!-- 编辑器主体 -->
    <div class="flex-grow flex overflow-hidden relative">
      <!-- 设置侧边栏 -->
      <aside 
        class="border-r border-gray-200 bg-gray-50 flex-shrink-0 transition-all duration-300 ease-in-out relative flex flex-col"
        :class="isSidebarOpen ? 'w-80' : 'w-16'"
      >
        <!-- 收起状态 -->
        <div v-show="!isSidebarOpen" class="flex flex-col items-center py-4 space-y-4 w-full h-full">
           <button 
            @click="isSidebarOpen = true"
            class="p-2 text-text-muted hover:text-primary hover:bg-gray-200 rounded-lg transition-all"
            title="展开设置"
          >
            <Settings class="w-5 h-5" />
          </button>
          <div class="flex-grow"></div>
           <button 
            @click="isSidebarOpen = true"
            class="p-2 text-text-muted hover:text-primary hover:bg-gray-200 rounded-lg transition-all"
            title="展开侧边栏"
          >
            <PanelLeftOpen class="w-5 h-5" />
          </button>
        </div>

        <!-- 展开状态 -->
        <div v-show="isSidebarOpen" class="w-80 flex flex-col h-full overflow-hidden"> 
          <div class="flex justify-between items-center p-6 pb-2 flex-shrink-0">
            <h3 class="font-bold text-text-main text-sm uppercase tracking-wider flex items-center gap-2">
                <Settings class="w-4 h-4" />
                文章设置
            </h3>
            <button 
              @click="isSidebarOpen = false"
              class="text-text-muted hover:text-primary transition-colors p-1 rounded hover:bg-gray-200"
              title="折叠侧边栏"
            >
              <PanelLeftClose class="w-4 h-4" />
            </button>
          </div>

          <div class="p-6 space-y-6 flex-grow overflow-y-auto">
            <div>
              <label class="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                文件名 (Slug)
              </label>
              <input 
                v-model="editorTitle" 
                type="text" 
                placeholder="article-slug"
                class="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-mono text-text-main"
                :disabled="!isNewPost"
              >
              <p class="text-[10px] text-text-light mt-2 leading-relaxed">
                作为 URL 的一部分 (例如 /post/filename)。
                <span v-if="isNewPost">创建后无法修改。建议使用英文和连字符。</span>
                <span v-else class="text-accent">编辑模式下无法修改文件名。</span>
              </p>
            </div>
          </div>
        </div>
      </aside>

      <!-- 写作区 -->
      <main class="flex-1 flex flex-col relative bg-white overflow-hidden">
        <MonacoEditor 
          ref="monacoRef"
          v-model="editorContent"
        />
      </main>

      <!-- 冲突解决模态框 -->
      <div v-if="showConflictModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 class="font-serif font-bold text-xl text-primary">发现未保存的草稿</h3>
            <button @click="useRemoteVersion" class="text-text-light hover:text-primary">
              <X class="w-5 h-5" />
            </button>
          </div>
          
          <div class="flex-1 overflow-hidden grid grid-cols-2 divide-x divide-gray-200">
            <!-- 本地版本 -->
            <div class="flex flex-col overflow-hidden bg-yellow-50/30">
              <div class="p-3 bg-yellow-100/50 text-xs font-bold text-yellow-800 uppercase tracking-wider flex justify-between items-center">
                <span>本地草稿 (Local Draft)</span>
                <span class="font-mono opacity-70">{{ new Date().toLocaleTimeString() }}</span>
              </div>
              <div class="flex-1 p-4 overflow-y-auto font-mono text-xs whitespace-pre-wrap">{{ localDraftContent }}</div>
              <div class="p-4 border-t border-yellow-100">
                <button 
                  @click="useLocalVersion"
                  class="w-full py-2 bg-yellow-600 text-white rounded font-medium hover:bg-yellow-700 transition-colors shadow-sm"
                >
                  恢复本地草稿
                </button>
              </div>
            </div>

            <!-- 远程版本 -->
            <div class="flex flex-col overflow-hidden bg-blue-50/30">
              <div class="p-3 bg-blue-100/50 text-xs font-bold text-blue-800 uppercase tracking-wider flex justify-between items-center">
                <span>远程版本 (GitHub)</span>
                <span class="font-mono opacity-70">Latest</span>
              </div>
              <div class="flex-1 p-4 overflow-y-auto font-mono text-xs whitespace-pre-wrap">{{ remoteContent }}</div>
              <div class="p-4 border-t border-blue-100">
                <button 
                  @click="useRemoteVersion"
                  class="w-full py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  使用远程版本
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Markdown 语法提示抽屉 -->
      <Transition name="slide-fade">
        <aside v-if="showTips" class="w-96 border-l border-gray-200 bg-white flex-shrink-0 overflow-y-auto absolute right-0 top-0 bottom-0 shadow-2xl z-20 flex flex-col">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <h3 class="font-serif font-bold text-lg text-primary flex items-center gap-2">
              <BookOpen class="w-5 h-5" />
              Markdown 指南
            </h3>
            <button @click="showTips = false" class="text-text-light hover:text-primary transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>
          
          <div class="p-6 space-y-8">
            <div v-for="(group, index) in markdownRules" :key="index">
              <h4 class="font-bold text-text-main mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                {{ group.title }}
              </h4>
              <div class="space-y-4">
                <div 
                  v-for="(rule, rIndex) in group.rules" 
                  :key="rIndex" 
                  class="group border border-gray-100 rounded-lg overflow-hidden hover:border-accent/30 hover:shadow-sm transition-all bg-white"
                >
                  <div class="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-start gap-2">
                    <code class="text-xs font-mono text-accent break-all">{{ rule.code }}</code>
                    <button 
                      @click="insertText(rule.code)" 
                      class="text-xs text-text-light hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      title="插入到编辑器"
                    >
                      <Copy class="w-3 h-3" />
                    </button>
                  </div>
                  <div class="p-3 text-sm text-text-muted prose prose-sm max-w-none">
                    <div v-html="renderPreview(rule.code)"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { getFileContent, putFile, toBase64Utf8 } from '@/utils/github-client'
import { GITHUB_CONFIG } from '@/consts'
import { toast } from 'vue-sonner'
import { marked } from 'marked'
import { ArrowLeft, Save, Loader2, HelpCircle, X, Copy, BookOpen, PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-vue-next'
import MonacoEditor from '@/components/MonacoEditor.vue'

const route = useRoute()
const router = useRouter()
const { getAuthToken } = useAuth()

const isNewPost = computed(() => !route.params.filename)
const editorTitle = ref('')
const editorContent = ref('')
const saving = ref(false)
const showTips = ref(false)
const isSidebarOpen = ref(true)
const monacoRef = ref(null)

// 本地缓存相关状态
const hasLocalChanges = ref(false)
const showConflictModal = ref(false)
const localDraftContent = ref('')
const remoteContent = ref('')

// Markdown 语法数据
const markdownRules = [
  {
    title: '基础排版',
    rules: [
      { code: '# 一级标题', desc: '页面主标题' },
      { code: '## 二级标题', desc: '章节标题' },
      { code: '**加粗文本**', desc: '强调重点' },
      { code: '*斜体文本*', desc: '次要强调' },
      { code: '> 引用文本', desc: '引用名言或段落' },
    ]
  },
  {
    title: '列表与任务',
    rules: [
      { code: '- 无序列表项\n- 列表项二', desc: '圆点列表' },
      { code: '1. 有序列表项\n2. 列表项二', desc: '数字列表' },
      { code: '- [ ] 待办任务\n- [x] 已完成任务', desc: '任务清单' },
    ]
  },
  {
    title: '代码与链接',
    rules: [
      { code: '`行内代码`', desc: '标记变量或命令' },
      { code: '```javascript\nconsole.log("Hi")\n```', desc: '代码块' },
      { code: '[链接文字](https://example.com)', desc: '超链接' },
      { code: '![图片说明](https://placehold.co/600x400)', desc: '插入图片' },
    ]
  },
  {
    title: '高级样式',
    rules: [
      { code: '<small>小号文本</small>', desc: '缩小字号' },
      { code: '<mark>高亮文本</mark>', desc: '黄色背景高亮' },
      { code: '~~删除线文本~~', desc: '表示废弃内容' },
      { code: '| 表头 | 表头 |\n| --- | --- |\n| 内容 | 内容 |', desc: '表格' },
    ]
  }
]

// 渲染预览
const renderPreview = (code) => {
  return marked.parse(code)
}

// 插入文本到光标处
const insertText = (text) => {
  if (monacoRef.value) {
    monacoRef.value.insertText(text)
    toast.success('已插入代码')
  }
}

// 自动保存草稿
watch(editorContent, (newVal) => {
  if (!editorTitle.value) return
  const key = `draft_${editorTitle.value}`
  if (newVal) {
    localStorage.setItem(key, newVal)
    hasLocalChanges.value = true
  } else {
    localStorage.removeItem(key)
    hasLocalChanges.value = false
  }
})

// 监听标题变化，更新缓存 Key
watch(editorTitle, (newVal, oldVal) => {
  if (oldVal && localStorage.getItem(`draft_${oldVal}`)) {
    const content = localStorage.getItem(`draft_${oldVal}`)
    localStorage.removeItem(`draft_${oldVal}`)
    if (newVal) localStorage.setItem(`draft_${newVal}`, content)
  }
})

// 加载文章内容 (如果是编辑模式)
const loadPost = async () => {
  if (isNewPost.value) {
    // 检查是否有未保存的新建草稿
    const draft = localStorage.getItem('draft_new_post')
    if (draft) {
      editorContent.value = draft
      hasLocalChanges.value = true
      toast.info('已恢复未保存的草稿')
    } else {
      editorContent.value = '# 新文章\n\n开始写作...'
    }
    return
  }

  const filename = route.params.filename
  editorTitle.value = filename.replace('.md', '')
  const draftKey = `draft_${editorTitle.value}`
  
  try {
    const loadingToast = toast.loading('正在加载文章...')
    const token = await getAuthToken()
    const content = await getFileContent(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, `posts/${filename}`)
    remoteContent.value = content
    
    // 检查本地草稿
    const draft = localStorage.getItem(draftKey)
    if (draft && draft !== content) {
      localDraftContent.value = draft
      showConflictModal.value = true
    } else {
      editorContent.value = content
    }
    
    toast.dismiss(loadingToast)
  } catch (e) {
    toast.error('无法加载文章: ' + e.message)
    // 即使远程加载失败，如果本地有草稿也尝试显示
    const draft = localStorage.getItem(draftKey)
    if (draft) {
      editorContent.value = draft
      toast.info('已加载本地缓存版本')
    } else {
      router.push('/admin')
    }
  }
}

// 使用本地版本
const useLocalVersion = () => {
  editorContent.value = localDraftContent.value
  showConflictModal.value = false
  toast.success('已恢复本地草稿')
}

// 使用远程版本
const useRemoteVersion = () => {
  editorContent.value = remoteContent.value
  // 清除本地旧草稿
  localStorage.removeItem(`draft_${editorTitle.value}`)
  hasLocalChanges.value = false
  showConflictModal.value = false
  toast.info('已加载远程版本')
}

// 保存文章
const handleSavePost = async () => {
  if (!editorTitle.value) {
    toast.error('请输入文件名')
    return
  }
  
  saving.value = true
  
  try {
    const token = await getAuthToken()
    const filename = editorTitle.value.trim().endsWith('.md') ? editorTitle.value.trim() : `${editorTitle.value.trim()}.md`
    const path = `posts/${filename}`
    const contentBase64 = toBase64Utf8(editorContent.value)
    
    const message = isNewPost.value ? `Create post ${filename}` : `Update post ${filename}`
    
    await putFile(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, path, contentBase64, message, GITHUB_CONFIG.BRANCH || 'main')
    
    // 保存成功后清除本地草稿
    localStorage.removeItem(`draft_${editorTitle.value}`)
    if (isNewPost.value) localStorage.removeItem('draft_new_post')
    hasLocalChanges.value = false
    
    toast.success('发布成功')
    
    // 如果是新建，保存后跳转到编辑模式或列表页
    if (isNewPost.value) {
      router.push('/admin')
    }
  } catch (e) {
    toast.error('发布失败: ' + e.message)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadPost()
})
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
