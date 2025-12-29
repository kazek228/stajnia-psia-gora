/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        earth: {
          50: '#faf6f1',
          100: '#f0e6d8',
          200: '#e1cdb1',
          300: '#cfb085',
          400: '#c19660',
          500: '#b58149',
          600: '#a06a3e',
          700: '#855436',
          800: '#6d4530',
          900: '#5a3a29',
        },
        forest: {
          50: '#f3faf3',
          100: '#e3f5e3',
          200: '#c8eac8',
          300: '#9dd89d',
          400: '#6bbf6b',
          500: '#47a347',
          600: '#358535',
          700: '#2d6a2d',
          800: '#285428',
          900: '#234623',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      backgroundImage: {
        'nature-gradient': 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0e6d8 100%)',
        'forest-gradient': 'linear-gradient(180deg, #166534 0%, #14532d 100%)',
      },
    },
  },
  plugins: [],
}
