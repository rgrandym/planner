/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode colors (default)
        'arch-bg': '#121212',
        'arch-surface': '#1e1e1e',
        'arch-surface-light': '#2a2a2a',
        'arch-border': '#333333',
        'arch-text': '#e5e5e5',
        'arch-text-secondary': '#a3a3a3',
        'arch-primary': '#06b6d4',
        'arch-secondary': '#8b5cf6',
        'arch-accent': '#ec4899',
        // Light mode colors
        'arch-bg-light': '#f8f9fa',
        'arch-surface-light-mode': '#ffffff',
        'arch-surface-hover-light': '#f1f3f5',
        'arch-border-light': '#dee2e6',
        'arch-text-light': '#212529',
        'arch-text-secondary-light': '#6c757d',
        // Category colors
        'cat-ai': '#8b5cf6',
        'cat-database': '#3b82f6',
        'cat-storage': '#10b981',
        'cat-logic': '#f59e0b',
        'cat-infra': '#06b6d4',
        'cat-data': '#ef4444',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(6, 182, 212, 0.3)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(6, 182, 212, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
