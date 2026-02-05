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
      <aside class="w-80 border-r border-gray-200 bg-gray-50 flex-shrink-0 overflow-y-auto p-6">
        <div class="space-y-6">
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
      </aside>

      <!-- 写作区 -->
      <main class="flex-1 flex flex-col relative bg-white">
        <textarea 
          ref="textareaRef"
          v-model="editorContent" 
          placeholder="# 标题&#10;&#10;在此开始写作..."
          class="flex-grow w-full p-8 resize-none focus:outline-none font-mono text-sm leading-relaxed text-text-main placeholder:text-gray-300 selection:bg-accent/10"
        ></textarea>
      </main>

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
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { getFileContent, putFile, toBase64Utf8 } from '@/utils/github-client'
import { GITHUB_CONFIG } from '@/consts'
import { toast } from 'vue-sonner'
import { marked } from 'marked'
import { ArrowLeft, Save, Loader2, HelpCircle, X, Copy, BookOpen } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { getAuthToken } = useAuth()

const isNewPost = computed(() => !route.params.filename)
const editorTitle = ref('')
const editorContent = ref('')
const saving = ref(false)
const showTips = ref(false)
const textareaRef = ref(null)

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
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const before = editorContent.value.substring(0, start)
  const after = editorContent.value.substring(end)

  editorContent.value = before + text + after
  
  // 恢复焦点并移动光标
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + text.length, start + text.length)
  }, 0)
  
  toast.success('已插入代码')
}

// 加载文章内容 (如果是编辑模式)
const loadPost = async () => {
  if (isNewPost.value) {
    editorContent.value = '# 新文章\n\n开始写作...'
    return
  }

  const filename = route.params.filename
  editorTitle.value = filename.replace('.md', '')
  
  try {
    const loadingToast = toast.loading('正在加载文章...')
    const token = await getAuthToken()
    const content = await getFileContent(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, `posts/${filename}`)
    editorContent.value = content
    toast.dismiss(loadingToast)
  } catch (e) {
    toast.error('无法加载文章: ' + e.message)
    router.push('/admin')
  }
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
