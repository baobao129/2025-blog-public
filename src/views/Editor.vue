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
        >
          <HelpCircle class="w-4 h-4" />
          Markdown 语法
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
          
          <!-- 可以扩展 Frontmatter 设置 -->
        </div>
      </aside>

      <!-- 写作区 -->
      <main class="flex-1 flex flex-col relative bg-white">
        <textarea 
          v-model="editorContent" 
          placeholder="# 标题&#10;&#10;在此开始写作..."
          class="flex-grow w-full p-8 resize-none focus:outline-none font-mono text-sm leading-relaxed text-text-main placeholder:text-gray-300"
        ></textarea>
      </main>

      <!-- Markdown 语法提示抽屉 -->
      <Transition name="slide-fade">
        <aside v-if="showTips" class="w-80 border-l border-gray-200 bg-white flex-shrink-0 overflow-y-auto p-6 absolute right-0 top-0 bottom-0 shadow-xl z-20">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-serif font-bold text-lg text-primary">Markdown 语法</h3>
            <button @click="showTips = false" class="text-text-light hover:text-primary">
              <X class="w-4 h-4" />
            </button>
          </div>
          
          <div class="space-y-6 text-sm">
            <section>
              <h4 class="font-bold text-text-main mb-2">标题</h4>
              <div class="bg-gray-50 p-3 rounded font-mono text-xs text-text-muted">
                # 一级标题<br>
                ## 二级标题<br>
                ### 三级标题
              </div>
            </section>

            <section>
              <h4 class="font-bold text-text-main mb-2">强调</h4>
              <div class="bg-gray-50 p-3 rounded font-mono text-xs text-text-muted">
                **加粗文本**<br>
                *斜体文本*<br>
                ==高亮文本== (需支持)<br>
                &lt;small&gt;小号文本&lt;/small&gt;
              </div>
            </section>

            <section>
              <h4 class="font-bold text-text-main mb-2">列表</h4>
              <div class="bg-gray-50 p-3 rounded font-mono text-xs text-text-muted">
                - 无序列表项 1<br>
                - 无序列表项 2<br><br>
                1. 有序列表项 1<br>
                2. 有序列表项 2
              </div>
            </section>

            <section>
              <h4 class="font-bold text-text-main mb-2">引用与代码</h4>
              <div class="bg-gray-50 p-3 rounded font-mono text-xs text-text-muted">
                > 引用文本<br><br>
                `行内代码`<br><br>
                ```javascript<br>
                // 代码块<br>
                console.log('Hi')<br>
                ```
              </div>
            </section>

            <section>
              <h4 class="font-bold text-text-main mb-2">链接与图片</h4>
              <div class="bg-gray-50 p-3 rounded font-mono text-xs text-text-muted">
                [链接文字](url)<br>
                ![图片描述](image-url)
              </div>
            </section>
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
import { ArrowLeft, Save, Loader2, HelpCircle, X } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { getAuthToken } = useAuth()

const isNewPost = computed(() => !route.params.filename)
const editorTitle = ref('')
const editorContent = ref('')
const saving = ref(false)
const showTips = ref(false)

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
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
