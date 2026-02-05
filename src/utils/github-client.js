/**
 * GitHub API 客户端工具类
 * 封装了与 GitHub App 交互的核心逻辑，包括 JWT 签发、Token 获取和文件操作
 */

import { KJUR, KEYUTIL } from 'jsrsasign'
import { toast } from 'vue-sonner'

// GitHub API 基础地址
export const GH_API = 'https://api.github.com'

/**
 * 处理 401 未授权错误
 * 触发全局事件通知应用层清除认证状态
 */
function handle401Error() {
  console.warn('Authentication failed (401)')
  window.dispatchEvent(new CustomEvent('auth:401'))
}

/**
 * 处理 422 频率限制或其他校验错误
 */
function handle422Error() {
  toast.error('操作太快了，请操作慢一点')
}

/**
 * 将字符串转换为 Base64 (UTF-8 编码)
 * 用于 GitHub API 的文件内容编码
 * @param {string} input - 原始字符串
 * @returns {string} Base64 编码字符串
 */
export function toBase64Utf8(input) {
  return btoa(unescape(encodeURIComponent(input)))
}

/**
 * 将 Base64 字符串解码为 UTF-8 字符串
 * 用于解码 GitHub API 返回的文件内容
 * @param {string} input - Base64 字符串
 * @returns {string} 解码后的字符串
 */
export function fromBase64Utf8(input) {
  return decodeURIComponent(escape(atob(input)))
}

/**
 * 签发 GitHub App JWT (JSON Web Token)
 * 用于获取 Installation ID
 * 
 * @param {string} appId - GitHub App ID
 * @param {string} privateKeyPem - GitHub App 私钥 PEM
 * @returns {string} 签发的 JWT 字符串
 */
export function signAppJwt(appId, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  // JWT 有效期设置：签发时间前 60秒 到 后 8分钟 (GitHub 最大允许 10分钟)
  const payload = { iat: now - 60, exp: now + 8 * 60, iss: appId }
  const prv = KEYUTIL.getKey(privateKeyPem)
  return KJUR.jws.JWS.sign('RS256', JSON.stringify(header), JSON.stringify(payload), prv)
}

/**
 * 获取 GitHub App 在特定仓库的 Installation ID
 * 
 * @param {string} jwt - App JWT
 * @param {string} owner - 仓库所有者
 * @param {string} repo - 仓库名称
 * @returns {Promise<number>} Installation ID
 */
export async function getInstallationId(jwt, owner, repo) {
  const res = await fetch(`${GH_API}/repos/${owner}/${repo}/installation`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })
  if (res.status === 401) handle401Error()
  if (res.status === 422) handle422Error()
  if (!res.ok) throw new Error(`installation lookup failed: ${res.status}`)
  const data = await res.json()
  return data.id
}

/**
 * 使用 JWT 和 Installation ID 创建 Installation Access Token
 * 这个 Token 用于后续的 Git 操作（读写文件等）
 * 
 * @param {string} jwt - App JWT
 * @param {string} installationId - 安装 ID
 * @returns {Promise<string>} Access Token
 */
export async function createInstallationToken(jwt, installationId) {
  const res = await fetch(`${GH_API}/app/installations/${installationId}/access_tokens`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })
  if (res.status === 401) handle401Error()
  if (res.status === 422) handle422Error()
  if (!res.ok) throw new Error(`create token failed: ${res.status}`)
  const data = await res.json()
  return data.token
}

/**
 * 获取文件 SHA (用于更新文件时校验)
 * 
 * @param {string} token - Access Token
 * @param {string} owner - 仓库所有者
 * @param {string} repo - 仓库名称
 * @param {string} path - 文件路径
 * @param {string} branch - 分支名称
 * @returns {Promise<string|undefined>} 文件的 SHA 值，如果文件不存在则返回 undefined
 */
export async function getFileSha(token, owner, repo, path, branch) {
  const res = await fetch(`${GH_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })
  if (res.status === 401) handle401Error()
  if (res.status === 422) handle422Error()
  if (res.status === 404) return undefined
  if (!res.ok) throw new Error(`get file sha failed: ${res.status}`)
  const data = await res.json()
  return (data && data.sha) || undefined
}

/**
 * 获取目录内容列表
 * 
 * @param {string|null} token - Access Token (可选，若为 null 则访问公共内容)
 * @param {string} owner - 仓库所有者
 * @param {string} repo - 仓库名称
 * @param {string} path - 目录路径 (例如 'posts')
 * @returns {Promise<Array>} 文件列表
 */
export async function getDirectoryContents(token, owner, repo, path) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${GH_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
    headers
  })
  if (res.status === 401 && token) handle401Error()
  if (res.status === 404) return [] // 目录不存在返回空数组
  if (!res.ok) throw new Error(`get contents failed: ${res.status}`)
  const data = await res.json()
  return Array.isArray(data) ? data : [data]
}

/**
 * 获取文件内容
 * 
 * @param {string|null} token - Access Token (可选，若为 null 则访问公共内容)
 * @param {string} owner - 仓库所有者
 * @param {string} repo - 仓库名称
 * @param {string} path - 文件路径
 * @returns {Promise<string>} 解码后的文件内容
 */
export async function getFileContent(token, owner, repo, path) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${GH_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
    headers
  })
  if (res.status === 401 && token) handle401Error()
  if (!res.ok) throw new Error(`get file content failed: ${res.status}`)
  const data = await res.json()
  if (data.encoding === 'base64' && data.content) {
    // GitHub API 返回的 base64 内容可能包含换行符，需要移除
    const cleanContent = data.content.replace(/\n/g, '')
    return fromBase64Utf8(cleanContent)
  }
  return ''
}

/**
 * 创建或更新文件
 * 
 * @param {string} token - Access Token
 * @param {string} owner - 仓库所有者
 * @param {string} repo - 仓库名称
 * @param {string} path - 文件路径
 * @param {string} contentBase64 - Base64 编码的文件内容
 * @param {string} message - 提交信息 (Commit Message)
 * @param {string} branch - 分支名称
 * @returns {Promise<Object>} GitHub API 响应结果
 */
export async function putFile(token, owner, repo, path, contentBase64, message, branch) {
  // 先获取文件的 SHA (如果是更新操作需要)
  const sha = await getFileSha(token, owner, repo, path, branch)
  
  const res = await fetch(`${GH_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    },
    // 构建请求体，如果是更新则必须包含 sha
    body: JSON.stringify({ message, content: contentBase64, branch, ...(sha ? { sha } : {}) })
  })
  if (res.status === 401) handle401Error()
  if (res.status === 422) handle422Error()
  if (!res.ok) throw new Error(`put file failed: ${res.status}`)
  return res.json()
}

/**
 * 删除文件
 * 
 * @param {string} token - Access Token
 * @param {string} owner - 仓库所有者
 * @param {string} repo - 仓库名称
 * @param {string} path - 文件路径
 * @param {string} message - 提交信息
 * @param {string} branch - 分支名称
 */
export async function deleteFile(token, owner, repo, path, message, branch) {
  // 删除需要提供文件的 sha
  const sha = await getFileSha(token, owner, repo, path, branch)
  if (!sha) return // 文件不存在，无需删除

  const res = await fetch(`${GH_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message, sha, branch })
  })
  if (res.status === 401) handle401Error()
  if (!res.ok) throw new Error(`delete file failed: ${res.status}`)
  return res.json()
}
