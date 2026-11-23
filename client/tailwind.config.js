/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          dark: '#070913',
          navy: '#0B1120',
          surface: '#121B2F',
          card: 'rgba(20, 30, 55, 0.7)',
          border: 'rgba(99, 102, 241, 0.25)',
          purple: {
            DEFAULT: '#8B5CF6',
            light: '#A78BFA',
            dark: '#6D28D9',
            neon: '#C084FC'
          },
          blue: {
            DEFAULT: '#06B6D4',
            light: '#38BDF8',
            electric: '#00F0FF',
            glow: '#3B82F6'
          },
          pink: '#F43F5E',
          accent: '#10B981',
          gold: '#F59E0B'
        }
      },
      fontFamily: {
        gaming: ['"Russo One"', '"Orbitron"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'neon-blue': '0 0 20px rgba(6, 182, 212, 0.5)',
        'neon-gold': '0 0 25px rgba(245, 158, 11, 0.6)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      backdropBlur: {
        glass: '16px'
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 15px rgba(6, 182, 212, 0.6))' },
          '50%': { opacity: 0.8, filter: 'drop-shadow(0 0 5px rgba(139, 92, 246, 0.3))' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      }
    },
  },
  plugins: [],
}
