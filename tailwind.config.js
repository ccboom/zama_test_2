/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'yellow-800': '#B45309', // 模拟 border-yellow-800/30
        'yellow-900': '#78350F', // 模拟 bg-yellow-900/50
      },
    },
  },
  plugins: [],
};

