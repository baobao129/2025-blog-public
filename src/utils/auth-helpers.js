import { GITHUB_CONFIG } from '@/consts'
import { decrypt, encrypt } from './aes256-util'

const GITHUB_TOKEN_CACHE_KEY = 'github_token'
const GITHUB_PEM_CACHE_KEY = 'p_info'

export function getTokenFromCache() {
  if (typeof sessionStorage === 'undefined') return null
  try {
    return sessionStorage.getItem(GITHUB_TOKEN_CACHE_KEY)
  } catch {
    return null
  }
}

export function saveTokenToCache(token) {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(GITHUB_TOKEN_CACHE_KEY, token)
  } catch (error) {
    console.error('Failed to save token to cache:', error)
  }
}

export function clearTokenCache() {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.removeItem(GITHUB_TOKEN_CACHE_KEY)
  } catch (error) {
    console.error('Failed to clear token cache:', error)
  }
}

export async function getPemFromCache() {
  if (typeof sessionStorage === 'undefined') return null
  try {
    // 解密缓存中的 pem
    const encryptedPem = sessionStorage.getItem(GITHUB_PEM_CACHE_KEY)
    if (!encryptedPem) return null
    return await decrypt(encryptedPem, GITHUB_CONFIG.ENCRYPT_KEY)
  } catch {
    return null
  }
}

export async function savePemToCache(pem) {
  if (typeof sessionStorage === 'undefined') return
  try {
    // 加密 pem 后存储
    const encryptedPem = await encrypt(pem, GITHUB_CONFIG.ENCRYPT_KEY)
    sessionStorage.setItem(GITHUB_PEM_CACHE_KEY, encryptedPem)
  } catch (error) {
    console.error('Failed to save pem to cache:', error)
  }
}

export function clearPemCache() {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.removeItem(GITHUB_PEM_CACHE_KEY)
  } catch (error) {
    console.error('Failed to clear pem cache:', error)
  }
}

export function clearAllAuthCache() {
  clearTokenCache()
  clearPemCache()
}

export async function hasAuth() {
  return !!getTokenFromCache() || !!(await getPemFromCache())
}
