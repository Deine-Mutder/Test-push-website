/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Basis
        bg: { DEFAULT: '#F7F8FB', dark: '#11152A' },
        surface: { DEFAULT: '#FFFFFF', dark: '#181D35' },
        border: { DEFAULT: '#E4E7F0', dark: '#2A3050' },
        ink: { DEFAULT: '#1A1D29', dark: '#EDEFF7' },
        muted: { DEFAULT: '#6B7085', dark: '#9096B5' },

        // Marke / Funktion
        primary: {
          DEFAULT: '#2D3A8C',
          light: '#4A58B8',
          dark: '#1F2966',
          50: '#EEF0FA',
        },
        success: {
          DEFAULT: '#0F9D78',
          light: '#3DBE9C',
          50: '#E7F8F3',
        },
        danger: {
          DEFAULT: '#E4572E',
          light: '#F0805E',
          50: '#FDECE6',
        },
        warning: {
          DEFAULT: '#C9852A',
          50: '#FBF0DF',
        },

        // Fachfarben (Default; werden pro Fach aus der DB ueberschrieben via inline style)
        subject: {
          math: '#2D3A8C',
          german: '#0F9D78',
          english: '#C9852A',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jbmono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(26,29,41,0.04), 0 4px 16px rgba(26,29,41,0.06)',
        'card-hover': '0 2px 6px rgba(26,29,41,0.06), 0 12px 28px rgba(26,29,41,0.10)',
      },
      keyframes: {
        'ring-fill': {
          from: { strokeDashoffset: 'var(--ring-start, 283)' },
          to: { strokeDashoffset: 'var(--ring-end, 0)' },
        },
        'fade-up': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'ring-fill': 'ring-fill 1s cubic-bezier(0.65,0,0.35,1) forwards',
        'fade-up': 'fade-up 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
};
