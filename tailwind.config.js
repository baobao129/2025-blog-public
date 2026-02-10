/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans SC"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Noto Serif SC"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      colors: {
        background: '#fdfbf7',
        surface: '#FFFFFF',
        primary: { DEFAULT: '#2c2c2c', hover: '#000000' },
        accent: { DEFAULT: '#c0392b', light: '#e74c3c' },
        text: { main: '#2c2c2c', muted: '#666666', light: '#999999' }
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.text.main'),
            maxWidth: 'none',
            lineHeight: '1.8',
            
            // 标题优化
            h1: {
              fontFamily: theme('fontFamily.serif'),
              fontWeight: '700',
              color: theme('colors.primary.DEFAULT'),
              fontSize: '2.25em',
              marginTop: '0',
              marginBottom: '0.8em',
              lineHeight: '1.2',
            },
            h2: {
              fontFamily: theme('fontFamily.serif'),
              fontWeight: '600',
              color: theme('colors.primary.DEFAULT'),
              fontSize: '1.75em',
              marginTop: '2em',
              marginBottom: '0.6em',
              borderBottom: '1px solid #e5e5e5',
              paddingBottom: '0.3em',
            },
            h3: {
              fontFamily: theme('fontFamily.serif'),
              fontWeight: '600',
              color: theme('colors.primary.DEFAULT'),
              fontSize: '1.375em',
              marginTop: '1.6em',
              marginBottom: '0.6em',
            },
            h4: {
              fontWeight: '600',
              marginTop: '1.5em',
              marginBottom: '0.5em',
            },

            // 引用块优化
            blockquote: {
              fontWeight: '400',
              fontStyle: 'normal',
              color: theme('colors.text.muted'),
              borderLeftWidth: '4px',
              borderLeftColor: theme('colors.accent.DEFAULT'),
              backgroundColor: '#f5f5f5',
              padding: '1rem 1.5rem',
              borderRadius: '0.5rem',
              quotes: 'none',
              marginTop: '1.6em',
              marginBottom: '1.6em',
            },

            // 代码块优化
            pre: {
              backgroundColor: '#282c34',
              color: '#abb2bf',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              marginTop: '1.6em',
              marginBottom: '1.6em',
              fontSize: '0.9em',
              lineHeight: '1.7',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
            code: {
              backgroundColor: 'rgba(192, 57, 43, 0.1)',
              color: theme('colors.accent.DEFAULT'),
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '500',
              fontSize: '0.9em',
            },
            'pre code': {
              backgroundColor: 'transparent',
              color: 'inherit',
              padding: '0',
              fontSize: '1em',
            },

            // 链接
            a: {
              color: theme('colors.accent.DEFAULT'),
              textDecoration: 'none',
              fontWeight: '500',
              borderBottom: '1px solid transparent',
              transition: 'border-color 0.2s',
              '&:hover': {
                borderBottomColor: theme('colors.accent.DEFAULT'),
              },
            },

            // 列表
            'ul > li': {
              position: 'relative',
              paddingLeft: '1.5em',
            },
            'ul > li::marker': {
              color: theme('colors.accent.light'),
            },

            // 图像
            img: {
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              marginTop: '2em',
              marginBottom: '2em',
            },

            // 特殊标签支持
            small: {
              fontSize: '0.8em',
              color: theme('colors.text.muted'),
            },
            mark: {
              backgroundColor: '#fef3c7',
              padding: '0.1em 0.3em',
              borderRadius: '0.2em',
            }
          }
        }
      })
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
