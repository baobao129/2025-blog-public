<template>
  <div class="max-w-5xl mx-auto space-y-12">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-serif font-bold text-primary">内容管理</h1>
      
      <!-- 状态指示 -->
      <div v-if="isAuth" class="flex items-center gap-3">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
          <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          已连接 GitHub
        </span>
        <button 
          @click="clearAuth" 
          class="text-sm text-text-light hover:text-red-600 transition-colors"
        >
          断开连接
        </button>
      </div>
    </div>

    <!-- 1. 未认证：显示私钥上传 -->
    <div v-if="!isAuth" class="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center max-w-2xl mx-auto">
      <div class="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-text-muted">
        <KeyRound class="w-8 h-8" />
      </div>
      <h2 class="text-2xl font-bold text-primary mb-3">需要身份验证</h2>
      <p class="text-text-muted mb-8 max-w-md mx-auto">
        请上传您的 GitHub App 私钥 (.pem) 以访问管理系统。
      </p>
      
      <div class="flex flex-col items-center gap-4">
        <label class="relative cursor-pointer group">
          <div class="px-6 py-3 bg-primary text-white rounded-lg font-medium shadow-lg shadow-primary/20 group-hover:shadow-primary/30 group-hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <Upload class="w-4 h-4" />
            <span>上传私钥文件</span>
          </div>
          <input 
            type="file" 
            accept=".pem"
            @change="handleFileUpload"
            class="hidden"
          />
        </label>
        <p v-if="authError" class="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">{{ authError }}</p>
      </div>
    </div>

    <!-- 2. 已认证：显示文章管理 -->
    <div v-else class="space-y-8 animate-fade-in-up">
      <!-- 操作栏 -->
      <div class="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div class="flex items-center gap-4 text-sm text-text-muted">
          共找到 <span class="font-medium text-primary">{{ posts.length }}</span> 篇文章
        </div>
        <button 
          @click="startNewPost"
          class="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
        >
          <Plus class="w-4 h-4" />
          新建文章
        </button>
      </div>

      <!-- 编辑器 -->
      <div v-if="showEditor" class="fixed inset-0 z-[100] bg-white flex flex-col animate-fade-in">
        <!-- 编辑器头部 -->
        <header class="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md">
          <div class="flex items-center gap-4">
            <button @click="showEditor = false" class="text-text-light hover:text-primary transition-colors">
              <X class="w-5 h-5" />
            </button>
            <div class="h-6 w-px bg-gray-200"></div>
            <span class="font-medium text-text-muted">{{ currentPost ? '编辑文章' : '新建文章' }}</span>
          </div>

          <div class="flex items-center gap-4">
            <span v-if="saving" class="text-sm text-text-light flex items-center gap-2">
              <Loader2 class="w-3 h-3 animate-spin" />
              保存中...
            </span>
            <button 
              @click="handleSavePost"
              :disabled="saving"
              class="px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Save class="w-4 h-4" />
              发布
            </button>
          </div>
        </header>

        <!-- 编辑器主体 (分栏) -->
        <div class="flex-grow flex overflow-hidden">
          <!-- 设置侧边栏 -->
          <aside class="w-80 border-r border-gray-100 bg-gray-50/50 p-6 overflow-y-auto">
            <div class="space-y-6">
              <div>
                <label class="block text-xs font-semibold text-text-light uppercase tracking-wider mb-2">文件名 (Slug)</label>
                <input 
                  v-model="editorTitle" 
                  type="text" 
                  placeholder="my-post-slug"
                  class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                  :disabled="!!currentPost"
                >
                <p class="text-[10px] text-text-light mt-1.5">作为 URL 的一部分。创建后无法修改。</p>
              </div>
              
              <!-- 可以在这里添加 Frontmatter 字段 (Title, Date, Tags) -->
            </div>
          </aside>

          <!-- Markdown 输入区 -->
          <div class="flex-1 flex flex-col">
            <textarea 
              v-model="editorContent" 
              placeholder="在此开始写作..."
              class="flex-grow w-full p-8 resize-none focus:outline-none font-mono text-sm leading-relaxed text-text-main placeholder:text-gray-300"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- 文章列表 (表格视图) -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-text-light uppercase tracking-wider">
              <th class="px-6 py-4">标题 / 文件名</th>
              <th class="px-6 py-4">大小</th>
              <th class="px-6 py-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="loading" class="text-center">
              <td colspan="3" class="px-6 py-12 text-text-light">正在加载文章列表...</td>
            </tr>
            <tr v-else-if="posts.length === 0" class="text-center">
              <td colspan="3" class="px-6 py-12 text-text-light">暂无文章。点击右上角新建第一篇！</td>
            </tr>
            <tr 
              v-for="post in posts" 
              :key="post.sha" 
              class="group hover:bg-gray-50/50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="font-medium text-text-main">{{ post.name.replace('.md', '') }}</div>
                <div class="text-xs text-text-light font-mono mt-0.5">{{ post.name }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-text-muted font-mono">
                {{ (post.size / 1024).toFixed(2) }} KB
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    :href="post.html_url" 
                    target="_blank" 
                    class="p-2 text-text-light hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                    title="在 GitHub 查看"
                  >
                    <Github class="w-4 h-4" />
                  </a>
                  <button 
                    @click="handleEdit(post)"
                    class="p-2 text-text-light hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button 
                    @click="handleDelete(post)"
                    class="p-2 text-text-light hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { getDirectoryContents, putFile, getFileContent, deleteFile, toBase64Utf8 } from '@/utils/github-client'
import { GITHUB_CONFIG } from '@/consts'
import { toast } from 'vue-sonner'
import { KeyRound, Upload, Plus, Loader2, Save, X, Github, Edit2, Trash2 } from 'lucide-vue-next'

const { isAuth, setPrivateKey, clearAuth, getAuthToken } = useAuth()

// 状态
const authError = ref('')
const posts = ref([])
const loading = ref(false)

// 编辑器状态
const showEditor = ref(false)
const currentPost = ref(null) 
const editorTitle = ref('')
const editorContent = ref('')
const saving = ref(false)

// 处理私钥上传
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const content = e.target.result
      await setPrivateKey(content)
      toast.success('Private key set successfully')
      fetchPosts()
    } catch (err) {
      authError.value = 'Failed to set key: ' + err.message
    }
  }
  reader.readAsText(file)
}

