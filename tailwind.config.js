/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        silk: {
          50: '#f0f4ff',
          100: '#e1e8fe',
          200: '#c7d5fd',
          300: '#a1bbfb',
          400: '#7599f7',
          500: '#4d72f1',
          600: '#354fe5',
          700: '#2a3db6',
          800: '#273493',
          900: '#253075',
          950: '#161b44',
        },
      }
    },
  },
  plugins: [],
}