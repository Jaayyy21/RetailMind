/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        background: '#020617',
        surface: {
          50: '#0f172a',
          100: '#1e293b',
          200: '#334155',
        },
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        accent: {
          cyan: '#22d3ee',
          pink: '#f472b6',
          purple: '#c084fc',
          emerald: '#34d399',
          orange: '#fb923c',
        }
      },
      backgroundImage: {
        'mesh-gradient': "radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(34, 211, 238, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(192, 132, 252, 0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(244, 114, 182, 0.15) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
}
