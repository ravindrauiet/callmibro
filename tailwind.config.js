/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'accent': '#e60012',
        'panel-dark': '#111',
        'panel-charcoal': '#1a1a1a',
        'panel-gray': '#222',
      },
    },
  },
  plugins: [],
} 