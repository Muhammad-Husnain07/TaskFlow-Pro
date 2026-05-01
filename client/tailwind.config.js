/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-accent)',
          50: 'var(--color-accent-50)',
          100: 'var(--color-accent-100)',
          200: 'var(--color-accent-200)',
          300: 'var(--color-accent-300)',
          400: 'var(--color-accent-400)',
          500: 'var(--color-accent)',
          600: 'var(--color-accent-600)',
          700: 'var(--color-accent-700)',
          800: 'var(--color-accent-800)',
          900: 'var(--color-accent-900)',
        },
        secondary: {
          DEFAULT: '#5ee7bf',
          50: '#effef7',
          100: '#d6fced',
          200: '#a8fad9',
          300: '#7af7c6',
          400: '#5ee7bf',
          500: '#3dd4a6',
          600: '#2eb88a',
          700: '#228b6c',
          800: '#175f4d',
          900: '#0b322e',
        },
        danger: {
          DEFAULT: '#f76c6c',
          50: '#fef2f2',
          100: '#fdeaea',
          200: '#fad0d0',
          300: '#f7b5b5',
          400: '#f76c6c',
          500: '#f44b43',
          600: '#e32b2b',
          700: '#b32 121',
          800: '#84 18 18',
          900: '#550f0f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system- ui', 'sans- serif'],
        heading: ['Syne', 'system- ui', 'sans- serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'large': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};