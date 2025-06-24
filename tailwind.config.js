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
        'panel-dark': 'var(--panel-dark)',
        'panel-charcoal': 'var(--panel-charcoal)',
        'panel-gray': 'var(--panel-gray)',
        'text-main': 'var(--text-main)',
        'text-secondary': 'var(--text-secondary)',
        'bg-color': 'var(--bg-color)',
        'border-color': 'var(--border-color)',
      },
    },
  },
  plugins: [],
} 