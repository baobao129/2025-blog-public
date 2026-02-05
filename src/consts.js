// 环境变量处理
// 优先使用 import.meta.env (Vite), 降级使用 process.env (兼容性)
const getEnv = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key]
  }
  return process.env[key]
}

export const GITHUB_CONFIG = {
	OWNER: getEnv('NEXT_PUBLIC_GITHUB_OWNER') || 'yysuni',
	REPO: getEnv('NEXT_PUBLIC_GITHUB_REPO') || '2025-blog-public',
	BRANCH: getEnv('NEXT_PUBLIC_GITHUB_BRANCH') || 'main',
	APP_ID: getEnv('NEXT_PUBLIC_GITHUB_APP_ID') || '-',
	ENCRYPT_KEY: getEnv('NEXT_PUBLIC_GITHUB_ENCRYPT_KEY') || 'wudishiduomejimo',
}

export const INIT_DELAY = 0.3
export const ANIMATION_DELAY = 0.1
export const CARD_SPACING = 36
export const CARD_SPACING_SM = 24
