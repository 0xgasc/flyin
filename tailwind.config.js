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
        // Navy blue luxury theme
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Dark luxury navy palette
        luxury: {
          gold: '#10b981',      // Emerald green accent
          silver: '#e2e8f0',    // Light slate
          black: '#0a1628',     // Dark navy
          charcoal: '#0f1d32',  // Navy charcoal
          slate: '#1e3a5f',     // Navy blue
          navy: '#0d2137',      // Deep navy
        },
        // Brand colors - navy/green
        brand: {
          dark: '#0a1628',
          navy: '#0d2137',
          charcoal: '#0f1d32',
          text: '#f7f7f7',
          muted: '#94a3b8',
          accent: '#10b981',    // Emerald green
          green: '#059669',     // Darker emerald
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