/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hc: {
          navy: '#0a1628',
          deep: '#0f2744',
          teal: '#0d9488',
          cyan: '#22d3ee',
          amber: '#f59e0b',
        },
      },
      fontFamily: {
        display: ['"Sora"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
        body: ['"IBM Plex Sans"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 8px 32px rgba(10, 22, 40, 0.45)',
        glass: '0 4px 24px rgba(13, 148, 136, 0.16)',
      },
    },
  },
  plugins: [],
}
