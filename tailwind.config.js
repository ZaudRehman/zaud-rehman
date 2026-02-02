/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#f5f1e8',
        charcoal: '#2b2b2b',
        sepia: '#8b7355',
        gold: '#d4af37',
        'paper-dark': '#e6e0d4'
      },
      fontFamily: {
        serif: ['"EB Garamond"', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #d4af3720 1px, transparent 1px), linear-gradient(to bottom, #d4af3720 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
