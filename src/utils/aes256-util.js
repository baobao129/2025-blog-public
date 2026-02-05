export async function encrypt(text, key) {
  const enc = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(12)) // 12字节IV
  const keyData = await crypto.subtle.digest(
    'SHA-256',
    enc.encode(key)
  )

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  )

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    enc.encode(text)
  )

  // iv + 密文 一起转 base64 方便存储
  const result = new Uint8Array(iv.length + encrypted.byteLength)
  result.set(iv, 0)
  result.set(new Uint8Array(encrypted), iv.length)

  // 浏览器环境使用 btoa
  // 注意：Uint8Array 转 String.fromCharCode 对于大文件可能会栈溢出，但在 Key 这种短文本场景没问题
  let binary = '';
  const len = result.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(result[i]);
  }
  return btoa(binary);
}

export async function decrypt(cipherText, key) {
  const binaryString = atob(cipherText)
  const len = binaryString.length
  const data = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    data[i] = binaryString.charCodeAt(i)
  }
  
  const iv = data.slice(0, 12)
  const encrypted = data.slice(12)

  const enc = new TextEncoder()
  const keyData = await crypto.subtle.digest(
    'SHA-256',
    enc.encode(key)
  )

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  )

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encrypted
  )

  return new TextDecoder().decode(decrypted)
}
