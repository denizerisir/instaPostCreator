/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Geist', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      colors: {
        studio: {
          bg: '#121212',
          surface: '#181818',
          card: '#1F1F1F',
          border: '#2A2A2A',
          hover: '#313131',
          gold: '#E0A96D',
          'gold-light': '#F4D19B',
          'gold-dark': '#B8824A',
          terracotta: '#D97706',
          muted: '#9B9B9B',
          subtle: '#6B6B6B',
          light: '#F5F5F5',
        }
      },
    },
  },
  plugins: [],
}
