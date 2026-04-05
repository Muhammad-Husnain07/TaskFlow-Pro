/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7c6af7',
          50: '#f0eeff',
          100: '#e4dffe',
          200: '#c9bffd',
          300: '#ae9ffd',
          400: '#937ffc',
          500: '#7c6af7',
          600: '#5a48c5',
          700: '#433593',
          800: '#2c2361',
          900: '#151130',
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
          500: '#f44343',
          600: '#e32b2b',
          700: '#b32121',
          800: '#841818',
          900: '#550f0f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Syne', 'system-ui', 'sans-serif'],
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
}
