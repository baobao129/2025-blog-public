/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 思源黑体优先，回退到系统字体
        sans: [
          '"Noto Sans SC"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif'
        ],
        // 思源宋体优先
        serif: [
          '"Noto Serif SC"',
          'ui-serif',
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'Times',
          'serif'
        ],
        mono: [
          '"JetBrains Mono"', 
          'ui-monospace', 
          'SFMono-Regular', 
          'Menlo', 
          'Monaco', 
          'Consolas', 
          '"Liberation Mono"', 
          '"Courier New"', 
          'monospace'
        ]
      },
      colors: {
        background: '#fdfbf7', // 米宣纸色
        surface: '#FFFFFF',
        primary: {
          DEFAULT: '#2c2c2c', // 墨色
          hover: '#000000',
        },
        accent: {
          DEFAULT: '#c0392b', // 朱砂红
          light: '#e74c3c',
        },
        text: {
          main: '#2c2c2c',    // 墨色
          muted: '#666666',   // 深灰
          light: '#999999',   // 浅灰
        }
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.text.main'),
            maxWidth: 'none',
            h1: {
              fontFamily: theme('fontFamily.serif'),
              fontWeight: '700',
              color: theme('colors.primary.DEFAULT'),
            },
            h2: {
              fontFamily: theme('fontFamily.serif'),
              fontWeight: '600',
              marginTop: '2em',
              color: theme('colors.primary.DEFAULT'),
            },
            h3: {
              fontFamily: theme('fontFamily.serif'),
              fontWeight: '600',
              color: theme('colors.primary.DEFAULT'),
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            code: {
              backgroundColor: '#f5f5f5',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '500',
              color: '#c0392b',
              fontFamily: theme('fontFamily.mono'),
            },
            pre: {
              backgroundColor: '#2c2c2c',
              color: '#fdfbf7',
            },
            blockquote: {
              borderLeftColor: '#c0392b',
              fontStyle: 'normal',
              color: theme('colors.text.muted'),
              backgroundColor: '#f9f9f9',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
            },
            a: {
              color: '#c0392b',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
          }
        }
      })
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
