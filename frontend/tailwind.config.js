/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e6f7f7',
          100: '#cceeee',
          200: '#99dddd',
          300: '#5cc8c8',
          400: '#2db5b5',
          500: '#0da3a3',
          600: '#0a9090',
          700: '#087878',
          800: '#056060',
          900: '#034848',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs':   ['13px', { lineHeight: '18px' }],
        'sm':   ['15px', { lineHeight: '22px' }],
        'base': ['16px', { lineHeight: '26px' }],
        'lg':   ['18px', { lineHeight: '28px' }],
        'xl':   ['20px', { lineHeight: '30px' }],
        '2xl':  ['24px', { lineHeight: '34px' }],
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
