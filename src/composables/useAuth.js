/**
 * Vue 组合式函数 (Composable) - 认证管理
 * 
 * 功能：
 * 1. 管理全局认证状态 (isAuth, privateKey)
 * 2. 处理私钥的设置和缓存
 * 3. 自动签发和刷新 GitHub Installation Token
 * 4. 处理 401 未授权事件
 */

import { ref, onMounted } from 'vue'
import { clearAllAuthCache, hasAuth as checkAuth, getPemFromCache, savePemToCache, getTokenFromCache, saveTokenToCache } from '@/utils/auth-helpers'
import { signAppJwt, getInstallationId, createInstallationToken } from '@/utils/github-client'
import { GITHUB_CONFIG } from '@/consts'
import { toast } from 'vue-sonner'

// 全局状态（单例模式，类似 Pinia/Vuex）
// 保证在应用的不同组件中使用 useAuth 时共享同一份状态
const isAuth = ref(false)
const privateKey = ref(null)

export function useAuth() {
  
  /**
   * 设置私钥并更新认证状态
   * @param {string} key - 私钥 PEM 字符串
   * @param {boolean} cache - 是否缓存到本地 (SessionStorage)
   */
  const setPrivateKey = async (key, cache = true) => {
    isAuth.value = true
    privateKey.value = key
    if (cache) {
      await savePemToCache(key)
    }
  }

  /**
   * 清除认证状态
   * 清空本地缓存和全局状态
   */
  const clearAuth = () => {
    clearAllAuthCache()
    isAuth.value = false
    privateKey.value = null
  }

  /**
   * 刷新当前认证状态
   * 检查缓存中是否有有效的 Token 或 私钥
   */
  const refreshAuthState = async () => {
    isAuth.value = await checkAuth()
  }

  /**
   * 统一的认证 Token 获取方法
   * 核心逻辑：
   * 1. 优先返回缓存中的有效 Token
   * 2. 如果无 Token，使用私钥签发 JWT
   * 3. 使用 JWT 获取 Installation ID
   * 4. 使用 Installation ID 获取新的 Access Token
   * 5. 缓存并返回新 Token
   * 
   * @returns {Promise<string>} GitHub Installation Token
   * @throws {Error} 如果未设置私钥或 API 调用失败
   */
  const getAuthToken = async () => {
    // 1. 先尝试从缓存获取 token
    const cachedToken = getTokenFromCache()
    if (cachedToken) {
      // toast.info('使用缓存的令牌...')
      return cachedToken
    }

    // 2. 获取私钥（从缓存）
    if (!privateKey.value) {
      // 尝试重新加载
      const cachedPem = await getPemFromCache()
      if (cachedPem) {
        privateKey.value = cachedPem
      } else {
        throw new Error('需要先设置私钥。')
      }
    }

    // toast.info('正在签发 JWT...')
    // 3. 签发 App JWT
    const jwt = signAppJwt(GITHUB_CONFIG.APP_ID, privateKey.value)

    // toast.info('正在获取安装信息...')
    // 4. 获取安装 ID
    const installationId = await getInstallationId(jwt, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO)

    // toast.info('正在创建安装令牌...')
    // 5. 创建 Access Token
    const token = await createInstallationToken(jwt, installationId)

    // 6. 保存到缓存
    saveTokenToCache(token)
    
    // 更新状态
    refreshAuthState()

    return token
  }

  // 初始化检查
  onMounted(async () => {
    // 监听全局 401 事件（由 github-client 触发）
    // 当 API 返回 401 时自动清除认证
    window.addEventListener('auth:401', clearAuth)
    
    // 初始化时尝试从缓存恢复私钥
    const key = await getPemFromCache()
    if (key) {
      privateKey.value = key
    }
    
    // 检查认证状态
    isAuth.value = await checkAuth()
  })

  return {
    isAuth,
    privateKey,
    setPrivateKey,
    clearAuth,
    refreshAuthState,
    getAuthToken
  }
}
