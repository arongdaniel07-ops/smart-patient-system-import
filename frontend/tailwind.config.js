/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#102B4E',
          'navy-light': '#173B63',
          teal: '#119E91',
          'teal-hover': '#0C8178',
          bg: '#F3F8FC',
          panel: '#E7F2F7',
          border: '#DCE6EE',
          text: '#182A3D',
          muted: '#68788B',
          success: '#25865A',
          warning: '#D99124',
          error: '#D64545',
          info: '#3878B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '14px',
      }
    },
  },
  plugins: [],
}
