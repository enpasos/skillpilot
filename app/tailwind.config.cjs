/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ChatGPT Style Grays
        gray: {
          50: '#f9f9f9', // Sidebar Light
          700: '#40414f', // Sidebar Hover Dark
          800: '#343541', // Main Chat Dark (Classic GPT)
          900: '#202123', // Sidebar Dark
        },
        // Semantic Names
        'chat-bg': 'var(--chat-bg)',
        'sidebar-bg': 'var(--sidebar-bg)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'border-color': 'var(--border-color)',
        'input-bg': 'var(--input-bg)',

        // Existing colors
        background: {
          DEFAULT: 'rgb(var(--color-bg-main) / <alpha-value>)',
          card: 'rgb(var(--color-bg-card) / <alpha-value>)',
          sidebar: 'rgb(var(--color-bg-sidebar) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          glow: 'rgb(var(--color-primary-glow) / <alpha-value>)',
        },
        mastery: {
          high: '#10b981',
          medium: '#fbbf24',
          low: '#f43f5e',
          none: '#475569',
        },
      },
      backgroundImage: {
        'app-gradient': 'radial-gradient(circle at top, #1e293b, #020617)',
        'card-gradient': 'radial-gradient(circle at top left, #1f2937, #020617)',
      },
      boxShadow: {
        'card-2xl': '0 18px 40px rgba(15, 23, 42, 0.7)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
