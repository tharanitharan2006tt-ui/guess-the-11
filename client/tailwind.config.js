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
          dark: '#0C101D',
          navy: '#111827',
          surface: '#18233C',
          'surface-light': '#212E4E',
          card: 'rgba(24, 35, 60, 0.85)',
          'card-hover': 'rgba(33, 46, 78, 0.95)',
          border: 'rgba(148, 163, 184, 0.16)',
          coral: {
            DEFAULT: '#FF5733',
            hover: '#FF6E4D',
            dark: '#C83412',
            light: '#FFA08A',
          },
          amber: {
            DEFAULT: '#FFB800',
            hover: '#FFC72C',
            dark: '#C78A00',
            light: '#FFE494',
          },
          mint: {
            DEFAULT: '#06D6A0',
            hover: '#1AE3AD',
            dark: '#048259',
            light: '#78ECCF',
          },
          indigo: {
            DEFAULT: '#6366F1',
            hover: '#818CF8',
            dark: '#4345B8',
            light: '#A5B4FC',
          },
          sky: {
            DEFAULT: '#0EA5E9',
            hover: '#38BDF8',
            dark: '#0369A1',
            light: '#7DD3FC',
          },
          pink: {
            DEFAULT: '#F43F5E',
            hover: '#FB7185',
            dark: '#BE123C',
            light: '#FDA4AF',
          },
          purple: {
            DEFAULT: '#8B5CF6',
            light: '#A78BFA',
            dark: '#6D28D9',
            neon: '#C084FC',
          },
          blue: {
            DEFAULT: '#0EA5E9',
            light: '#38BDF8',
            electric: '#00F0FF',
            glow: '#3B82F6',
          },
          accent: '#06D6A0',
          gold: '#FFB800',
        },
      },
      fontFamily: {
        game: ['"Fredoka"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        gaming: ['"Fredoka"', '"Outfit"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        '3d-coral': '0 4px 0 #C83412, 0 8px 20px rgba(255, 87, 51, 0.3)',
        '3d-amber': '0 4px 0 #C78A00, 0 8px 20px rgba(255, 184, 0, 0.3)',
        '3d-mint': '0 4px 0 #048259, 0 8px 20px rgba(6, 214, 160, 0.3)',
        '3d-indigo': '0 4px 0 #4345B8, 0 8px 20px rgba(99, 102, 241, 0.3)',
        '3d-slate': '0 4px 0 #0F172A, 0 8px 16px rgba(0, 0, 0, 0.4)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.4)',
        'neon-blue': '0 0 20px rgba(14, 165, 233, 0.4)',
        'neon-gold': '0 0 25px rgba(255, 184, 0, 0.5)',
        'glass': '0 12px 36px 0 rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
