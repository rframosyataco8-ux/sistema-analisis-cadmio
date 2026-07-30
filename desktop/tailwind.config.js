/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand Cacao Tech
        cacao: {
          50:  '#faf6f1',
          100: '#f0e6d8',
          200: '#e0c9a8',
          300: '#c9a27a',
          400: '#b07d52',
          500: '#9a6540',
          600: '#7d4f32',
          700: '#633f2a',
          800: '#4a2f20',
          900: '#352218',
          950: '#1f140e',
        },
        bronze: {
          400: '#d4a574',
          500: '#c4894a',
          600: '#a86f35',
        },
        // Surfaces
        surface: {
          DEFAULT: '#0f172a',   // slate-900
          raised:  '#1e293b',   // slate-800
          overlay: '#334155',   // slate-700
        },
        // Status
        conform: {
          DEFAULT: '#10b981', // emerald-500
          soft:    '#064e3b',
          text:    '#6ee7b7',
        },
        alert: {
          DEFAULT: '#f59e0b', // amber-500
          soft:    '#78350f',
          text:    '#fcd34d',
        },
        risk: {
          DEFAULT: '#f43f5e', // rose-500
          soft:    '#881337',
          text:    '#fda4af',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.25), 0 1px 2px -1px rgb(0 0 0 / 0.2)',
        elevated: '0 4px 12px -2px rgb(0 0 0 / 0.35), 0 2px 6px -2px rgb(0 0 0 / 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
