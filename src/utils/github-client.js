import { KJUR, KEYUTIL } from 'jsrsasign'
import { toast } from 'sonner'

export const GH_API = 'https://api.github.com'

function handle401Error() {
  // 这里需要一种机制来通知应用层清除 auth
  // 简单起见，抛出特定错误
  // 或者使用 EventBus/GlobalState
  console.warn('Authentication failed (401)')
  window.dispatchEvent(new CustomEvent('auth:401'))
}

function handle422Error() {
  toast.error('操作太快了，请操作慢一点')
}

export function toBase64Utf8(input) {
  return btoa(unescape(encodeURIComponent(input)))
}

export function signAppJwt(appId, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = { iat: now - 60, exp: now + 8 * 60, iss: appId }
  const prv = KEYUTIL.getKey(privateKeyPem)
  return KJUR.jws.JWS.sign('RS256', JSON.stringify(header), JSON.stringify(payload), prv)
}

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

export async function putFile(token, owner, repo, path, contentBase64, message, branch) {
  const sha = await getFileSha(token, owner, repo, path, branch)
  const res = await fetch(`${GH_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message, content: contentBase64, branch, ...(sha ? { sha } : {}) })
  })
  if (res.status === 401) handle401Error()
  if (res.status === 422) handle422Error()
  if (!res.ok) throw new Error(`put file failed: ${res.status}`)
  return res.json()
}
