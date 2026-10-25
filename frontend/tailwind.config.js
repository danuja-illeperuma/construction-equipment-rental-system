/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light Blue & White Theme Tokens
        brand: {
          50: '#F5F9FC', // Light gray-blue background
          100: '#E8F2FA',
          200: '#DFE8F0', // Border color
          300: '#A4D0F2',
          400: '#5BA9E6', // Primary light blue
          500: '#368BD1', // Secondary blue
          600: '#2473B5', // Dark blue for hover states
          700: '#1C5D94',
          800: '#154874',
          900: '#263746', // Main text
          950: '#1A2733',
          DEFAULT: '#368BD1',
        },
        advantis: {
          50: '#F5F9FC',
          100: '#E8F2FA',
          200: '#DFE8F0',
          300: '#A4D0F2',
          400: '#5BA9E6',
          500: '#368BD1',
          600: '#2473B5',
          700: '#1C5D94',
          800: '#154874',
          900: '#263746',
          950: '#1A2733',
        },
        equipment: {
          50: '#F5F9FC',
          100: '#E8F2FA',
          200: '#DFE8F0',
          300: '#A4D0F2',
          400: '#5BA9E6',
          500: '#368BD1',
          600: '#2473B5',
          700: '#1C5D94',
          800: '#154874',
          900: '#263746',
          950: '#1A2733',
        },
        cerms: {
          lightBlue: '#5BA9E6',
          secondaryBlue: '#368BD1',
          darkBlue: '#2473B5',
          canvas: '#F5F9FC',
          border: '#DFE8F0',
          textMain: '#263746',
          textSecondary: '#657786',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        heading: ['"Titillium Web"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
