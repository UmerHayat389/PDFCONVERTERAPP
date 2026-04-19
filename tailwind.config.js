/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#E63946',
        secondary: '#1D3557',
        accent: '#457B9D',
        surface: '#F1FAEE',
        dark: '#0D1B2A',
      },
    },
  },
  plugins: [],
};