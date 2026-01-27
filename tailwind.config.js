/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Custom font families
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },

      // Custom border radius - less boxy, more refined
      borderRadius: {
        'subtle': '2px',
        'soft': '4px',
      },

      // Custom shadows for luxury feel
      boxShadow: {
        'subtle': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'elevated': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        'luxury': '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.08)',
        'gold-glow': '0 0 20px -5px rgb(212 175 55 / 0.3)',
        'inner-subtle': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.03)',
      },

      colors: {
        // Primary brand - slate blue professional palette
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#455a64',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#0a0a0a',
        },

        // Real gold accent - for luxury touches
        gold: {
          50: '#fefdf8',
          100: '#fef9e7',
          200: '#fdf2c4',
          300: '#fbe68a',
          400: '#f9d54a',
          500: '#d4af37',
          600: '#b8960c',
          700: '#8b7100',
          800: '#5c4a00',
          900: '#3d3000',
        },

        // Luxury dark palette
        luxury: {
          black: '#0a0a0a',
          charcoal: '#141414',
          slate: '#455a64',
          cream: '#faf9f6',
          muted: '#6b7280',
        },

        // Brand colors
        brand: {
          dark: '#0a0a0a',
          charcoal: '#141414',
          text: '#f7f7f7',
          muted: '#919191',
          accent: '#455a64',
          light: '#c6c6c6',
        },

        // Accent colors for interactions
        accent: {
          emerald: '#059669',
          amber: '#d97706',
          rose: '#e11d48',
        },

        // Semantic status colors
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
        },
      },

      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'shimmer': 'shimmer 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
}
