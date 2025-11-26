/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Single (Customer) App - Green Primary
        'single-primary': {
          DEFAULT: '#028550',
          light: '#03a664',
          dark: '#016a40',
          50: '#e6f7f1',
          100: '#ccefe3',
          200: '#99dfc7',
          300: '#66cfab',
          400: '#33bf8f',
          500: '#028550',
          600: '#026a40',
          700: '#015030',
          800: '#013520',
          900: '#001b10',
        },
        // Business App - Blue Primary
        'business-primary': {
          DEFAULT: '#0055aa',
          light: '#0066cc',
          dark: '#004488',
          50: '#e6f2ff',
          100: '#cce5ff',
          200: '#99cbff',
          300: '#66b1ff',
          400: '#3397ff',
          500: '#0055aa',
          600: '#004488',
          700: '#003366',
          800: '#002244',
          900: '#001122',
        },
        // Default Primary (Customer)
        primary: {
          DEFAULT: '#028550',
          light: '#03a664',
          dark: '#016a40',
          50: '#e6f7f1',
          100: '#ccefe3',
          200: '#99dfc7',
          300: '#66cfab',
          400: '#33bf8f',
          500: '#028550',
          600: '#026a40',
          700: '#015030',
          800: '#013520',
          900: '#001b10',
        },
        // Secondary (Business)
        secondary: {
          DEFAULT: '#0055aa',
          light: '#0066cc',
          dark: '#004488',
          50: '#e6f2ff',
          100: '#cce5ff',
          200: '#99cbff',
          300: '#66b1ff',
          400: '#3397ff',
          500: '#0055aa',
          600: '#004488',
          700: '#003366',
          800: '#002244',
          900: '#001122',
        },
        // Status colors
        success: '#34C759',
        danger: '#FF3B30',
        warning: '#FF9500',
        info: '#0055aa',
        // Neutral colors
        background: '#f8f8f8',
        card: '#FFFFFF',
        white: '#FFFFFF',
        // Text colors
        text: {
          DEFAULT: '#000000',
          secondary: '#8E8E93',
          tertiary: '#C7C7CC',
        },
        // Border colors
        border: {
          DEFAULT: '#C6C6C8',
          light: '#E5E5EA',
        },
      },
      fontFamily: {
        // Add custom fonts here if needed
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
}
