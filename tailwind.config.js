/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0A0907',
          800: '#0F0D0A',
          700: '#171410',
          600: '#1F1B16',
          500: '#2A241D',
          400: '#3A3328',
        },
        cream: {
          50:  '#FBF7EC',
          100: '#F2EBD7',
          200: '#E5DCBE',
          300: '#C8BFA1',
          400: '#9C9479',
          500: '#6E6850',
        },
        ember: {
          400: '#FF7A3A',
          500: '#FF4D17',
          600: '#D93A0B',
        },
        acid: {
          400: '#D8FF55',
          500: '#C8FF3C',
          600: '#A6E021',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        widest: '0.18em',
      },
    },
  },
  plugins: [],
};
