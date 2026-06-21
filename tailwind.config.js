/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        // 設定動畫名稱為 breathing，持續 3 秒，循環無限次
        'breathing': 'breathing 3s ease-in-out infinite',
      },
      keyframes: {
        breathing: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1', boxShadow: '0 0 0 0 rgba(0, 0, 0, 0.4)' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8', boxShadow: '0 0 20px 10px rgba(0, 0, 0, 0.2)' },
        },
      },
    },
  },
  plugins: [],
}