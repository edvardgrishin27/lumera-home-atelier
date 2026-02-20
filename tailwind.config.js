/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable Dark Mode via class strategy
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Outfit"', 'sans-serif'],
      },
      fontSize: {
        '10xl': '10rem',
        '12xl': '12rem',
      },
      letterSpacing: {
        'tightest': '-0.05em',
        'widest-xl': '0.3em',
      },
      transitionTimingFunction: {
        'gallery': 'cubic-bezier(0.76, 0, 0.24, 1)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // New Spring Animation
      },
      boxShadow: {
        // Multi-layered shadow for generic cards (base layer)
        'elevated': '0 4px 6px -1px rgba(51, 51, 51, 0.05), 0 10px 15px -3px rgba(51, 51, 51, 0.08)',
        // Super soft, wide shadow for floating elements
        'floating': '0 10px 25px -5px rgba(51, 51, 51, 0.04), 0 20px 48px 5px rgba(51, 51, 51, 0.06)',
        // Intense 2026 premium light glow on hover
        'hover-glow': '0 0 30px rgba(255, 255, 255, 0.5)',
      }
    },
  },
  plugins: [],
}
