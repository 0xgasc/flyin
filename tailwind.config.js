/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark slate theme inspired by flyinguate.com
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Dark luxury palette
        luxury: {
          gold: '#94a3b8',      // Slate accent (was gold)
          silver: '#e2e8f0',    // Light slate
          black: '#0a0a0a',     // True black
          charcoal: '#161616',  // Dark charcoal
          slate: '#455a64',     // Slate blue accent
        },
        // Brand colors
        brand: {
          dark: '#000000',
          charcoal: '#161616',
          text: '#f7f7f7',
          muted: '#919191',
          accent: '#455a64',
        },
        // Semantic status colors for consistent use across all views
        status: {
          pending: {
            bg: '#fef3c7',
            text: '#92400e',
            border: '#fcd34d',
          },
          approved: {
            bg: '#dbeafe',
            text: '#1e40af',
            border: '#93c5fd',
          },
          assigned: {
            bg: '#e9d5ff',
            text: '#6b21a8',
            border: '#c4b5fd',
          },
          completed: {
            bg: '#dcfce7',
            text: '#166534',
            border: '#86efac',
          },
          cancelled: {
            bg: '#fee2e2',
            text: '#991b1b',
            border: '#fca5a5',
          },
          rejected: {
            bg: '#fef2f2',
            text: '#b91c1c',
            border: '#fecaca',
          },
        }
      },
    },
  },
  plugins: [],
}