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
        luxury: {
          gold: '#D4AF37',
          silver: '#C0C0C0',
          black: '#0A0A0A',
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