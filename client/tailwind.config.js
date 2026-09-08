/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#14120F',
          surface: '#1E1B17',
          elevated: '#28241F',
        },
        felt: {
          primary: '#0F3D2E',
          dark: '#08241B',
          line: '#1C5B45',
          glow: '#267A5D',
        },
        accent: {
          gold: '#C9A24B',
          goldLight: '#E8C676',
          goldDark: '#8F6E25',
        },
        danger: {
          red: '#B3261E',
          glow: '#E5484D',
          dark: '#6E130E',
        },
        state: {
          safe: '#4E9E6B',
          eliminated: '#5C5650',
          warning: '#D97706',
        },
        text: {
          primary: '#EDE6D6',
          muted: '#A69C89',
          dim: '#716859',
        }
      },
      fontFamily: {
        serif: ['"Fraunces"', 'serif'],
        sans: ['"IBM Plex Sans"', '"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'felt': 'inset 0 0 100px rgba(0, 0, 0, 0.8), 0 20px 40px rgba(0, 0, 0, 0.9)',
        'gold-glow': '0 0 25px rgba(201, 162, 75, 0.45)',
        'danger-glow': '0 0 35px rgba(229, 72, 77, 0.65)',
        'card': '0 10px 20px rgba(0, 0, 0, 0.6), 0 2px 6px rgba(0, 0, 0, 0.4)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        chamberSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(1080deg)' },
        },
        flashBang: {
          '0%': { opacity: '1', background: '#FFFFFF' },
          '20%': { background: '#B3261E' },
          '100%': { opacity: '0', background: 'transparent' },
        },
        cardDeal: {
          '0%': { opacity: '0', transform: 'translateY(-40px) scale(0.8)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'chamber-spin': 'chamberSpin 3s cubic-bezier(0.1, 0.9, 0.2, 1) forwards',
        'flash-bang': 'flashBang 1.5s ease-out forwards',
        'card-deal': 'cardDeal 0.35s ease-out forwards',
      }
    },
  },
  plugins: [],
}
