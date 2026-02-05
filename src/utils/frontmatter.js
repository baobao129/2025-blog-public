/**
 * Frontmatter 解析与生成工具
 * 用于处理 Markdown 文件头部的元数据 (YAML 格式)
 */

/**
 * 解析 Markdown 文本中的 Frontmatter
 * @param {string} text - 完整的 Markdown 文本
 * @returns {Object} { data: Object, content: string }
 */
export function parseFrontmatter(text) {
  if (!text) return { data: {}, content: '' }
  
  const pattern = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = text.match(pattern)
  
  if (!match) {
    return { data: {}, content: text }
  }
  
  const yaml = match[1]
  const content = match[2]
  
  const data = {}
  yaml.split('\n').forEach(line => {
    const parts = line.split(':')
    if (parts.length >= 2) {
      const key = parts[0].trim()
      const value = parts.slice(1).join(':').trim()
      // 简单的类型转换
      if (value === 'true') data[key] = true
      else if (value === 'false') data[key] = false
      else if (!isNaN(Number(value))) data[key] = Number(value)
      else data[key] = value
    }
  })
  
  return { data, content }
}

/**
 * 生成带有 Frontmatter 的 Markdown 文本
 * @param {string} content - Markdown 正文
 * @param {Object} data - 元数据对象
 * @returns {string} 组合后的文本
 */
export function stringifyFrontmatter(content, data) {
  if (!data || Object.keys(data).length === 0) {
    return content
  }
  
  const yamlLines = Object.entries(data).map(([key, value]) => {
    return `${key}: ${value}`
  })
  
  return `---\n${yamlLines.join('\n')}\n---\n${content}`
}
