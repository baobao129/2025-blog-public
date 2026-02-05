/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Inter"', 
          'ui-sans-serif', 
          'system-ui', 
          '-apple-system', 
          'BlinkMacSystemFont', 
          '"Segoe UI"', 
          'Roboto', 
          '"Helvetica Neue"', 
          'Arial', 
          'sans-serif'
        ],
        serif: [
          '"Merriweather"', 
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
        background: '#FAF9F6', // Off-white / Eggshell
        surface: '#FFFFFF',
        primary: {
          DEFAULT: '#18181B', // Zinc 900
          hover: '#27272A',   // Zinc 800
        },
        accent: {
          DEFAULT: '#E17055', // Terracotta
          light: '#FAB1A0',
        },
        text: {
          main: '#27272A',    // Zinc 800
          muted: '#71717A',   // Zinc 500
          light: '#A1A1AA',   // Zinc 400
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
            },
            h2: {
              fontFamily: theme('fontFamily.serif'),
              fontWeight: '600',
              marginTop: '2em',
            },
            h3: {
              fontFamily: theme('fontFamily.serif'),
              fontWeight: '600',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            code: {
              backgroundColor: '#F4F4F5', // Zinc 100
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '500',
              color: '#E17055', // Terracotta
            },
            pre: {
              backgroundColor: '#18181B', // Zinc 900
              color: '#F4F4F5', // Zinc 100
            },
            blockquote: {
              borderLeftColor: '#E17055', // Terracotta
              fontStyle: 'italic',
              color: theme('colors.text.muted'),
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