// 获取文章列表
const fetchPosts = async () => {
  if (!isAuth.value) return
  loading.value = true
  try {
    const token = await getAuthToken()
    const files = await getDirectoryContents(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, 'posts')
    posts.value = files.filter(f => f.name.endsWith('.md'))
  } catch (e) {
    console.error(e)
    toast.error('Failed to fetch posts')
  } finally {
    loading.value = false
  }
}

// 开始新文章
const startNewPost = () => {
  currentPost.value = null
  editorTitle.value = ''
  editorContent.value = '# New Story\n\nStart writing...'
  showEditor.value = true
}

// 加载文章内容用于编辑
const handleEdit = async (post) => {
  try {
    const loadingToast = toast.loading('Loading post...')
    const token = await getAuthToken()
    const content = await getFileContent(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, post.path)
    
    currentPost.value = post
    editorTitle.value = post.name.replace('.md', '')
    editorContent.value = content
    showEditor.value = true
    toast.dismiss(loadingToast)
  } catch (e) {
    toast.error('Failed to load post: ' + e.message)
  }
}

// 保存文章
const handleSavePost = async () => {
  if (!editorTitle.value) {
    toast.error('Please enter a filename')
    return
  }
  
  saving.value = true
  
  try {
    const token = await getAuthToken()
    const filename = editorTitle.value.trim().endsWith('.md') ? editorTitle.value.trim() : `${editorTitle.value.trim()}.md`
    const path = `posts/${filename}`
    const contentBase64 = toBase64Utf8(editorContent.value)
    
    const message = currentPost.value ? `Update post ${filename}` : `Create post ${filename}`
    
    await putFile(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, path, contentBase64, message, GITHUB_CONFIG.BRANCH || 'main')
    
    toast.success('Published successfully')
    showEditor.value = false
    fetchPosts() 
  } catch (e) {
    toast.error('Failed to publish: ' + e.message)
  } finally {
    saving.value = false
  }
}

// 删除文章
const handleDelete = async (post) => {
  if (!confirm(`Are you sure you want to delete ${post.name}?`)) return
  
  try {
    const token = await getAuthToken()
    await deleteFile(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, post.path, `Delete post ${post.name}`, GITHUB_CONFIG.BRANCH || 'main')
    toast.success('Deleted successfully')
    fetchPosts()
  } catch (e) {
    toast.error('Failed to delete: ' + e.message)
  }
}

watch(isAuth, (newVal) => {
  if (newVal) fetchPosts()
})

onMounted(() => {
  if (isAuth.value) fetchPosts()
})
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
