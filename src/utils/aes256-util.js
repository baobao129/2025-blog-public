/**
 * AES-256-GCM 加密工具类
 * 用于在浏览器端安全地加密存储敏感信息（如 GitHub 私钥）
 */

/**
 * 使用 AES-256-GCM 算法加密文本
 * 
 * @param {string} text - 需要加密的原始文本
 * @param {string} key - 用于加密的密钥（密码）
 * @returns {Promise<string>} 返回 Base64 编码的加密字符串（包含 IV 和密文）
 */
export async function encrypt(text, key) {
  const enc = new TextEncoder()
  // 生成 12 字节的随机初始向量 (IV)
  const iv = crypto.getRandomValues(new Uint8Array(12)) 
  
  // 使用 SHA-256 将密钥处理为固定长度的 Key 数据
  const keyData = await crypto.subtle.digest(
    'SHA-256',
    enc.encode(key)
  )

  // 导入密钥用于 AES-GCM 加密
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  )

  // 执行加密操作
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    enc.encode(text)
  )

  // 将 IV 和密文合并存储
  // iv + 密文 一起转 base64 方便存储
  const result = new Uint8Array(iv.length + encrypted.byteLength)
  result.set(iv, 0)
  result.set(new Uint8Array(encrypted), iv.length)

  // 将二进制数据转换为 Base64 字符串
  // 浏览器环境使用 btoa
  // 注意：Uint8Array 转 String.fromCharCode 对于大文件可能会栈溢出，但在 Key 这种短文本场景没问题
  let binary = '';
  const len = result.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(result[i]);
  }
  return btoa(binary);
}

/**
 * 解密 AES-256-GCM 加密的文本
 * 
 * @param {string} cipherText - Base64 编码的加密字符串（包含 IV 和密文）
 * @param {string} key - 用于解密的密钥（必须与加密时一致）
 * @returns {Promise<string>} 解密后的原始文本
 */
export async function decrypt(cipherText, key) {
  // Base64 解码为二进制字符串
  const binaryString = atob(cipherText)
  const len = binaryString.length
  const data = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    data[i] = binaryString.charCodeAt(i)
  }
  
  // 提取 IV（前 12 字节）和密文（剩余部分）
  const iv = data.slice(0, 12)
  const encrypted = data.slice(12)

  const enc = new TextEncoder()
  // 重新生成密钥数据
  const keyData = await crypto.subtle.digest(
    'SHA-256',
    enc.encode(key)
  )

  // 导入密钥用于解密
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  )

  // 执行解密操作
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encrypted
  )

  // 解码为 UTF-8 字符串
  return new TextDecoder().decode(decrypted)
}
