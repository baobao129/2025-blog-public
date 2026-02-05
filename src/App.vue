<script setup>
import { onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { isAuth, privateKey, setPrivateKey, clearAuth, getAuthToken } = useAuth()

const handleLogin = async () => {
  const key = prompt('请输入 Private Key PEM 内容:')
  if (key) {
    await setPrivateKey(key)
    alert('设置成功！')
  }
}

const handleTest = async () => {
  try {
    const token = await getAuthToken()
    alert('获取 Token 成功: ' + token.substring(0, 10) + '...')
  } catch (e) {
    alert('错误: ' + e.message)
  }
}
</script>

<template>
  <div class="p-10 max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Vue 3 Blog Project</h1>
    
    <div class="bg-gray-100 p-6 rounded-lg mb-6">
      <h2 class="text-xl font-semibold mb-4">GitHub 认证状态</h2>
      <div class="flex items-center gap-4 mb-4">
        <span class="font-medium">状态:</span>
        <span :class="isAuth ? 'text-green-600' : 'text-red-600'">
          {{ isAuth ? '已认证' : '未认证' }}
        </span>
      </div>
      
      <div class="flex gap-4">
        <button 
          v-if="!isAuth"
          @click="handleLogin"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          设置 Private Key
        </button>
        <button 
          v-else
          @click="clearAuth"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          清除认证
        </button>
        
        <button 
          v-if="isAuth"
          @click="handleTest"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          测试获取 Token
        </button>
      </div>
    </div>

    <div class="prose">
      <p>这是一个基础的 Vue 3 + Vite 项目框架。</p>
      <p>关键的 GitHub App 认证逻辑已经迁移到 <code>src/composables/useAuth.js</code> 和 <code>src/utils</code> 目录中。</p>
    </div>
  </div>
</template>
