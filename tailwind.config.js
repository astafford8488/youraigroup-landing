/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f5f5f7',
          100: '#e5e5ea',
          200: '#c7c7cc',
          300: '#a0a0a8',
          400: '#6e6e78',
          500: '#48485a',
          600: '#36364a',
          700: '#2a2a3e',
          800: '#1f1f33',
          900: '#1A1A2E',
          950: '#0f0f1e',
        },
        fire: {
          50: '#fff7f0',
          100: '#ffedd9',
          200: '#ffd6b3',
          300: '#ffb380',
          400: '#ff8c4d',
          500: '#FF6B35',
          600: '#e85a25',
          700: '#c4481c',
          800: '#9e3a18',
          900: '#7d3016',
        },
        slate: {
          950: '#0a0f1a',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
