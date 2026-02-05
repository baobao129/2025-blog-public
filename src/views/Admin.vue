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
          @click="router.push('/editor')"
          class="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
        >
          <Plus class="w-4 h-4" />
          新建文章
        </button>
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
                    @click="router.push(`/editor/${post.name}`)"
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
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { getDirectoryContents, deleteFile } from '@/utils/github-client'
import { GITHUB_CONFIG } from '@/consts'
import { toast } from 'vue-sonner'
import { KeyRound, Upload, Plus, Github, Edit2, Trash2 } from 'lucide-vue-next'

const router = useRouter()
const { isAuth, setPrivateKey, clearAuth, getAuthToken } = useAuth()

// 状态
const authError = ref('')
const posts = ref([])
const loading = ref(false)

// 处理私钥上传
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const content = e.target.result
      await setPrivateKey(content)
      toast.success('私钥设置成功')
      fetchPosts()
    } catch (err) {
      authError.value = '设置私钥失败: ' + err.message
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
    toast.error('获取文章列表失败')
  } finally {
    loading.value = false
  }
}

// 删除文章
const handleDelete = async (post) => {
  if (!confirm(`确定要删除 ${post.name} 吗？`)) return
  
  try {
    const token = await getAuthToken()
    await deleteFile(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, post.path, `Delete post ${post.name}`, GITHUB_CONFIG.BRANCH || 'main')
    toast.success('删除成功')
    fetchPosts()
  } catch (e) {
    toast.error('删除失败: ' + e.message)
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

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
