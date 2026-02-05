import { ref, onMounted } from 'vue'
import { clearAllAuthCache, hasAuth as checkAuth, getPemFromCache, savePemToCache, getTokenFromCache, saveTokenToCache } from '@/utils/auth-helpers'
import { signAppJwt, getInstallationId, createInstallationToken } from '@/utils/github-client'
import { GITHUB_CONFIG } from '@/consts'
import { toast } from 'sonner'

// 全局状态（单例模式，类似 Pinia/Vuex）
const isAuth = ref(false)
const privateKey = ref(null)

export function useAuth() {
  
  const setPrivateKey = async (key, cache = true) => {
    isAuth.value = true
    privateKey.value = key
    if (cache) {
      await savePemToCache(key)
    }
  }

  const clearAuth = () => {
    clearAllAuthCache()
    isAuth.value = false
    privateKey.value = null
  }

  const refreshAuthState = async () => {
    isAuth.value = await checkAuth()
  }

  /**
   * 统一的认证 Token 获取
   * 自动处理缓存、签发等逻辑
   * @returns GitHub Installation Token
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
    const jwt = signAppJwt(GITHUB_CONFIG.APP_ID, privateKey.value)

    // toast.info('正在获取安装信息...')
    const installationId = await getInstallationId(jwt, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO)

    // toast.info('正在创建安装令牌...')
    const token = await createInstallationToken(jwt, installationId)

    saveTokenToCache(token)
    
    // 更新状态
    refreshAuthState()

    return token
  }

  // 初始化检查
  onMounted(async () => {
    // 监听 401 错误
    window.addEventListener('auth:401', clearAuth)
    
    const key = await getPemFromCache()
    if (key) {
      privateKey.value = key
    }
    
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
