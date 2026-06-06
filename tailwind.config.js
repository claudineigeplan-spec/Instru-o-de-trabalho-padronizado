/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#1e3a8a',
          600: '#1e3a8a',
          700: '#1e3070',
          900: '#0a1628',
        },
        orange: '#f97316',
        royal: '#1d4ed8',
      },
    },
  },
  plugins: [],
}
