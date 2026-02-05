/**
 * 认证辅助工具类
 * 负责管理 Token 和私钥的本地缓存（SessionStorage）
 * 包含加密存储逻辑，确保敏感信息安全
 */

import { GITHUB_CONFIG } from '@/consts'
import { decrypt, encrypt } from './aes256-util'

// 定义缓存 Key 常量
const GITHUB_TOKEN_CACHE_KEY = 'github_token'
const GITHUB_PEM_CACHE_KEY = 'p_info'

/**
 * 从 SessionStorage 获取 GitHub Installation Token
 * @returns {string|null} Token 字符串或 null
 */
export function getTokenFromCache() {
  if (typeof sessionStorage === 'undefined') return null
  try {
    return sessionStorage.getItem(GITHUB_TOKEN_CACHE_KEY)
  } catch {
    return null
  }
}

/**
 * 将 GitHub Installation Token 保存到 SessionStorage
 * @param {string} token - GitHub Installation Token
 */
export function saveTokenToCache(token) {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(GITHUB_TOKEN_CACHE_KEY, token)
  } catch (error) {
    console.error('Failed to save token to cache:', error)
  }
}

/**
 * 清除 SessionStorage 中的 Token
 */
export function clearTokenCache() {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.removeItem(GITHUB_TOKEN_CACHE_KEY)
  } catch (error) {
    console.error('Failed to clear token cache:', error)
  }
}

/**
 * 从缓存中获取并解密私钥 (PEM)
 * @returns {Promise<string|null>} 解密后的私钥 PEM 字符串或 null
 */
export async function getPemFromCache() {
  if (typeof sessionStorage === 'undefined') return null
  try {
    // 获取加密的 pem 字符串
    const encryptedPem = sessionStorage.getItem(GITHUB_PEM_CACHE_KEY)
    if (!encryptedPem) return null
    // 使用应用配置中的 ENCRYPT_KEY 进行解密
    return await decrypt(encryptedPem, GITHUB_CONFIG.ENCRYPT_KEY)
  } catch {
    return null
  }
}

/**
 * 加密并保存私钥 (PEM) 到缓存
 * @param {string} pem - 私钥 PEM 字符串
 */
export async function savePemToCache(pem) {
  if (typeof sessionStorage === 'undefined') return
  try {
    // 使用应用配置中的 ENCRYPT_KEY 加密 pem 后存储
    const encryptedPem = await encrypt(pem, GITHUB_CONFIG.ENCRYPT_KEY)
    sessionStorage.setItem(GITHUB_PEM_CACHE_KEY, encryptedPem)
  } catch (error) {
    console.error('Failed to save pem to cache:', error)
  }
}

/**
 * 清除缓存中的私钥
 */
export function clearPemCache() {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.removeItem(GITHUB_PEM_CACHE_KEY)
  } catch (error) {
    console.error('Failed to clear pem cache:', error)
  }
}

/**
 * 清除所有认证相关的缓存（Token 和 私钥）
 */
export function clearAllAuthCache() {
  clearTokenCache()
  clearPemCache()
}

/**
 * 检查当前是否已认证（存在 Token 或 私钥）
 * @returns {Promise<boolean>} 是否已认证
 */
export async function hasAuth() {
  return !!getTokenFromCache() || !!(await getPemFromCache())
}
